# Client-Side Auth Hook Testing - MSW/Fetch Mocking Resolution

**Status**: In Progress
**Priority**: Medium
**Estimated Effort**: low/medium
**Created**: 2025-10-16

## Objective

Fix 9 failing client-side authentication hook tests by resolving MSW/fetch mocking architectural conflicts and achieve 80%+ coverage for the auth module.

## Background

Previous strategic test coverage implementation achieved:
- ✅ API Endpoints: 80%+ coverage (54 tests)
- ⚠️ Authentication: 65% coverage (target: 80%)
- ✅ Business Logic: 85%+ maintained
- ✅ 92 tests added (29 auth tests passing, 9 client-side tests failing)
- ✅ Test execution time: ~13 seconds for full suite
- ✅ Zero test flakiness maintained

## Root Cause Analysis

**Component**: `lib/auth/useAdminAuth.ts`
**Current Coverage**: ~35%
**Target Coverage**: 80%
**Gap**: 9 tests failing due to MSW/fetch architecture conflict

**Technical Issue**:
- Client-side hook uses browser `fetch` API
- Test setup uses global `fetch` mock for other tests
- Global fetch mock interferes with MSW's own fetch interception
- MSW handlers fail when global fetch is mocked
- Conflict between test infrastructure layers

**Current Mitigation**:
- Server-side auth logic fully covered (95%+)
- E2E tests provide end-to-end coverage for client-side flows
- Integration tests validate auth flows at API layer
- No security risk: authentication logic thoroughly tested

## Implementation Roadmap

- [ ] **Step 1**: Analyze global fetch mock in `__tests__/setup.ts` (or similar setup files)
- [ ] **Step 2**: Remove or refactor global fetch mock to avoid MSW conflicts
- [ ] **Step 3**: Update MSW handlers to work with native fetch
- [ ] **Step 4**: Run client-side auth hook tests (`__tests__/lib/auth/useAdminAuth.test.ts`)
- [ ] **Step 5**: Verify all 9 tests pass
- [ ] **Step 6**: Confirm 80%+ coverage for `lib/auth/` directory
- [ ] **Step 7**: Run full test suite to ensure no regressions (should maintain 321+ passing tests)
- [ ] **Step 8**: Execute quality gates (lint, type-check, test, security, build)
- [ ] **Step 9**: Commit changes with conventional commit message
- [ ] **Step 10**: Update documentation if new patterns developed

## Test Cases to Fix

All 9 client-side hook tests in `__tests__/lib/auth/useAdminAuth.test.ts`:
- Hook initialization with valid session
- Login flows (success scenarios)
- Login flows (error scenarios)
- Logout flows
- Session refresh operations

## Related Files

**Test Files**:
- `__tests__/lib/auth/useAdminAuth.test.ts` (9 failing tests)
- `__tests__/setup.ts` or similar (global fetch mock location)
- `__tests__/setup/test-utils.tsx` (test utilities)

**Implementation**:
- `lib/auth/useAdminAuth.ts` (hook implementation)

**MSW Setup**:
- `__tests__/setup/handlers.ts` (MSW request handlers)
- `__tests__/setup/server.ts` (MSW server setup)
- `__tests__/setup/msw-setup.js` (MSW initialization)

## Success Criteria

- [ ] All 9 client-side auth hook tests passing
- [ ] 80%+ coverage for `lib/auth/` directory
- [ ] No MSW/fetch conflicts
- [ ] Zero test flakiness maintained
- [ ] All quality gates passing
- [ ] No regressions in existing 321+ passing tests

## Circuit Breakers

- If architectural changes needed beyond test setup: Escalate to Architect mode
- If alternative approach needed (e.g., node-fetch polyfill): Document and escalate

## Pattern Applications

**Applying from patterns/index.md**:
- Testing patterns for React hooks
- MSW handler setup patterns
- Test isolation patterns

**New patterns to document**:
- MSW/fetch mocking resolution approach (if reusable solution developed)
- Client-side auth hook testing pattern (complete version)

## Quality Gates

Pre-commit verification:
- [ ] `npm run lint` (ESLint + Prettier)
- [ ] `npm run type-check` (TypeScript compilation)
- [ ] `npm run test:critical` (Essential tests)
- [ ] `npm run security:scan` (Security check)
- [ ] `npm run build:verify` (Build verification)