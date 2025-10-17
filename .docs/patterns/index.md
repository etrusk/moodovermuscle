# Pattern Index

Reference for proven, reusable code patterns. Always check this before implementing similar functionality.

## Auth Patterns

### JWT Authentication
**Location**: `lib/auth/jwt-service.ts`
**Use for**: Login, token refresh, token validation
**Key functions**: `generateToken()`, `refreshToken()`, `validateToken()`

### Auth Middleware
**Location**: `middleware/auth-middleware.ts`
**Use for**: Protecting API routes
**Pattern**: Verify JWT in Authorization header, attach user to request

## Form Patterns

### Zod Validation Schemas
**Location**: `lib/validation/schemas.ts`
**Use for**: Runtime input validation
**Pattern**: Define schema, use `.parse()` for validation, catch ZodError

### Multi-Step Forms
**Location**: `components/forms/MultiStepForm.tsx`
**Use for**: Complex forms with multiple pages
**Pattern**: State machine for step management, validate per-step

### Form Error Handling
**Location**: `components/forms/FormError.tsx`
**Use for**: Displaying validation errors
**Pattern**: Map Zod errors to field-specific messages

## Database Patterns

### Prisma Queries
**Location**: `lib/db/booking-queries.ts`
**Use for**: Booking CRUD operations
**Pattern**: Use `include` for relations, proper error handling

### Transaction Wrapper
**Location**: `lib/db/transaction-wrapper.ts`
**Use for**: Multiple operations in single transaction
**Pattern**: Wrap in `prisma.$transaction()`, rollback on error

### Availability Checks
**Location**: `lib/db/availability-check.ts`
**Use for**: Preventing booking conflicts
**Pattern**: Query overlapping time ranges, lock for update

## Testing Patterns

### Integration Tests
**Location**: `tests/integration/booking.test.ts`
**Use for**: API endpoint testing
**Pattern**: Setup/teardown database, test full request/response cycle

### Prisma Mocking
**Location**: `tests/mocks/prisma-mock.ts`
**Use for**: Mocking database in tests
**Pattern**: Use `vi.mock()` for ESM compatibility

### E2E Tests
**Location**: `tests/e2e/booking-flow.spec.ts`
**Use for**: User workflow testing
**Pattern**: Playwright test, full browser automation

### Admin API Route Testing
**Location**: `__tests__/app/api/admin/*/route.test.ts`
**Use for**: Testing admin API endpoints with authentication
**Pattern**:
- Mock Prisma client for database operations
- Mock auth utilities for authentication checks
- Test CRUD operations, error scenarios, edge cases
- Verify response formats and status codes
**Example**: `__tests__/app/api/admin/bookings/route.test.ts`
**Coverage Target**: 80%+ for API routes

### Auth Service Testing with JWT
**Location**: `__tests__/lib/auth/admin-auth.test.ts`
**Use for**: Testing authentication service layer
**Pattern**:
- Mock environment variables (ADMIN_EMAIL, ADMIN_PASSWORD_HASH)
- Mock JWT utilities (sign, verify)
- Test authentication flows, token generation, token validation
- Test error scenarios (invalid credentials, expired tokens)
**Coverage Target**: 95%+ for auth services

### MSW Handler Setup for Admin Endpoints
**Location**: Test files using MSW for admin API mocking
**Use for**: Mocking admin API calls in component tests
**Pattern**:
- Define MSW handlers for `/api/admin/*` endpoints
- Return realistic response structures matching API contracts
- Handle both success and error scenarios
- Use request handlers to validate request payloads
**Note**: Global fetch mocking conflicts with MSW - avoid mixing approaches

### Client-Side Auth Hook Testing (Partial)
**Location**: `__tests__/lib/auth/useAdminAuth.test.ts`
**Use for**: Testing React hooks that use browser fetch API
**Known Issues**:
- Global fetch mock interferes with MSW's fetch interception
- Tests fail when MSW handlers and global fetch mocks are both present
- Requires MSW handler refactoring or fetch polyfill approach
**Workaround**: E2E tests provide coverage for client-side auth flows
**Future Pattern**: Remove global fetch mocks, use MSW exclusively or node-fetch polyfill

## Component Patterns

### Component Decomposition
**Principle**: Keep components <300 lines
**Pattern**: Extract sub-components when component grows too large
**Example**: BookingForm → BookingFormFields + BookingFormActions

### State Management
**Location**: Components use React Query for server state
**Pattern**: `useQuery` for reads, `useMutation` for writes
**Avoid**: Duplicating server state in local state

## API Patterns

### API Route Structure
**Location**: `app/api/bookings/route.ts`
**Pattern**:
```typescript
export async function POST(request: Request) {
  // 1. Parse and validate input (Zod)
  // 2. Authenticate/authorize
  // 3. Business logic
  // 4. Return Response.json()
}
```

### Error Response Format
**Pattern**:
```typescript
{
  success: false,
  error: {
    message: "Human-readable error",
    code: "ERROR_CODE",
    details: {} // Optional additional context
  }
}
```

## Pattern Documentation Template

When documenting new patterns, include:

```markdown
### [Pattern Name]
**Location**: `path/to/implementation.ts`
**Use for**: [When to apply this pattern]
**Pattern**: [Brief description of approach]
**Prerequisites**: [Dependencies or setup needed]

**Pattern Metadata**:
- **Last Applied**: [YYYY-MM-DD]
- **Times Reused**: [Count]
- **Effectiveness**: [High/Medium/Low - effort reduction percentage if known]
- **Complexity**: [1-10 score]
```

**Example Pattern Documentation**:

```markdown
### JWT Authentication
**Location**: `lib/auth/jwt-service.ts`
**Use for**: Login, token refresh, token validation
**Key functions**: `generateToken()`, `refreshToken()`, `validateToken()`

**Pattern Metadata**:
- **Last Applied**: 2025-08-03
- **Times Reused**: 5
- **Effectiveness**: High (40% effort reduction)
- **Complexity**: 6
```

## Common Implementation Approaches

### When to Extract a Pattern

**Extract when:**
- Code duplicated 2+ times (5+ lines)
- Clear reusable abstraction
- Multiple similar implementations

**Don't extract when:**
- Used only once
- Highly specific to single use case
- Abstraction adds more complexity than it removes

### How to Apply Patterns

1. Search this index for similar functionality
2. Review referenced file for implementation details
3. Copy pattern structure (don't duplicate code)
4. Adapt pattern to specific use case
5. If creating new pattern, document here only if genuinely reusable
