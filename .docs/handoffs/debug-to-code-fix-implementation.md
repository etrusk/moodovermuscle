# Debug to Code: Fix Implementation Handoff

## Handoff Type: Fix Implementation

**From**: Debug Mode → **To**: Code Mode  
**Context**: Root cause identified, verified solution approach, ready for implementation

## Mandatory Index Discovery

**CRITICAL**: Code agent must execute this discovery protocol immediately:

### Required Index Reads

- **MANDATORY**: Read `.docs/patterns/index.md` - search for fix patterns related to identified issue type
- **MANDATORY**: Check `.docs/investigations/index.md` - review similar debugging outcomes and their fixes
- **CONDITIONAL**: Review `.docs/decisions/index.md` - understand architectural constraints for fix implementation
- **CONDITIONAL**: Check `.docs/memory/index.md` - apply lessons from similar fix implementations

### Discovery Documentation

- [ ] Fix patterns reviewed and selected for implementation
- [ ] Previous investigations consulted for proven solutions
- [ ] Architectural constraints confirmed for fix approach
- [ ] Implementation complexity calibrated from memory

## Root Cause Summary

**Issue classification**:

- [ ] Logic error
- [ ] Integration failure
- [ ] Performance bottleneck
- [ ] Configuration problem
- [ ] Resource leak
- [ ] Race condition
- [ ] Other: [specify]

**Root cause details**:

```
[Detailed explanation of what was causing the issue]
```

**Evidence supporting root cause**:

- Reproduction steps: [Clear steps to reproduce]
- Log evidence: [Relevant log entries]
- Test failures: [Specific test failures that confirm issue]
- Metrics: [Performance metrics or other quantitative evidence]

## Fix Implementation Plan

**Solution approach verified during debugging**:

```
[Specific approach that was tested/validated during debug session]
```

**Files requiring modification**:

- [ ] Primary fix: `path/to/file` - [specific changes needed]
- [ ] Supporting changes: `path/to/file` - [additional changes required]
- [ ] Configuration updates: `path/to/file` - [config changes needed]

**Implementation sequence**:

1. [First implementation step]
2. [Second implementation step]
3. [Final implementation step]

## Test Requirements

**Existing tests that should pass after fix**:

- [ ] `test/path/file.test.ts` - [specific test cases]
- [ ] `test/path/file.test.ts` - [specific test cases]

**New tests required**:

- [ ] **Regression test**: Test that specifically prevents this issue from reoccurring
- [ ] **Edge case coverage**: Tests for edge cases discovered during debugging
- [ ] **Integration verification**: Tests confirming fix doesn't break integrations

**Test implementation priority**:

- [ ] Critical: Tests that must be implemented before fix deployment
- [ ] Important: Tests that should be implemented with fix
- [ ] Nice-to-have: Tests that can be implemented post-fix

## Regression Prevention Measures

**Code changes to prevent similar issues**:

```
[Structural changes, validation additions, or patterns to prevent recurrence]
```

**Monitoring/logging improvements**:

```
[Additional logging or monitoring to catch similar issues early]
```

**Documentation updates needed**:

- [ ] Code comments explaining fix rationale
- [ ] README updates for configuration changes
- [ ] API documentation updates if interfaces changed

## Context Transfer Package

**Debug artifacts to preserve**:

- Reproduction script: `[path/to/script]`
- Debug logs: `[path/to/logs]`
- Performance profiles: `[path/to/profiles]`
- Test case developments: `[path/to/tests]`

**Verified solution components**:

```typescript
// Example of verified fix approach
[code snippet that was tested during debugging]
```

**Alternative approaches ruled out**:

1. ❌ Approach A: [Why this didn't work]
2. ❌ Approach B: [Why this was suboptimal]
3. ✅ Chosen approach: [Why this is the best solution]

## Appetite and Complexity

**Implementation complexity estimate**:

- Fix implementation: [X units]
- Test creation: [Y units]
- Documentation: [Z units]
- **Total estimate**: [X+Y+Z units]

**Appetite boundaries**:

- Current remaining: [A units]
- Required for fix: [B units]
- Buffer remaining: [A-B units]

**Circuit breaker conditions**:

- Escalate if implementation exceeds [threshold] complexity
- Escalate if fix requires architectural changes
- Escalate if testing reveals additional issues

## Success Criteria for Code Agent

**Implementation completion indicators**:

- [ ] All identified fixes implemented
- [ ] All critical tests pass
- [ ] Regression tests added and passing
- [ ] No new issues introduced
- [ ] Performance metrics improved/maintained

**Quality gates required**:

- [ ] All existing tests still pass
- [ ] New tests achieve required coverage
- [ ] Linting/formatting standards maintained
- [ ] Build process successful
- [ ] Integration tests pass

## 70/30 Decision Routing

**70% (Autonomous Implementation)**:

- Code structure and organization
- Test implementation following established patterns
- Documentation updates
- Performance optimizations within scope
- Error handling improvements

**30% (Escalate to Human)**:

- Business logic changes required by fix
- User experience impacts
- Security implications of the fix
- Integration strategy changes
- Performance trade-off decisions

## Escalation Conditions

**Escalate back to Debug Mode if**:

- Implementation reveals additional root causes
- Verified solution doesn't work in practice
- Fix creates new integration failures
- Performance impact is unacceptable

**Escalate to Human Navigator if**:

- Fix requires business logic decisions
- Implementation exceeds appetite boundaries
- Security implications discovered
- Multiple valid fix approaches with similar complexity

## Pattern Applications

**Applied from patterns/index.md**:

- [List debugging patterns that led to solution]
- [List implementation patterns to be used for fix]

**New patterns developed**:

- [Any new debugging or fix patterns discovered]

## Investigation Cross-References

**Related from investigations/index.md**:

- [Reference debugging investigations that informed this fix]

**New investigation contribution**:

- [Any insights that should be added to investigations knowledge]

## Session Continuity

**Current state**: Root cause identified, solution verified, ready for implementation
**Handoff artifacts**: [List all debugging artifacts being transferred]
**Resume prevention**: Clear implementation plan with verified solution approach

---

_Handoff Date_: [Auto-generated]  
_Issue Severity_: [Critical/High/Medium/Low]  
_Implementation Complexity_: [X units]  
_Expected Resolution Time_: [Based on appetite]
