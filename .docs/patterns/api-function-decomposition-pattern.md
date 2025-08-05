# Pattern: Function Decomposition

**Complexity**: Medium
**Files Affected**: 3-5 (API route, function modules, tests)
**Prerequisites**: A complex API route with multiple responsibilities.
**Use Cases**: Refactoring a monolithic API endpoint into smaller, single-responsibility functions to improve modularity, testability, and maintainability.

## Implementation Steps

1.  **Identify Responsibilities**: Analyze the existing API route and identify distinct logical operations (e.g., validation, database interaction, external service calls, notifications).
2.  **Create Function Modules**: For each identified responsibility, create a new file within a `functions` subdirectory (e.g., `app/api/your-route/functions/`).
3.  **Extract Logic**: Move the code for each responsibility into its corresponding new function module. Ensure each function is self-contained and has a clear interface.
4.  **Update API Route**: Refactor the main API route to be a lightweight coordinator that imports and calls the new functions in the correct sequence. The route should primarily handle request/response flow and error orchestration.
5.  **Create Unit Tests**: Write dedicated unit tests for each new function module. Mock any external dependencies to test the function's logic in isolation.
6.  **Refactor Integration Tests**: Update existing integration tests to reflect the new decomposed structure. Ensure the tests still cover the end-to-end flow but mock the individual functions where appropriate to test specific scenarios.

## Testing Strategy

-   **Unit Tests**: Each function module should have its own test file (e.g., `booking-validation.test.ts`). Use Jest to mock dependencies (like `prisma` or email services) and test the function's logic in complete isolation.
-   **Integration Tests**: The main API route's integration test should be updated to test the orchestration of the functions. You can use `jest.mock` to simulate different outcomes from your decomposed functions (e.g., a validation failure or a database conflict) and assert that the route handles them correctly.

## Common Pitfalls

-   **Over-Decomposition**: Don't break down functions into pointlessly small pieces. Each function should represent a meaningful, cohesive block of logic.
-   **Leaky Abstractions**: Ensure that implementation details from one function don't leak into another. For example, the notification function shouldn't need to know about the specifics of the database schema.
-   **Circular Dependencies**: Be mindful of the dependency graph. A function in one module should not import a function from another in a way that creates a circular reference.

## Related Patterns

-   [RESTful CRUD Pattern](./api-crud-pattern.md)
-   [Error Response Pattern](./api-error-response-pattern.md)
-   [Validation Middleware Pattern](./api-validation-middleware-pattern.md)
-   [Transaction Safety Pattern](./db-transaction-safety-pattern.md)