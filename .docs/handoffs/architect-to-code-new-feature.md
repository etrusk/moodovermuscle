# Architecture to Code Handoff: New Feature Implementation

## Curated Context Package

**ARCHITECT RESPONSIBILITY**: Comprehensive context discovery completed and curated for Code implementation

### Context Discovery Completed by Architect

**Full .docs Discovery Executed**:

- ✅ `.docs/current-task.md` - Active work and session state analyzed
- ✅ `.docs/spec.md` - Project requirements and appetite constraints reviewed
- ✅ `.docs/architecture.md` - System design boundaries and constraints evaluated
- ✅ `.docs/workflows.md` - Quality gates and development processes confirmed
- ✅ `.docs/patterns/index.md` - Implementation patterns identified and selected
- ✅ `.docs/decisions/index.md` - Architectural decisions affecting feature reviewed
- ✅ `.docs/investigations/index.md` - Related issues and prevention measures analyzed
- ✅ `.docs/memory/index.md` - Complexity insights and implementation lessons applied


### Appetite Constraints (from spec.md analysis)

- **Timeline**: [Specify appetite timeline from current project context]
- **Resource Allocation**: [Effort boundaries based on complexity analysis]
- **Circuit Breakers**: [Hard stops based on architectural constraints and appetite limits]

### Architecture Foundation (from architecture.md + decisions context)

- **Feature Scope**: [Clear description informed by project requirements]
- **System Integration Points**: [How feature connects based on architectural analysis]
- **Data Model Changes**: [Database schema updates based on system constraints]
- **API Design**: [Endpoint definitions following established patterns]

### Technical Context (from patterns + investigations analysis)

- **Dependencies**: [Required libraries/services based on architectural decisions]
- **Curated Patterns**: [Specific patterns from patterns/index.md to apply]
- **Known Issues Prevention**: [Issues from investigations/index.md to avoid]
- **Quality Gates**: [Requirements from workflows.md analysis]

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

## Preview-First Workflow Requirements

**MANDATORY for functionality changes**:

### Deployment Strategy

- [ ] **Feature Branch**: Create feature branch from main for implementation
- [ ] **Vercel Preview**: Push triggers automatic Vercel Preview deployment
- [ ] **Client Approval Required**: MUST get explicit human confirmation of client approval
- [ ] **Production Deployment**: Only merge to main after confirmed client approval

### Human Confirmation Protocol

**Code agent MUST**:

- Use `ask_followup_question` tool to confirm client approval
- Ask: "Has the client reviewed and approved the changes at [preview-URL]?"
- Wait for explicit human confirmation before merging
- **NEVER assume approval** - always get explicit confirmation

### Preview Deployment Checklist

- [ ] Feature branch created and pushed
- [ ] Vercel Preview URL generated
- [ ] Preview URL shared with human for client review
- [ ] Client approval explicitly confirmed by human
- [ ] Merge to main only after approval confirmation

## Code Role Expectations

**SPECIALIZED IMPLEMENTATION ROLE**: Focus on implementation using curated context

### No Broad Discovery Required

- **Context Provided**: All relevant patterns, constraints, and guidance pre-researched
- **Focus on Implementation**: Apply provided patterns and constraints
- **Escalate Context Gaps**: If provided context insufficient, escalate to Architect
- **Report Findings**: Document implementation results for Architect documentation updates

### Implementation Responsibilities

- [ ] Apply specific patterns provided in curated context
- [ ] Follow architectural constraints from provided guidance
- [ ] Implement within appetite boundaries specified
- [ ] Execute quality gates as specified in curated workflow context
- [ ] Report implementation outcomes without updating documentation

## Escalation Triggers

### Immediate Human Navigator Involvement

- **Architecture Changes**: If implementation requires significant deviation from approved design
- **Security Decisions**: Any authentication, authorization, or data protection choices
- **Performance Impact**: If feature causes >20% degradation in core metrics
- **Scope Expansion**: When requirements grow beyond original appetite boundaries

### Return to Architect Mode

- **Insufficient Context**: If curated context doesn't provide enough guidance
- **Design Issues**: If implementation reveals architectural problems
- **Pattern Gaps**: If no suitable patterns provided for implementation approach
- **Constraint Conflicts**: If provided constraints conflict during implementation

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
