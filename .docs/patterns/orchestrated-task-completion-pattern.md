# Pattern: Orchestrated Task Completion with Mandatory Cleanup

**Complexity**: Medium
**Files Affected**: .docs/workflows.md, .docs/patterns/index.md, mode transition protocols
**Prerequisites**: Established quality gates, institutional memory patterns
**Use Cases**: All orchestrated tasks requiring documentation, commits, and knowledge capture

## Problem Statement

Current orchestration workflow ends with Code mode implementation but requires manual prompting for essential cleanup activities (documentation updates, commits, knowledge capture, quality verification). This creates inconsistent task completion and potential knowledge loss.

## Solution Architecture

### Enhanced Orchestration Flow

```
Architect (Design) → Code (Implementation) → Architect (Mandatory Cleanup) → Complete
```

### Automatic Transition Triggers

**From Code Mode to Architect Cleanup** (Automatic):
- All implementation tasks marked complete in current-task.md
- All acceptance criteria met
- Quality gates passed (critical gates only)
- No active circuit breakers triggered

**Mandatory Cleanup Phase** (Never skipped):
- Documentation updates and synchronization
- Institutional memory capture
- Pattern documentation (if new patterns developed)
- Git operations (commit, push) with conventional commit messages
- Index maintenance (.docs/patterns/index.md, .docs/memory/index.md)
- Task completion verification

## Implementation Steps

### 1. Enhanced Workflow Protocol

**Code Mode Completion Detection**:
```markdown
## Implementation Complete Signal

When Code mode reaches task completion:
1. Mark all roadmap items as [x] completed in .docs/current-task.md
2. Verify all acceptance criteria met
3. Run critical quality gates (never bypass)
4. Document any technical debt or deferred items
5. Signal "READY_FOR_CLEANUP" in session state
```

**Automatic Architect Mode Transition**:
```markdown
## Transition Protocol

Trigger: Code mode signals "READY_FOR_CLEANUP"
Action: Automatic switch to Architect mode with cleanup context
Context: Implementation results, patterns used, new knowledge discovered
Scope: Cleanup and documentation only (no new implementation)
```

### 2. Mandatory Cleanup Checklist

**Documentation Synchronization** (Required):
- [ ] Update .docs/current-task.md with completion status
- [ ] Synchronize .docs/patterns/index.md with any new patterns
- [ ] Update .docs/memory/index.md with complexity and outcome data
- [ ] Document lessons learned in appropriate memory files

**Pattern Capture** (If applicable):
- [ ] Extract reusable patterns from implementation
- [ ] Create pattern documentation files
- [ ] Update pattern index with semantic search terms
- [ ] Cross-reference with related decisions and investigations

**Quality Verification** (Final gates):
- [ ] Execute critical quality gates one final time
- [ ] Verify all tests still passing
- [ ] Confirm no breaking changes introduced
- [ ] Validate build still succeeds

**Git Operations** (Standardized):
- [ ] Create conventional commit message(s) for all changes
- [ ] Commit implementation and documentation together
- [ ] Push to feature branch (if using branch workflow)
- [ ] Update branch status for review/merge readiness

**Knowledge Management** (Institutional memory):
- [ ] Update complexity estimation accuracy data
- [ ] Capture appetite management insights
- [ ] Document 70/30 decision routing effectiveness
- [ ] Record circuit breaker effectiveness

### 3. Standardized Cleanup Templates

**Cleanup Context Template**:
```markdown
## Architect Cleanup Phase

**Implementation Summary**: [Brief description of what was completed]
**Patterns Applied**: [List of patterns used from institutional memory]
**New Patterns Identified**: [Any new reusable patterns discovered]
**Technical Debt**: [Any deferred items or compromises made]
**Quality Status**: [Final quality gate results]
**Appetite Compliance**: [Within/exceeding appetite boundaries]

## Mandatory Cleanup Tasks
- [ ] Documentation synchronization
- [ ] Pattern extraction and indexing
- [ ] Memory capture and calibration
- [ ] Git operations with conventional commits
- [ ] Index maintenance
- [ ] Completion verification
```

**Commit Message Template**:
```bash
feat(scope): implement [feature] using [patterns] within appetite

- Applied [Pattern A] and [Pattern B] from institutional memory
- Complexity: [X] units (within [Y]-[Z] appetite boundary)
- Quality gates: all critical gates passed
- Documentation: patterns and memory updated
- Technical debt: [none/documented in .docs/debt.md]

Co-authored-by: Code Agent <code@roo>
Co-authored-by: Architect Agent <architect@roo>
```

## Testing Strategy

**Cleanup Workflow Verification**:
- All cleanup tasks must complete successfully
- Documentation must be synchronized and current
- Git operations must follow conventional commit standards
- Quality gates must pass after cleanup activities
- No knowledge should be lost between task cycles

**Circuit Breakers for Cleanup**:
- If cleanup takes >20% of original appetite, escalate to human
- If documentation updates require business decisions, escalate
- If quality gates fail after cleanup, halt and investigate
- If git operations fail, resolve before task completion

## Common Pitfalls

**Skipping Cleanup Phase**:
- Problem: Treating cleanup as optional or deferrable
- Solution: Make cleanup phase mandatory and automatic
- Prevention: Build transition triggers into mode protocols

**Inadequate Documentation**:
- Problem: Rushing through documentation updates
- Solution: Use structured templates and checklists
- Prevention: Automate documentation synchronization where possible

**Knowledge Loss**:
- Problem: Failing to capture patterns and lessons learned
- Solution: Systematic pattern extraction and memory updates
- Prevention: Mandatory institutional memory updates

**Git Operation Failures**:
- Problem: Inconsistent commit messages or failed pushes
- Solution: Standardized templates and error handling
- Prevention: Validate git operations before task completion

## Success Metrics

**Process Metrics**:
- 100% of orchestrated tasks complete cleanup phase
- 95% of cleanup phases complete within appetite boundaries
- 90% of new patterns successfully captured and indexed
- 85% improvement in institutional memory accuracy over time

**Quality Metrics**:
- Zero knowledge loss between task cycles
- Consistent conventional commit message format
- All documentation remains synchronized and current
- Pattern reuse increases over time (institutional learning)

## Related Patterns

- [Quality Gates Pattern](./quality-gate-comprehensive-pattern.md) - Integration with cleanup verification
- [Institutional Memory Pattern](../memory/index.md) - Knowledge capture protocols
- [Function Decomposition Pattern](./api-function-decomposition-pattern.md) - Pattern extraction example
- [UI Component Decomposition Pattern](./ui-component-decomposition-pattern.md) - Reusable pattern development

## Pattern Evolution

**Version 1.0** (Current): Manual cleanup prompting
**Version 2.0** (This pattern): Automatic Architect cleanup phase
**Future Enhancement**: Predictive pattern identification and automated documentation generation

---

**Pattern Status**: Ready for implementation
**Complexity Estimate**: 6-8 units to implement orchestration changes
**Risk Level**: Low - enhances existing proven patterns
**Business Impact**: High - prevents knowledge loss and ensures consistent task completion