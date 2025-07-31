# Agentic Orchestration Workflow

## Core Principles

### 1. Documentation-First Approach

- **Always consult relevant documentation before starting work**
- Validate task scope against existing specifications in [`.docs/current-task.md`](.docs/current-task.md)
- Ensure understanding of system constraints from [`.docs/architecture.md`](.docs/architecture.md)
- Reference [`.docs/api-spec.md`](.docs/api-spec.md) for interface contracts
- Check [`.docs/debt.md`](.docs/debt.md) for known technical debt impacts

### 2. Task Decomposition

- **Break complex tasks into small, coherent, well-defined units**
- Each task should have clear acceptance criteria aligned with business value
- Tasks must be atomic and independently testable with staged test execution
- Delegate specialized work to appropriate modes based on complexity
- Consider technical debt impact when planning task scope

### 3. Staged Test-Driven Development

- **Critical tests come first** - core business logic must always pass
- Follow **RED → GREEN → REFACTOR** pattern with staged test execution
- **Critical tests** (unit + stable integration) gate all commits/pushes
- **Integration tests** can temporarily fail with proper tracking in [`.docs/failing-tests.md`](.docs/failing-tests.md)
- **Full test suite** must pass before releases

### 4. Continuous Integration with Quality Stages

- **Frequent commits and pushes** enabled by critical test gating
- Atomic commits with clear, descriptive messages following conventional format
- Push after each RED/GREEN/REFACTOR cycle using `pnpm test:critical`
- Maintain short-lived feature branches with staged quality validation
- Integration test failures tracked but don't block development velocity

### 5. Pragmatic Quality Gates

- **Critical quality gates** (never bypass): Type checking, linting, critical tests, build validation, security vulnerabilities
- **Non-critical quality gates** (can be temporarily bypassed with tracking): Integration test failures, performance regressions, non-critical accessibility issues
- Address critical issues immediately when detected
- Track and schedule resolution of non-critical issues

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

- Review [`.docs/current-task.md`](.docs/current-task.md) for scope and acceptance criteria
- Consult [`.docs/architecture.md`](.docs/architecture.md) for system constraints and design decisions
- Check [`.docs/test-strategy.md`](.docs/test-strategy.md) and [`.docs/testing-workflow.md`](.docs/testing-workflow.md) for testing patterns
- Review [`.docs/failing-tests.md`](.docs/failing-tests.md) for known test issues that may impact work
- Check [`.docs/debt.md`](.docs/debt.md) for relevant technical debt
- Establish feature branch with descriptive naming following conventional format

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
- Run critical test suite (`pnpm test:critical`) to ensure no regressions in core functionality
- Run full test suite (`pnpm test:full`) for comprehensive validation when needed

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

- [`.docs/current-task.md`](.docs/current-task.md): Progress tracking and completion status
- [`.docs/architecture.md`](.docs/architecture.md): Design changes and architectural decisions
- [`.docs/api-spec.md`](.docs/api-spec.md): Interface modifications and contract updates
- [`.docs/test-strategy.md`](.docs/test-strategy.md): New testing patterns and coverage updates
- [`.docs/testing-workflow.md`](.docs/testing-workflow.md): Testing workflow updates and insights
- [`.docs/failing-tests.md`](.docs/failing-tests.md): Failing test tracking and resolution status
- [`.docs/debt.md`](.docs/debt.md): Technical debt tracking and resolution notes

### Phase 5: Integration and Cleanup

**Objective**: Merge changes and maintain clean workspace

**Integration Checklist**:

- [ ] All critical quality gates passed (type checking, linting, critical tests, build validation)
- [ ] Documentation updated across all relevant `.docs/` files
- [ ] Code review completed with focus on technical debt prevention
- [ ] **Client Approval Received** for user-facing changes
- [ ] Integration tests validated or failing tests properly tracked in [`.docs/failing-tests.md`](.docs/failing-tests.md)
- [ ] Performance benchmarks met or regressions documented
- [ ] Security vulnerabilities addressed

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

**Critical Tests (MUST be fixed immediately)**:

- Analyze failure root cause before fixing
- Update tests if requirements changed
- Maintain test quality and coverage
- Document test patterns for reuse

**Integration Tests (Can be temporarily tracked)**:

- Document failing tests in [`.docs/failing-tests.md`](.docs/failing-tests.md) with root cause analysis
- Assign priority, effort estimate, and timeline for resolution
- Track in sprint planning and retrospectives with clear ownership
- Never delete tests without fixing underlying issues
- Regular review and resolution planning to prevent debt accumulation

### Quality Gate Failures

**Critical Quality Gates (Never bypass)**:

- Type checking failures
- Linting errors
- Critical test failures
- Build failures
- Security vulnerabilities

**Non-Critical Quality Gates (Can be temporarily bypassed with tracking)**:

- Integration test failures (with documentation)
- Performance regressions (with monitoring)
- Non-critical accessibility issues (with remediation plan)

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

- **Test-first mentality** for new features
- **Comprehensive critical test coverage** for core business logic
- **Refactoring discipline** while maintaining green critical tests
- **Design emergence through testing** with staged test execution
- **Pragmatic test management** with categorized test suites

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

## Workflow Commands Reference

### Context Loading

```bash
# Quick context restoration
cd /home/bob/Projects/moodovermuscle
git status && git log --oneline -5

# Documentation review
head -20 .docs/current-task.md
grep -A3 "^## $FEATURE" .docs/test-strategy.md
grep -A2 "^## $COMPONENT" .docs/architecture.md
```

### Development Workflow

```bash
# Development environment
pnpm dev                    # Start Next.js dev server
pnpm db:studio             # Open Prisma database studio

# Staged testing approach
pnpm test:critical         # Critical tests (pre-push gate)
pnpm test:integration      # Integration tests (can fail)
pnpm test:full            # Full test suite (pre-release)
pnpm test:watch           # Watch mode for TDD

# Quality validation
pnpm lint                 # ESLint validation
pnpm type-check          # TypeScript compilation
pnpm lighthouse          # Performance audit
```

### Git Workflow

```bash
# Feature development
git checkout -b feat/feature-name
# ... development with TDD cycles ...
git add . && git commit -m "feat: description"
git push origin feat/feature-name  # Triggers critical tests only

# Pre-release validation
pnpm test:full            # All tests must pass
git checkout main && git merge feat/feature-name
```

## Integration with Project Documentation

This workflow integrates with the comprehensive `.docs/` structure:

- **[Current Task](.docs/current-task.md)**: Active scope and acceptance criteria
- **[Architecture](.docs/architecture.md)**: System design and constraints
- **[API Specification](.docs/api-spec.md)**: Interface contracts and test data
- **[Test Strategy](.docs/test-strategy.md)**: Testing patterns and automation
- **[Testing Workflow](.docs/testing-workflow.md)**: Staged testing implementation
- **[Failing Tests](.docs/failing-tests.md)**: Test failure tracking and resolution
- **[Technical Debt](.docs/debt.md)**: Debt management and prevention

## Success Metrics Integration

### Development Velocity (Enhanced)

- Time from task start to completion with staged testing
- Critical test pass rate (target: 100%)
- Integration test resolution time (target: <2 sprints)
- Documentation maintenance overhead (target: <10% of development time)

### Quality Indicators (Refined)

- Critical test coverage (target: 100% for core business logic)
- Integration test coverage (target: >90% with tracked failures acceptable)
- Technical debt accumulation rate (tracked in [`.docs/debt.md`](.docs/debt.md))
- Security vulnerability resolution time (target: immediate for critical)

### Process Health (Updated)

- Documentation freshness across all `.docs/` files
- Failing test resolution rate and timeline adherence
- Mode delegation effectiveness for complex tasks
- Workflow adherence with staged testing compliance

---

**Workflow Version**: 3.0.0
**Focus**: Staged Testing • Pragmatic Quality • Documentation-Driven
**Last Updated**: 2025-07-31
**Principles**: Documentation-First • Staged Test-Driven • Pragmatic Quality • Continuously Integrated • Technical Debt Aware
