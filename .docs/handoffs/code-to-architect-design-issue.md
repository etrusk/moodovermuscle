# Code to Architect: Design Issue Handoff

## Handoff Type: Design Problem Escalation

**From**: Code Mode → **To**: Architect Mode  
**Context**: Implementation work has revealed architectural problems that require design-level solutions

## Mandatory Index Discovery

**CRITICAL**: Architect must execute this discovery protocol immediately:

### Required Index Reads

- **MANDATORY**: Read `.docs/patterns/index.md` - check for architectural patterns related to the design issue
- **MANDATORY**: Review `.docs/investigations/index.md` - scan for similar architectural problems previously investigated
- **MANDATORY**: Check `.docs/decisions/index.md` - understand existing architectural decisions that may conflict
- **CONDITIONAL**: Review `.docs/memory/index.md` - examine complexity lessons from similar architectural changes

### Discovery Documentation

- [ ] Architectural patterns reviewed for applicability
- [ ] Previous investigations consulted for similar issues
- [ ] Existing decisions evaluated for conflicts
- [ ] Memory insights applied to complexity assessment

## Implementation Discoveries

**What was discovered during implementation**:

```
[Details of what implementation work revealed about design problems]
```

**Specific files/components affected**:

- [ ] File 1: `path/to/file` - [nature of problem]
- [ ] File 2: `path/to/file` - [nature of problem]

## Architectural Conflicts Identified

**Current architecture assumptions that are proving incorrect**:

```
[List specific architectural assumptions that implementation contradicts]
```

**Technical debt or design limitations exposed**:

```
[Specific technical debt or design limitations discovered]
```

**Integration points that are problematic**:

```
[Systems/components that don't integrate as designed]
```

## Proposed Design Changes

**Initial thoughts on potential solutions** (from implementation perspective):

```
[Code implementer's suggestions for architectural changes]
```

**Alternative approaches considered**:

1. Option A: [Brief description]
2. Option B: [Brief description]
3. Option C: [Brief description]

## Complexity Impact Assessment

**Appetite boundaries affected**:

- Current appetite: [X units]
- Estimated additional complexity: [Y units]
- New total estimate: [X+Y units]

**Circuit breakers that may need adjustment**:

```
[Which scope boundaries might need to change]
```

**70/30 Decision Requirements**:

- **30% (Human) Decisions Needed**: [List architectural decisions requiring human input]
- **70% (Agent) Work Remaining**: [List implementation work that can proceed autonomously]

## Context Transfer Package

**Files requiring architectural review**:

- Primary: `[path/to/main/file]` - [core issue location]
- Supporting: `[path/to/related/file]` - [related concerns]
- Documentation: `[path/to/docs]` - [relevant specs/docs]

**Code segments highlighting the issue**:

```typescript
// Example of problematic code that reveals design issue
[actual code snippet]
```

**Current implementation state**:

- [ ] Working but architecturally problematic
- [ ] Partially implemented, blocked by design issue
- [ ] Multiple attempted approaches, all hitting same design wall

## Success Criteria for Architect

**Expected deliverables**:

- [ ] Revised architectural approach that resolves implementation conflicts
- [ ] Updated technical decisions in `.docs/decisions/`
- [ ] Clear implementation roadmap within revised appetite
- [ ] Pattern documentation for similar future scenarios

**Handoff back conditions**:

- Architectural solution provides clear implementation path
- Design changes documented with rationale
- Implementation appetite recalibrated
- No remaining architectural ambiguities

## Escalation Conditions

**Escalate to Human Navigator if**:

- Design changes require business logic decisions
- Architecture changes affect user experience significantly
- Multiple architectural approaches have similar complexity
- Design solution exceeds appetite tolerance by >50%

## Boomerang Possibility

**High** - Architecture work will return to Code mode for implementation of revised design

**Expected Return Package**:

- Revised architectural specifications
- Updated implementation roadmap
- Pattern applications for new design
- Appetite-adjusted scope boundaries

## Pattern Applications

**Applied from patterns/index.md**:

- [List any patterns applied during discovery]

**New patterns developed**:

- [Any new approaches developed that could become patterns]

## Investigation Cross-References

**Related from investigations/index.md**:

- [Reference any similar architectural investigations]

**New investigation needed**:

- [Any aspects requiring further investigation]

## Session Continuity

**Current state**: Implementation work suspended due to architectural roadblock
**Preservation needs**: [What work/context must be preserved during architectural revision]
**Resume conditions**: Clear architectural direction provided with implementation path

---

_Handoff Date_: [Auto-generated]  
_Complexity Estimate_: [X units → Y units]  
_Priority_: [Critical/High/Medium] - Design blockers are typically high priority
