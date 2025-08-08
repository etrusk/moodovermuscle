# Pattern: Admin Component Testing Pattern

**Complexity**: Medium (3-5 files, 4-8 hours)
**Files Affected**: Component test files, integration tests, E2E tests
**Prerequisites**: React Testing Library, Jest, Playwright, existing admin components
**Use Cases**: Testing admin dashboard interfaces with authentication, API integration, and complex user workflows

## Implementation Steps

### 1. Component Test Structure
Create comprehensive test suites following this pattern:

```typescript
// __tests__/components/admin/[component].test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import AdminComponent from '@/app/admin/[component]/page'

// Mock authentication and navigation
const mockUseAdminAuth = jest.fn()
jest.mock('@/lib/auth/AdminAuthContext', () => ({
  useAdminAuth: () => mockUseAdminAuth(),
}))

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AdminComponent', () => {
  beforeEach(() => {
    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      logout: jest.fn(),
    })
    mockFetch.mockResolvedValue(mockSuccessResponse)
  })

  describe('Authentication Integration', () => {
    // Authentication state testing
  })

  describe('Data Loading and Display', () => {
    // API integration testing
  })

  describe('User Interactions', () => {
    // User workflow testing
  })

  describe('Error Handling', () => {
    // Error state testing
  })

  describe('Accessibility', () => {
    // Accessibility validation
  })
})
```

### 2. Mock Strategy for Admin Components
Use consistent mocking approach:

```typescript
const mockSuccessResponse = {
  ok: true,
  json: jest.fn(() => Promise.resolve(mockData)),
  clone: jest.fn().mockReturnThis()
} as any

const mockErrorResponse = {
  ok: false,
  statusText: 'Internal Server Error',
  json: jest.fn(() => Promise.resolve({ error: 'Failed to fetch' })),
  clone: jest.fn().mockReturnThis()
} as any
```

### 3. Authentication Testing Pattern
Test all authentication states:

```typescript
it('shows loading state during authentication', async () => {
  mockUseAdminAuth.mockReturnValue({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    logout: jest.fn(),
  })

  const { container } = render(<AdminComponent />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

it('redirects when not authenticated', async () => {
  mockUseAdminAuth.mockReturnValue({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: jest.fn(),
  })

  render(<AdminComponent />)

  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledWith('/admin/login')
  })
})
```

### 4. API Integration Testing
Test loading, success, and error states:

```typescript
it('handles API failures gracefully', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'))

  render(<AdminComponent />)

  await waitFor(() => {
    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})

it('retries API calls when retry button is clicked', async () => {
  mockFetch
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce(mockSuccessResponse)

  render(<AdminComponent />)

  await waitFor(() => {
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  const retryButton = screen.getByRole('button', { name: /retry/i })
  await user.click(retryButton)

  await waitFor(() => {
    expect(screen.getByText('Data loaded successfully')).toBeInTheDocument()
  })
})
```

### 5. Integration Testing Pattern
Create workflow integration tests:

```typescript
// __tests__/integration/admin-components/admin-workflow.integration.test.tsx
describe('Admin Components Integration Tests', () => {
  it('supports full workflow: Dashboard → Bookings → Calendar', async () => {
    // Test complete user journey across components
    // Verify data consistency
    // Test navigation between sections
    // Validate cross-component functionality
  })
})
```

### 6. E2E Testing Pattern
Create comprehensive E2E tests:

```typescript
// e2e/admin/admin-workflow.spec.ts
test('complete admin workflow: login → dashboard → bookings → calendar', async ({ page }) => {
  // Login flow
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')

  // Dashboard verification
  await expect(page).toHaveURL(/\/admin\/dashboard/)
  
  // Navigation testing
  await page.click('a[href="/admin/bookings"]')
  await expect(page).toHaveURL(/\/admin\/bookings/)
  
  // Functionality testing
  // Error handling
  // Accessibility validation
})
```

## Testing Strategy

### Component Tests Focus
- Authentication integration
- API data loading and error handling  
- User interactions (forms, buttons, navigation)
- Status updates and state management
- Accessibility compliance
- Loading and error states

### Integration Tests Focus
- Cross-component data flow
- Authentication persistence
- Navigation consistency
- Error boundary behavior
- Performance under load

### E2E Tests Focus
- Complete user workflows
- Authentication protection
- Responsive design
- Error recovery
- Performance benchmarks

## Common Pitfalls

### Mock Configuration Issues
- Ensure `fetch` mocking includes `clone()` method
- Reset mocks between tests to prevent state leakage
- Use proper TypeScript casting for mock objects

### Async Testing Problems  
- Always use `waitFor` for async operations
- Set appropriate timeouts for slow operations
- Test both loading and loaded states

### Authentication Edge Cases
- Test all authentication states (loading, authenticated, not authenticated)
- Verify redirect behavior
- Test logout functionality across components

### Accessibility Testing
- Include `axe` testing in all component tests
- Test keyboard navigation
- Verify proper heading structure and ARIA labels

## Related Patterns

- [Authentication Flow Pattern](./auth-authentication-pattern.md) - For authentication implementation
- [API Error Response Pattern](./api-error-response-pattern.md) - For consistent error handling
- [Component Test Pattern](./test-component-pattern.md) - For general component testing
- [Integration Test Pattern](./test-integration-pattern.md) - For API integration testing

## Performance Considerations

- Mock heavy API calls to keep tests fast
- Use proper cleanup in test lifecycle
- Avoid excessive DOM queries in assertions
- Test performance impact of large datasets

## Security Implications

- Test authentication boundaries thoroughly
- Verify proper error message handling (no sensitive data exposure)
- Test authorization checks for different user roles
- Validate input sanitization in forms

This pattern provides comprehensive testing coverage for admin interfaces while maintaining test performance and reliability.