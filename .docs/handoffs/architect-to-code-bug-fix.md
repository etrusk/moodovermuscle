# Architecture to Code Handoff: Bug Fix Implementation

## Context

### Appetite Constraints

- **Timeline**: [Specify urgency level - e.g., "Critical: 4-8 hours", "High: 1-2 days", "Medium: 3-5 days"]
- **Resource Allocation**: [Effort boundaries - e.g., "Maximum 8 hours for critical bugs"]
- **Circuit Breakers**: [Hard stops - e.g., "Escalate if fix requires architectural changes or >12 hours"]

### Bug Analysis Foundation

- **Issue Description**: [Clear problem statement and user impact]
- **Root Cause Analysis**: [Technical analysis from architecture review]
- **Affected Components**: [System areas impacted by the bug]
- **Proposed Solution**: [Architectural approach to resolution]

### Technical Context

- **Reproduction Steps**: [How to consistently trigger the bug]
- **Environment Details**: [Where bug occurs - dev, staging, production]
- **Related Issues**: [Connected bugs or technical debt items]
- **Risk Assessment**: [Potential side effects of proposed fix]

## Requirements

### Fix Implementation

- [ ] Core bug resolution per architectural analysis
- [ ] Regression tests to prevent future occurrence
- [ ] Impact validation on related functionality
- [ ] Performance verification (no degradation)
- [ ] Documentation of fix approach

### Testing Requirements

- [ ] Unit tests covering the bug scenario
- [ ] Integration tests for affected workflows
- [ ] Manual testing of reproduction steps
- [ ] Smoke tests for related functionality
- [ ] Performance benchmarks maintained

### Safety Measures

- [ ] Backward compatibility preserved
- [ ] No breaking changes to public APIs
- [ ] Database integrity maintained
- [ ] User data protection verified
- [ ] Rollback plan documented

## Success Criteria

### Bug Resolution

- [ ] Original issue no longer reproducible
- [ ] All reproduction steps pass
- [ ] User-reported symptoms eliminated
- [ ] No new issues introduced

### Technical Quality

- [ ] All existing tests continue passing
- [ ] New tests prevent regression
- [ ] Code follows established patterns
- [ ] Performance impact minimal
- [ ] Security considerations addressed

### Appetite Compliance

- [ ] Fix completed within urgency timeline
- [ ] No scope expansion beyond bug resolution
- [ ] Circuit breakers respected
- [ ] Solution matches architectural proposal

## Escalation Triggers

### Immediate Human Navigator Involvement

- **Scope Expansion**: If fix requires features or architectural changes beyond bug resolution
- **Data Risk**: Any potential for data loss or corruption during fix
- **Security Impact**: If bug or fix has security implications
- **Business Logic**: Changes affecting core business rules or user workflows

### Debug Mode Handoff

- **Complex Root Cause**: If architectural analysis was incomplete or incorrect
- **Environment Issues**: Problems reproducing or testing the fix
- **Integration Complications**: Unexpected interactions with other systems
- **Test Failures**: If fix breaks existing functionality

### Architecture Mode Re-consultation

- **Design Inadequacy**: If proposed solution proves insufficient
- **Performance Impact**: If fix causes significant performance degradation
- **Architectural Inconsistency**: If implementation conflicts with system design
- **Future-proofing**: If fix creates technical debt requiring architectural review

## Handoff Checklist

### Pre-Implementation

- [ ] Bug analysis and proposed solution understood
- [ ] Reproduction steps verified in development environment
- [ ] Appetite constraints and urgency level acknowledged
- [ ] Related code areas identified and reviewed
- [ ] Testing strategy planned

### During Implementation

- [ ] Fix approach matches architectural proposal
- [ ] Regular testing during development
- [ ] Impact on related functionality monitored
- [ ] Timeline tracking against appetite constraints
- [ ] Documentation updated with fix details

### Post-Implementation

- [ ] Original reproduction steps no longer trigger bug
- [ ] All automated tests passing
- [ ] Manual verification completed
- [ ] Performance impact assessed
- [ ] Fix committed with detailed commit message
- [ ] Issue tracking updated with resolution details

### Bug Prevention

- [ ] Regression tests added to prevent recurrence
- [ ] Root cause patterns documented in .docs/memory/
- [ ] Process improvements identified (if applicable)
- [ ] Team knowledge sharing completed
