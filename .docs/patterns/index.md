# Implementation Pattern Index

This index helps agents find proven implementation approaches before starting new work. Check here first to apply established patterns and avoid reinventing solutions.

## By Feature Type

**Authentication Flows**

- [JWT Middleware Pattern](./auth-jwt-middleware-pattern.md) - token validation + error handling
- [User Registration Pattern](./auth-user-registration-pattern.md) - validation + database + response handling
- [Password Reset Flow](./auth-password-reset-pattern.md) - secure token generation and email workflow
- [Session Management Pattern](./auth-session-management-pattern.md) - session lifecycle and cleanup

**Database Operations**

- [Transaction Safety Pattern](./db-transaction-safety-pattern.md) - ACID compliance and conflict detection
- [Connection Pool Pattern](./db-connection-pool-pattern.md) - efficient database connection management
- [Migration Pattern](./db-migration-pattern.md) - safe schema changes and rollback procedures
- [Audit Trail Pattern](./db-audit-trail-pattern.md) - change tracking and history preservation

**API Endpoints**

- [RESTful CRUD Pattern](./api-crud-pattern.md) - consistent endpoint structure and responses
- [Error Response Pattern](./api-error-response-pattern.md) - standardized error handling and status codes
- [Validation Middleware Pattern](./api-validation-middleware-pattern.md) - request validation and sanitization
- [Rate Limiting Pattern](./api-rate-limiting-pattern.md) - request throttling and quota management

**UI Components**

- [Form Validation Pattern](./ui-form-validation-pattern.md) - client-side validation with error display
- [Loading State Pattern](./ui-loading-state-pattern.md) - async operation feedback and skeleton loading
- [Error Boundary Pattern](./ui-error-boundary-pattern.md) - React error handling and recovery
- [Responsive Design Pattern](./ui-responsive-design-pattern.md) - mobile-first component architecture

**File Handling**

- [Upload Validation Pattern](./file-upload-validation-pattern.md) - secure file processing and storage
- [Image Optimization Pattern](./file-image-optimization-pattern.md) - compression and format handling
- [File Streaming Pattern](./file-streaming-pattern.md) - large file handling without memory issues

**Testing Approaches**

- [Integration Test Pattern](./test-integration-pattern.md) - database and API testing setup
- [Component Test Pattern](./test-component-pattern.md) - React component testing with MSW
- [E2E Test Pattern](./test-e2e-pattern.md) - end-to-end user journey testing
- [Mock Pattern](./test-mock-pattern.md) - external service mocking strategies

**TypeScript Patterns**

- [Interface Definition Pattern](./ts-interface-pattern.md) - API response and data structure typing
- [Generic Utility Pattern](./ts-generic-utility-pattern.md) - reusable type-safe utilities
- [Error Type Pattern](./ts-error-type-pattern.md) - typed error handling and union types
- [Schema Validation Pattern](./ts-schema-validation-pattern.md) - runtime type checking with Zod

## By Complexity Level

**Simple (1-2 files, < 2 hours)**

- [Basic CRUD Operations](./simple-crud-pattern.md) - single entity create/read/update/delete
- [Form Component](./simple-form-pattern.md) - basic form with validation
- [API Route Handler](./simple-api-route-pattern.md) - single endpoint implementation
- [UI Component](./simple-ui-component-pattern.md) - stateless display component

**Medium (3-5 files, 2-8 hours)**

- [Authentication System](./medium-auth-system-pattern.md) - login/logout with JWT
- [Booking Workflow](./medium-booking-workflow-pattern.md) - multi-step booking process
- [Payment Integration](./medium-payment-integration-pattern.md) - third-party payment processing
- [Email Notification System](./medium-email-system-pattern.md) - templated email sending

**Complex (5+ files, 1+ days)**

- [Multi-tenant Architecture](./complex-multi-tenant-pattern.md) - tenant isolation and data segregation
- [Real-time Sync System](./complex-realtime-sync-pattern.md) - WebSocket-based live updates
- [File Processing Pipeline](./complex-file-pipeline-pattern.md) - async file processing workflow
- [Audit and Compliance System](./complex-audit-system-pattern.md) - comprehensive change tracking

## Usage Guide

**Before Starting Implementation**:

1. **Search by Feature Type**: Look for similar functionality patterns first
2. **Check Complexity Level**: Estimate scope and find appropriate pattern complexity
3. **Review Prerequisites**: Ensure dependencies and setup requirements are met
4. **Adapt to Context**: Modify pattern for specific use case while maintaining core approach

**When to Create New Patterns**:

- No existing pattern covers the use case
- Significant improvements to existing approach discovered
- Reusable solution developed that others might need
- Cross-cutting concern that spans multiple feature types

**Pattern Documentation Format**:

```markdown
# Pattern: [Name]

**Complexity**: Simple/Medium/Complex
**Files Affected**: [Number and types]
**Prerequisites**: [Dependencies, setup requirements]
**Use Cases**: [When to apply this pattern]

## Implementation Steps

1. [Step-by-step implementation guide]
2. [Include code examples and file structures]

## Testing Strategy

[How to test this pattern implementation]

## Common Pitfalls

[Known issues and how to avoid them]

## Related Patterns

[Links to complementary or alternative patterns]
```

**Integration with Other Indexes**:

- **Investigations**: When debugging, check if pattern was implemented correctly
- **Decisions**: Understand architectural context behind pattern choices
- **Memory**: Learn from past pattern applications and modifications
- **Handoffs**: Include relevant patterns in agent handoff context

**Quality Gates for Patterns**:

- All patterns must include working code examples
- Test coverage requirements specified
- Error handling approaches documented
- Performance considerations noted
- Security implications addressed

**Pattern Evolution**:

- Update patterns based on lessons learned
- Deprecate patterns that are no longer recommended
- Version patterns when significant changes occur
- Cross-reference pattern updates with related investigations
