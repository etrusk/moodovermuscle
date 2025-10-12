# Test Mode: Two-Phase Test Workflow

**MANDATORY**: Test mode MUST follow this two-phase approach for all new features.

## Overview

Test mode now operates in two distinct phases to prevent AI hallucination and ensure human approval before test implementation.

## Phase 1: Test Design

**When test mode receives a new feature request:**

1. **Create Design Document** in `.docs/test-designs/[feature-name]-test-design.md`:
   ```markdown
   # Test Design: [Feature Name]
   
   **Created:** [Date]
   **Feature:** [Brief description]
   
   ## Test Strategy
   
   ### Happy Path Tests
   - [ ] Test 1: [Description]
   - [ ] Test 2: [Description]
   
   ### Edge Cases
   - [ ] Edge case 1: [Description]
   - [ ] Edge case 2: [Description]
   
   ### Error Conditions
   - [ ] Error 1: [Description]
   - [ ] Error 2: [Description]
   
   ## Integration Points
   - API endpoint: [endpoint]
   - Database schema: [tables/models]
   - External services: [if any]
   
   ## Test File Structure
   - `__tests__/[feature].test.ts` - Unit tests
   - `e2e/[feature].spec.ts` - E2E tests (if needed)
   
   ## Mocking Strategy
   - Mock: [What will be mocked]
   - Real: [What will use actual implementation]
   
   ## Expected Assertions
   - Type assertions: toMatchObject, toEqual
   - Error assertions: toThrow, rejects.toThrow
   - Mock verification: toHaveBeenCalledWith
   ```

2. **Use `attempt_completion`** to request human approval:
   ```
   I've created a test design document at .docs/test-designs/[feature-name]-test-design.md.
   
   The design covers:
   - [X] happy path tests
   - [X] edge cases
   - [X] error conditions
   
   Please review the design and confirm before I implement the tests.
   ```

3. **WAIT for human approval** - Do NOT proceed to Phase 2 without explicit approval

## Phase 2: Test Implementation

**After human approves the design:**

1. **Implement tests** following the approved design document
2. **Apply quality standards** from `.roo/rules-test/02-ai-test-quality.md`
3. **Verify all tests pass**: `npm run test:critical`
4. **Run quality gate**: `npm run test:quality` (validates test quality)
5. **Auto-commit** after tests pass:
   ```bash
   git add -A
   git commit -m "test: [description of tests added]"
   ```
6. **Use `attempt_completion`** with summary of tests implemented

## When to Skip Phase 1

Phase 1 can be skipped ONLY for:
- Simple bug fix tests (single function, clear scope)
- Trivial utility function tests (<5 assertions)
- Updating existing test to fix false positive/negative

For ALL new features: Phase 1 is MANDATORY.

## Why Two Phases?

**Prevents:**
- AI hallucinating non-existent APIs or endpoints
- Incorrect integration point assumptions
- Over-complex test structures
- Missing critical test cases

**Ensures:**
- Human validates integration points before implementation
- Test strategy aligns with actual system architecture
- Clear scope and acceptance criteria
- Efficient test implementation (no rework)

## Example Workflow

**User request:** "Create tests for user authentication feature"

**Phase 1 - Test Design:**
1. Create `.docs/test-designs/user-authentication-test-design.md`
2. Document: JWT validation, refresh tokens, password hashing tests
3. Use `attempt_completion` to request review
4. WAIT for approval

**Phase 2 - Test Implementation:**
1. Human approves design
2. Implement tests in `__tests__/auth/authentication.test.ts`
3. Run `npm run test:critical` - all pass
4. Run `npm run test:quality` - quality gate passes
5. Auto-commit: `git commit -m "test: add user authentication tests"`
6. Use `attempt_completion` with summary

## Integration with Navigator Mode

Navigator mode should delegate to test mode with:
```typescript
new_task({
  task: "Create test design for [feature] covering [key areas]",
  mode: "test"
})
```

Navigator should NOT instruct test mode to "write tests immediately" - the two-phase workflow is automatic.