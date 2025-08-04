# Orchestrator to Specialist: Task Delegation Handoff

## Handoff Type: Specialist Delegation

**From**: Orchestrator Mode → **To**: [Specialist Mode]  
**Context**: Complex task decomposed, specific specialist expertise required for sub-component

## Synthesized Context Package

**ORCHESTRATOR RESPONSIBILITY**: Context discovery delegated to Ask mode and synthesized for specialist

### Context Discovery Delegated and Synthesized

**Discovery Delegation Completed**:

- ✅ Ask mode analyzed `.docs/current-task.md` - Active work and session state
- ✅ Ask mode reviewed `.docs/spec.md` - Project requirements and appetite constraints
- ✅ Ask mode evaluated `.docs/architecture.md` - System design boundaries and constraints
- ✅ Ask mode confirmed `.docs/workflows.md` - Quality gates and development processes
- ✅ Ask mode identified `.docs/patterns/index.md` - Relevant patterns selected
- ✅ Ask mode reviewed `.docs/decisions/index.md` - Architectural decisions affecting task
- ✅ Ask mode analyzed `.docs/investigations/index.md` - Related investigations
- ✅ Ask mode applied `.docs/memory/index.md` - Complexity insights and lessons

**Documentation Pulse Tracking** (via Ask mode):

```
<!-- PULSE: [YYYY-MM-DD] ask - discovery for orchestrator delegation to [specialist] -->
```

### Synthesized Context for Specialist

**NO BROAD DISCOVERY REQUIRED**: All relevant context discovered by Ask mode and synthesized below

## Task Decomposition

**Overall objective**:

```
[High-level goal that this specialist work contributes to]
```

**Specialist-specific sub-task**:

```
[Specific deliverable expected from this specialist mode]
```

**Task boundaries and scope**:

- **In scope**: [What this specialist should handle]
- **Out of scope**: [What remains with orchestrator or other specialists]
- **Interface points**: [How this work connects to other components]

## Specialist Selection Rationale

**Why this specialist mode was chosen**:

```
[Justification for mode selection - specific expertise needed]
```

**Alternative specialists considered**:

- Option A: [Mode] - [Why not selected]
- Option B: [Mode] - [Why not selected]
- ✅ Selected: [Mode] - [Why this is optimal]

**Specialist expertise required**:

- Primary skill: [Core competency needed]
- Secondary skills: [Supporting competencies]
- Domain knowledge: [Specific domain expertise]

## Expected Deliverables

**Primary outputs required**:

- [ ] Deliverable 1: [Specific output with acceptance criteria]
- [ ] Deliverable 2: [Specific output with acceptance criteria]
- [ ] Deliverable 3: [Specific output with acceptance criteria]

**Quality standards**:

- Code quality: [Standards applicable to this specialist work]
- Documentation: [Documentation requirements]
- Testing: [Test coverage and types required]
- Performance: [Performance criteria if applicable]

**Format and structure requirements**:

```
[Specific format requirements for deliverables]
```

## Integration Points

**Dependencies this work relies on**:

- [ ] Component A: `path/to/component` - [What specialist needs from this]
- [ ] Component B: `path/to/component` - [What specialist needs from this]
- [ ] External service: [Service name] - [Integration requirements]

**Systems this work will integrate with**:

- [ ] Integration Point 1: [How specialist work connects]
- [ ] Integration Point 2: [How specialist work connects]
- [ ] Integration Point 3: [How specialist work connects]

**Handoff interfaces**:

- **Input interfaces**: [What orchestrator provides to specialist]
- **Output interfaces**: [What specialist provides back]
- **Communication protocol**: [How progress/issues are communicated]

## Context Transfer Package

**Files specialist should examine first**:

- Core context: `[path/to/primary/file]` - [Why this is important]
- Supporting context: `[path/to/related/file]` - [Additional context]
- Configuration: `[path/to/config]` - [Relevant configuration]

**Existing work to build upon**:

```
[Previous work that specialist should leverage]
```

**Known constraints and limitations**:

```
[Technical, business, or resource constraints affecting specialist work]
```

## Appetite and Complexity Management

**Allocated appetite for specialist work**:

- Total allocation: [X units]
- Primary task: [Y units]
- Integration work: [Z units]
- Buffer: [Buffer units]

**Complexity indicators**:

- **Green**: Task progressing within appetite, standard complexity
- **Yellow**: Approaching appetite boundaries, complexity higher than expected
- **Red**: Exceeding appetite, significant complexity issues

**Circuit breaker conditions**:

- Stop work if appetite exceeded by >25%
- Escalate if task complexity fundamentally different than expected
- Return to orchestrator if integration requirements change

## Success Criteria and Completion

**Definition of done**:

- [ ] All expected deliverables completed
- [ ] Integration points verified
- [ ] Quality standards met
- [ ] Documentation complete
- [ ] Testing requirements satisfied

**Acceptance criteria**:

```
[Specific criteria orchestrator will use to validate completion]
```

**Handoff back requirements**:

- [ ] Work summary document
- [ ] Integration verification report
- [ ] Any new patterns or insights discovered
- [ ] Appetite consumption report
- [ ] Recommendations for similar future work

## 70/30 Decision Routing for Specialist

**70% (Specialist Autonomous)**:

- Technical implementation within domain expertise
- Code structure and patterns within specialist area
- Testing strategies for specialist domain
- Documentation creation
- Performance optimization within scope

**30% (Escalate to Orchestrator/Human)**:

- Cross-domain integration decisions
- Business logic rules affecting multiple systems
- Resource allocation changes
- Scope modifications
- Architecture changes affecting other components

## Escalation Conditions

**Return to Orchestrator if**:

- Task scope needs modification
- Integration requirements change
- Dependencies are blocking progress
- Appetite boundaries need adjustment
- Multiple valid approaches with similar complexity

**Escalate to Human Navigator if**:

- Business decisions required within specialist domain
- Security implications discovered
- User experience impacts identified
- Cross-functional coordination needed

## Boomerang Patterns

**Likely return scenarios**:

- **High probability**: Specialist completes work, returns for integration
- **Medium probability**: Specialist discovers scope issues, needs orchestrator guidance
- **Low probability**: Specialist work reveals need for different specialist

**Expected return package**:

- Completed deliverables
- Integration documentation
- New patterns discovered
- Appetite consumption analysis
- Recommendations for future similar work

## Pattern Applications

**Applied from patterns/index.md**:

- [List orchestration patterns used for task decomposition]
- [List specialist domain patterns to be applied]

**New patterns expected**:

- [Any new patterns this specialist work might develop]

## Investigation Cross-References

**Related from investigations/index.md**:

- [Reference investigations relevant to specialist task]

**Investigation triggers for specialist**:

- [Conditions under which specialist should create new investigations]

## Communication Protocol

**Progress reporting**:

- Frequency: [How often to report progress]
- Format: [Structure for progress updates]
- Escalation triggers: [When to immediately contact orchestrator]

**Collaboration boundaries**:

- **Independent work**: [What specialist can do autonomously]
- **Consultation required**: [When to check with orchestrator]
- **Approval needed**: [Decisions requiring orchestrator approval]

## Session Continuity

**Current state**: Task decomposed, specialist expertise identified, context packaged
**Handoff artifacts**: [List all context being transferred to specialist]
**Resume conditions**: Specialist work complete with deliverables ready for integration

---

_Handoff Date_: [Auto-generated]  
_Specialist Mode_: [Target specialist mode]  
_Complexity Estimate_: [X units allocated]  
_Expected Integration Points_: [Number of integration touchpoints]
