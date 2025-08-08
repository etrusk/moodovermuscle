# Mandatory Completion Checklist Templates

This document provides standardized completion checklists that **MUST** be used for all specialist role tasks to ensure systematic completion, quality gate enforcement, and knowledge preservation.

## Universal Completion Protocol

Every task, regardless of specialist role, must include these mandatory items:

```markdown
[ ] Primary objective achieved within appetite constraints
[ ] Quality gates verified (lint, type-check, test, security, build)
[ ] Git operations completed (add, commit with conventional message)
[ ] Knowledge transfer documented (patterns updated if applicable)
[ ] Institutional memory preserved (investigations/decisions updated if applicable)
[ ] Handback verification with evidence of completion
```

## Role-Specific Templates

### Implementation Specialist Template

```markdown
## Implementation Progress (Within Appetite)
[ ] Pattern-guided context loading (checked .docs/patterns/index.md)
[ ] Investigation awareness (checked .docs/investigations/index.md)
[ ] Feature implementation per roadmap
[ ] Code structure and organization (70% decisions)
[ ] Error handling implementation
[ ] Testing implementation
[ ] Documentation generation

## Quality Gate Verification
[ ] npm run lint (exit code 0 required)
[ ] npm run type-check (exit code 0 required)
[ ] npm run test:critical (current status documented)
[ ] npm run security:scan (no vulnerabilities)
[ ] npm run build:verify (successful build)

## Knowledge Capture
[ ] Pattern applications documented
[ ] New reusable patterns identified
[ ] Investigations updated if debugging occurred
[ ] Complexity lessons captured

## Git Workflow
[ ] All changes staged (git add .)
[ ] Conventional commit created
[ ] Pattern/investigation references in commit message

## Business Logic Escalations (30%)
[ ] Security policies → Escalated to Navigator
[ ] Business rules → Escalated to Navigator
[ ] UX decisions → Escalated to Navigator
[ ] Integration strategies → Escalated to Navigator

## Completion Verification
[ ] Appetite boundaries respected (no scope creep)
[ ] Circuit breakers not violated
[ ] Functionality not compromised for appetite
[ ] Ready for handback with evidence
```

### Investigation Specialist Template

```markdown
## Investigation Progress
[ ] Issue reproduction and documentation
[ ] Root cause analysis completed
[ ] Solution approach identified and validated
[ ] Fix implementation within appetite
[ ] Verification testing completed

## Diagnostic Documentation
[ ] Issue symptoms documented
[ ] Root cause clearly identified
[ ] Fix approach explained
[ ] Prevention measures noted
[ ] Investigation file created/updated

## Quality Gate Verification
[ ] npm run lint (exit code 0 required)
[ ] npm run type-check (exit code 0 required)
[ ] npm run test:critical (tests pass)
[ ] npm run security:scan (no vulnerabilities)
[ ] npm run build:verify (successful build)

## Knowledge Capture
[ ] Investigation pattern applied/updated
[ ] Reusable debugging insights captured
[ ] Similar issue prevention documented
[ ] Decision context preserved

## Git Workflow
[ ] All changes staged (git add .)
[ ] Conventional commit with investigation reference
[ ] Investigation file updates committed

## Completion Verification
[ ] Issue fully resolved
[ ] No regression introduced
[ ] Ready for handback with verification evidence
```

### Quality Specialist Template

```markdown
## Quality Assurance Progress
[ ] Test strategy developed
[ ] Test coverage assessment completed
[ ] Critical test gaps identified and addressed
[ ] Quality gate enforcement verified
[ ] Performance benchmarking completed

## Test Implementation
[ ] Unit tests created/updated
[ ] Integration tests verified
[ ] E2E test coverage confirmed
[ ] Accessibility testing completed
[ ] Security testing performed

## Quality Gate Verification
[ ] npm run lint (exit code 0 required)
[ ] npm run type-check (exit code 0 required)
[ ] npm run test:critical (all tests pass)
[ ] npm run test (full test suite status)
[ ] npm run security:scan (no vulnerabilities)
[ ] npm run build:verify (successful build)

## Quality Metrics
[ ] Code coverage thresholds met
[ ] Performance benchmarks within targets
[ ] Security scan results acceptable
[ ] Accessibility standards compliance

## Knowledge Capture
[ ] Testing patterns applied/updated
[ ] Quality insights documented
[ ] Best practices captured
[ ] Quality gate improvements noted

## Git Workflow
[ ] All test changes staged (git add .)
[ ] Conventional commit with quality focus
[ ] Quality documentation updated

## Completion Verification
[ ] Quality standards maintained
[ ] No quality degradation
[ ] Ready for handback with metrics evidence
```

### Navigator Template

```markdown
## Navigation and Planning Progress
[ ] Business context analysis completed
[ ] Appetite constraints defined
[ ] Task breakdown and delegation planned
[ ] Specialist assignments made
[ ] Progress monitoring established

## Business Alignment
[ ] Requirements clarification completed
[ ] Stakeholder expectations managed
[ ] Business logic decisions made
[ ] UX direction provided
[ ] Integration strategy defined

## Appetite Management
[ ] Circuit breakers defined
[ ] Scope boundaries established
[ ] Resource allocation confirmed
[ ] Timeline expectations set
[ ] Escalation criteria defined

## Specialist Coordination
[ ] Work packages defined
[ ] Context handoffs prepared
[ ] Progress tracking mechanisms established
[ ] Quality gate requirements communicated
[ ] Knowledge preservation requirements set

## Knowledge Capture
[ ] Decision context documented
[ ] Business logic rationale captured
[ ] Appetite accuracy tracked
[ ] Lessons learned preserved

## Completion Verification
[ ] All delegated work completed
[ ] Business objectives achieved
[ ] Quality standards maintained
[ ] Knowledge properly transferred
[ ] Ready for final delivery
```

## Quality Gate Commands

All specialists must execute these commands and document results:

### Pre-Implementation Gates
```bash
npm run lint              # Must pass (exit code 0)
npm run type-check        # Must pass (exit code 0)
```

### Post-Implementation Gates
```bash
npm run lint              # MUST show: exit code 0
npm run type-check        # MUST show: exit code 0
npm run test:critical     # MUST show: current status
npm run security:scan     # MUST show: no vulnerabilities
npm run build:verify      # MUST show: successful build
```

### Git Operations
```bash
git add .                 # Stage all changes
git commit -m "feat(protocols): conventional commit message with pattern/investigation references"
```

## Completion Protocol Enforcement

### Non-Negotiable Requirements

1. **Quality Gate Passage**: All critical gates must pass before completion
2. **Knowledge Preservation**: Reusable insights must be captured
3. **Git Compliance**: Conventional commits with proper references
4. **Appetite Respect**: No scope violations or circuit breaker breaks
5. **Evidence-Based Handback**: Clear verification of completion

### Failure Escalation

If any mandatory item cannot be completed:
- **Quality Gates**: Escalate to Navigator if fixes affect appetite
- **Scope Issues**: Immediate escalation for appetite expansion
- **Technical Blocks**: Switch to Debug mode with context
- **Knowledge Gaps**: Document gaps for future resolution

### Success Metrics

- 100% critical quality gate passage
- 95% appetite compliance without violations
- 90% pattern application from institutional memory
- 100% mandatory checklist completion
- Zero functionality compromises

## Template Usage Instructions

1. **Select Appropriate Template**: Choose based on specialist role
2. **Customize for Task**: Add task-specific items while maintaining mandatory items
3. **Track Progress**: Update status throughout implementation
4. **Verify Completion**: Ensure all items completed before handback
5. **Evidence Collection**: Gather verification evidence for each item

## Integration with Todo Lists

These templates integrate with Roo Code's todo list system to provide:
- Systematic progress tracking
- Quality gate enforcement
- Knowledge preservation automation
- Completion verification protocols
- Evidence-based handbacks

**All templates must be used as the foundation for task todo lists - no exceptions.**