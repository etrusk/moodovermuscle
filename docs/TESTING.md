# Testing Documentation - MoodOverMuscle Project

## Overview

This document outlines the comprehensive testing strategy and guidelines for the MoodOverMuscle project. Our testing infrastructure includes unit tests, integration tests, and end-to-end (E2E) tests to ensure code quality and reliability.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Coverage**: Jest built-in coverage reporting
- **Mocking**: Jest mock functions and custom test utilities

## Project Structure

```
__tests__/
├── components/
│   ├── booking-form.test.tsx
│   └── ui/
│       └── button.test.tsx
├── setup/
│   └── test-utils.tsx
├── mocks/
│   └── booking-data.ts
e2e/
├── example.spec.ts
├── fixtures/
│   └── test-data.ts
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
pnpm playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in headed mode
pnpm test:e2e --headed
```

## Test Guidelines

### Unit Test Best Practices

1. **Component Testing**
   - Test component rendering
   - Test user interactions
   - Test props and state changes
   - Test edge cases

2. **Test Structure**

   ```typescript
   describe('ComponentName', () => {
     test('should render correctly', () => {})
     test('should handle user interaction', () => {})
     test('should handle edge cases', () => {})
   })
   ```

3. **Mocking**
   - Use Jest mocks for external dependencies
   - Mock API calls and external services
   - Use custom test utilities for consistent setup

### E2E Test Best Practices

1. **Test Scenarios**
   - Critical user journeys
   - Form submissions
   - Navigation flows
   - Responsive design testing

2. **Test Data**
   - Use fixtures for consistent test data
   - Clean up test data after tests
   - Use environment-specific configurations

## Coverage Configuration

Current coverage thresholds:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Testing Utilities

### Custom Render Function

Located in `__tests__/setup/test-utils.tsx`, provides:

- Theme provider wrapper
- Consistent test setup
- Re-exported testing library functions

### Mock Data

Located in `__tests__/mocks/`, provides:

- Consistent test data
- Valid and invalid data examples
- Reusable across tests

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

- Unit tests on every PR
- E2E tests on main branch
- Coverage reports generated
- Failing tests block deployment

## Common Issues and Solutions

### TypeScript Errors

- Ensure `@testing-library/jest-dom` is imported in setup
- Check for missing type definitions
- Verify import paths are correct

### Mock Setup

- Always mock external dependencies
- Use consistent mock data
- Reset mocks between tests

## Writing New Tests

### For Components

1. Create test file in `__tests__/components/`
2. Use the custom render function
3. Follow the established patterns
4. Include both positive and negative test cases

### For E2E Tests

1. Create test file in `e2e/`
2. Use the Playwright test structure
3. Include proper test data fixtures
4. Add descriptive test names

## Maintenance

- Update tests when components change
- Review and update test data regularly
- Monitor coverage reports
- Refactor tests for clarity and maintainability

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
