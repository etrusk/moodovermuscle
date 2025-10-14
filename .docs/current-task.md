# Replace Date Picker Popover to Enable 6 Skipped Tests

**Status:** ⚠️ PARTIAL SUCCESS - Tests Still Skipped
**Started:** 2025-10-14
**Completed:** 2025-10-14
**Mode:** Navigator → Implementation
**Goal:** Replace Popover-based date picker with inline calendar to fix React 19 + Radix UI focus-scope incompatibility

## Problem

6 critical booking integration tests are skipped due to React 19 + Radix UI focus-scope incompatibility causing infinite loop when opening date picker inside Dialog.

**Affected Tests:** `__tests__/integration/booking-form-component.integration.test.tsx`
- Line 103: "completes full booking flow from start to confirmation"
- Line 125: "preserves user data through multi-step wizard"
- Line 147: "displays validation errors from API"
- Line 167: "handles network failures gracefully"
- Line 213: "shows loading state during final submission"
- Line 240: "enables time selection only after date is chosen"

**Root Cause:** Nested focus scopes (Dialog → Popover → Calendar) trigger infinite setState loop
**Investigation:** `.docs/investigations/2025-01-14-radix-ui-react19-focus-scope.md`

## Solution Approach

Replace Popover wrapper with inline calendar display to eliminate nested focus-scope issue.

## Changes Required

### 1. Update DateSelector Component
**Target File:** `components/booking-form/steps/scheduling/DateSelector.tsx`

**Change Pattern:**
```tsx
// BEFORE (Popover-based)
<Popover>
  <PopoverTrigger>Select date</PopoverTrigger>
  <PopoverContent>
    <Calendar />
  </PopoverContent>
</Popover>

// AFTER (Inline)
<div className="date-selector-inline">
  <Calendar 
    selected={selectedDate}
    onSelect={setSelectedDate}
    disabled={unavailableDates}
  />
</div>
```

### 2. Add Styling
- Ensure inline calendar is mobile-responsive
- Proper spacing within booking form dialog
- Maintain accessibility

### 3. Update Tests
**File:** `__tests__/integration/booking-form-component.integration.test.tsx`

Actions:
- Remove `.skip()` from 6 tests
- Update test queries (no popover trigger to click)
- Verify all tests pass

### 4. Update Investigation Documentation
**File:** `.docs/investigations/2025-01-14-radix-ui-react19-focus-scope.md`

Add resolution section documenting the fix.

## Outcome

**What Was Accomplished:**
- ✅ Removed Popover wrapper (one less layer of nested focus scopes)
- ✅ Implemented inline calendar display
- ✅ Simplified user interaction (always-visible calendar)
- ✅ Updated investigation doc with findings

**What Wasn't Resolved:**
- ❌ Tests still fail with infinite loop/memory exhaustion
- ❌ Issue is deeper than just Popover focus-scope
- ❌ Likely react-day-picker + React 19 incompatibility

## Acceptance Criteria Status

- [ ] ~~All 6 previously skipped tests pass~~ - Tests still skipped (issue persists)
- [x] Calendar displays inline in booking form
- [x] Mobile responsive layout works
- [x] No popover component (removed)
- [x] Investigation doc updated with resolution attempt
- [x] Changes committed with conventional commit message

## Effort Estimate

**Total Appetite:** 2-3 hours
- Component refactor: 1 hour
- Test updates: 30 minutes
- Styling and mobile responsiveness: 30 minutes
- Verification and documentation: 30 minutes

## Circuit Breakers

- If inline calendar breaks existing functionality: Revert and escalate
- If tests still fail after changes: Document new issue and escalate
- If >3 hours: Stop and report progress

## Next Steps

1. Delegate to `implementation` mode
2. Refactor DateSelector to use inline calendar
3. Update tests and verify pass
4. Document resolution