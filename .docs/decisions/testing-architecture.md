# ADR-006: Testing Architecture - Jest + MSW + Playwright

**Status**: Accepted  
**Date**: 2025-07-30  
**Deciders**: Development Team  
**Technical Story**: Comprehensive testing strategy for booking system

## Context

The booking system requires a robust testing strategy covering unit tests, integration tests, and end-to-end testing. We needed to choose testing tools that would provide comprehensive coverage while supporting the TDD workflow and maintaining fast feedback loops.

## Decision Drivers

- **Comprehensive Coverage**: Unit, integration, and E2E testing
- **TDD Support**: Fast feedback loops for red-green-refactor cycles
- **Realistic Testing**: API mocking that closely resembles production
- **Accessibility Testing**: WCAG compliance validation
- **Developer Experience**: Easy to write and maintain tests
- **CI/CD Integration**: Automated testing in deployment pipeline

## Considered Options

### Option 1: Jest + MSW + Playwright (Chosen)

- **Pros**:
  - Jest: Excellent React/Next.js integration
  - MSW: Realistic API mocking at network level
  - Playwright: Robust E2E testing with browser automation
  - Great TypeScript support across all tools
  - Comprehensive accessibility testing capabilities
- **Cons**:
  - Multiple tools to learn and configure
  - Setup complexity for MSW integration

### Option 2: Vitest + Testing Library + Cypress

- **Pros**:
  - Vitest: Faster than Jest, better Vite integration
  - Cypress: Mature E2E testing platform
- **Cons**:
  - Less Next.js ecosystem integration
  - Cypress has licensing considerations
  - More complex API mocking setup

### Option 3: Jest + Nock + Puppeteer

- **Pros**:
  - Jest: Proven React testing solution
  - Nock: Simple HTTP mocking
- **Cons**:
  - Nock: Less realistic than MSW
  - Puppeteer: More complex than Playwright
  - Limited accessibility testing

## Decision

We chose **Jest + MSW + Playwright** for the following reasons:

1. **Jest**: Excellent Next.js integration and React Testing Library support
2. **MSW**: Network-level mocking provides realistic test scenarios
3. **Playwright**: Superior browser automation with accessibility features
4. **Ecosystem Fit**: All tools work well together and with our tech stack
5. **Accessibility**: Built-in support for WCAG compliance testing

## Implementation Details

### Jest Configuration

```typescript
const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/msw-setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw|@mswjs)/)'],
}
```

### MSW Integration

```typescript
// Realistic API mocking at network level
export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequestBody

    // Conditional responses based on test data
    if (body.email === 'fail@example.com') {
      return new HttpResponse(
        JSON.stringify({ message: 'Internal Server Error' }),
        { status: 500 }
      )
    }

    return new HttpResponse(
      JSON.stringify({ message: 'Booking submitted successfully!' }),
      { status: 200 }
    )
  }),
]
```

### Playwright E2E Testing

```typescript
test('Complete booking flow with accessibility validation', async ({
  page,
}) => {
  // Route stubbing for controlled testing
  await page.route('**/api/book-session', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  )

  // Multi-step form testing
  await page.getByPlaceholder('Your beautiful name').fill('Jane Doe')
  // ... complete form flow ...

  // Accessibility validation
  const btn = page.getByRole('button', { name: 'Book session' })
  await btn.click()
  await expect(btn).toHaveAttribute('aria-busy', 'true')
  await expect(btn).toHaveAttribute('disabled', '')
})
```

## Testing Strategy Implementation

### Unit Testing Patterns

- **API Routes**: Direct function testing with NextRequest mocking
- **Email Service**: Nodemailer mocking with success/failure scenarios
- **Components**: React Testing Library with accessibility validation
- **Utilities**: Pure function testing with edge cases

### Integration Testing

- **MSW Handlers**: Network-level API mocking for realistic scenarios
- **Database Mocking**: Prisma client mocking for data layer tests
- **Form Validation**: End-to-end validation flow testing

### E2E Testing

- **Complete User Flows**: Multi-step booking wizard navigation
- **Error Scenarios**: Network failures and server errors
- **Accessibility**: WCAG compliance and screen reader compatibility
- **Performance**: Loading states and user feedback validation

## Test Organization

### File Structure

```
__tests__/
├── api/                    # API route tests
├── components/             # Component unit tests
├── lib/                    # Utility function tests
├── setup/                  # Test configuration
│   ├── handlers.ts         # MSW request handlers
│   ├── msw-setup.js       # MSW integration
│   └── test-utils.tsx     # Testing utilities
└── constants/
    └── test-strings.ts     # Maintainable test constants

e2e/
├── booking-wizard.spec.ts  # Complete booking flow
└── booking-form-calendar.spec.ts  # Calendar interaction
```

### Coverage Strategy

- **80% minimum** for all code coverage metrics
- **100% coverage** for critical booking flow
- **Accessibility testing** on all user-facing components
- **Performance budgets** enforced via Lighthouse CI

## Consequences

### Positive

- **Comprehensive Coverage**: All testing layers covered effectively
- **Realistic Mocking**: MSW provides network-level simulation
- **Accessibility Compliance**: Automated WCAG validation
- **Fast Feedback**: Jest watch mode supports TDD workflow
- **CI/CD Ready**: All tests run in automated pipeline

### Negative

- **Setup Complexity**: Multiple tools require careful configuration
- **Learning Curve**: Team needs to understand MSW patterns
- **Test Maintenance**: E2E tests require more maintenance than unit tests

### Neutral

- **Tool Diversity**: Multiple tools provide flexibility but require coordination
- **Performance**: Test suite performance requires monitoring as it grows

## Testing Patterns Discovered

### API Route Testing

```typescript
// Custom helper for NextRequest creation
function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  return new NextRequest('http://localhost/api/book-session', {
    method: 'POST',
    body: blob,
  })
}
```

### Email Service Testing

```typescript
// Nodemailer mocking pattern
jest.mock('nodemailer')
const mockSendMail = jest.fn()
beforeAll(() => {
  nodemailer.createTransporter.mockReturnValue({ sendMail: mockSendMail })
})
```

### E2E Error Recovery Testing

```typescript
// Form data persistence during error scenarios
test('Handles server error and preserves form data', async ({ page }) => {
  // Fill form, trigger error, verify data persistence
  // Then stub success and verify retry works
})
```

## Follow-up Actions

1. **Performance Monitoring**: Track test suite execution time
2. **Coverage Analysis**: Regular review of coverage reports
3. **Accessibility Audits**: Quarterly comprehensive accessibility testing
4. **Test Data Management**: Implement test data factories for complex scenarios
5. **Visual Regression**: Consider adding visual testing for UI components

## Notes

This testing architecture provides comprehensive coverage while maintaining developer productivity. The combination of Jest, MSW, and Playwright creates a robust testing foundation that supports both current needs and future feature development.
