# Test Design: Booking Cancellation

**Created:** 2025-10-13
**Feature:** Booking cancellation functionality with status validation and audit trail

## Test Strategy

### Happy Path Tests
- [ ] Test 1: Cancel PENDING booking successfully with audit trail
- [ ] Test 2: Cancel CONFIRMED booking successfully with audit trail
- [ ] Test 3: Send email notification on cancellation
- [ ] Test 4: Cancellation with optional notes/reason

### Edge Cases
- [ ] Edge case 1: Prevent cancellation of COMPLETED booking (should return 400 error)
- [ ] Edge case 2: Prevent cancellation of already CANCELLED booking (should return 400 error)
- [ ] Edge case 3: Handle non-existent booking ID (should return 404)
- [ ] Edge case 4: Validate empty cancellation request body

### Error Conditions
- [ ] Error 1: Database transaction failure during cancellation
- [ ] Error 2: Audit trail creation failure (transaction rollback)
- [ ] Error 3: Email notification failure (non-blocking)
- [ ] Error 4: Invalid booking ID format

## Integration Points
- API endpoint: `POST /api/book-session/[id]/status` (existing status transition endpoint)
- Database schema: `Booking` table (status field), `BookingStatusChange` table (audit trail)
- External services: Email service (`lib/email.ts`) for customer/admin notifications
- Status transitions: PENDING → CANCELLED, CONFIRMED → CANCELLED (only valid transitions)

## Test File Structure
- `__tests__/integration/booking-cancellation.test.ts` - Integration tests for cancellation workflow
- Reuse existing mocking patterns from `booking-status-transitions.test.ts`

## Mocking Strategy
- Mock: Prisma database operations (using `testDb` from `__tests__/setup/test-db.ts`)
- Mock: Email service (`lib/email.ts`) - verify calls without sending
- Real: Status validation logic
- Real: Transaction wrapper logic

## Expected Assertions
- Type assertions: `toMatchObject`, `toEqual` for booking status changes
- Error assertions: `toThrow`, `rejects.toThrow` for invalid transitions
- Mock verification: `toHaveBeenCalledWith` for database operations and email sending
- Status code assertions: `toBe(200)` for success, `toBe(400)` for invalid transitions, `toBe(404)` for not found

## Business Logic Constraints
- PENDING → CANCELLED: ✅ Allowed
- CONFIRMED → CANCELLED: ✅ Allowed
- COMPLETED → CANCELLED: ❌ Not allowed (booking already completed)
- CANCELLED → CANCELLED: ❌ Not allowed (idempotency - already cancelled)

## Audit Trail Requirements
- Every cancellation must create a `BookingStatusChange` record
- Record must include: `fromStatus`, `toStatus`, `bookingId`, `createdAt`
- Should be created within same transaction as booking status update

## Notification Requirements
- Send customer notification on cancellation
- Send admin notification on cancellation
- Email failures should not block cancellation (log error but proceed)

## Test Data Setup
```typescript
// PENDING booking (cancellable)
{
  id: 'booking-cancel-pending',
  status: 'PENDING',
  email: 'customer@example.com'
}

// CONFIRMED booking (cancellable)
{
  id: 'booking-cancel-confirmed',
  status: 'CONFIRMED',
  email: 'customer2@example.com'
}

// COMPLETED booking (not cancellable)
{
  id: 'booking-completed',
  status: 'COMPLETED',
  email: 'completed@example.com'
}

// CANCELLED booking (not cancellable)
{
  id: 'booking-already-cancelled',
  status: 'CANCELLED',
  email: 'cancelled@example.com'
}
```

## Test Coverage Goals
- ✅ Valid cancellation scenarios (PENDING, CONFIRMED)
- ✅ Invalid cancellation scenarios (COMPLETED, CANCELLED)
- ✅ Audit trail creation
- ✅ Email notification verification
- ✅ Transaction rollback on failure
- ✅ Error handling for non-existent bookings