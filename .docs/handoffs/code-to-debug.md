# [DEPRECATED] Code → Debug Handoff Template

> **⚠️ DEPRECATED**: This generic template has been superseded by specific scenario templates:
>
> - Use [`code-to-debug-runtime-errors.md`](./code-to-debug-runtime-errors.md) for runtime error investigations
> - Use [`code-to-debug-test-failures.md`](./code-to-debug-test-failures.md) for test failure debugging
>
> The specific templates include appetite constraints, circuit breakers, and modern handoff patterns that this generic template lacks.

# Code → Debug Handoff Template

## Issue Summary

**Date**: [YYYY-MM-DD]  
**Code Agent**: [Agent/Human Name]  
**Escalation Reason**: [Bug found, test failure, performance issue, etc.]

## Problem Description

### Symptoms Observed

[Detailed description of what's not working as expected]

### Expected Behavior

[Clear description of what should happen]

### Actual Behavior

[What actually happens, including error messages]

### Reproduction Steps

1. [Step 1 to reproduce the issue]
2. [Step 2 to reproduce the issue]
3. [Step 3 to reproduce the issue]

## Technical Context

### Recently Modified Files

- **File 1**: `path/to/file.ext`
  - **Changes Made**: [What was changed]
  - **Suspected Relationship**: [Why this might be related to the issue]

- **File 2**: `path/to/file.ext`
  - **Changes Made**: [What was changed]
  - **Suspected Relationship**: [Why this might be related to the issue]

### Error Messages & Stack Traces

```
[Paste full error messages and stack traces here]
```

### Environment Details

- **Development/Production**: [Which environment]
- **Browser/Node Version**: [If relevant]
- **Database State**: [If database-related]
- **Recent Deployments**: [Any recent changes]

## Investigation Starting Points

### Likely Root Causes

1. **Theory 1**: [Most likely cause based on symptoms]
   - **Evidence**: [Why you think this]
   - **Investigation Path**: [Where to look first]

2. **Theory 2**: [Second most likely cause]
   - **Evidence**: [Supporting information]
   - **Investigation Path**: [Debugging approach]

### Test Failures

- **Failing Tests**: [Specific test names and failure messages]
- **Passing Tests**: [Related tests that still work]
- **Test Coverage**: [Areas that might lack coverage]

### Code Quality Issues

- **TypeScript Errors**: [Any type-related issues]
- **Linting Warnings**: [Code quality concerns]
- **Performance Concerns**: [If performance-related]

## System State

### Database State

```sql
-- Relevant database queries to check current state
-- Include expected vs actual data
```

### API Responses

```json
// Actual API responses (sanitized)
// Include request/response pairs
```

### Log Output

```
[Relevant log entries with timestamps]
[Include both error logs and normal operation logs for comparison]
```

## Debugging Tools & Resources

### Available Debugging Tools

- [ ] **Browser DevTools**: [Specific tabs/features to check]
- [ ] **Database Console**: [Queries to run]
- [ ] **API Testing**: [Endpoints to test]
- [ ] **Performance Profiling**: [If performance issue]

### Context Files for Investigation

- [ ] **`.docs/spec.md`**: Requirements and expected behavior
- [ ] **`.docs/architecture.md`**: System design constraints
- [ ] **`.docs/api-spec.md`**: Interface contracts
- [ ] **Related test files**: [Specific test files to examine]

### Related Documentation

- [ ] **`.docs/decisions/[relevant-adr].md`**: Design decisions
- [ ] **Previous investigations**: [Similar issues resolved before]

## Constraints & Requirements

### Quality Gates

- **Critical Gates**: [What must continue to pass]
- **Testing Requirements**: [New tests needed after fix]
- **Performance Targets**: [Metrics to maintain]

### Compatibility Requirements

- **Backward Compatibility**: [What must remain unchanged]
- **API Contracts**: [Interface guarantees to maintain]
- **Database Integrity**: [Data consistency requirements]

## Success Criteria

### Fix Validation

- [ ] **Root cause identified** and documented
- [ ] **Issue resolved** with minimal side effects
- [ ] **Tests pass** (all existing + new tests for bug)
- [ ] **No regressions** in related functionality

### Quality Standards

- [ ] **Code quality maintained** (linting, typing)
- [ ] **Performance preserved** (or improved)
- [ ] **Documentation updated** if needed
- [ ] **Prevention measures** implemented

## Rollback Plan

### If Fix Fails

1. [Step to revert changes safely]
2. [How to restore working state]
3. [Who to notify if rollback needed]

### Safe Harbor

- **Last Known Good State**: [Git commit or deployment]
- **Rollback Verification**: [How to confirm rollback success]

## Investigation Notes

### Attempted Solutions

- [Solution 1]: [What was tried and result]
- [Solution 2]: [What was tried and result]

### Ruled Out Causes

- [Cause 1]: [Why this was eliminated]
- [Cause 2]: [Evidence against this theory]

### Working Hypotheses

- [Current best theory about root cause]
- [Evidence supporting this theory]
- [Next steps to validate/disprove]

---

**Next Action**: Debug mode should systematically investigate starting with most likely root cause, document findings in `.docs/investigations/`, and implement fix with proper testing.
