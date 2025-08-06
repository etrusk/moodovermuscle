+++
[metadata]
type = "architecture_decision_record"
adr_number = "003"
title = "Testing Architecture - Jest + MSW + Playwright"
date = "2025-07-30"
status = "accepted"
category = "development_workflow"
complexity = "high"
impact = "high"

[decision_context]
domain = "development_workflow"
problem_space = "testing_strategy"
stakeholders = ["development_team", "qa_team"]
related_adrs = ["031", "017", "021"]

[implementation_tracking]
implementation_status = "completed"
estimated_effort = "high"
breaking_changes = false
rollback_complexity = "medium"
+++

# ADR-003: Testing Architecture - Jest + MSW + Playwright

**Date**: 2025-07-30
**Status**: Accepted
**Deciders**: Development Team

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
- **Performance Tests**: Privacy-focused Lighthouse CI with automated quality gates

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

**Positive:**

- Comprehensive coverage, realistic mocking, accessibility compliance

**Negative:**

- Setup complexity, learning curve for MSW patterns

## Related Decisions

- [ADR-031: Testing Strategy](./adr-031-testing-strategy.md) - Comprehensive testing approach
- [ADR-017: Code Quality Gates](./adr-017-code-quality-gates.md) - Quality assurance integration
- [ADR-021: Accessibility Standards](./adr-021-accessibility-standards.md) - A11y testing requirements
