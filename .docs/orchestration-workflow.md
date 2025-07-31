# Agentic Orchestration Workflow

## Core Principles

### 1. Documentation-First Approach

- **Always consult relevant documentation before starting work**
- Validate task scope against existing specifications
- Ensure understanding of system constraints and architecture
- Reference `.docs/current-task.md` for active scope and acceptance criteria

### 2. Task Decomposition

- **Break complex tasks into small, coherent, well-defined units**
- Each task should have clear acceptance criteria
- Tasks must be atomic and independently testable
- Delegate specialized work to appropriate modes

### 3. Test-Driven Development

- **Tests come first in the development cycle**
- Follow RED → GREEN → REFACTOR pattern religiously
- Maintain comprehensive test coverage across all layers
- Validate both functionality and non-functional requirements

### 4. Continuous Integration

- **Frequent commits and pushes for rapid feedback**
- Atomic commits with clear, descriptive messages
- Push after each RED/GREEN/REFACTOR cycle
- Maintain short-lived feature branches

### 5. Quality Gates

- **Automated validation at every step**
- Never bypass quality checks
- Address issues immediately when detected
- Maintain high code quality standards

## Workflow Patterns

### Phase 1: Task Initialization

**Objective**: Establish context and prepare for development

**Validation Checkpoints**:

- [ ] Current environment status verified
- [ ] Relevant documentation consulted
- [ ] Task scope clearly defined
- [ ] Feature branch created and tracked
- [ ] Session state restored if applicable

**Key Activities**:

- Review `.docs/current-task.md` for scope and acceptance criteria
- Consult `.docs/architecture.md` for system constraints
- Check `.docs/test-strategy.md` for testing patterns
- Establish feature branch with descriptive naming

### Phase 2: Test-First Development

**Objective**: Implement functionality through TDD cycles

**RED Phase**:

- Write failing tests that capture requirements
- Ensure tests fail for the right reasons
- Commit failing tests with clear test descriptions
- Validate test coverage and quality

**GREEN Phase**:

- Implement minimal code to make tests pass
- Focus on functionality over optimization
- Commit working implementation
- Run full test suite to ensure no regressions

**REFACTOR Phase**:

- Clean up code while maintaining test coverage
- Extract patterns and improve design
- Commit refactored code
- Validate performance and maintainability

### Phase 3: Quality Validation

**Objective**: Ensure code meets all quality standards

**Automated Quality Gates**:

- Linting and code style validation
- Type checking and static analysis
- Security vulnerability scanning
- Performance benchmarking
- Accessibility compliance testing
- Build verification

**Manual Quality Gates**:

- Code review readiness assessment
- Documentation completeness check
- Integration testing validation
- User experience verification

### Phase 4: Documentation Maintenance

**Objective**: Keep documentation synchronized with implementation

**Documentation Updates Required**:

- `.docs/current-task.md`: Progress tracking and completion status
- `.docs/architecture.md`: Design changes and architectural decisions
- `.docs/api-spec.md`: Interface modifications and contract updates
- `.docs/test-strategy.md`: New testing patterns and coverage updates
- `.docs/debt.md`: Technical debt tracking and resolution notes

### Phase 5: Integration and Cleanup

**Objective**: Merge changes and maintain clean workspace

**Integration Checklist**:

- [ ] All quality gates passed
- [ ] Documentation updated
- [ ] Code review completed
- [ ] **Client Approval Received**
- [ ] Integration tests validated
- [ ] Performance benchmarks met

**Cleanup Protocol**:

- Merge feature branch using appropriate strategy
- Delete feature branch after successful merge
- Update main branch documentation
- Clean temporary files and artifacts
- Archive completed task documentation

## Mode Delegation Strategies

### Strategic Mode Selection

- **Architect Mode**: High-level planning, system design, workflow orchestration
- **Code Mode**: Implementation, refactoring, feature development
- **Debug Mode**: Issue investigation, error analysis, troubleshooting
- **Ask Mode**: Research, documentation queries, technical clarification

### Delegation Patterns

- Start complex tasks in **Architect** mode for planning
- Switch to **Code** mode for implementation phases
- Use **Debug** mode when quality gates fail
- Leverage **Ask** mode for technical research and clarification

### Context Handoff

- Provide clear task boundaries when delegating
- Include relevant documentation references
- Specify acceptance criteria and quality requirements
- Maintain session continuity across mode switches

## Continuous Feedback Loops

### Development Feedback

- Hot reload for immediate visual feedback
- Test watching for continuous validation
- Automated quality checks on every commit
- Performance monitoring during development

### Quality Feedback

- Immediate linting and type checking
- Automated security scanning
- Performance regression detection
- Accessibility compliance monitoring

### Documentation Feedback

- Specification drift detection
- Documentation completeness validation
- Architecture decision tracking
- Technical debt accumulation monitoring

## Failure Recovery Patterns

### Test Failures

- Analyze failure root cause before fixing
- Update tests if requirements changed
- Maintain test quality and coverage
- Document test patterns for reuse

### Quality Gate Failures

- Address issues immediately
- Never bypass quality checks
- Update tooling configuration if needed
- Learn from failures to prevent recurrence

### Integration Issues

- Isolate problematic changes
- Use feature flags for gradual rollout
- Maintain rollback capabilities
- Document resolution for future reference

### Documentation Drift

- Regular documentation audits
- Automated documentation validation
- Clear ownership and update responsibilities
- Version control for documentation changes

## Agile/Lean/TDD Integration

### Lean Principles

- Eliminate waste through automation
- Optimize value stream flow
- Build quality in from the start
- Deliver working software frequently

### Agile Practices

- Iterative development cycles
- Continuous stakeholder feedback
- Adaptive planning and execution
- Sustainable development pace

### TDD Excellence

- Test-first mentality
- Comprehensive test coverage
- Refactoring discipline
- Design emergence through testing

## Success Metrics

### Development Velocity

- Time from task start to completion
- Number of quality gate failures
- Rework frequency and causes
- Documentation maintenance overhead

### Quality Indicators

- Test coverage percentage
- Defect escape rate
- Performance regression frequency
- Security vulnerability count

### Process Health

- Documentation freshness
- Technical debt accumulation rate
- Mode delegation effectiveness
- Workflow adherence compliance

---

**Workflow Version**: 2.0.0  
**Focus**: Agentic Task Orchestration  
**Last Updated**: 2025-07-30  
**Principles**: Documentation-First • Test-Driven • Quality-Focused • Continuously Integrated
