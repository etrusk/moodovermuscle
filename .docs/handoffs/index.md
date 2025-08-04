# Agent Handoff Template Index

This index provides structured templates for transferring context between different agent modes, ensuring continuity and comprehensive information transfer during workflow transitions.

## By Transition Type

**Architect → Code**

- [New Feature Implementation](./arch-to-code-new-feature.md) - feature design to implementation handoff
- [Bug Fix Implementation](./arch-to-code-bug-fix.md) - problem analysis to solution implementation
- ~~[Generic Template](./architect-to-code.md)~~ - **DEPRECATED** - use specific templates above

**Code → Debug**

- [Test Failures](./code-to-debug-test-failures.md) - failing tests requiring investigation
- [Runtime Errors](./code-to-debug-runtime-errors.md) - production issues needing debugging
- ~~[Generic Template](./code-to-debug.md)~~ - **DEPRECATED** - use specific templates above

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

## By Handoff Type

### Task Delegation

**boomerang-task-template.md** - Generic template for tasks that will return to the originating mode

- Use when: Task requires specialist expertise but will return for integration
- Boomerang probability: High - designed for round-trip workflows
- Context preservation: Comprehensive state transfer for seamless continuation

**orchestrator-to-specialist.md** - Generic template for orchestrator delegating to any specialist mode

- Use when: Complex task decomposed, specific specialist expertise required for sub-component
- Expected outcome: Specialist completes domain-specific work with clear deliverables
- Integration focus: Clear interface points and handoff back requirements
- Complexity: Variable - depends on specialist domain and task scope

### Problem Escalation

**code-to-debug-test-failure.md** - When Code mode encounters test failures requiring investigation

- Use when: Implementation work hits test failures that need debugging expertise
- Expected outcome: Root cause identification and fix guidance
- Complexity: Medium - debugging complexity varies by issue type

**code-to-architect-design-issue.md** - When implementation reveals architectural problems

- Use when: Code work discovers design conflicts or architectural limitations
- Expected outcome: Revised architectural approach with clear implementation path
- Complexity: High - architectural changes typically have broad impact

**debug-to-code-fix-implementation.md** - When debug has identified root cause and needs fix implemented

- Use when: Root cause verified, solution approach tested, ready for implementation
- Expected outcome: Fix implemented with regression prevention measures
- Complexity: Medium - implementation complexity varies by fix scope

### Emergency and Critical Issues

**emergency-escalation.md** - For critical production issues requiring immediate attention

- Use when: Production system failures, security breaches, data loss risks
- Response time: Critical - human response required within minutes
- Complexity: Variable - emergency response complexity depends on issue severity

**security-issue-escalation.md** - For security vulnerabilities requiring careful handling

- Use when: Security vulnerabilities discovered requiring coordinated response
- Special handling: Disclosure coordination, legal considerations, compliance requirements
- Complexity: High - security issues require specialized expertise and careful communication

### Performance and Investigation

**performance-investigation.md** - Specialized template for performance bottleneck investigations

- Use when: Performance degradation identified, systematic investigation required
- Expected outcome: Root cause identification with optimization roadmap
- Complexity: Medium to High - performance optimization can have architectural implications

### Specialized Workflows

_(Space reserved for additional specialized handoff templates as workflow patterns emerge)_

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

## Usage Guidelines

### When to Use Handoff Templates

**Required scenarios**:

- Mode transitions involving context-sensitive work
- Task delegation requiring specific expertise
- Problem escalation needing specialized investigation
- Complex multi-mode workflows
- Emergency situations requiring coordinated response
- Security issues requiring careful disclosure handling

**Template selection criteria**:

1. **Task complexity**: Use specialized templates for complex domain-specific work
2. **Context sensitivity**: Use when significant context must be preserved across modes
3. **Expertise matching**: Select template based on receiving mode's specialized capabilities
4. **Integration requirements**: Consider how work will integrate back into overall workflow
5. **Urgency and impact**: Use emergency templates for critical issues requiring immediate response
6. **Security implications**: Use security-specific templates when vulnerabilities are involved

### Quality Standards for Handoffs

**All handoff templates must include**:

- **Synthesized context provision** (for Orchestrator handoffs via Ask mode delegation) OR **Curated context provision** (for Architect handoffs) OR **No broad discovery required** (for Code/Debug handoffs)
- **Documentation pulse tracking** for all .docs references
- Clear appetite and complexity estimates (except emergency escalations)
- Circuit breaker conditions and escalation triggers
- **Role specialization alignment** with Navigator-Driver model
- 70/30 decision routing guidance (where applicable)
- Pattern applications from institutional memory
- Investigation cross-references where applicable
- **Preview-first workflow requirements** for functionality changes
- Communication protocols for specialized scenarios

**Handoff Quality Checklist**:

- [ ] Current state clearly documented
- [ ] Specific task and acceptance criteria defined
- [ ] Relevant patterns and decisions referenced
- [ ] Known constraints and circuit breakers identified
- [ ] Testing requirements specified
- [ ] Rollback plan documented (if applicable)
- [ ] Related investigations linked
- [ ] Appetite boundaries clearly marked

### Template Development Guidelines

**Creating New Handoff Templates**
**Template requirements**:

- Follow semantic naming: `[source-mode]-to-[target-mode]-[specific-scenario].md`
- **Include synthesized context provision** (for Orchestrator handoffs via Ask mode) OR **curated context provision** (for Architect handoffs) OR **specify no broad discovery required** (for specialized roles)
- **Add documentation pulse tracking** for all .docs references
- Provide structured context transfer protocols aligned with role specialization
- Define clear success criteria and escalation conditions
- Reference institutional memory indexes appropriately for role type
- **Include preview-first workflow requirements** for functionality changes
- Include boomerang patterns where investigation might return to orchestrator
- Add specialized sections for domain-specific requirements
- Include communication protocols for sensitive scenarios

**Template Categories**
**Current categories**:

- Task delegation (boomerang workflows, orchestrator delegation)
- Problem escalation (debugging, architectural issues, fix implementation)
- Emergency and critical issues (production failures, security vulnerabilities)
- Performance and investigation (bottleneck analysis, optimization planning)
- Specialized workflows (domain-specific transitions)

**Template Maintenance**:

- Regular review of template effectiveness
- Updates based on actual handoff experiences
- Pattern refinement from successful transitions
- Integration with evolving institutional memory

**Standard Handoff Structure**:

```markdown
# Handoff: [Task Title]

**From**: [Current Mode] **To**: [Target Mode]
**Complexity**: [1-10] **Appetite**: [Time constraint]
**Risk Level**: Low/Medium/High

## Synthesized Context Package (for Orchestrator handoffs)

**Context Discovery Delegated**: [Ask mode analyzed .docs files]

OR

## Curated Context Package (for Architect handoffs)

**Context Discovery Completed**: [List .docs files analyzed]

OR

## Specialized Role Context (for Code/Debug handoffs)

**NO BROAD DISCOVERY REQUIRED**: [Context provided by comprehensive roles]

**Documentation Pulse Tracking**:
```

<!-- PULSE: [YYYY-MM-DD] [role] - [context] -->

```

## Current State

[What has been accomplished, current system state]

## Task Definition

[Specific work to be completed, acceptance criteria]

## Context Package

**Synthesized Patterns**: [Specific patterns selected via Ask mode analysis]
**Architectural Constraints**: [Relevant constraints from Ask mode discovery]
**Related Investigations**: [Similar issues identified through Ask mode analysis]
**Institutional Memory**: [Lessons learned applied from Ask mode memory analysis]

## Preview-First Workflow (for functionality changes)

- [ ] Feature branch creation required
- [ ] Vercel Preview deployment needed
- [ ] Client approval confirmation mandatory
- [ ] Human confirmation protocol required

## Implementation Guidance

[Specific technical direction, file locations, approaches]

## Quality Gates

[Testing requirements, validation steps, quality checks]

## Circuit Breakers

[Scope boundaries, when to escalate, appetite limits]

## Role Expectations

**Specialized Implementation Role**: [For Code/Debug - focus on provided context]
OR
**Synthesis Coordination Role**: [For Orchestrator - coordinate Ask mode discovery and synthesize]
OR
**Comprehensive Discovery Role**: [For Architect - full context analysis]

## Handoff Verification

- [ ] Receiving agent confirms understanding
- [ ] Context package verified complete
- [ ] Role expectations understood
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
