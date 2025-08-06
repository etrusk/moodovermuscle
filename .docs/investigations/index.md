+++
[metadata]
type = "investigation_index"
last_updated = "2025-08-06"
total_investigations = 29
active_investigations = 1
resolved_investigations = 28
token_cost_estimate = "medium"

[tracking_metrics]
component_coverage = 0.85
error_pattern_coverage = 0.75
symptom_mapping_completeness = 0.90
resolution_success_rate = 0.88

[investigation_categories]
component_based = 18
error_pattern_based = 15
symptom_based = 7
security_focused = 3

[maintenance_status]
recent_updates = 2
stale_entries = 1
cross_reference_integrity = 0.92
usage_frequency = "medium"
+++

# Investigation Index

This index helps agents quickly find relevant investigations when encountering issues. Search by component, error pattern, or user-facing symptom to locate past debugging work and solutions.

## By Component

**Auth System**

- [JWT Token Issues](./auth-jwt-token-issues.md) - token validation, expiry handling, and refresh logic debugging
- [Session Management](./auth-session-management.md) - session persistence and timeout investigations
- [Login Flow Errors](./auth-login-flow-errors.md) - authentication flow failures and redirects

**Database**

- [Connection Pool Issues](./db-connection-pool-issues.md) - database connection handling and pool exhaustion
- [Query Performance](./db-query-performance.md) - slow queries and optimization investigations
- [Transaction Conflicts](./db-transaction-conflicts.md) - concurrent access and deadlock resolution
- [Migration Failures](./db-migration-failures.md) - schema migration issues and rollback procedures

**API Integration**

- [External API Timeouts](./api-external-timeouts.md) - third-party service integration issues
- [Rate Limiting](./api-rate-limiting.md) - API throttling and quota management
- [Response Parsing](./api-response-parsing.md) - data transformation and validation errors

**UI Components**

- [Form Validation](./ui-form-validation.md) - client-side validation failures and UX issues
- [State Management](./ui-state-management.md) - React state synchronization problems
- [Rendering Issues](./ui-rendering-issues.md) - component lifecycle and display problems

**Booking System**

- [Availability Conflicts](./booking-availability-conflicts.md) - double-booking prevention and calendar sync
- [Payment Processing](./booking-payment-processing.md) - payment gateway integration issues
- [Notification Delivery](./booking-notification-delivery.md) - email/SMS delivery failures

**Performance**

- [Memory Leaks](./performance-memory-leaks.md) - memory usage monitoring and optimization
- [Bundle Size](./performance-bundle-size.md) - JavaScript bundle optimization
- [Database Performance](./performance-database.md) - query optimization and indexing

**Testing & Quality Assurance**

- [Time Format Mismatch in Test Data](./time-format-mismatch-test-data.md) - 12-hour vs 24-hour format standardization [RESOLVED]
- [Git Staging and Pre-commit Hook Bypass](./git-staging-pre-commit-hook-bypass-2025-08-06.md) - Quality gate circumvention through --no-verify flag usage [ACTIVE]

## By Error Pattern

**Connection Issues**

- [Network Timeouts](./pattern-network-timeouts.md) - handling unstable connections
- [Service Unavailable](./pattern-service-unavailable.md) - graceful degradation strategies
- [DNS Resolution](./pattern-dns-resolution.md) - domain resolution failures

**Validation Failures**

- [Schema Validation](./pattern-schema-validation.md) - data structure validation errors
- [Input Sanitization](./pattern-input-sanitization.md) - XSS prevention and data cleaning
- [Business Rule Violations](./pattern-business-rules.md) - domain logic validation failures

**Type Errors**

- [TypeScript Compilation](./pattern-typescript-compilation.md) - type checking and compilation issues
- [Runtime Type Mismatches](./pattern-runtime-type-mismatches.md) - dynamic typing problems
- [API Contract Violations](./pattern-api-contracts.md) - interface mismatch debugging

**Build Failures**

- [Dependency Conflicts](./pattern-dependency-conflicts.md) - package version incompatibilities
- [Build Tool Issues](./pattern-build-tools.md) - webpack, babel, and bundler problems
- [Environment Differences](./pattern-environment-differences.md) - dev vs production discrepancies

**Quality Gate Issues**

- [Pre-commit Hook Bypass](./git-staging-pre-commit-hook-bypass-2025-08-06.md) - improper use of --no-verify flag and staging confusion

**Security Issues**

- [Authentication Bypass](./pattern-auth-bypass.md) - security vulnerability investigations
- [Data Exposure](./pattern-data-exposure.md) - information leakage prevention
- [Injection Attacks](./pattern-injection-attacks.md) - SQL injection and XSS prevention

## By Symptom

**User-Facing Symptoms → Investigation Files**

- "Login doesn't work" → [`auth-login-flow-errors.md`](./auth-login-flow-errors.md)
- "Page loads slowly" → [`performance-database.md`](./performance-database.md), [`performance-bundle-size.md`](./performance-bundle-size.md)
- "Form submission fails" → [`ui-form-validation.md`](./ui-form-validation.md), [`api-response-parsing.md`](./api-response-parsing.md)
- "Double bookings occur" → [`booking-availability-conflicts.md`](./booking-availability-conflicts.md)
- "Emails not received" → [`booking-notification-delivery.md`](./booking-notification-delivery.md)
- "Payment declined unexpectedly" → [`booking-payment-processing.md`](./booking-payment-processing.md)
- "Site completely down" → [`pattern-service-unavailable.md`](./pattern-service-unavailable.md), [`db-connection-pool-issues.md`](./db-connection-pool-issues.md)
- "Commit fails with same errors repeatedly" → [`git-staging-pre-commit-hook-bypass-2025-08-06.md`](./git-staging-pre-commit-hook-bypass-2025-08-06.md)
- "ESLint errors persist after 'fixes'" → [`git-staging-pre-commit-hook-bypass-2025-08-06.md`](./git-staging-pre-commit-hook-bypass-2025-08-06.md)

## Usage Guide

**When to Check Investigations**:

- Before starting any debugging session
- When encountering similar error messages or symptoms
- During incident response to find past resolution patterns
- When implementing fixes to avoid known failure modes

**How to Search**:

1. **By Component**: Know which system is failing? Check component sections first
2. **By Error Pattern**: Have specific error types? Look in error pattern sections
3. **By Symptom**: User reporting issues? Start with symptom mapping
4. **Cross-Reference**: Many issues span multiple categories - check related sections

**Before test implementation** → Check: time format mismatch issues for format standardization approaches

**Adding New Investigations**:

1. Create investigation file with format: `component-specific-issue-YYYY-MM-DD.md`
2. Add entry to relevant sections in this index
3. Include symptoms, error patterns, and component tags
4. Cross-reference with related patterns and decisions

**Investigation File Format**:

```markdown
# Investigation: [Title]

**Date**: YYYY-MM-DD
**Component**: [Primary system affected]
**Symptom**: [User-facing issue description]
**Resolution**: [Brief solution summary]
**Prevention**: [How to avoid in future]
**Related**: [Links to patterns, decisions, or other investigations]
```

**Cross-References**:

- Check [`patterns/index.md`](../patterns/index.md) for implementation approaches
- Reference [`decisions/index.md`](../decisions/index.md) for architectural context
- Update [`memory/index.md`](../memory/index.md) with lessons learned
