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

**Quality Assurance**

- [Comprehensive Quality Gates Pattern](./quality-gate-comprehensive-pattern.md) - complexity detection, coverage thresholds, pre-commit automation

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

**Implemented Quality Gates**:

- [Comprehensive Quality Gates Pattern](./quality-gate-comprehensive-pattern.md) - Prevents technical debt through automated complexity detection, coverage enforcement, and security scanning

**Pattern Evolution**:

- Update patterns based on lessons learned
- Deprecate patterns that are no longer recommended
- Version patterns when significant changes occur
- Cross-reference pattern updates with related investigations

## Pattern Gaps (Patterns Needed But Not Yet Documented)

### High Priority Gaps

**Real-Time Data Synchronization Pattern**

- **Needed For**: Calendar availability updates, live booking status
- **Current Approach**: Polling (inefficient, complexity 3-4 per implementation)
- **Why It's Missing**: Haven't implemented real-time features yet
- **Estimated Complexity**: 7-8 to develop pattern
- **Business Impact**: Blocking real-time availability feature
- **Potential Approaches**: WebSockets, SSE, or polling optimization
- **Investigation Needed**: Performance implications, scalability

**Admin Authentication Pattern**

- **Needed For**: Admin dashboard access control
- **Current Approach**: None - critical security gap
- **Why It's Missing**: Admin features not yet implemented
- **Estimated Complexity**: 5-6 to develop pattern
- **Business Impact**: Cannot deploy admin features without auth
- **Potential Approaches**: JWT with role checks, session-based, OAuth
- **Investigation Needed**: Security requirements, session management

### Medium Priority Gaps

**Bulk Operation Pattern**

- **Needed For**: Admin bulk actions, data migrations
- **Current Approach**: Individual operations (inefficient)
- **Why It's Missing**: No bulk requirements yet
- **Estimated Complexity**: 4-5 to develop pattern
- **Business Impact**: Admin efficiency limited
- **Potential Approaches**: Batch API, transaction batching
- **Investigation Needed**: Transaction safety, performance limits

**Dynamic Email Template Pattern**

- **Needed For**: Customizable email content, A/B testing
- **Current Approach**: Hardcoded templates (works but inflexible)
- **Why It's Missing**: Current templates sufficient for MVP
- **Estimated Complexity**: 3-4 to develop pattern
- **Business Impact**: Marketing flexibility limited
- **Potential Approaches**: Template engine, MDX, or React Email
- **Investigation Needed**: Template management, preview system

### Low Priority Gaps

**Analytics Integration Pattern**

- **Needed For**: User behavior tracking, conversion metrics
- **Current Approach**: Basic Vercel Analytics only
- **Why It's Missing**: Not priority for current phase
- **Estimated Complexity**: 2-3 to develop pattern
- **Business Impact**: Limited insight into user behavior
- **Potential Approaches**: Google Analytics, Plausible, custom
- **Investigation Needed**: Privacy implications, GDPR compliance

**Notification System Pattern**

- **Needed For**: In-app notifications, push notifications
- **Current Approach**: Email only
- **Why It's Missing**: Email sufficient for current needs
- **Estimated Complexity**: 5-6 to develop pattern
- **Business Impact**: User engagement opportunities missed
- **Potential Approaches**: In-app, push, SMS integration
- **Investigation Needed**: User preferences, delivery reliability

## Gap Management Process

### When Gaps Are Identified

1. **During Implementation**: If no pattern exists, document gap immediately
2. **During Architecture**: Note pattern needs in design documents
3. **During Debug**: If investigation reveals missing pattern, add to gaps
4. **During Ask**: If analysis shows pattern would help, document it

### Gap Tracking Workflow

```markdown
1. Identify gap during work
2. Check if truly no pattern exists (search all indexes)
3. Add to appropriate priority level
4. Include all fields for context
5. Reference in current-task.md if blocking
```

### Converting Gaps to Patterns

- **Trigger**: When implementing feature that needs the pattern
- **Process**: Develop pattern during implementation
- **Documentation**: Create pattern file and update index
- **Review**: Validate pattern works before removing from gaps
- **Cross-Reference**: Update investigations/decisions that relate

### Escalation Criteria

- **Critical Gaps**: Security patterns needed → Immediate escalation
- **Blocking Gaps**: Preventing feature delivery → Include in handoff
- **Accumulation**: >5 high-priority gaps → Review architecture approach
- **Complexity**: Gap would require >8 complexity → Needs appetite planning

## Gap Review Schedule

- **Per Task**: Check if task creates or fills gaps
- **Per Handoff**: Include relevant gaps in context
- **Per Appetite**: Review all gaps during planning
- **Pattern Creation**: Prioritize based on business impact

## Current Gap Statistics

- **High Priority**: 2 patterns needed
- **Medium Priority**: 2 patterns needed
- **Low Priority**: 2 patterns needed
- **Total Gap Complexity**: ~30 units to fill all gaps
- **Most Critical**: Admin Authentication Pattern (security risk)
