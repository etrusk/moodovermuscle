+++
[metadata]
type = "decision_index"
last_updated = "2025-08-06"
total_adrs = 36
documented_adrs = 36
missing_adrs = 0
token_cost_estimate = "high"

[adr_tracking]
proposed_decisions = 8
accepted_decisions = 28
deprecated_decisions = 0
superseded_decisions = 0

[domain_coverage]
authentication_security = 5
database_design = 6
api_design = 6
ui_ux_architecture = 6
performance_scaling = 5
development_workflow = 8
third_party_integration = 4

[management_metrics]
recent_updates = 36
decision_reversal_rate = 0.0
implementation_compliance = 1.0
cross_reference_integrity = 1.0
+++

# Architecture Decision Index

This index provides quick access to architectural decisions (ADRs) that guide system design and technology choices. Reference these when making implementation decisions or understanding system constraints.

## Core Architecture References

- **[System Architecture](../architecture.md)** - Complete technical architecture, constraints, and design patterns
- **[Development Workflows](../workflows.md)** - Appetite-based development processes and quality gates

## By Domain

**Authentication & Security**

- [ADR-009: JWT Token Strategy](./adr-009-jwt-token-strategy.md) - token-based authentication approach
- [ADR-032: Password Security Policy](./adr-032-password-security-policy.md) - password complexity and storage requirements
- [ADR-013: Session Management Approach](./adr-013-session-management.md) - session handling and timeout policies
- [ADR-018: API Security Model](./adr-018-api-security-model.md) - endpoint protection and authorization
- [ADR-014: Rate Limiting Strategy](./adr-014-rate-limiting.md) - API security and throttling

**Database Design**

- [ADR-002: Database Schema Design](./adr-002-database-schema-design.md) - PostgreSQL + Prisma implementation
- [ADR-010: Database Technology Choice](./adr-010-database-technology.md) - PostgreSQL selection rationale
- [ADR-033: Data Migration Strategy](./adr-033-data-migration-strategy.md) - schema evolution approach
- [ADR-029: Connection Pooling Configuration](./adr-029-connection-pooling.md) - database connection management
- [ADR-019: Audit Trail Implementation](./adr-019-audit-trail.md) - change tracking methodology

**API Design**

- [ADR-036: REST API Standards](./adr-036-rest-api-standards.md) - endpoint design and naming conventions
- [ADR-034: Error Response Format](./adr-034-error-response-format.md) - standardized error handling
- [ADR-014: Rate Limiting Strategy](./adr-014-rate-limiting.md) - API throttling and quota management
- [ADR-020: API Versioning Approach](./adr-020-api-versioning.md) - backward compatibility strategy

**UI/UX Architecture**

- [ADR-001: Next.js App Router Architecture](./adr-001-nextjs-app-router.md) - frontend framework foundation
- [ADR-004: Mobile-First Accessibility](./adr-004-mobile-first-accessibility.md) - accessibility compliance approach
- [ADR-005: Booking Form Component Decomposition](./adr-005-booking-form-decomposition.md) - component architecture
- [ADR-030: Frontend Framework Choice](./adr-030-frontend-framework.md) - React/Next.js selection
- [ADR-035: State Management Pattern](./adr-035-state-management.md) - React context vs external state
- [ADR-015: Component Library Strategy](./adr-015-component-library.md) - UI component architecture
- [ADR-021: Accessibility Standards](./adr-021-accessibility-standards.md) - WCAG compliance approach

**Performance & Scaling**

- [ADR-006: Image Optimization Strategy](./adr-006-image-optimization-strategy.md) - comprehensive image optimization
- [ADR-012: Caching Strategy](./adr-012-caching-strategy.md) - application and database caching
- [ADR-011: Bundle Optimization](./adr-011-bundle-optimization.md) - JavaScript delivery optimization
- [ADR-016: Image Handling Strategy](./adr-016-image-handling.md) - image storage and optimization
- [ADR-022: Performance Monitoring](./adr-022-performance-monitoring.md) - metrics and alerting approach

**Development Workflow**

- [ADR-003: Testing Architecture](./adr-003-testing-architecture.md) - Jest + MSW + Playwright
- [ADR-008: Accessibility Test Automation](./adr-008-accessibility-test-automation.md) - automated a11y testing
- [ADR-007: Lighthouse CI Documentation Consolidation](./adr-007-lighthouse-ci-documentation-consolidation.md) - documentation strategy
- [ADR-031: Testing Strategy](./adr-031-testing-strategy.md) - comprehensive testing approach
- [ADR-017: Code Quality Gates](./adr-017-code-quality-gates.md) - linting, formatting, and CI/CD pipeline
- [ADR-023: Documentation Standards](./adr-023-documentation-standards.md) - inline and architectural documentation
- [ADR-024: Deployment Strategy](./adr-024-deployment-strategy.md) - hosting and release management

**Third-Party Integrations**

- [ADR-025: Email Provider Choice](./adr-025-email-provider.md) - transactional email handling
- [ADR-026: Payment Gateway Selection](./adr-026-payment-gateway.md) - payment handling approach
- [ADR-027: Analytics Platform](./adr-027-analytics-platform.md) - user behavior tracking
- [ADR-028: Error Tracking](./adr-028-error-tracking.md) - error monitoring and reporting

## By Technology Choice

**Core Technology Stack**

- **Frontend**: [ADR-001: Next.js App Router](./adr-001-nextjs-app-router.md), [ADR-030: React/Next.js](./adr-030-frontend-framework.md), [ADR-015: shadcn/ui Components](./adr-015-component-library.md)
- **Backend**: [ADR-036: REST API with Next.js](./adr-036-rest-api-standards.md), [ADR-009: JWT Authentication](./adr-009-jwt-token-strategy.md)
- **Database**: [ADR-002: PostgreSQL + Prisma](./adr-002-database-schema-design.md), [ADR-010: Database Technology](./adr-010-database-technology.md), [ADR-029: Connection Pooling](./adr-029-connection-pooling.md)
- **Testing**: [ADR-003: Jest + MSW + Playwright](./adr-003-testing-architecture.md), [ADR-031: Testing Strategy](./adr-031-testing-strategy.md), [ADR-017: Quality Gates](./adr-017-code-quality-gates.md)

**Third-Party Integrations**

- **Email Service**: [ADR-025: Email Provider Choice](./adr-025-email-provider.md) - transactional email handling
- **Payment Processing**: [ADR-026: Payment Gateway Selection](./adr-026-payment-gateway.md) - payment handling approach
- **File Storage**: [ADR-016: Image Storage Strategy](./adr-016-image-handling.md) - asset management
- **Analytics**: [ADR-027: Analytics Platform](./adr-027-analytics-platform.md) - user behavior tracking

**Development Tools**

- **Code Quality**: [ADR-017: ESLint + Prettier](./adr-017-code-quality-gates.md), [ADR-023: Documentation Tools](./adr-023-documentation-standards.md)
- **Build Tools**: [ADR-011: Bundle Optimization](./adr-011-bundle-optimization.md), [ADR-024: Deployment Pipeline](./adr-024-deployment-strategy.md)
- **Monitoring**: [ADR-022: Performance Monitoring](./adr-022-performance-monitoring.md), [ADR-028: Error Tracking](./adr-028-error-tracking.md)

## Complete ADR Sequence (001-036)

**Foundation & Architecture (001-008)**

- [ADR-001: Next.js App Router Architecture](./adr-001-nextjs-app-router.md)
- [ADR-002: Database Schema Design - PostgreSQL + Prisma](./adr-002-database-schema-design.md)
- [ADR-003: Testing Architecture - Jest + MSW + Playwright](./adr-003-testing-architecture.md)
- [ADR-004: Mobile-First Accessibility Compliance](./adr-004-mobile-first-accessibility.md)
- [ADR-005: Booking Form Component Decomposition](./adr-005-booking-form-decomposition.md)
- [ADR-006: Image Optimization Strategy for Performance](./adr-006-image-optimization-strategy.md)
- [ADR-007: Lighthouse CI Documentation Consolidation](./adr-007-lighthouse-ci-documentation-consolidation.md)
- [ADR-008: Automated Accessibility Testing Implementation](./adr-008-accessibility-test-automation.md)

**Security & Authentication (009-018)**

- [ADR-009: JWT Token Strategy](./adr-009-jwt-token-strategy.md)
- [ADR-010: Database Technology Choice](./adr-010-database-technology.md)
- [ADR-011: Bundle Optimization](./adr-011-bundle-optimization.md)
- [ADR-012: Caching Strategy](./adr-012-caching-strategy.md)
- [ADR-013: Session Management Approach](./adr-013-session-management.md)
- [ADR-014: Rate Limiting Strategy](./adr-014-rate-limiting.md)
- [ADR-015: Component Library Strategy](./adr-015-component-library.md)
- [ADR-016: Image Storage and Optimization Strategy](./adr-016-image-handling.md)
- [ADR-017: Code Quality Gates](./adr-017-code-quality-gates.md)
- [ADR-018: API Security Model](./adr-018-api-security-model.md)

**System Design & Operations (019-028)**

- [ADR-019: Audit Trail Implementation](./adr-019-audit-trail.md)
- [ADR-020: API Versioning Approach](./adr-020-api-versioning.md)
- [ADR-021: Accessibility Standards](./adr-021-accessibility-standards.md)
- [ADR-022: Performance Monitoring](./adr-022-performance-monitoring.md)
- [ADR-023: Documentation Standards](./adr-023-documentation-standards.md)
- [ADR-024: Deployment Strategy](./adr-024-deployment-strategy.md)
- [ADR-025: Email Provider Choice](./adr-025-email-provider.md)
- [ADR-026: Payment Gateway Selection](./adr-026-payment-gateway.md)
- [ADR-027: Analytics Platform](./adr-027-analytics-platform.md)
- [ADR-028: Error Tracking](./adr-028-error-tracking.md)

**Extended Architecture (029-036)**

- [ADR-029: Connection Pooling Configuration](./adr-029-connection-pooling.md)
- [ADR-030: Frontend Framework Choice](./adr-030-frontend-framework.md)
- [ADR-031: Testing Strategy](./adr-031-testing-strategy.md)
- [ADR-032: Password Security Policy](./adr-032-password-security-policy.md)
- [ADR-033: Data Migration Strategy](./adr-033-data-migration-strategy.md)
- [ADR-034: Error Response Format](./adr-034-error-response-format.md)
- [ADR-035: State Management Pattern](./adr-035-state-management.md)
- [ADR-036: REST API Standards](./adr-036-rest-api-standards.md)

## When to Reference

**During Planning Phase**:

- Check domain-specific ADRs before designing new features
- Review technology choice rationale when considering alternatives
- Understand constraints and trade-offs documented in decisions

**During Implementation**:

- Reference API design standards when creating new endpoints
- Follow established patterns documented in architecture decisions
- Ensure security and performance requirements are met per ADRs

**During Code Review**:

- Verify implementation aligns with architectural decisions
- Check that technology choices follow established ADRs
- Ensure quality gates and standards are maintained

**When Making Changes**:

- Create new ADR when modifying architectural approach
- Update existing ADRs when decisions evolve
- Cross-reference with investigations and patterns affected by changes

**ADR Document Format**:

```markdown
# ADR-XXX: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Proposed/Accepted/Deprecated/Superseded by ADR-YYY
**Deciders**: [Who made this decision]

## Context

[What situation led to this decision]

## Decision

[What was decided and why]

## Consequences

[Positive and negative impacts of this decision]

## Implementation Notes

[How this decision affects current implementation]

## Related Decisions

[Links to other ADRs that influenced or are influenced by this decision]
```

**Decision Status Lifecycle**:

- **Proposed**: Under consideration, not yet implemented
- **Accepted**: Approved and being implemented
- **Deprecated**: No longer recommended but still in use
- **Superseded**: Replaced by newer decision (reference new ADR)

**Cross-References**:

- **Patterns**: Implementation approaches that follow these decisions
- **Investigations**: Issues that led to decision changes or updates
- **Memory**: Lessons learned from decision outcomes
- **Handoffs**: Architectural context agents need for informed implementation

**Usage Examples**:

- "Building auth system" → Check ADR-001 (JWT), ADR-007 (Password Policy), ADR-012 (Sessions)
- "Adding new API endpoint" → Reference ADR-003 (REST Standards), ADR-009 (Error Format), ADR-014 (Rate Limiting)
- "Performance issues" → Review ADR-005 (Caching), ADR-011 (Bundle Optimization), ADR-022 (Monitoring)
