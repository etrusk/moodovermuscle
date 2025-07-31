# Failing Tests Tracking

## Status: 12 failing tests (as of 2025-07-31)

### Integration Tests - Booking Form Component

**File**: `__tests__/integration/booking-form-component.integration.test.tsx`
**Status**: 🔴 FAILING
**Priority**: HIGH
**Reason**: Component behavior changes, test expectations need updating

**Failing Tests**:

1. `should disable submit button during form submission` - Button not being disabled as expected
2. `should validate required fields before submission` - Validation message text mismatch
3. `should handle date and time selection` - Calendar date selection failing
4. `should call onClose after successful submission` - Confirmation message not found
5. `should handle different service types` - Mock fetch not being called
6. `should handle form accessibility` - Missing test data attributes
7. `should maintain form state during validation errors` - Step navigation failing

**Root Cause**: Recent UI/UX changes to booking form component broke test expectations

**Action Required**:

- [ ] Update test selectors to match new component structure
- [ ] Fix mock setup for API calls
- [ ] Update validation message expectations
- [ ] Add missing test data attributes to components

**Estimated Effort**: 4-6 hours
**Assigned**: TBD
**Target Resolution**: Next sprint

### Integration Tests - Calendar Component

**File**: `__tests__/integration/calendar-component.integration.test.tsx`
**Status**: 🔴 FAILING
**Priority**: MEDIUM
**Reason**: Calendar library update changed behavior

**Failing Tests**: 4. Calendar-related date selection tests

**Root Cause**: react-day-picker library behavior changes

**Action Required**:

- [ ] Update calendar test interactions
- [ ] Verify date picker accessibility
- [ ] Update test data attributes

**Estimated Effort**: 2-3 hours
**Assigned**: TBD
**Target Resolution**: Next sprint

### Component Tests - Booking Form

**File**: `__tests__/components/booking-form.test.tsx`
**Status**: 🔴 FAILING
**Priority**: MEDIUM
**Reason**: UI changes removed close button or changed its accessibility label

**Failing Tests**:

1. `calls onClose when form is closed` - Cannot find close button with label "Close"

**Root Cause**: Component UI changes removed or modified close button accessibility

**Action Required**:

- [ ] Update test to use correct selector for close button
- [ ] Verify close button has proper accessibility label
- [ ] Update test expectations to match new UI

**Estimated Effort**: 1 hour
**Assigned**: TBD
**Target Resolution**: Next sprint

## Test Categories

### 🟢 Critical Tests (MUST PASS for commits/pushes)

- Unit tests for core business logic
- API route tests
- Email service tests
- Schema validation tests
- Stable integration tests

### 🟡 Integration Tests (Run in CI, can be temporarily skipped)

- Component integration tests
- End-to-end user flows
- Complex UI interactions

### 🔵 Full Test Suite (Run before releases)

- All tests including failing ones
- Performance tests
- Accessibility compliance
- Cross-browser compatibility

## Workflow

1. **Pre-commit**: Critical tests only
2. **Pre-push**: Critical tests only
3. **CI/CD**: Integration tests (allowed to fail with warnings)
4. **Pre-release**: Full test suite (all must pass)

## Resolution Process

1. **Triage**: Categorize failing test by priority and impact
2. **Track**: Add to this document with context and timeline
3. **Assign**: Allocate to team member or sprint
4. **Fix**: Address root cause, not just test symptoms
5. **Verify**: Ensure fix doesn't break other functionality
6. **Remove**: Update this document when resolved

## Notes

- Failing tests should never be deleted without fixing the underlying issue
- Test skipping is temporary and must be tracked
- All skipped tests must have clear resolution timeline
- Regular review of this document in sprint planning
