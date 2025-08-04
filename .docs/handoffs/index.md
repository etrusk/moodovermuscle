# Agent Handoff Template Index

This index provides structured templates for transferring context between different agent modes, ensuring continuity and comprehensive information transfer during workflow transitions.

## By Transition Type

**Architect → Code**

- [New Feature Implementation](./arch-to-code-new-feature.md) - feature design to implementation handoff
- [Bug Fix Implementation](./arch-to-code-bug-fix.md) - problem analysis to solution implementation
- [Refactoring Task](./arch-to-code-refactoring.md) - architectural improvement to code changes
- [Integration Work](./arch-to-code-integration.md) - system integration design to implementation

**Code → Debug**

- [Test Failures](./code-to-debug-test-failures.md) - failing tests requiring investigation
- [Runtime Errors](./code-to-debug-runtime-errors.md) - production issues needing debugging
- [Performance Issues](./code-to-debug-performance.md) - performance problems requiring analysis
- [Integration Failures](./code-to-debug-integration.md) - external system integration problems

**Debug → Code**

- [Issue Resolution](./debug-to-code-resolution.md) - root cause identified, needs implementation fix
- [Workaround Implementation](./debug-to-code-workaround.md) - temporary solution needs proper fix
- [Configuration Fix](./debug-to-code-config-fix.md) - configuration changes needed
- [Dependency Update](./debug-to-code-dependency.md) - third-party dependency issues

**Code → Ask**

- [Technical Clarification](./code-to-ask-clarification.md) - implementation questions need answers
- [Business Logic Questions](./code-to-ask-business-logic.md) - domain logic clarification needed
- [Architecture Guidance](./code-to-ask-architecture.md) - structural decisions need input

**Any → Orchestrator**

- [Complex Multi-Step Task](./any-to-orchestrator-complex.md) - task requires coordination
- [Cross-Domain Work](./any-to-orchestrator-cross-domain.md) - spans multiple expertise areas
- [Resource Coordination](./any-to-orchestrator-resources.md) - multiple resources need management

## By Complexity Score

**Simple Tasks (Complexity 1-3)**

- [Basic Handoff Template](./simple-task-handoff.md) - minimal context for straightforward work
- Essential context: current state, specific task, constraints
- Typical duration: < 2 hours
- Single file or component focus

**Medium Tasks (Complexity 4-6)**

- [Standard Handoff Template](./medium-task-handoff.md) - moderate context for typical features
- Enhanced context: dependencies, patterns to follow, testing requirements
- Typical duration: 2-8 hours
- Multiple files or system components

**Complex Tasks (Complexity 7-10)**

- [Comprehensive Handoff Template](./complex-task-handoff.md) - full context for major work
- Complete context: architecture impact, cross-system effects, rollback plans
- Typical duration: 1+ days
- System-wide changes or new integrations

## Template Selection Guide

**Choose Template Based On**:

1. **Task Complexity**: Use complexity scoring to select appropriate detail level
2. **Agent Expertise Gap**: More context needed when transitioning to unfamiliar domain
3. **Risk Level**: Higher risk tasks need more comprehensive handoffs
4. **Time Sensitivity**: Critical issues may need abbreviated but focused handoffs

**Handoff Quality Checklist**:

- [ ] Current state clearly documented
- [ ] Specific task and acceptance criteria defined
- [ ] Relevant patterns and decisions referenced
- [ ] Known constraints and circuit breakers identified
- [ ] Testing requirements specified
- [ ] Rollback plan documented (if applicable)
- [ ] Related investigations linked
- [ ] Appetite boundaries clearly marked

**Standard Handoff Structure**:

```markdown
# Handoff: [Task Title]

**From**: [Current Mode] **To**: [Target Mode]
**Complexity**: [1-10] **Appetite**: [Time constraint]
**Risk Level**: Low/Medium/High

## Current State

[What has been accomplished, current system state]

## Task Definition

[Specific work to be completed, acceptance criteria]

## Context Package

**Patterns to Apply**: [Link to relevant patterns from patterns/index.md]
**Architectural Constraints**: [Link to relevant ADRs from decisions/index.md]
**Related Investigations**: [Link to similar issues from investigations/index.md]
**Institutional Memory**: [Lessons learned from memory/index.md]

## Implementation Guidance

[Specific technical direction, file locations, approaches]

## Quality Gates

[Testing requirements, validation steps, quality checks]

## Circuit Breakers

[Scope boundaries, when to escalate, appetite limits]

## Handoff Verification

- [ ] Receiving agent confirms understanding
- [ ] Context package verified complete
- [ ] Quality gates understood
- [ ] Circuit breakers acknowledged
```

**Context Preservation Rules**:

1. **Never lose context**: Each handoff must preserve all relevant information
2. **Reference institutional knowledge**: Always link to relevant index files
3. **Update progress tracking**: Maintain continuity in .docs/current-task.md
4. **Preserve decision trail**: Document why choices were made
5. **Include failure prevention**: Reference known pitfalls and solutions

## Usage Examples

**Architect → Code (New Feature)**:

```markdown
# Handoff: Implement User Dashboard

**From**: Architect **To**: Code
**Complexity**: 5 **Appetite**: 6 hours

## Context Package

**Patterns**: [UI Dashboard Pattern](../patterns/ui-dashboard-pattern.md)
**Decisions**: [ADR-004: Frontend Framework](../decisions/adr-004-frontend-framework.md)
**Investigations**: Check [UI State Management](../investigations/ui-state-management.md) for known issues
```

**Code → Debug (Test Failures)**:

```markdown
# Handoff: Resolve Integration Test Failures

**From**: Code **To**: Debug
**Complexity**: 3 **Appetite**: 2 hours

## Context Package

**Related**: [Database Integration Issues](../investigations/db-integration-issues.md)
**Patterns**: [Test Database Pattern](../patterns/test-database-pattern.md)
**Recent Changes**: [List of recent commits affecting tests]
```

**Cross-Reference Integration**:

- **Patterns Index**: Templates reference proven implementation approaches
- **Investigations Index**: Handoffs include related debugging context
- **Decisions Index**: Architectural constraints carried through transitions
- **Memory Index**: Lessons learned inform handoff guidance
- **Current Task**: Progress tracking maintained across handoffs

**Handoff Success Metrics**:

- Receiving agent can start work immediately without additional context requests
- No context loss or repeated discovery work
- Quality gates consistently met across transitions
- Circuit breaker violations prevented through clear boundaries
- Institutional knowledge effectively leveraged and preserved
