# Investigation: 52 Failing Admin Component Tests

**Date:** 2025-10-13  
**Investigator:** Claude (Investigation Mode)  
**Status:** Root causes identified, systematic fix approach defined

## Summary

Identified root causes for 52 failing tests across 7 test files. All failures fall into two categories:
1. **NextRequest constructor issues** (15 failures)
2. **Mock fetch structure issues** (37 failures)

## Failing Test Files

1. `__tests__/api/admin-authentication-core.test.ts` - 15 failures
2. `__tests__/components/admin/bookings.test.tsx` - ~15 failures
3. `__tests__/components/admin/calendar.test.tsx` - ~15 failures
4. `__tests__/components/booking-form.test.tsx` - ~2 failures
5. `__tests__/integration/admin-components/admin-workflow.integration.test.tsx` - ~2 failures
6. `__tests__/integration/booking-form-component.integration.test.tsx` - ~1 failure
7. `__tests__/integration/calendar-component.integration.test.tsx` - ~2 failures

## Root Cause Analysis

### Issue 1: NextRequest Constructor (15 failures)

**Problem:**
```typescript
new NextRequest('http://localhost:3000/api/admin/login', { ... })
// Error: NextRequest is not a constructor
```

**Root Cause:** `NextRequest` from `next/server` isn't directly constructible in Jest environment.

**Solution Pattern (from working tests):**
```typescript
// ✅ CORRECT
new Request('http://localhost:3000/api/admin/login', { ... }) as NextRequest

// ❌ INCORRECT
new NextRequest('http://localhost:3000/api/admin/login', { ... })
```

**Evidence:** Tests in `booking-cancellation.test.ts` and `booking-status-transitions.test.ts` use the cast pattern and pass.

**Affected Files:**
- `__tests__/api/admin-authentication-core.test.ts` (15 occurrences)

### Issue 2: Mock Fetch Structure (37 failures)

**Problem:** Mock responses don't properly structure the response object that components expect.

**Root Cause:** Tests mock `global.fetch` but don't properly handle:
- Response structure: `{ bookings: [...] }`
- Async handling with proper promise resolution
- Clone method for response objects
- Error state handling

**Evidence from test output:**
```
Error Loading Bookings
Cannot read properties of undefined (reading 'bookings')
```

**Affected Files:**
- `__tests__/components/admin/bookings.test.tsx`
- `__tests__/components/admin/calendar.test.tsx`
- Integration test files using fetch mocks

## Fix Strategy

### Phase 1: Fix NextRequest Constructor (Quick Win)

**Files to modify:**
1. `__tests__/api/admin-authentication-core.test.ts`

**Changes:**
- Replace all `new NextRequest(...)` with `new Request(...) as NextRequest`
- 4 locations in helper functions + 2 direct uses

**Time estimate:** 5 minutes  
**Impact:** Fixes 15 failures immediately

### Phase 2: Fix Admin Bookings Mocks

**Files to modify:**
1. `__tests__/components/admin/bookings.test.tsx`

**Analysis:**
- Mock fetch is set up but responses aren't awaited properly
- Some tests don't wait for component to finish loading
- Filter tests fail because search input retains value "s" instead of clearing

**Specific Issues:**
- Line 329: Test expects filtered results but component still loading
- Line 384: Clear filters doesn't actually clear search input value
- Line 393: Component in loading state when test tries to access search input
- Lines 448, 488, 519: Component shows error state instead of bookings

**Root Cause:** Mock responses return correct structure but async timing issues cause tests to run before component finishes rendering.

### Phase 3: Fix Admin Calendar Mocks

**Files to modify:**
1. `__tests__/components/admin/calendar.test.tsx`

**Analysis:** Similar to bookings - mock fetch timing and structure issues.

### Phase 4: Fix Remaining Integration Tests

**Files to modify:**
1. `__tests__/components/booking-form.test.tsx`
2. `__tests__/integration/admin-components/admin-workflow.integration.test.tsx`
3. `__tests__/integration/booking-form-component.integration.test.tsx`
4. `__tests__/integration/calendar-component.integration.test.tsx`

## Systematic Fix Approach

### Step 1: NextRequest Pattern Fix (Immediate)

```bash
# Apply fix to admin-authentication-core.test.ts
# Replace 4 instances in helper functions + 2 direct uses
```

### Step 2: Mock Fetch Pattern (Based on Working Tests)

Review working test patterns:
- `__tests__/integration/booking-cancellation.test.ts` (all passing)
- `__tests__/integration/booking-status-transitions.test.ts` (all passing)

Apply similar mock patterns to failing component tests.

### Step 3: Verify Each Fix

```bash
# Test each file individually after fixing
npm run test __tests__/api/admin-authentication-core.test.ts
npm run test __tests__/components/admin/bookings.test.tsx
npm run test __tests__/components/admin/calendar.test.tsx
```

### Step 4: Full Suite Verification

```bash
npm run test
# Expected: 0 failed, 642 passed
```

## Prevention Strategy

1. **Test Pattern Documentation:** Add examples of correct NextRequest usage to test helpers
2. **Mock Helper Functions:** Create shared mock response builders for fetch
3. **Pre-commit Hook:** Add check for `new NextRequest(` pattern (should use cast instead)

## Related Issues

None found in `.docs/investigations/index.md` - this is a new issue.

## Next Steps

1. Apply NextRequest fix systematically
2. Fix admin bookings mock structure and timing
3. Apply same fixes to admin calendar
4. Fix remaining integration tests
5. Verify all 642 tests pass
6. Document solution in patterns/index.md if reusable

## References

- Working test pattern: `__tests__/integration/booking-cancellation.test.ts:38`
- Working test pattern: `__tests__/integration/booking-status-transitions.test.ts:38`
- Failing test: `__tests__/api/admin-authentication-core.test.ts:39`
- Mock fetch setup: `__tests__/components/admin/bookings.test.tsx:103-107`