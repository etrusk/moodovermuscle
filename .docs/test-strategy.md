# Test Strategy

## Testing Approach & Patterns

### Lean TDD Workflow Integration

- **RED Phase**: Write failing tests first, commit, verify failure
- **GREEN Phase**: Minimal implementation to pass tests, commit
- **REFACTOR Phase**: Clean code while maintaining test coverage, commit
- Test-driven development with atomic commits per cycle
- Continuous feedback through automated test execution

### Core Testing Principles

- **Accessibility First**: Every component must pass automated accessibility tests
- **Behavior Over Implementation**: Test what users experience, not internal details
- **Maintainable Tests**: Avoid brittle tests that break with styling changes
- **Comprehensive Coverage**: Include happy paths, error scenarios, and edge cases
- **Real-World Simulation**: Use realistic data and user interactions

## Test Automation & CI/CD Integration

### Quality Standards

- **WCAG 2.1 AA Compliance**: Automated accessibility testing required
- **User-Centric Testing**: Focus on user interactions and outcomes
- **Error Resilience**: Test failure scenarios and recovery paths
- **Performance Awareness**: Consider testing impact on build times

### Core Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Accessibility Testing**: jest-axe for WCAG 2.1 AA compliance
- **API Mocking**: Mock Service Worker (MSW) for realistic mocking
- **Test Data**: @faker-js/faker for realistic data generation
- **Coverage**: Jest built-in coverage reporting

### Automated Quality Gates

```bash
# Pre-commit hooks
npm run test:unit
npm run test:accessibility
npm run test:performance
npm run lint
npm run type-check
```

## Test Patterns & Automation Configs

### Unit Testing Patterns

```typescript
// Component testing with accessibility
import { axe, toHaveNoViolations } from 'jest-axe'
import { TEST_STRINGS } from '../constants/test-strings'

expect.extend(toHaveNoViolations)

describe('BookingForm', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<BookingForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<BookingForm />)

    await user.click(screen.getByRole('button', { name: TEST_STRINGS.BUTTONS.SUBMIT }))
    expect(screen.getByRole('alert')).toHaveTextContent(TEST_STRINGS.VALIDATION.REQUIRED_FIELD)
  })
})
```

### Accessibility Testing Integration

```typescript
// Automated accessibility checks
export const runAccessibilityTests = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-visible': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
}

// Screen reader testing
it('should announce form errors to screen readers', async () => {
  render(<BookingForm />)
  await user.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() => {
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveAttribute('aria-live', 'polite')
  })
})
```

### Performance Testing Approach

```typescript
// Core Web Vitals testing
describe('Performance', () => {
  it('meets Core Web Vitals thresholds', async () => {
    const metrics = await getWebVitals('/')
    expect(metrics.fcp).toBeLessThan(1800)
    expect(metrics.lcp).toBeLessThan(2500)
    expect(metrics.cls).toBeLessThan(0.1)
  })

  it('validates bundle size limits', () => {
    const bundleSize = getBundleSize()
    expect(bundleSize.javascript).toBeLessThan(150000) // 150KB
    expect(bundleSize.css).toBeLessThan(50000) // 50KB
  })
})
```

## RED/GREEN/REFACTOR Cycle Support

### Test Development Workflow

1. **RED**: Write failing test describing desired behavior
2. **GREEN**: Write minimal code to pass the test
3. **REFACTOR**: Improve code quality while maintaining green tests
4. **COMMIT**: Atomic commit after each phase completion

### Watch Mode Configuration

```json
{
  "scripts": {
    "test:watch": "jest --watch --verbose",
    "test:coverage": "jest --coverage --watchAll=false",
    "test:e2e:dev": "playwright test --ui",
    "test:a11y": "jest --testNamePattern=\"accessibility|a11y\""
  }
}
```

### Test Coverage Requirements

- Minimum 80% code coverage for critical business logic
- 100% coverage for booking flow and payment processing
- Accessibility compliance testing on all user-facing components
- Performance budgets enforced via Lighthouse CI

## PR Templates & Quality Gates

### PR Testing Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage maintained above thresholds
- [ ] Accessibility tests passing (WCAG 2.1 AA)
- [ ] Performance budgets not exceeded
- [ ] No console errors or warnings
- [ ] Cross-browser compatibility verified
- [ ] Screen reader compatibility tested

### Automated PR Checks

- Unit test suite completion
- Integration test validation with MSW
- E2E critical path verification
- Accessibility compliance check (jest-axe)
- Performance regression prevention (Lighthouse CI)
- Security vulnerability scanning

## Session Persistence for Testing

### Test State Management

- MSW handlers for consistent API mocking across sessions
- Persistent test database seeding for integration tests
- Snapshot testing for UI regression prevention
- Test artifacts preservation for debugging

### Development Environment Setup

```bash
# Restore testing session
npm run test:setup
npm run db:seed:test
npm run test:watch

# Run specific test types
npm run test:a11y
npm run test:performance
npm run test:e2e
```

### Test Constants & String Management

```typescript
// Maintainable test strings
export const TEST_STRINGS = {
  BOOKING: {
    CTA_BUTTON: /book.*free.*session/i,
    FORM_TITLE: /let's get to know you/i,
    SUCCESS_MESSAGE: /booking confirmed/i,
  },
  VALIDATION: {
    REQUIRED_FIELD: /required/i,
    INVALID_EMAIL: /valid email/i,
  },
} as const
```

## Critical Testing Areas

### Booking Flow Validation

- Form validation and error handling
- Payment processing integration
- Session scheduling and availability
- Email notification delivery
- Database transaction integrity

### Accessibility Compliance Areas

- WCAG 2.1 AA compliance verification
- Screen reader compatibility (NVDA, VoiceOver)
- Keyboard navigation support
- Color contrast validation (4.5:1 minimum)
- Focus management testing
- Touch target accessibility (44x44px minimum)

### Performance Monitoring

- Core Web Vitals tracking (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Bundle size monitoring and budgets
- API response time validation
- Database query optimization
- Image optimization verification

## Error Handling & Edge Cases

### Network & System Failures

- Network failure scenarios with MSW
- API timeout handling
- Database connection issues
- Payment processing failures
- Email delivery failures

### User Input Validation

- Invalid input validation
- Boundary condition testing
- Special character handling
- Form submission edge cases
- Session availability conflicts

### Mock Data Management

```typescript
// Realistic test data with faker.js
export const createMockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number('04## ### ###'),
  goals: faker.helpers.arrayElement(['weight-loss', 'strength', 'flexibility']),
  ...overrides,
})
```

## Maintenance & Best Practices

### Regular Maintenance Tasks

- **Weekly**: Review and update test constants for copy changes
- **Monthly**: Update mock data factories with new scenarios
- **Quarterly**: Review accessibility test coverage and patterns
- **Per Release**: Run full accessibility audit and update documentation

### Performance Considerations

- Use `screen.getByRole()` over `screen.getByTestId()` for better semantics
- Prefer `userEvent` over `fireEvent` for realistic interactions
- Use `waitFor()` for async operations, avoid arbitrary timeouts
- Mock heavy dependencies to keep tests fast
- Use MSW instead of mocking fetch directly
