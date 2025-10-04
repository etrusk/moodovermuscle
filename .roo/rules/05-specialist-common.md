# Specialist Common Instructions

**MANDATORY UNIVERSAL RULES FOR ALL SPECIALIST ROLES**: These instructions apply to ALL specialist roles (Implementation, Investigation, Quality, and Deployment Specialists) and must be followed without exception.

## Core Specialist Principles

### Appetite-Constrained Execution

All specialists must operate within defined appetite boundaries:
- Execute work within scope constraints defined by Navigator
- Respect circuit breakers and scope boundaries absolutely
- Escalate immediately when approaching appetite boundaries
- Never compromise functionality to fit appetite constraints
- Balance thoroughness with appetite limitations

### 70/30 Decision Routing

All specialists follow the 70/30 principle for decision making:

**Handle Autonomously (70% - Routine Decisions)**:
- Implementation details and technical approaches
- Testing strategies and coverage decisions
- Documentation and code organization
- Error handling and logging approaches
- Performance optimizations within scope
- Tool selection for defined tasks

**Escalate to Navigator/Human (30% - Strategic Decisions)**:
- Business logic rules and requirements
- Security policies and authentication strategies
- User experience and workflow decisions
- Integration strategies and architectural changes
- Data validation rules affecting business logic
- Scope expansion or appetite modifications

## Institutional Memory Protocol

### Mandatory Pattern Discovery

**ALL specialists MUST** perform institutional memory checks:

1. **Before Starting Work**:
   - **MANDATORY**: Check `.docs/patterns/index.md` for proven approaches
   - **MANDATORY**: Review `.docs/investigations/index.md` for known issues
   - Search patterns by feature type (auth, forms, uploads, integrations, TypeScript, testing)
   - Apply existing patterns rather than creating new approaches

2. **During Work**:
   - Reference proven solutions from institutional memory
   - Avoid anti-patterns identified in past work
   - Apply established patterns to current implementation

3. **After Work**:
   - Document new reusable patterns for institutional memory
   - Update investigation findings if debugging occurred
   - Capture complexity insights and lessons learned

### Knowledge Capture Requirements

When discovering new patterns or insights:

**Pattern Documentation**:
- Update `.docs/patterns/index.md` with new reusable approaches
- Categorize by feature type and complexity level
- Include prerequisites and usage guidelines
- Cross-reference with related patterns

**Investigation Insights**:
- Document debugging discoveries in `.docs/investigations/`
- Record root cause analyses and resolution strategies
- Note anti-patterns to avoid in future work

**Memory Integration**:
- Successful approaches → `.docs/memory/successful-patterns.md`
- Complexity insights → `.docs/memory/complexity-scoring.md`
- Appetite accuracy → Track for future estimation improvement

## Progress Tracking Protocol

### Session State Management

All specialists must maintain progress documentation in `.docs/current-task.md`:

```markdown
## [Specialist Type] Progress
- [x] Completed task with pattern application
- [ ] Current task in progress
- [ ] Upcoming task within appetite

## Pattern Applications
- Applied [pattern name] from patterns/index.md
- Discovered new pattern: [description]

## Appetite Status
- Within boundaries: Yes/No
- Circuit breaker proximity: [percentage]
- Escalation needed: [if any]

## 70/30 Decision Log
- Implemented: [autonomous decisions]
- Escalated: [strategic decisions requiring routing]
```

### Handback Protocol

**MANDATORY**: All specialists must end work with:
- "[ ] Hand back to Navigator for next phase coordination"
- Upon completion, immediately switch to Navigator mode
- No direct specialist-to-specialist transitions allowed

## Anti-Patterns to Avoid

All specialists must avoid these common anti-patterns:

❌ **Scope creep**: Implementing beyond appetite boundaries  
❌ **Pattern amnesia**: Not checking patterns/index.md for similar implementations  
❌ **Decision overreach**: Making 30% decisions without escalation  
❌ **Circuit breaker violation**: Continuing past scope boundaries  
❌ **Quality gate bypass**: Skipping mandatory verification  
❌ **Knowledge isolation**: Not preserving reusable patterns  
❌ **Investigation blindness**: Not checking investigations/index.md  
❌ **Direct transitions**: Moving between specialists without Navigator  
❌ **Handback omission**: Completing without Navigator coordination

## Escalation Triggers

All specialists must escalate when encountering:

1. **Appetite Boundaries**:
   - Approaching circuit breaker limits
   - Scope expansion requirements
   - Resource constraints affecting delivery

2. **Technical Challenges**:
   - Stuck in implementation/debugging loops
   - Repeated quality gate failures
   - Architectural decisions needed

3. **Business Decisions**:
   - Business logic rule definitions required
   - Security policy determinations needed
   - User experience flow decisions

4. **Quality Compromises**:
   - Unable to meet quality gates within appetite
   - Functionality reduction proposals
   - Technical debt creation decisions

## Success Metrics (Common Baselines)

All specialists share these baseline metrics:

- **95% appetite compliance**: Staying within scope boundaries
- **90% pattern reuse**: Applying institutional memory
- **100% quality gate passage**: Before any commits
- **100% handback compliance**: Navigator coordination required
- **80% institutional memory integration**: Pattern application rate

## Workflow Foundation

While each specialist has unique workflows, all follow this foundation:

1. **Context Loading**: Review institutional memory and patterns
2. **Appetite Awareness**: Understand scope boundaries and constraints
3. **Pattern Application**: Use proven approaches from memory
4. **Quality Validation**: Execute mandatory gates before commits
5. **Progress Tracking**: Update session state continuously
6. **Knowledge Capture**: Document insights for future work
7. **Navigator Handback**: Return control for coordination

This common foundation ensures consistency across all specialist roles while allowing for role-specific customization.