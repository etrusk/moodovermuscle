# Architecture Decision Index

This index provides quick access to architectural decisions (ADRs) that guide system design and technology choices. Reference these when making implementation decisions or understanding system constraints.

## By Domain

**Authentication & Security**

- [ADR-001: JWT Token Strategy](./adr-001-jwt-token-strategy.md) - token-based authentication approach
- [ADR-007: Password Security Policy](./adr-007-password-security-policy.md) - password complexity and storage requirements
- [ADR-012: Session Management Approach](./adr-012-session-management.md) - session handling and timeout policies
- [ADR-018: API Security Model](./adr-018-api-security-model.md) - endpoint protection and authorization

**Database Design**

- [ADR-002: Database Technology Choice](./adr-002-database-technology.md) - PostgreSQL selection rationale
- [ADR-008: Data Migration Strategy](./adr-008-data-migration-strategy.md) - schema evolution approach
- [ADR-013: Connection Pooling Configuration](./adr-013-connection-pooling.md) - database connection management
- [ADR-019: Audit Trail Implementation](./adr-019-audit-trail.md) - change tracking methodology

**API Design**

- [ADR-003: REST API Standards](./adr-003-rest-api-standards.md) - endpoint design and naming conventions
- [ADR-009: Error Response Format](./adr-009-error-response-format.md) - standardized error handling
- [ADR-014: Rate Limiting Strategy](./adr-014-rate-limiting.md) - API throttling and quota management
- [ADR-020: Versioning Approach](./adr-020-api-versioning.md) - backward compatibility strategy

**UI/UX Architecture**

- [ADR-004: Frontend Framework Choice](./adr-004-frontend-framework.md) - React/Next.js selection
- [ADR-010: State Management Pattern](./adr-010-state-management.md) - React context vs external state
- [ADR-015: Component Library Strategy](./adr-015-component-library.md) - UI component architecture
- [ADR-021: Accessibility Standards](./adr-021-accessibility-standards.md) - WCAG compliance approach

**Performance & Scaling**

- [ADR-005: Caching Strategy](./adr-005-caching-strategy.md) - application and database caching
- [ADR-011: Bundle Optimization](./adr-011-bundle-optimization.md) - JavaScript delivery optimization
- [ADR-016: Image Handling Strategy](./adr-016-image-handling.md) - image storage and optimization
- [ADR-022: Performance Monitoring](./adr-022-performance-monitoring.md) - metrics and alerting approach

**Development Workflow**

- [ADR-006: Testing Strategy](./adr-006-testing-strategy.md) - unit, integration, and e2e testing approach
- [ADR-017: Code Quality Gates](./adr-017-code-quality-gates.md) - linting, formatting, and CI/CD pipeline
- [ADR-023: Documentation Standards](./adr-023-documentation-standards.md) - inline and architectural documentation
- [ADR-024: Deployment Strategy](./adr-024-deployment-strategy.md) - hosting and release management

## By Technology Choice

**Core Technology Stack**

- **Frontend**: [ADR-004: React/Next.js](./adr-004-frontend-framework.md), [ADR-015: shadcn/ui Components](./adr-015-component-library.md)
- **Backend**: [ADR-003: REST API with Next.js](./adr-003-rest-api-standards.md), [ADR-001: JWT Authentication](./adr-001-jwt-token-strategy.md)
- **Database**: [ADR-002: PostgreSQL](./adr-002-database-technology.md), [ADR-013: Connection Pooling](./adr-013-connection-pooling.md)
- **Testing**: [ADR-006: Jest + Playwright](./adr-006-testing-strategy.md), [ADR-017: Quality Gates](./adr-017-code-quality-gates.md)

**Third-Party Integrations**

- **Email Service**: [ADR-025: Email Provider Choice](./adr-025-email-provider.md) - transactional email handling
- **Payment Processing**: [ADR-026: Payment Gateway Selection](./adr-026-payment-gateway.md) - payment handling approach
- **File Storage**: [ADR-016: Image Storage Strategy](./adr-016-image-handling.md) - asset management
- **Analytics**: [ADR-027: Analytics Platform](./adr-027-analytics-platform.md) - user behavior tracking

**Development Tools**

- **Code Quality**: [ADR-017: ESLint + Prettier](./adr-017-code-quality-gates.md), [ADR-023: Documentation Tools](./adr-023-documentation-standards.md)
- **Build Tools**: [ADR-011: Build Optimization](./adr-011-bundle-optimization.md), [ADR-024: Deployment Pipeline](./adr-024-deployment-strategy.md)
- **Monitoring**: [ADR-022: Performance Monitoring](./adr-022-performance-monitoring.md), [ADR-028: Error Tracking](./adr-028-error-tracking.md)

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
