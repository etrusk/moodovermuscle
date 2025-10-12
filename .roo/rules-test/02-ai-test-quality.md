# Test Mode: AI Test Quality Anti-Patterns

**MANDATORY**: All tests must pass quality gates enforced by `scripts/test-quality-check.js`.

## Critical Quality Requirements

### 1. Explicit Type Assertions (REQUIRED)

**❌ FORBIDDEN:**
```typescript
// Weak assertion - doesn't verify structure
expect(result).toBeDefined();
expect(result).toBeTruthy();
expect(response).not.toBeNull();
```

**✅ REQUIRED:**
```typescript
// Strong type assertions - verify actual structure
expect(result).toMatchObject({
  id: expect.any(String),
  status: 'confirmed',
  clientEmail: expect.stringContaining('@')
});

expect(response).toEqual({
  success: true,
  data: expect.objectContaining({
    bookingId: expect.any(String)
  })
});
```

**Rule:** Every test MUST include at least one of:
- `toMatchObject()` - Partial object matching
- `toEqual()` - Deep equality check
- `toStrictEqual()` - Strict equality (including undefined)
- `toHaveBeenCalledWith()` - Mock verification with args

### 2. Error Condition Coverage (REQUIRED)

**❌ FORBIDDEN:**
```typescript
// Only testing happy path
it('should create booking', async () => {
  const result = await createBooking(validData);
  expect(result).toMatchObject({ status: 'confirmed' });
});
```

**✅ REQUIRED:**
```typescript
// Testing both success and failure cases
describe('createBooking', () => {
  it('should create booking with valid data', async () => {
    // Arrange
    const validData = { /* ... */ };
    
    // Act
    const result = await createBooking(validData);
    
    // Assert
    expect(result).toMatchObject({ status: 'confirmed' });
  });

  it('should throw error for invalid email', async () => {
    // Arrange
    const invalidData = { email: 'not-an-email' };
    
    // Act & Assert
    await expect(createBooking(invalidData)).rejects.toThrow('Invalid email');
  });

  it('should throw error for past date', async () => {
    // Arrange
    const pastDate = { datetime: new Date('2020-01-01') };
    
    // Act & Assert
    await expect(createBooking(pastDate)).rejects.toThrow('Cannot book past dates');
  });
});
```

**Rule:** Every test file MUST include at least one error condition test using:
- `toThrow()` - Synchronous error
- `rejects.toThrow()` - Async error
- Negative assertions (`not.toMatch()`, etc.)

### 3. AAA Pattern Comments (REQUIRED)

**❌ FORBIDDEN:**
```typescript
it('should process payment', async () => {
  const payment = { amount: 100 };
  const result = await processPayment(payment);
  expect(result.status).toBe('success');
});
```

**✅ REQUIRED:**
```typescript
it('should process payment successfully', async () => {
  // Arrange
  const payment = { amount: 100, currency: 'USD' };
  
  // Act
  const result = await processPayment(payment);
  
  // Assert
  expect(result).toMatchObject({
    status: 'success',
    transactionId: expect.any(String)
  });
});
```

**Rule:** Every test MUST have `// Arrange`, `// Act`, `// Assert` comments.

### 4. Mock Call Verification (REQUIRED for integration tests)

**❌ FORBIDDEN:**
```typescript
it('should send notification', async () => {
  const mockSendEmail = jest.fn();
  await notifyUser('user@example.com');
  // No verification of what was called
});
```

**✅ REQUIRED:**
```typescript
it('should send notification with correct data', async () => {
  // Arrange
  const mockSendEmail = jest.fn();
  const email = 'user@example.com';
  
  // Act
  await notifyUser(email, mockSendEmail);
  
  // Assert
  expect(mockSendEmail).toHaveBeenCalledWith({
    to: email,
    subject: expect.stringContaining('Booking'),
    body: expect.any(String)
  });
  expect(mockSendEmail).toHaveBeenCalledTimes(1);
});
```

**Rule:** When using mocks, MUST verify:
- `toHaveBeenCalledWith()` - Exact arguments
- `toHaveBeenCalledTimes()` - Call count

## AI Hallucination Prevention Checklist

**Before implementing tests, verify:**

- [ ] **API endpoints exist** - Check `app/api/` directory for actual routes
- [ ] **Database schema matches** - Check `prisma/schema.prisma` for models
- [ ] **Functions are exported** - Check source files for actual exports
- [ ] **Types are defined** - Check for TypeScript interfaces/types
- [ ] **Integration points are real** - Verify external services actually exist

**Common AI Hallucinations:**
- ❌ Testing non-existent API routes
- ❌ Assuming database fields that don't exist
- ❌ Importing functions not exported by module
- ❌ Using TypeScript types not defined in codebase
- ❌ Testing against mock APIs that don't match real implementation

**Prevention:** Always read actual source files before writing tests.

## Integration Point Contracts

**When testing integration points:**

```typescript
describe('Booking API Integration', () => {
  it('should create booking via POST /api/bookings', async () => {
    // Arrange
    const bookingData = {
      serviceId: 'valid-id',
      datetime: '2024-12-01T10:00:00Z',
      clientEmail: 'client@example.com'
    };
    
    // Act
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    const result = await response.json();
    
    // Assert - Verify contract
    expect(response.status).toBe(201);
    expect(result).toMatchObject({
      success: true,
      data: {
        id: expect.any(String),
        serviceId: bookingData.serviceId,
        status: expect.stringMatching(/^(pending|confirmed)$/)
      }
    });
  });
});
```

**Rule:** Integration tests MUST verify:
- HTTP status codes
- Response structure (success, data, error fields)
- Required fields in response
- Valid enum values

## Quality Gate Enforcement

**Pre-commit hook runs:**
```bash
npm run test:quality
```

**This validates:**
1. ✅ Every test has at least one type assertion (toMatchObject/toEqual)
2. ✅ Every test file has at least one error condition test
3. ✅ Every test has AAA comments
4. ✅ Mock calls are verified with toHaveBeenCalledWith()

**If quality gate fails:**
- Pre-commit is BLOCKED
- Fix test quality issues
- Re-run tests
- Commit again

## Test File Structure Template

```typescript
import { createBooking } from '@/lib/booking/booking-service';
import { BookingFormData } from '@/types/booking';

describe('Booking Service', () => {
  describe('createBooking', () => {
    it('should create booking with valid data', async () => {
      // Arrange
      const validData: BookingFormData = {
        serviceId: 'service-1',
        datetime: new Date('2024-12-01T10:00:00Z'),
        clientEmail: 'client@example.com',
        clientName: 'John Doe'
      };

      // Act
      const result = await createBooking(validData);

      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        status: 'pending',
        serviceId: 'service-1'
      });
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const invalidData = {
        ...validBookingData,
        clientEmail: 'not-an-email'
      };

      // Act & Assert
      await expect(createBooking(invalidData)).rejects.toThrow('Invalid email');
    });
  });
});
```

## Success Criteria

**Quality tests MUST:**
- ✅ Use strong type assertions (no toBeDefined only)
- ✅ Cover error conditions (at least 1 per file)
- ✅ Have AAA comments (every test)
- ✅ Verify mock calls (when mocking)
- ✅ Test real integration points (no hallucinated APIs)

**Quality gate blocks commits that:**
- ❌ Use only weak assertions (toBeDefined, toBeTruthy)
- ❌ Have no error condition tests
- ❌ Missing AAA comments
- ❌ Use mocks without verification