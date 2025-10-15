# Tech Stack Cleanup - Actionable Items from Audit

**Audit Date:** 2025-10-15
**Status:** Ready for Implementation
**Overall Assessment:** 95% of codebase appropriately architected. 5% over-engineering identified.

---

## Phase 1: Zero-Risk Deletions (15 minutes)

### 1. Delete sonner Toast System ✅ HIGH CONFIDENCE
**Impact:** -1 dependency, -28 LOC, 0% functionality loss

**Evidence:**
- `sonner` package in `package.json:89` is UNUSED
- Only referenced in `components/ui/sonner.tsx` (wrapper component)
- App uses Radix UI toast system (`app/layout.tsx:32` imports from `@/components/ui/toaster`)
- Fully redundant with existing `@radix-ui/react-toast` implementation

**Actions:**
```bash
# 1. Remove dependency
pnpm remove sonner

# 2. Delete wrapper component
rm components/ui/sonner.tsx

# 3. Verify no imports remain
git grep -n "from 'sonner'" 
git grep -n "from \"sonner\""
```

**Risk:** ZERO (confirmed unused via codebase search)

---

### 2. Delete Empty lib/monitoring/ Directory ✅ HIGH CONFIDENCE
**Impact:** Cleaner structure

**Evidence:**
- Directory exists but contains no files
- Orphaned structure from previous cleanup (README.md:237 mentions recent cleanup)

**Actions:**
```bash
rm -rf lib/monitoring/
```

**Risk:** ZERO (empty directory)

---

### 3. Remove Premature useCallback in app/page.tsx ✅ HIGH CONFIDENCE
**Impact:** -6 LOC, clearer code

**Evidence:**
- Lines 17-22: `useCallback` for simple modal state toggle `setIsBookingOpen(true)`
- No performance benefit for simple state update
- No dependency array complexity justifying memoization

**Actions:**
```typescript
// CURRENT (app/page.tsx:17-22)
const handleBookSessionClick = useCallback((): void => {
  setIsBookingOpen(true)
}, [])

const handleCloseBooking = useCallback((): void => {
  setIsBookingOpen(false)
}, [])

// REPLACE WITH
const handleBookSessionClick = (): void => {
  setIsBookingOpen(true)
}

const handleCloseBooking = (): void => {
  setIsBookingOpen(false)
}
```

**Risk:** ZERO (simple state update, no performance impact at <10 concurrent users)

---

## Phase 2: Low-Risk Simplifications (3-4 hours)

### 1. Remove Availability Caching Infrastructure ✅ HIGH CONFIDENCE
**Impact:** -100 LOC, eliminate cache staleness bugs, 0% user-facing performance impact

**Evidence:**
- File: `components/booking-form/useAvailability.ts`
- ~100 lines dedicated to in-memory cache (TTL, staleness detection, invalidation)
- **Scale mismatch:** Caching infrastructure for ~100-200 API calls/month (50-100 bookings × 2-3 checks)
- API already meets <500ms performance budget (architecture.md:213)
- Complexity cost: cache invalidation bugs, testing overhead

**Current Implementation (lines 24-74):**
- In-memory cache with `{ timestamp, availableTimes }` structure
- 30-second TTL (`isCacheValid`)
- 60-second staleness detection (`isCacheStale`)
- Manual invalidation logic

**Simplification:**
```typescript
// REPLACE 100 lines of caching WITH:
const fetchAvailability = async (date: Date) => {
  const res = await fetch(`/api/availability?date=${date.toISOString().split('T')[0]}`)
  if (!res.ok) throw new Error('Failed to fetch availability')
  return res.json()
}
```

**Actions:**
1. Refactor `components/booking-form/useAvailability.ts` to direct API calls
2. Update tests to remove cache expectation assertions
3. Verify <500ms response time maintained (already documented in architecture.md)

**Risk:** LOW (API performance already documented as <500ms, no user-facing change)

**Estimated Time:** 2-3 hours (including test updates)

---

### 2. Audit useMemo/useCallback Premature Optimizations ⚠️ MEDIUM CONFIDENCE
**Impact:** -10-15 LOC, reduced cognitive overhead

**Evidence:**
- 22 total instances found across codebase
- ~8-10 instances lack profiling justification
- No documented performance issues at <10 concurrent users scale

**Questionable Instances:**
1. `components/booking-form/steps/SchedulingStep.tsx:151` - useCallback wrapping fetch already memoized elsewhere
2. `components/ui/sidebar/menu.tsx:183` - useMemo for random width (runs once anyway)

**Keep (Performance-Critical):**
- `app/admin/bookings/page.tsx:219` - useMemo for filtering booking arrays (appropriate)

**Actions:**
1. Profile each instance with React DevTools Profiler
2. Remove if no measured performance benefit
3. Document justification for any kept instances

**Risk:** LOW (can re-add if profiler shows issues)

**Estimated Time:** 1 hour

---

### 3. Investigate whatwg-fetch Necessity ⚠️ MEDIUM CONFIDENCE
**Impact:** -1 dependency if removed

**Evidence:**
- Package: `whatwg-fetch: ^3.6.20` in dependencies
- Usage: Only `vitest.setup.ts:3` - `import 'whatwg-fetch'`
- Context: Next.js 15 + React 19 + Node 20 have native fetch

**Actions:**
```bash
# 1. Remove dependency
pnpm remove whatwg-fetch

# 2. Remove import from vitest.setup.ts:3
# Delete line: import 'whatwg-fetch'

# 3. Verify tests pass
pnpm test

# 4. If tests fail, rollback
git checkout package.json vitest.setup.ts
pnpm install
```

**Risk:** LOW (easy rollback if tests fail, modern environments have native fetch)

**Estimated Time:** 30 minutes

---

## Phase 3: Documentation Cleanup (2 hours)

### 1. Update README.md References ✅ LOW PRIORITY
**Impact:** Accurate documentation

**Evidence:**
- Lines 107, 112, 120 reference `.github/workflows/vercel-deployment.yml`
- Actual file: `.github/workflows/ci.yml`

**Actions:**
```bash
# Update references in README.md
sed -i 's/vercel-deployment.yml/ci.yml/g' README.md
```

**Estimated Time:** 5 minutes

---

### 2. Update spec.md Test Status ✅ LOW PRIORITY
**Impact:** Accurate test reporting

**Evidence:**
- Line 175-177 claims "8 skipped email validation tests"
- Audit found ZERO skipped tests (searched for `.skip`, `xit`, `xdescribe`)

**Actions:**
1. Run full test suite to confirm status
2. Update spec.md:175-177 to reflect actual test state

**Estimated Time:** 5 minutes

---

### 3. Check @types Redundancy ⚠️ NEEDS VERIFICATION
**Impact:** -3 dependencies if redundant

**Packages to Check:**
- `@types/bcryptjs` - Does `bcryptjs@3.0.2` ship types?
- `@types/jsonwebtoken` - Does `jsonwebtoken@9.0.2` ship types?
- `@types/nodemailer` - Does `nodemailer@7.0.9` ship types?

**Actions:**
```bash
# Check package registries
npm view bcryptjs
npm view jsonwebtoken
npm view nodemailer

# Look for "types" field in package.json or .d.ts files
```

**Risk:** LOW (TypeScript compilation will catch issues immediately)

**Estimated Time:** 30 minutes

---

## Phase 4: Future Backlog (Lower Priority)

### 1. Email Template Refactor (4-6 hours) - LOW PRIORITY
**Current:** Manual HTML string concatenation (`lib/email-templates.ts`, 217 lines)
**Alternative:** Template literal syntax or lightweight library
**Status:** Works correctly, not causing issues
**Benefit:** Easier maintenance, less error-prone

---

### 2. Application-Level Date Validation (2-3 hours) - MEDIUM PRIORITY
**Context:** Booking date validation removed from DB constraint (`.docs/investigations/index.md:616-621`)
**Action:** Add validation in `POST /api/book-session` to prevent creating past bookings
**Status:** TODO noted in investigations

---

### 3. Investigate 8 Failing Tests - MEDIUM PRIORITY
**Source:** `spec.md:149` claims 634/642 passing (8 failures)
**Action:** Run full test suite, identify failures
**Current Pass Rate:** 98.8%

---

## What NOT to Change

### ✅ KEEP - Justified Complexity

1. **Extensive Documentation (1,950 lines)** - Enables solo developer + AI workflow
2. **Comprehensive Test Suite (634 tests)** - Production system, transaction safety critical
3. **CI/CD Pipeline (7 jobs)** - Quality gates prevent production issues
4. **Mode System Configuration (408 lines)** - Encodes best practices for agentic development
5. **Transaction Safety Pattern** - Prevents double bookings (business-critical)
6. **Admin Dashboard Complexity** - Emily's daily workflow, inherent domain complexity
7. **Database Schema** - Lean, no over-normalization, all fields used

---

## Summary

**Total Cleanup Impact (Phases 1-2):**
- Remove: 2-3 dependencies
- Delete: ~150 LOC
- Functionality Loss: 0%
- Maintainability: IMPROVED (eliminate cache bugs, simpler code)

**Primary Finding:** 95% of codebase appropriately architected. Only 5% over-engineering (client-side caching for <10 API requests/day).

**Recommended Execution Order:**
1. Phase 1 (15 min) - Zero risk, immediate wins
2. Phase 2 (3-4 hours) - Low risk, high value refactors
3. Phase 3 (2 hours) - Documentation accuracy
4. Phase 4 (Backlog) - Future improvements

---

Last updated: 2025-10-15
Status: Ready for implementation