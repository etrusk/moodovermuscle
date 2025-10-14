# Testing Infrastructure Improvements

**Status:** Queued
**Priority:** HIGH - Technical debt resolution
**Estimated Effort:** 4-5 days

## Task Queue

### 1. Audit Existing Tests for Weak Assertions (4 hours)
**Goal**: Replace all weak assertions with specific value assertions

**Scope**:
```bash
# Find all weak assertions
grep -r "toBeDefined\|toBeTruthy\|toBeGreaterThan(0)" __tests__/ --include="*.test.ts" --include="*.test.tsx"
```

**Action Required**:
- Replace `toBeDefined()` with `toEqual(specificValue)`
- Replace `toBeTruthy()` with `toBe(true)` or specific value checks
- Replace `toBeGreaterThan(0)` with `toBe(expectedNumber)`
- Verify each replacement catches actual bugs by breaking code

**Acceptance Criteria**:
- Zero instances of `toBeDefined()` in test files
- Zero instances of `toBeTruthy()` in test files
- All assertions verify specific expected values
- Test quality gate passes: `npm run test:quality`

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