# Test Mode: Complexity Constraints

**CRITICAL**: Pre-commit WILL BLOCK test commits that violate complexity limits. Write focused tests that pass pre-commit checks upfront.

## Hard Limits (Apply to Test Files)

These limits are **automatically enforced** at commit time for test files:

- **Test functions: ≤50 lines** (AST-based detection)
- **Test files: ≤300 lines**
- **Function parameters: ≤3** (including test utilities)
- **Duplication: ≤3%** (jscpd threshold)

## Self-Monitoring Protocol for Tests

**CHECK DURING TEST GENERATION (not after):**

1. **Stop at 40 lines per test function** - If approaching 40, split into multiple focused tests
2. **Split test files at 250 lines** - Don't wait until 300 limit
3. **Extract setup to utilities if >30 lines** - Reduce test boilerplate
4. **Write multiple focused tests** - Not monolithic mega-tests

## Test Pattern: Multiple Focused Tests

### ❌ BAD: Monolithic Test Function (WILL BE BLOCKED)

```typescript
// Pre-commit will REJECT this - 85 lines
describe('BookingService', () => {
  it('should handle complete booking workflow', async () => {
    // Setup service
    const mockService = {
      id: 'service-1',
      name: 'Personal Training',
      duration: 60,
      price: 100
    };
    
    // Setup database mock
    const mockPrisma = {
      service: {
        findUnique: jest.fn().mockResolvedValue(mockService)
      },
      booking: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({
          id: 'booking-1',
          status: 'pending'
        })
      },
      activityLog: {
        create: jest.fn()
      }
    };
    
    // Setup email mock
    const mockEmailService = {
      send: jest.fn().mockResolvedValue(true)
    };
    
    // Create booking request
    const bookingRequest = {
      serviceId: 'service-1',
      datetime: new Date('2024-01-01T10:00:00Z'),
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      phone: '1234567890'
    };
    
    // Test service validation
    const service = await validateService(bookingRequest.serviceId);
    expect(service).toEqual(mockService);
    expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({
      where: { id: 'service-1' }
    });
    
    // Test availability check
    await checkAvailability(bookingRequest, service.duration);
    expect(mockPrisma.booking.findMany).toHaveBeenCalled();
    
    // Test booking creation
    const booking = await createBookingRecord(bookingRequest);
    expect(booking).toMatchObject({
      id: 'booking-1',
      status: 'pending'
    });
    expect(mockPrisma.booking.create).toHaveBeenCalledWith({
      data: {
        ...bookingRequest,
        status: 'pending'
      }
    });
    
    // Test notification
    await sendBookingNotification(booking, service);
    expect(mockEmailService.send).toHaveBeenCalledWith({
      to: bookingRequest.clientEmail,
      subject: 'Booking Confirmation',
      body: expect.stringContaining(service.name)
    });
    
    // Test activity logging
    await logBookingActivity(booking.id);
    expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        type: 'BOOKING_CREATED',
        bookingId: booking.id,
        timestamp: expect.any(Date)
      }
    });
  }); // 85 lines - BLOCKED by pre-commit
});
```

### ✅ GOOD: Multiple Focused Tests

```typescript
// Each test ≤50 lines - passes pre-commit

describe('BookingService', () => {
  describe('validateService', () => {
    it('should return service when found', async () => {
      // Arrange
      const mockService = {
        id: 'service-1',
        name: 'Personal Training',
        duration: 60,
        price: 100
      };
      
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      
      // Act
      const result = await validateService('service-1');
      
      // Assert
      expect(result).toEqual(mockService);
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: 'service-1' }
      });
    }); // ~20 lines
    
    it('should throw error when service not found', async () => {
      // Arrange
      mockPrisma.service.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(validateService('invalid-id')).rejects.toThrow(
        'Service not found'
      );
    }); // ~10 lines
  });
  
  describe('checkAvailability', () => {
    it('should pass when no conflicting bookings', async () => {
      // Arrange
      const request = {
        serviceId: 'service-1',
        datetime: new Date('2024-01-01T10:00:00Z')
      };
      
      mockPrisma.booking.findMany.mockResolvedValue([]);
      
      // Act & Assert
      await expect(
        checkAvailability(request, 60)
      ).resolves.not.toThrow();
    }); // ~15 lines
    
    it('should throw error when time slot unavailable', async () => {
      // Arrange
      const request = {
        serviceId: 'service-1',
        datetime: new Date('2024-01-01T10:00:00Z')
      };
      
      mockPrisma.booking.findMany.mockResolvedValue([
        { id: 'existing-booking', datetime: request.datetime }
      ]);
      
      // Act & Assert
      await expect(
        checkAvailability(request, 60)
      ).rejects.toThrow('Time slot not available');
    }); // ~18 lines
  });
  
  describe('createBookingRecord', () => {
    it('should create booking with pending status', async () => {
      // Arrange
      const request = {
        serviceId: 'service-1',
        datetime: new Date('2024-01-01T10:00:00Z'),
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        phone: '1234567890'
      };
      
      const expectedBooking = {
        id: 'booking-1',
        ...request,
        status: 'pending'
      };
      
      mockPrisma.booking.create.mockResolvedValue(expectedBooking);
      
      // Act
      const result = await createBookingRecord(request);
      
      // Assert
      expect(result).toEqual(expectedBooking);
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: { ...request, status: 'pending' }
      });
    }); // ~25 lines
  });
});
```

## AAA Pattern Within Limits

**Arrange-Act-Assert pattern keeps tests focused:**

```typescript
it('should validate email format', () => {
  // Arrange (setup test data)
  const validEmail = 'user@example.com';
  const invalidEmail = 'invalid-email';
  
  // Act (execute function)
  const validResult = validateEmail(validEmail);
  
  // Assert (verify outcome)
  expect(validResult).toBe(true);
  expect(() => validateEmail(invalidEmail)).toThrow('Invalid email');
}); // ~12 lines - clear and focused
```

## Complex Test Setup Guidance

### Extract Setup When >30 Lines

**❌ BAD: Inline complex setup**

```typescript
it('should process booking with all validations', async () => {
  // 40+ lines of setup
  const mockService = { /* ... */ };
  const mockUser = { /* ... */ };
  const mockBooking = { /* ... */ };
  const mockPrisma = { /* ... */ };
  const mockEmailService = { /* ... */ };
  // ... more setup
  
  // Act
  const result = await processBooking(data);
  
  // Assert
  expect(result).toBeDefined();
}); // 50+ lines - will be BLOCKED
```

**✅ GOOD: Extract setup to utilities**

```typescript
// __tests__/setup/booking-fixtures.ts
export function createMockBookingRequest(
  overrides?: Partial<BookingRequest>
): BookingRequest {
  return {
    serviceId: 'service-1',
    datetime: new Date('2024-01-01T10:00:00Z'),
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    phone: '1234567890',
    ...overrides
  };
}

export function createMockService(
  overrides?: Partial<Service>
): Service {
  return {
    id: 'service-1',
    name: 'Personal Training',
    duration: 60,
    price: 100,
    ...overrides
  };
}

// In test file
it('should process booking with all validations', async () => {
  // Arrange (concise with utilities)
  const request = createMockBookingRequest();
  const service = createMockService();
  setupBookingMocks(request, service);
  
  // Act
  const result = await processBooking(request);
  
  // Assert
  expect(result).toMatchObject({
    id: expect.any(String),
    status: 'pending'
  });
}); // ~15 lines - passes pre-commit
```

## Test File Organization

**Split test files by functionality:**

```
__tests__/
  lib/
    booking/
      booking-service.test.ts           # Core service tests (≤250 lines)
      booking-validation.test.ts        # Validation tests (≤200 lines)
      booking-notifications.test.ts     # Notification tests (≤150 lines)
  setup/
    booking-fixtures.ts                 # Shared test data
    test-helpers.ts                     # Shared utilities
```

## Duplication in Tests

**Extract repeated assertions to utilities:**

```typescript
// ❌ BAD: Repeated assertion patterns
it('should create booking', async () => {
  const result = await createBooking(data);
  expect(result).toHaveProperty('id');
  expect(result.id).toMatch(/^[a-z0-9-]+$/);
  expect(result).toHaveProperty('status', 'pending');
});

it('should update booking', async () => {
  const result = await updateBooking(id, data);
  expect(result).toHaveProperty('id');
  expect(result.id).toMatch(/^[a-z0-9-]+$/);
  expect(result).toHaveProperty('status', 'confirmed');
});

// ✅ GOOD: Extract to utility
function expectValidBookingId(booking: any) {
  expect(booking).toHaveProperty('id');
  expect(booking.id).toMatch(/^[a-z0-9-]+$/);
}

it('should create booking', async () => {
  const result = await createBooking(data);
  expectValidBookingId(result);
  expect(result).toHaveProperty('status', 'pending');
});

it('should update booking', async () => {
  const result = await updateBooking(id, data);
  expectValidBookingId(result);
  expect(result).toHaveProperty('status', 'confirmed');
});
```

## Pre-Commit Verification for Tests

Before committing test files:

- [ ] All test functions ≤50 lines
- [ ] Test files ≤300 lines
- [ ] Complex setup extracted to utilities
- [ ] Each test has clear AAA structure
- [ ] Multiple focused tests instead of mega-tests
- [ ] No duplicated assertion patterns (>3%)

## Success Metrics

- **Write focused tests first time** - No rejection cycles
- **Pre-commit passes automatically** - No manual fixes needed
- **Multiple small tests** - Each ≤50 lines
- **Clear test intent** - AAA pattern maintained
- **Reusable test utilities** - Extract on 2nd use

## Key Principle

**Write multiple focused tests that will pass pre-commit checks BEFORE committing.**

Don't write monolithic test functions. Split complex workflows into separate focused tests. Extract setup utilities when needed. Pre-commit enforcement is absolute.