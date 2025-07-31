# Testing Workflow Documentation

## Overview

This document outlines our **staged testing strategy** that balances development velocity with quality assurance. We use **test categorization** to allow different quality gates at different stages of the development lifecycle.

## Test Categories

### 🟢 Critical Tests (`pnpm test:critical`)

**Purpose**: Core business logic that MUST work for the application to function
**When**: Pre-commit, pre-push, CI/CD (blocking)
**Coverage**:

- API route functionality
- Email service core logic
- Database operations
- Schema validation
- Utility functions
- Stable component logic

**Files Included**:

- `__tests__/api/**/*.test.ts`
- `__tests__/lib/**/*.test.ts`
- `__tests__/integration/booking-api.integration.test.ts`
- `__tests__/integration/email-service.integration.test.ts`
- `__tests__/integration/database.integration.test.ts`
- `__tests__/integration/error-scenarios.integration.test.ts`
- `__tests__/components/booking-form.logic.test.tsx`
- `__tests__/components/ui/button.test.tsx`

### 🟡 Integration Tests (`pnpm test:integration`)

**Purpose**: Complex UI interactions and user flows
**When**: CI/CD (non-blocking with warnings), pre-release (blocking)
**Coverage**:

- Component integration testing
- Multi-step user workflows
- UI state management
- Form interactions

**Files Included**:

- `__tests__/integration/booking-form-component.integration.test.tsx`
- `__tests__/integration/calendar-component.integration.test.tsx`
- `__tests__/components/booking-form.test.tsx`

### 🔵 Full Test Suite (`pnpm test:full`)

**Purpose**: Complete application testing including known failing tests
**When**: Pre-release, manual testing, debugging
**Coverage**: All tests including temporarily failing ones

## Workflow Stages

### 1. Development (Local)

```bash
# Watch mode for rapid feedback
pnpm test:watch

# Run critical tests before committing
pnpm test:critical
```

### 2. Pre-commit Hook

- **Runs**: Lint-staged (formatting, linting)
- **Tests**: None (for speed)
- **Blocks commit**: Yes, on linting/formatting errors

### 3. Pre-push Hook

- **Runs**: Type checking, linting, critical tests, build validation
- **Tests**: `pnpm test:critical`
- **Blocks push**: Yes, on any failure

### 4. CI/CD Pipeline

#### Critical Quality Gates (Blocking)

- Type checking
- Linting
- Critical tests
- Build validation
- Bundle size check
- Lighthouse performance

#### Non-Critical Quality Gates (Warning only)

- Integration tests
- Performance regressions (monitored)

### 5. Pre-release

- **Runs**: Full test suite
- **Tests**: `pnpm test:full`
- **Blocks release**: Yes, all tests must pass

## Failing Test Management

### Documentation

All failing tests are tracked in [`.docs/failing-tests.md`](.docs/failing-tests.md) with:

- Root cause analysis
- Priority level
- Estimated effort
- Target resolution timeline
- Assigned owner

### Workflow

1. **Identify**: Failing test discovered
2. **Categorize**: Determine if critical or integration
3. **Document**: Add to failing tests tracking
4. **Exclude**: Remove from critical test suite if needed
5. **Schedule**: Assign to sprint/milestone
6. **Resolve**: Fix underlying issue (not just test)
7. **Re-include**: Add back to appropriate test suite

### Rules

- ❌ **Never delete failing tests** without fixing the underlying issue
- ✅ **Always document** why tests are excluded
- ✅ **Set clear timelines** for resolution
- ✅ **Regular review** in sprint planning

## Commands Reference

### Development

```bash
pnpm test:watch              # Watch mode for active development
pnpm test:critical           # Run only critical tests
pnpm test:integration        # Run only integration tests
pnpm test:full               # Run all tests (including failing)
```

### CI/CD

```bash
pnpm test:critical:ci        # Critical tests with coverage
pnpm test:integration:ci     # Integration tests (can fail)
pnpm test:ci                 # Full test suite with coverage
```

### E2E Testing

```bash
pnpm test:e2e               # Run Playwright tests
pnpm test:e2e:ui            # Run with Playwright UI
```

## Configuration Files

- **`jest.config.ts`**: Default Jest configuration (all tests)
- **`jest.config.critical.ts`**: Critical tests only configuration
- **`playwright.config.ts`**: E2E test configuration

## Quality Metrics

### Success Criteria

- ✅ Critical tests: 100% pass rate
- ✅ Integration tests: >90% pass rate (tracked failures acceptable)
- ✅ Code coverage: >80% for critical business logic
- ✅ Build success: 100% success rate
- ✅ Performance: Core Web Vitals within thresholds

### Monitoring

- **Test execution time**: Critical tests <30s, Full suite <5min
- **Flaky test rate**: <5% for critical tests
- **Resolution time**: Failing tests resolved within 2 sprints
- **Coverage trends**: Maintained or improving over time

## Best Practices

### Test Writing

1. **Critical tests**: Focus on business logic, avoid UI details
2. **Integration tests**: Test user workflows and complex interactions
3. **Mocking**: Use MSW for realistic API mocking
4. **Accessibility**: Include a11y testing in all UI tests
5. **Performance**: Consider test execution speed

### Test Maintenance

1. **Regular review**: Weekly review of failing tests
2. **Refactoring**: Update tests when requirements change
3. **Documentation**: Keep test documentation current
4. **Patterns**: Extract reusable test patterns and helpers

### Debugging

1. **Isolation**: Run individual test files for debugging
2. **Verbose output**: Use `--verbose` flag for detailed output
3. **Coverage reports**: Use coverage to identify untested code
4. **CI logs**: Check CI logs for environment-specific issues

## Migration Guide

### From Previous Workflow

1. **Immediate**: Start using `pnpm test:critical` for pre-push
2. **Week 1**: Update local development workflow
3. **Week 2**: Team training on new categories
4. **Week 3**: Full adoption and monitoring

### Rollback Plan

If issues arise, temporarily revert to:

```bash
# In .husky/pre-push, change back to:
pnpm test || { print_error "Tests failed."; exit 1; }
```

## Support

### Troubleshooting

- **Critical tests failing**: Must be fixed before push
- **Integration tests failing**: Document in failing-tests.md
- **CI/CD issues**: Check GitHub Actions logs
- **Performance issues**: Review test execution patterns

### Team Resources

- **Documentation**: This file and `.docs/failing-tests.md`
- **Examples**: Existing test files for patterns
- **Tools**: Jest, Playwright, MSW, Testing Library
- **Support**: Team lead for complex testing scenarios
