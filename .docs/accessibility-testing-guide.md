# Accessibility Testing Guide

## Overview

This guide provides comprehensive instructions for implementing and maintaining automated accessibility testing in the MoodOverMuscle project. The solution eliminates manual verification requirements while ensuring WCAG 2.1 AA compliance.

## Testing Architecture

### Three-Layer Testing Approach

1. **Unit Level**: Enhanced Jest + jest-axe with custom accessibility utilities
2. **Integration Level**: Playwright automation for complex user journeys
3. **System Level**: Enhanced Lighthouse CI with comprehensive rule enforcement

## Quick Start

### Running Accessibility Tests

```bash
# Run all accessibility tests
npm run test:accessibility:all

# Run specific test types
npm run test:accessibility:unit        # Jest unit tests
npm run test:accessibility:integration # Jest integration tests
npm run test:accessibility:e2e         # Playwright E2E tests

# Run Lighthouse accessibility audits
npm run lighthouse:accessibility:comprehensive

# Generate accessibility report
npm run accessibility:report

# Validate compliance
npm run accessibility:validate

# Check for regressions
npm run accessibility:regression-check
```

### Development Workflow

```bash
# Watch mode for development
npm run accessibility:dev

# Debug E2E tests
npm run accessibility:debug

# Local Lighthouse audit (no upload)
npm run accessibility:audit-dev
```

## Unit Testing with Enhanced Jest

### Basic Component Testing

```typescript
import { a11yTest, standardAccessibilityTests } from '@/__tests__/setup/accessibility-utils'
import { MyComponent } from '@/components/MyComponent'

// Quick accessibility check
test('component has no accessibility violations', async () => {
  await a11yTest.component(<MyComponent />)
})

// Comprehensive accessibility test suite
standardAccessibilityTests('MyComponent', () => <MyComponent />)
```

### Form Component Testing

```typescript
import { formAccessibilityTests } from '@/__tests__/setup/accessibility-test-patterns'
import { BookingForm } from '@/components/booking-form'

// Form-specific accessibility tests
formAccessibilityTests('BookingForm', () =>
  <BookingForm isOpen={true} onClose={() => {}} />
)
```

### Interactive Component Testing

```typescript
import { interactiveAccessibilityTests } from '@/__tests__/setup/accessibility-test-patterns'
import { Calendar } from '@/components/ui/calendar'

// Interactive component accessibility tests
interactiveAccessibilityTests('Calendar', () => <Calendar />)
```

### Custom Accessibility Tests

```typescript
import { accessibilityTestSuite } from '@/__tests__/setup/accessibility-utils'

test('custom accessibility validation', async () => {
  const results = await accessibilityTestSuite.validateComponent(<MyComponent />)

  // Assert specific accessibility requirements
  expect(results.axeResults).toHaveNoViolations()
  expect(results.keyboardNavigation.tabOrder.length).toBeGreaterThan(0)
  expect(results.screenReaderAnnouncements.labelAssociations).toBe(true)
  expect(results.focusManagement.visibleFocusIndicators).toBe(true)
})
```

## E2E Testing with Playwright

### User Journey Testing

```typescript
import { e2eA11yTest, UserJourney } from './utils/accessibility-helpers'

test('booking flow accessibility', async ({ page }) => {
  const bookingJourney: UserJourney = {
    name: 'Complete Booking Flow',
    steps: [
      {
        name: 'Homepage Load',
        execute: async page => {
          await page.goto('/')
          await page.waitForLoadState('networkidle')
        },
        accessibilityChecks: [
          { type: 'axe' },
          { type: 'keyboard' },
          { type: 'focus' },
        ],
      },
      // Additional steps...
    ],
  }

  const results = await e2eA11yTest.journey(page, bookingJourney)

  // All steps must pass accessibility checks
  for (const result of results) {
    expect(result.axeResults.violations).toEqual([])
  }
})
```

### Complex Interaction Testing

```typescript
test('modal dialog accessibility', async ({ page }) => {
  await page.goto('/')

  // Test modal accessibility
  await page.getByRole('button', { name: /book.*session/i }).click()

  // Validate modal accessibility
  const results = await e2eA11yTest.interactions(page)
  expect(results.modalDialogs[0].focusTrapping).toBe(true)
  expect(results.modalDialogs[0].escapeClosing).toBe(true)
})
```

### Cross-Browser Testing

```typescript
// Automatically runs across chromium, firefox, and mobile
npm run test:accessibility:cross-browser
```

## Lighthouse CI Integration

### Configuration

The enhanced Lighthouse configuration (`lighthouserc.accessibility.js`) includes:

- **95% minimum accessibility score** (raised from 90%)
- **Zero tolerance for critical violations**:
  - Color contrast: 100%
  - Image alt text: 100%
  - Form labels: 100%
  - Link names: 100%
  - Button names: 100%
  - Document structure: 100%

### Quality Gates

**Critical Gates (Build Blockers)**:

- Accessibility score ≥95%
- Color contrast: 100%
- Image alt text: 100%
- Form labeling: 100%
- Heading structure: 100%
- Landmark usage: 100%

**Warning Gates (Tracked)**:

- Skip links
- Tab index usage
- Advanced ARIA features

## CI/CD Integration

### GitHub Actions Workflow

The accessibility CI/CD pipeline includes:

1. **Unit accessibility tests** (must pass)
2. **Integration accessibility tests** (can fail with tracking)
3. **E2E accessibility tests** (must pass)
4. **Lighthouse accessibility audits** (must pass)
5. **Cross-browser testing**
6. **Regression detection**
7. **Compliance validation**

### Pull Request Integration

Automated PR comments include:

- Accessibility test results summary
- Violation counts and details
- Lighthouse scores
- Regression detection results
- Compliance status

## Regression Prevention

### Baseline Management

```bash
# Check for regressions (default)
npm run accessibility:regression-check

# Update baselines after improvements
npm run accessibility:regression-check update-baseline

# Generate regression report only
npm run accessibility:regression-check report-only
```

### Regression Detection

The system automatically detects:

- Decreased test pass rates
- Increased violation counts
- Lower Lighthouse scores
- New accessibility failures

### Baseline Updates

Baselines are automatically updated when:

- No regressions are detected
- Explicitly requested with `update-baseline`
- All accessibility metrics improve

## Compliance Validation

### Compliance Requirements

**Critical Requirements (Build Blockers)**:

- Unit accessibility tests: 100% pass rate
- Lighthouse accessibility: ≥95% score
- Zero critical accessibility violations

**Warning Requirements (Tracked)**:

- E2E accessibility tests: Pass rate tracked
- Advanced accessibility features: Monitored

### Compliance Reporting

```bash
# Validate current compliance
npm run accessibility:validate

# Generate compliance report
npm run accessibility:report
```

## Development Guidelines

### Component Development

1. **Start with accessibility**: Use semantic HTML and ARIA attributes
2. **Test early**: Run accessibility tests during development
3. **Use utilities**: Leverage provided accessibility testing utilities
4. **Follow patterns**: Use established accessibility test patterns

### Form Development

1. **Label all inputs**: Use proper labeling strategies
2. **Provide validation feedback**: Ensure accessible error messages
3. **Test keyboard navigation**: Verify tab order and focus management
4. **Test screen reader flow**: Validate announcements and structure

### Interactive Components

1. **Implement keyboard support**: Handle all keyboard interactions
2. **Manage focus**: Implement proper focus management
3. **Provide feedback**: Use ARIA live regions for dynamic content
4. **Test complex flows**: Validate multi-step interactions

## Troubleshooting

### Common Issues

**Unit Test Failures**:

- Check component markup for semantic HTML
- Verify ARIA attributes are correct
- Ensure proper labeling of form elements

**E2E Test Failures**:

- Verify keyboard navigation works correctly
- Check focus management in modals/dialogs
- Validate dynamic content announcements

**Lighthouse Failures**:

- Review color contrast ratios
- Check image alt text coverage
- Verify heading structure
- Validate landmark usage

### Debugging Tools

```bash
# Debug E2E tests with UI
npm run accessibility:debug

# Run Lighthouse locally
npm run accessibility:audit-dev

# Watch unit tests
npm run accessibility:dev
```

### Performance Considerations

- Unit tests run in parallel for speed
- E2E tests use optimized browser configurations
- Lighthouse uses multiple runs for consistency
- Regression checks use cached baselines

## Best Practices

### Test Organization

- Group related accessibility tests together
- Use descriptive test names
- Include context in test descriptions
- Maintain test data consistency

### Maintenance

- Review accessibility baselines regularly
- Update test patterns as components evolve
- Monitor compliance trends over time
- Address warnings before they become critical

### Team Workflow

- Run accessibility tests before committing
- Review accessibility reports in PRs
- Address regressions immediately
- Share accessibility knowledge across team

## Integration with Existing Workflow

### Git Hooks

```bash
# Pre-commit accessibility validation
npm run test:accessibility:unit
npm run accessibility:validate
```

### IDE Integration

- Use accessibility linting extensions
- Configure accessibility-focused code formatting
- Set up accessibility test runners

### Continuous Monitoring

- Monitor accessibility metrics in production
- Track accessibility performance over time
- Set up alerts for accessibility regressions

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Testing Utilities

- `@/__tests__/setup/accessibility-utils.ts` - Core testing utilities
- `@/__tests__/setup/accessibility-test-patterns.ts` - Reusable test patterns
- `e2e/utils/accessibility-helpers.ts` - E2E testing helpers

## Support

For accessibility testing questions or issues:

1. Check this documentation first
2. Review existing test patterns
3. Consult WCAG guidelines
4. Test with actual assistive technologies when needed

Remember: The goal is to eliminate manual accessibility verification while maintaining the highest standards of accessibility compliance.
