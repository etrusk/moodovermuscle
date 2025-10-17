# Technical Debt

This document tracks known technical debt, gaps, and deferred work for future appetite allocation.

## Test Coverage Gaps

### Client-Side Auth Hook Testing

**Component**: `lib/auth/useAdminAuth.ts`  
**Created**: 2025-10-16  
**Category**: Test Coverage  
**Priority**: Medium  
**Impact**: Coverage gap (35% vs 80% target)

**Description**:
Client-side authentication hook tests are incomplete due to MSW/fetch mocking architectural conflicts. 9 tests are pending completion:
- Hook initialization with valid session
- Login flows (success and error scenarios)
- Logout flows
- Session refresh operations

**Root Cause**:
- Client-side hook uses browser `fetch` API
- Test setup uses global `fetch` mock for other tests
- Global fetch mock interferes with MSW's own fetch interception
- MSW handlers fail when global fetch is mocked

**Current Mitigation**:
- Server-side auth logic fully covered (95%+)
- E2E tests provide end-to-end coverage for client-side flows
- Integration tests validate auth flows at API layer
- No security risk: authentication logic thoroughly tested

**Proposed Solution**:
1. **Remove global fetch mock** from test setup (`__tests__/setup.ts`)
2. **Refactor MSW handlers** to avoid fetch conflicts
3. **Alternative**: Use `node-fetch` polyfill for test environment
4. **Verify**: All 9 client-side hook tests pass
5. **Achieve**: 80%+ coverage target for auth module

**Estimated Effort**: 2-4 hours  
**Appetite Allocation**: Dedicated test infrastructure improvement session  
**Dependencies**: None - can be tackled independently

**Related Files**:
- `__tests__/lib/auth/useAdminAuth.test.ts` (9 failing tests)
- `__tests__/setup.ts` (global fetch mock location)
- `lib/auth/useAdminAuth.ts` (implementation)

**Success Criteria**:
- All 9 tests passing
- 80%+ coverage for `lib/auth/` directory
- No MSW/fetch conflicts
- Zero test flakiness maintained

---

## Future Debt Items

*Add new technical debt items below as they are identified*