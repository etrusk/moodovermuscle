# ADR-003: Testing Architecture - Jest + MSW + Playwright

## Status

Accepted

## Context

Need comprehensive testing strategy covering unit, integration, and E2E testing with accessibility compliance.

## Decision

Use Jest + MSW + Playwright for testing architecture.

## Rationale

- **Jest**: Excellent Next.js integration and React Testing Library support
- **MSW**: Network-level mocking provides realistic test scenarios
- **Playwright**: Superior browser automation with accessibility features
- **Ecosystem Fit**: All tools work well together and with tech stack
- **Accessibility**: Built-in WCAG compliance testing

## Implementation

- **Unit Tests**: Jest + React Testing Library (80% coverage minimum)
- **Integration Tests**: MSW for realistic API mocking
- **E2E Tests**: Playwright with accessibility validation
- **Performance Tests**: Lighthouse CI integration

## Test Organization

```
__tests__/
├── api/                    # API route tests
├── components/             # Component unit tests
├── lib/                    # Utility function tests
├── integration/            # MSW integration tests
└── setup/                  # Test configuration

e2e/
├── booking-wizard.spec.ts  # Complete booking flow
└── mobile-accessibility.spec.ts  # A11y compliance
```

## Consequences

- **Positive**: Comprehensive coverage, realistic mocking, accessibility compliance
- **Negative**: Setup complexity, learning curve for MSW patterns

## Date

2025-07-30
