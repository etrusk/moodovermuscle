# Code to Debug Handoff: Runtime Errors Investigation

## Context

### Appetite Constraints

- **Timeline**: [Specify urgency - e.g., "Critical: Fix within 2 hours", "High: Resolve within 4 hours"]
- **Resource Allocation**: [Debug effort boundaries - e.g., "Maximum 6 hours for runtime debugging"]
- **Circuit Breakers**: [Hard stops - e.g., "Escalate if requires major system changes or >8 hours"]

### Error Context

- **Error Type**: [Runtime exception, performance issue, memory leak, etc.]
- **Error Environment**: [Development, staging, production]
- **Error Frequency**: [Intermittent, consistent, under specific conditions]
- **User Impact**: [Severity and scope of user-facing problems]

### Technical Context

- **Error Messages**: [Stack traces, console errors, logs]
- **Recent Changes**: [Code deployments or configuration changes before error]
- **Affected Components**: [System areas experiencing issues]
- **Reproduction Conditions**: [Steps or scenarios that trigger the error]

## Requirements

### Investigation Scope

- [ ] Identify root cause of runtime errors
- [ ] Determine error patterns and triggering conditions
- [ ] Assess system stability and data integrity impact
- [ ] Evaluate performance implications
- [ ] Document comprehensive error analysis

### Error Resolution

- [ ] Implement fix that addresses root cause
- [ ] Ensure fix doesn't introduce new issues
- [ ] Validate error resolution across environments
- [ ] Add monitoring or logging to prevent recurrence
- [ ] Update error handling patterns if needed

### System Verification

- [ ] Confirm error no longer occurs in affected scenarios
- [ ] Verify system performance remains stable
- [ ] Validate data integrity maintained
- [ ] Test related functionality for regressions
- [ ] Confirm monitoring and alerting working

## Success Criteria

### Error Elimination

- [ ] Runtime error no longer reproducible
- [ ] System operates normally under previous error conditions
- [ ] No new errors introduced by fix
- [ ] Performance impact eliminated or minimized

### System Stability

- [ ] All related functionality working correctly
- [ ] No data corruption or loss
- [ ] System monitoring shows healthy metrics
- [ ] Error handling graceful and user-friendly

### Appetite Compliance

- [ ] Resolution completed within urgency timeline
- [ ] No scope expansion beyond error fixing
- [ ] Circuit breakers respected
- [ ] Implementation changes validated and stable

## Escalation Triggers

### Immediate Human Navigator Involvement

- **Data Risk**: Any potential for data loss, corruption, or security breach
- **Business Impact**: Errors affecting core business functionality or revenue
- **Scope Expansion**: If fix requires architectural changes or major refactoring
- **System-wide Issues**: Errors indicating broader infrastructure or design problems

### Code Mode Re-engagement

- **Implementation Gaps**: If errors reveal missing functionality or incomplete features
- **Feature Bugs**: If runtime errors stem from implementation logic problems
- **Integration Issues**: If errors occur during system integration or API interactions
- **Performance Problems**: If errors related to performance require code optimization

### Architecture Mode Consultation

- **Design Flaws**: If errors indicate fundamental architectural problems
- **Scalability Issues**: If errors reveal system capacity or scaling limitations
- **Pattern Violations**: If errors show violations of established architectural patterns
- **System Integration**: If errors suggest broader system compatibility issues

## Handoff Checklist

### Pre-Investigation

- [ ] Error details and context reviewed
- [ ] System state and recent changes analyzed
- [ ] Error reproduction attempted
- [ ] Appetite constraints and urgency acknowledged
- [ ] Investigation approach planned

### During Investigation

- [ ] Systematic error analysis and root cause identification
- [ ] Impact assessment on system stability and data
- [ ] Timeline tracking against appetite constraints
- [ ] Regular status updates on investigation progress
- [ ] Documentation of findings and hypotheses

### Post-Resolution

- [ ] Error resolution verified in all affected environments
- [ ] Root cause documented in .docs/investigations/
- [ ] Prevention measures implemented
- [ ] System monitoring and alerting updated
- [ ] Knowledge sharing and lessons learned captured

### Error Documentation

- [ ] Error description with technical details and user impact
- [ ] Root cause analysis with systematic investigation findings
- [ ] Resolution approach and implementation details
- [ ] Prevention measures and monitoring improvements
- [ ] Impact on appetite timeline and resource usage
- [ ] Patterns captured for .docs/memory/ contribution

### Handback to Code Mode

- [ ] System fully functional and error-free
- [ ] Performance restored to expected levels
- [ ] Implementation validated and stable
- [ ] Error handling improved where applicable
- [ ] Clear path for continued development work

### Production Readiness

- [ ] Fix tested across all relevant environments
- [ ] Deployment plan validated and risk-assessed
- [ ] Rollback procedures documented and tested
- [ ] Monitoring and alerting configured for error detection
- [ ] Team prepared for deployment and post-deployment monitoring
