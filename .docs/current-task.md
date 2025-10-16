# Strategic Test Coverage Implementation Plan

**Objective**: Implement recommended coverage targets for MoodOverMuscle
- Business logic (booking/payment): >85%
- Authentication/authorization: >80%
- API endpoints: >80%
- UI components: >60%

## Implementation Roadmap

### Phase 1: Configuration & Baseline
- [ ] Update vitest.config.critical.ts with auth coverage thresholds (80%)
- [ ] Update vitest.config.critical.ts with API coverage thresholds (80%)
- [ ] Run coverage report to establish baseline (`npm run test:ci`)
- [ ] Document current coverage gaps by category

### Phase 2: Authentication/Authorization Coverage (Target: >80%)
- [ ] Analyze current auth test coverage gaps
- [ ] Add tests for uncovered paths in lib/auth/admin-auth-handlers.ts
- [ ] Add tests for uncovered paths in lib/auth/admin-auth.ts
- [ ] Add tests for uncovered paths in lib/utils/admin-auth-check.ts
- [ ] Verify 80% threshold met for lib/auth/**/*.ts

### Phase 3: API Endpoint Coverage (Target: >80%)
- [ ] Analyze current API test coverage gaps
- [ ] Add tests for uncovered paths in app/api/admin/bookings/route.ts
- [ ] Add tests for uncovered paths in app/api/admin/stats/route.ts
- [ ] Add tests for uncovered error scenarios in app/api/book-session/route.ts
- [ ] Verify 80% threshold met for app/api/**/*.ts

### Phase 4: Verification & Documentation
- [ ] Run full test suite and verify all thresholds pass
- [ ] Update .docs/patterns/index.md with coverage strategy patterns
- [ ] Commit changes with conventional commit message
- [ ] Document coverage approach in .docs/architecture.md

## Current Status
**Active Task**: Phase 1 - Configuration & Baseline
**Next Action**: Update vitest.config.critical.ts with auth and API thresholds

## Coverage Targets Summary
✅ **Business Logic**: 85% (already configured and passing)
⚠️ **Authentication**: 80% (needs threshold configuration)
⚠️ **API Endpoints**: 80% (needs threshold configuration)
✅ **UI Components**: 60-75% (acceptable with E2E coverage)

## Quality Gate Compliance
- Pre-commit hooks: Configured ✅
- Critical tests: Passing ✅
- Coverage thresholds: Needs update for auth/API ⚠️
- E2E tests: Comprehensive coverage ✅

## Appetite Constraints
- **Time**: 1-2 focused sessions per phase
- **Scope**: Configure thresholds → identify gaps → add targeted tests
- **Circuit Breaker**: If any phase exceeds 4 hours, escalate for scope adjustment