# Investigation Mode: Debugging Constraints

**CRITICAL**: Maintain complexity limits when fixing bugs. Pre-commit WILL BLOCK commits that violate limits, even for bug fixes.

## Hard Limits (Apply During Bug Fixes)

These limits are **automatically enforced** at commit time for all code, including bug fixes:

- **Functions: ≤50 lines** (AST-based detection)
- **Files: ≤300 lines**
- **Parameters: ≤3 per function**
- **Duplication: ≤3%** (jscpd threshold)

## Fix Pattern: Refactor FIRST, Then Fix

**CRITICAL PRINCIPLE**: If bug is in function >50 lines, refactor to <50 lines FIRST, THEN apply fix.

**Rationale**: Prevents complexity accumulation during maintenance. Bug fixes should improve code quality, not make it worse.

## Self-Monitoring Protocol for Bug Fixes

**CHECK DURING BUG FIX (not after):**

1. **Identify bug location** - Find function/file with issue
2. **Check complexity** - Is function >40 lines or file >250 lines?
3. **Refactor if needed** - Break down complex code BEFORE fixing bug
4. **Apply fix** - Add bug fix to refactored code
5. **Verify limits** - Ensure fix doesn't violate complexity limits

## Bug Fix Examples

### ❌ BAD: Patch Complex Function (WILL BE BLOCKED)

```typescript
// Existing function with bug - 70 lines
async function processBookingRequest(
  serviceId: string,
  datetime: Date,
  clientName: string,
  clientEmail: string,
  phone: string
) {
  // Validate service
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Validate datetime
  if (datetime < new Date()) {
    throw new Error('Cannot book past dates');
  }
  
  // Check availability
  const existingBookings = await prisma.booking.findMany({
    where: {
      serviceId,
      datetime: {
        gte: new Date(datetime.getTime() - service.duration * 60000),
        lte: new Date(datetime.getTime() + service.duration * 60000)
      }
    }
  });
  
  if (existingBookings.length > 0) {
    throw new Error('Time slot not available');
  }
  
  // Validate client data
  if (!clientEmail.includes('@')) {
    throw new Error('Invalid email');
  }
  
  if (phone.length < 10) {
    throw new Error('Invalid phone');
  }
  
  // BUG: Missing timezone conversion for datetime
  // ❌ WRONG FIX: Just patch the 70-line function
  const utcDatetime = convertToUTC(datetime);
  
  // Create booking
  const booking = await prisma.booking.create({
    data: {
      serviceId,
      datetime: utcDatetime, // bug fix applied
      clientName,
      clientEmail,
      phone,
      status: 'pending'
    }
  });
  
  // Send notification
  await sendEmail({
    to: clientEmail,
    subject: 'Booking Confirmation',
    body: `Your booking for ${service.name} is confirmed`
  });
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      type: 'BOOKING_CREATED',
      bookingId: booking.id,
      timestamp: new Date()
    }
  });
  
  return booking;
} // 72 lines - BLOCKED by pre-commit
```

### ✅ GOOD: Refactor First, Then Fix

```typescript
// STEP 1: Refactor into small functions (even before fixing bug)

interface BookingRequest {
  serviceId: string;
  datetime: Date;
  clientName: string;
  clientEmail: string;
  phone: string;
}

async function validateService(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  return service;
}

async function checkAvailability(
  request: Pick<BookingRequest, 'serviceId' | 'datetime'>,
  duration: number
) {
  const existingBookings = await prisma.booking.findMany({
    where: {
      serviceId: request.serviceId,
      datetime: {
        gte: new Date(request.datetime.getTime() - duration * 60000),
        lte: new Date(request.datetime.getTime() + duration * 60000)
      }
    }
  });
  
  if (existingBookings.length > 0) {
    throw new Error('Time slot not available');
  }
}

function validateBookingRequest(request: BookingRequest) {
  if (request.datetime < new Date()) {
    throw new Error('Cannot book past dates');
  }
  
  if (!request.clientEmail.includes('@')) {
    throw new Error('Invalid email');
  }
  
  if (request.phone.length < 10) {
    throw new Error('Invalid phone');
  }
}

// STEP 2: Apply bug fix to refactored code
async function createBookingRecord(request: BookingRequest) {
  // ✅ BUG FIX: Convert to UTC before saving
  const utcDatetime = convertToUTC(request.datetime);
  
  return prisma.booking.create({
    data: {
      ...request,
      datetime: utcDatetime, // bug fix in focused function
      status: 'pending'
    }
  });
}

async function processBookingRequest(request: BookingRequest) {
  validateBookingRequest(request);
  
  const service = await validateService(request.serviceId);
  await checkAvailability(request, service.duration);
  
  const booking = await createBookingRecord(request);
  
  await sendBookingNotification(booking, service);
  await logBookingActivity(booking.id);
  
  return booking;
} // ~15 lines - passes pre-commit with bug fix applied
```

## When Bug is in Already-Complex Code

**Protocol for fixing bugs in >50 line functions:**

1. **Don't add to complexity** - Resist urge to just patch
2. **Refactor FIRST** - Break function into smaller units
3. **Apply fix** - Add bug fix to appropriate small function
4. **Verify** - Ensure all functions ≤50 lines
5. **Commit** - Pre-commit will pass

## Debugging Process Within Limits

### Investigation Steps

```typescript
// 1. REPRODUCE BUG
it('should handle timezone conversion correctly', () => {
  // Arrange
  const localDatetime = new Date('2024-01-01T10:00:00+10:00');
  
  // Act
  const result = convertToUTC(localDatetime);
  
  // Assert
  expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
}); // Add test that exposes bug - ~10 lines

// 2. ISOLATE ISSUE
// Identify which function has the bug
// Check if function violates complexity limits

// 3. REFACTOR IF NEEDED
// If function >40 lines, break it down first

// 4. APPLY FIX
// Add fix to appropriate small function

// 5. VERIFY
// Ensure test passes and limits respected
```

## Adding Debug Logging Within Limits

**Keep debug additions focused:**

```typescript
// ❌ BAD: Adding 20 lines of logging to 40-line function
async function processBooking(data: BookingData) {
  console.log('Starting processBooking', data);
  console.log('Validating service');
  const service = await validateService(data.serviceId);
  console.log('Service validated:', service);
  console.log('Checking availability');
  // ... 15+ more logging lines
  // Function now 60+ lines - BLOCKED
}

// ✅ GOOD: Extract logging to utility or use structured logger
import { logger } from '@/lib/logger';

async function processBooking(data: BookingData) {
  logger.debug('processBooking.start', { data });
  
  const service = await validateService(data.serviceId);
  logger.debug('processBooking.serviceValidated', { service });
  
  await checkAvailability(data, service.duration);
  logger.debug('processBooking.availabilityChecked');
  
  const booking = await createBookingRecord(data);
  logger.debug('processBooking.created', { bookingId: booking.id });
  
  return booking;
} // ~15 lines with structured logging
```

## Performance Fix Pattern

**When fixing performance issues:**

```typescript
// ❌ BAD: Inline optimization in complex function
async function getBookingsWithDetailsBad(userId: string) {
  // ... 50+ lines of existing complex logic
  
  // Adding N+1 query fix here would push over limit
  for (const booking of bookings) {
    booking.service = await prisma.service.findUnique({
      where: { id: booking.serviceId }
    });
  }
  
  return bookings;
} // 60+ lines - BLOCKED

// ✅ GOOD: Refactor to smaller functions with optimization
async function fetchBookingsWithIncludes(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          duration: true
        }
      }
    },
    orderBy: { datetime: 'desc' }
  });
} // ~18 lines - optimization in focused function

async function getBookingsWithDetails(userId: string) {
  return fetchBookingsWithIncludes(userId);
} // ~3 lines - passes pre-commit
```

## Error Handling Fix Pattern

**Add error handling without bloating functions:**

```typescript
// ❌ BAD: Adding try-catch to every operation
async function processBooking(data: BookingData) {
  try {
    const service = await validateService(data.serviceId);
  } catch (error) {
    logger.error('Service validation failed', error);
    throw new ValidationError('Invalid service');
  }
  
  try {
    await checkAvailability(data, service.duration);
  } catch (error) {
    logger.error('Availability check failed', error);
    throw new AvailabilityError('Time slot unavailable');
  }
  
  // ... 10+ more try-catch blocks
  // Function balloons to 70+ lines - BLOCKED
}

// ✅ GOOD: Centralized error handling
async function processBooking(data: BookingData) {
  const service = await validateService(data.serviceId);
  await checkAvailability(data, service.duration);
  const booking = await createBookingRecord(data);
  
  await sendBookingNotification(booking, service);
  await logBookingActivity(booking.id);
  
  return booking;
} // ~10 lines

// Error handling in API layer
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await processBooking(data);
    return Response.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error); // Centralized error handling
  }
} // ~10 lines with proper error handling
```

## Pre-Commit Verification for Bug Fixes

Before committing bug fixes:

- [ ] Bug isolated and reproduced with test
- [ ] If function >50 lines, refactored first
- [ ] Bug fix applied to focused function
- [ ] All functions still ≤50 lines
- [ ] All files still ≤300 lines
- [ ] No increase in duplication (≤3%)
- [ ] Fix verified with passing tests

## Success Metrics

- **Refactor before fixing** - Improve code quality during maintenance
- **Maintain complexity limits** - No function >50 lines in bug fix
- **Pre-commit passes** - Bug fix doesn't violate any limits
- **Add focused tests** - Reproduce and verify fix ≤50 lines per test
- **Document fix** - Update investigations index if needed

## Key Principle

**Bug fixes should improve code quality, not make it worse.**

Never patch complex functions. Refactor to manageable size FIRST, then apply fix. This ensures codebase quality improves over time rather than degrades. Pre-commit enforcement is absolute - no exceptions for bug fixes.