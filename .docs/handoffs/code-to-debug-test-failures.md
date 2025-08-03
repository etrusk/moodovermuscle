# Code to Debug Handoff: Test Failures Investigation

## Context

### Appetite Constraints

- **Timeline**: [Specify urgency - e.g., "Critical: Fix within 4 hours", "High: Resolve within 1 day"]
- **Resource Allocation**: [Debug effort boundaries - e.g., "Maximum 6 hours for test debugging"]
- **Circuit Breakers**: [Hard stops - e.g., "Escalate if requires major refactoring or >8 hours"]

### Implementation Context

- **Recent Changes**: [What code changes preceded the test failures]
- **Failing Test Details**: [Number of failed tests, affected test suites]
- **Error Patterns**: [Common error messages or failure types observed]
- **Environment Context**: [Development, CI/CD, or specific test environment issues]

### Technical Context

- **Test Framework**: [Jest, Playwright, Cypress, etc.]
- **Test Types Affected**: [Unit, integration, E2E, etc.]
- **Related Components**: [Code areas likely causing the failures]
- **Previous Working State**: [Last known good commit or test run]

## Requirements

### Investigation Scope

- [ ] Identify root cause of test failures
- [ ] Categorize failures by type (environment, logic, mocking, etc.)
- [ ] Determine if failures indicate real bugs or test issues
- [ ] Assess impact on overall test suite stability
- [ ] Document findings for future prevention

### Fix Implementation

- [ ] Resolve test environment compatibility issues
- [ ] Fix broken mocks or test setup problems
- [ ] Update tests to match new implementation behavior
- [ ] Maintain or improve test coverage
- [ ] Ensure no regression in working tests

### Verification Requirements

- [ ] All previously failing tests now pass
- [ ] No new test failures introduced
- [ ] Test suite achieves 100% pass rate
- [ ] CI/CD pipeline validates successfully
- [ ] Performance impact minimal

## Success Criteria

### Test Suite Stability

- [ ] Zero failing tests across all test suites
- [ ] No flaky or intermittent test failures
- [ ] Test execution time within acceptable limits
- [ ] All test environments working correctly

### Root Cause Resolution

- [ ] Underlying cause identified and documented
- [ ] Fix addresses root cause, not just symptoms
- [ ] Prevention measures implemented where possible
- [ ] Knowledge captured for similar future issues

### Appetite Compliance

- [ ] Resolution completed within timeline constraints
- [ ] No scope expansion beyond test fixing
- [ ] Circuit breakers respected
- [ ] Implementation changes preserved and working

## Escalation Triggers

### Immediate Human Navigator Involvement

- **Implementation Issues**: If test failures reveal actual bugs in business logic
- **Architecture Problems**: If failures indicate design flaws requiring architectural review
- **Scope Expansion**: If fixing tests requires significant code refactoring
- **Data Integrity**: If failures suggest potential data corruption or loss risks

### Code Mode Re-engagement

- **Implementation Bugs**: If tests reveal actual functionality problems in recent code
- **Feature Incompleteness**: If failures indicate missing implementation details
- **Integration Issues**: If tests expose problems with new feature integration
- **Performance Degradation**: If tests reveal performance regression from implementation

### Architecture Mode Consultation

- **Design Validation**: If test failures suggest architectural approach needs review
- **System Integration**: If failures indicate broader system compatibility issues
- **Technical Debt**: If fixes require substantial refactoring or design changes
- **Pattern Violations**: If failures reveal violations of established architectural patterns

## Handoff Checklist

### Pre-Investigation

- [ ] Test failure details reviewed and understood
- [ ] Recent implementation changes analyzed
- [ ] Test environment status verified
- [ ] Appetite constraints and timeline acknowledged
- [ ] Investigation strategy planned

### During Investigation

- [ ] Systematic analysis of failure patterns
- [ ] Root cause identification prioritized over quick fixes
- [ ] Impact on implementation functionality assessed
- [ ] Timeline tracking against appetite constraints
- [ ] Regular communication of findings

### Post-Resolution

- [ ] All test failures resolved
- [ ] Root cause documented in .docs/investigations/
- [ ] Prevention measures implemented
- [ ] Test suite stability verified
- [ ] Knowledge sharing completed
- [ ] Implementation integrity confirmed

### Investigation Documentation

- [ ] Problem summary with clear symptom description
- [ ] Root cause analysis with technical details
- [ ] Resolution steps taken and rationale
- [ ] Prevention measures for future occurrence
- [ ] Impact assessment on appetite timeline
- [ ] Patterns identified for .docs/memory/ contribution

### Handback to Code Mode

- [ ] Test environment fully functional
- [ ] All tests passing consistently
- [ ] Implementation preserved and verified
- [ ] Any necessary code adjustments documented
- [ ] Clear path for continued development
