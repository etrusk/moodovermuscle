# Architecture to Code Handoff: New Feature Implementation

## Context

### Appetite Constraints

- **Timeline**: [Specify appetite timeline - e.g., "Week 2-3 of current 6-week cycle"]
- **Resource Allocation**: [Specify effort boundaries - e.g., "12-16 hours maximum"]
- **Circuit Breakers**: [Define hard stops - e.g., "Stop if implementation exceeds 2 weeks or requires major architectural changes"]

### Architecture Foundation

- **Feature Scope**: [Clear description of what is being built]
- **System Integration Points**: [How feature connects to existing architecture]
- **Data Model Changes**: [Database schema updates, if any]
- **API Design**: [Endpoint definitions and request/response structures]

### Technical Context

- **Dependencies**: [Required libraries, services, or infrastructure]
- **Existing Patterns**: [Reference .docs/patterns/ and .docs/memory/successful-patterns.md]
- **Quality Gates**: [Performance requirements, test coverage expectations]

## Requirements

### Implementation Deliverables

- [ ] Core feature functionality per architectural specification
- [ ] Unit tests with [X]% coverage for new components
- [ ] Integration tests for API endpoints and data flows
- [ ] Component tests for UI elements (if applicable)
- [ ] Documentation updates in relevant files

### Code Quality Standards

- [ ] TypeScript strict mode compliance
- [ ] ESLint and Prettier formatting
- [ ] Consistent naming conventions with existing codebase
- [ ] Error handling following established patterns
- [ ] Proper separation of concerns (hooks, components, utilities)

### Integration Requirements

- [ ] Backward compatibility with existing features
- [ ] Database migrations (if schema changes required)
- [ ] API versioning considerations
- [ ] Performance impact assessment

## Success Criteria

### Functional Success

- [ ] Feature works as specified in architectural design
- [ ] All user acceptance criteria met
- [ ] Error scenarios handled gracefully
- [ ] Performance meets defined benchmarks

### Technical Success

- [ ] All tests passing (100% pass rate maintained)
- [ ] Code review guidelines satisfied
- [ ] No breaking changes to existing functionality
- [ ] Documentation updated and accurate

### Appetite Compliance

- [ ] Implementation completed within timeline constraints
- [ ] Resource usage within allocated boundaries
- [ ] No circuit breaker triggers encountered
- [ ] Scope creep properly managed

## Escalation Triggers

### Immediate Human Navigator Involvement

- **Architecture Changes**: If implementation requires significant deviation from approved design
- **Security Decisions**: Any authentication, authorization, or data protection choices
- **Performance Impact**: If feature causes >20% degradation in core metrics
- **Scope Expansion**: When requirements grow beyond original appetite boundaries

### Debug Mode Handoff

- **Test Failures**: If implementation breaks existing test suite
- **Integration Issues**: Complex problems with third-party services or APIs
- **Performance Problems**: Unexpected bottlenecks or resource consumption
- **Environment Issues**: Development or deployment pipeline complications

### Circuit Breaker Conditions

- **Time Overrun**: Implementation approaching appetite timeline limits
- **Complexity Explosion**: Feature requiring significantly more effort than estimated
- **Breaking Changes**: Modifications that would impact existing user workflows
- **Technical Debt**: Implementation requiring substantial refactoring of existing code

## Handoff Checklist

### Pre-Implementation

- [ ] Architecture design reviewed and understood
- [ ] Appetite constraints acknowledged
- [ ] Required context from .docs/ structure analyzed
- [ ] Development environment prepared
- [ ] Success criteria clarified

### During Implementation

- [ ] Regular progress tracking against appetite timeline
- [ ] Circuit breaker monitoring for scope expansion
- [ ] Quality gate validation at each milestone
- [ ] Documentation updated incrementally

### Post-Implementation

- [ ] All success criteria verified
- [ ] Test suite at 100% pass rate
- [ ] Documentation complete and accurate
- [ ] Code committed with conventional commit format
- [ ] Handoff summary prepared for next phase
