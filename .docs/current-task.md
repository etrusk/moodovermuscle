# Testing Infrastructure Improvements

**Status:** In Progress
**Priority:** HIGH - Technical debt resolution
**Estimated Effort:** 4-5 days

## Task Queue

### 1. Audit Existing Tests for Weak Assertions (4 hours) ✅ COMPLETED
**Goal**: Replace all weak assertions with specific value assertions

**Scope**:
```bash
# Find all weak assertions
grep -rE "toBeDefined|toBeTruthy|toBeGreaterThan\(0\)" __tests__/ --include="*.test.ts" --include="*.test.tsx"
```

**Completed Actions**:
- ✅ Fixed `scripts/test-quality-check.js` (grep regex and find command syntax issues)
- ✅ Replaced 26 weak assertions across 12 test files:
  - `toBeDefined()` → `toBeInstanceOf(HTMLElement)`, `toEqual({ ... })`
  - `toBeTruthy()` → `toBeInstanceOf()`, `toBe('')`
  - `toBeGreaterThan(0)` → `toHaveLength(n)`, `toBeGreaterThanOrEqual(n)`
- ✅ Split large test file to comply with complexity limits:
  - Split `layout.test.tsx` (736 lines) into 7 focused modules (< 250 lines each)
  - All 34 layout tests passing across split files

**Files Modified**:
1. `scripts/test-quality-check.js` - Fixed shell command syntax
2. `__tests__/components/admin/layout.test.tsx` - DELETED (split into 7 files)
3. `__tests__/components/admin/layout-authentication.test.tsx` - NEW (240 lines)
4. `__tests__/components/admin/layout-navigation.test.tsx` - NEW (151 lines)
5. `__tests__/components/admin/layout-session.test.tsx` - NEW (170 lines)
6. `__tests__/components/admin/layout-accessibility.test.tsx` - NEW (125 lines)
7. `__tests__/components/admin/layout-responsiveness.test.tsx` - NEW (113 lines)
8. `__tests__/components/admin/layout-edge-cases.test.tsx` - NEW (181 lines)
9. `__tests__/components/admin/layout-performance.test.tsx` - NEW (103 lines)
10. `__tests__/components/admin/bookings/bookings-display.test.tsx`
11. `__tests__/components/admin/calendar/calendar-interactions.test.tsx`
12. `__tests__/components/admin/calendar/calendar-accessibility.test.tsx`
13. `__tests__/components/classes/ServiceCardContent.test.tsx`
14. `__tests__/lib/auth/admin-auth-handlers.test.ts`
15. `__tests__/integration/admin-api-session.test.ts`
16. `__tests__/integration/admin-components/admin-workflow.integration.test.tsx`
17. `__tests__/integration/classes-booking-flow.test.tsx`
18. `__tests__/integration/error-scenarios.integration.test.ts`
19. `__tests__/app/classes/classes-page.test.tsx`
20. `__tests__/api/booking-validation.test.ts`

**Acceptance Criteria Met**:
- ✅ Zero instances of `toBeDefined()` in test files
- ✅ Zero instances of `toBeTruthy()` in test files
- ✅ All assertions verify specific expected values
- ✅ Test quality gate passes: `npm run test:quality`

**Results**:
```
✅ PASS: No weak assertions found
✅ PASS: All test files use AAA pattern
✅ PASS: All test files include error cases
⚠️  WARN: 1 integration test heavily mocked (acceptable)
✅ TEST QUALITY GATE PASSED
```

### 2. Fix or Delete 52 Failing Admin Tests (1-2 days)
**Goal**: Achieve 100% passing test suite (no excluded tests)

**Current Issue**: 
- 52 admin tests excluded from critical suite in `jest.config.critical.ts`
- Tests in: admin calendar, admin bookings, admin auth, admin workflow integration

**Action Required**:
For each failing test file:
1. Run test file: `npm test -- path/to/test.test.tsx`
2. Analyze failures: genuine bugs vs test brittleness
3. Decision tree:
   - If E2E test exists covering same behavior → DELETE unit test
   - If test is brittle (testing implementation details) → DELETE
   - If test catches real bug → FIX test properly
   - If unsure → FIX (default to keeping tests)

**Acceptance Criteria**:
- All tests in `__tests__/components/admin/` passing
- All tests in `__tests__/api/admin-*` passing
- All tests in `__tests__/integration/admin-*` passing
- Remove all entries from `testPathIgnorePatterns` in `jest.config.critical.ts`
- `npm run test:critical` passes with zero skipped tests

### 3. Vitest Migration (1-2 days)
**Goal**: Migrate from Jest to Vitest for faster execution and better ESM support

**Rationale**: Research shows 98% Vitest retention rate, 2-3x faster than Jest, native ESM

**Action Required**:
1. Install Vitest: `pnpm add -D vitest @vitest/ui`
2. Create `vitest.config.ts` (Jest-compatible API)
3. Update package.json scripts (replace jest commands)
4. Test migration: run full suite with Vitest
5. Update CI workflows (`.github/workflows/ci.yml`)
6. Remove Jest dependencies if all tests pass
7. Update documentation references

**Acceptance Criteria**:
- All tests pass under Vitest
- CI uses Vitest
- Test execution faster than Jest baseline
- No Jest dependencies in package.json
- Documentation updated