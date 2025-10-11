# Implementation Mode: Complexity Constraints

**CRITICAL**: Pre-commit WILL BLOCK commits that violate these limits. Generate compliant code upfront to avoid rejection cycles.

## Hard Limits (Pre-Commit Enforced)

These limits are **automatically enforced** at commit time. Code exceeding these thresholds is **BLOCKED**:

- **Functions: ≤50 lines** (AST-based detection)
- **Files: ≤300 lines**
- **Parameters: ≤3 per function**
- **Duplication: ≤3%** (jscpd threshold)

## Self-Monitoring Protocol

**CHECK DURING CODE GENERATION (not after):**

1. **Stop at 40 lines per function** - If approaching 40, refactor immediately
2. **Split files at 250 lines** - Don't wait until 300 limit
3. **Use options object at 3+ params** - Reduce parameter count proactively
4. **Extract duplication on 2nd occurrence** - Don't wait for 3rd use

## Function Complexity Examples

### ❌ BAD: Function Exceeds 50 Lines (WILL BE BLOCKED)

```typescript
// Pre-commit will REJECT this commit
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
  
  // Create booking
  const booking = await prisma.booking.create({
    data: {
      serviceId,
      datetime,
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
} // 70+ lines - BLOCKED by pre-commit
```

### ✅ GOOD: Refactored to Multiple Small Functions

```typescript
// Each function ≤50 lines - passes pre-commit

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

async function createBookingRecord(request: BookingRequest) {
  return prisma.booking.create({
    data: {
      ...request,
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
} // ~15 lines - passes pre-commit
```

## Parameter Count Examples

### ❌ BAD: Too Many Parameters (WILL BE BLOCKED)

```typescript
// Pre-commit will REJECT this - 5 parameters > 3 limit
function createBooking(
  serviceId: string,
  datetime: Date,
  clientName: string,
  clientEmail: string,
  phone: string
) {
  // implementation
}
```

### ✅ GOOD: Options Object Pattern

```typescript
// Options object counts as 1 parameter - passes pre-commit
interface BookingOptions {
  serviceId: string;
  datetime: Date;
  clientName: string;
  clientEmail: string;
  phone: string;
}

function createBooking(options: BookingOptions) {
  // implementation
}

// Or with validation
function createBooking(
  options: BookingOptions,
  validate: boolean = true
) {
  // 2 parameters - passes pre-commit
}
```

## File Length Guidance

### Split Files Before Hitting 300-Line Limit

**Proactive splitting at 250 lines:**

```typescript
// booking-service.ts approaching 250 lines

// SPLIT INTO:
// booking-service.ts        (core service - 150 lines)
// booking-validation.ts     (validation logic - 80 lines)
// booking-notifications.ts  (email/SMS - 70 lines)
```

**File organization patterns:**

```
lib/booking/
  ├── booking-service.ts        # Main service (≤250 lines)
  ├── booking-validation.ts     # Validation helpers
  ├── booking-notifications.ts  # Notification logic
  ├── booking.types.ts          # Shared types
  └── index.ts                  # Barrel exports
```

## Duplication Threshold

**Extract on 2nd occurrence (before 3% threshold):**

```typescript
// ❌ BAD: Same validation in 3+ places
function createBooking(data: BookingData) {
  if (!data.email.includes('@')) throw new Error('Invalid email');
  // ...
}

function updateBooking(data: BookingData) {
  if (!data.email.includes('@')) throw new Error('Invalid email');
  // ...
}

// ✅ GOOD: Extract to shared utility
// lib/validation/email-validation.ts
export function validateEmail(email: string): void {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
}

// Use in multiple places
function createBooking(data: BookingData) {
  validateEmail(data.email);
  // ...
}

function updateBooking(data: BookingData) {
  validateEmail(data.email);
  // ...
}
```

## Override Protocol

**If genuinely need >50 lines (rare cases):**

1. **Stop generation** - Don't proceed with oversized function
2. **Ask human explicitly**: "This function requires 65 lines due to [specific reason]. Should I proceed or refactor further?"
3. **Wait for approval** - Don't assume exception is acceptable
4. **Document justification** - If approved, add comment explaining why

**Valid reasons for override:**

- Complex algorithm that loses clarity when split
- Switch statement with 10+ cases (each case is simple)
- Configuration object with 20+ required fields

**Invalid reasons:**

- "It's easier to write as one function"
- "Splitting would create extra files"
- "The logic is related"

## Pre-Commit Verification Checklist

Before attempting commit, verify:

- [ ] All functions ≤50 lines (check with line counter)
- [ ] All files ≤300 lines
- [ ] All functions ≤3 parameters (or using options object)
- [ ] No duplicated code blocks (extracted to utilities)
- [ ] Complex logic split into focused functions
- [ ] File split if approaching 250 lines

## Success Metrics

- **Generate compliant code first time** - No rejection cycles
- **Pre-commit passes automatically** - No manual fixes needed
- **Zero functions >50 lines** - Enforced at commit time
- **Zero files >300 lines** - Split proactively
- **Duplication <3%** - Extract on 2nd occurrence

## Key Principle

**Write code that will pass pre-commit checks BEFORE committing.**

Don't generate code that will be rejected. If approaching limits during generation, refactor immediately. Pre-commit enforcement is absolute - there is no bypass.