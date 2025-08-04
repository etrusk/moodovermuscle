# Performance Investigation: Bottleneck Analysis Handoff

## Handoff Type: Performance Investigation

**From**: [Any Mode] → **To**: Debug Mode (Performance Specialist)  
**Context**: Performance degradation identified, specialized investigation required to identify and resolve bottlenecks

## Mandatory Index Discovery

**CRITICAL**: Debug agent must execute this discovery protocol immediately:

### Required Index Reads

- **MANDATORY**: Read `.docs/patterns/index.md` - search for performance optimization patterns
- **MANDATORY**: Check `.docs/investigations/index.md` - review previous performance investigations
- **MANDATORY**: Review `.docs/decisions/index.md` - understand performance-related architectural decisions
- **CONDITIONAL**: Check `.docs/memory/index.md` - apply lessons from similar performance work

### Discovery Documentation

- [ ] Performance patterns reviewed for applicable optimization approaches
- [ ] Previous investigations consulted for similar bottleneck types
- [ ] Architectural decisions evaluated for performance constraints
- [ ] Performance optimization complexity calibrated from memory

## Performance Baseline

**Current performance metrics**:

- Page load time: [current] vs [target] ms
- API response time: [current] vs [target] ms
- Database query time: [current] vs [target] ms
- Memory usage: [current] vs [target] MB
- CPU utilization: [current] vs [target] %

**Historical performance data**:

```
[Performance trends over time - when did degradation start?]
```

**User-reported symptoms**:

- [ ] Slow page loads
- [ ] Unresponsive interface
- [ ] Timeout errors
- [ ] High resource usage
- [ ] Other: [specify]

**Affected user workflows**:

- Primary workflow: [Most impacted user journey]
- Secondary workflows: [Other affected areas]
- Peak usage times: [When performance is worst]

## Bottleneck Hypotheses

**Primary hypothesis**:

```
[Most likely cause of performance degradation based on initial analysis]
```

**Supporting evidence**:

- Metrics: [Specific metrics supporting this hypothesis]
- User reports: [User feedback patterns]
- System observations: [Observed system behavior]

**Alternative hypotheses**:

1. **Database bottleneck**: [Evidence for/against]
2. **Network latency**: [Evidence for/against]
3. **Memory leaks**: [Evidence for/against]
4. **Inefficient algorithms**: [Evidence for/against]
5. **Resource contention**: [Evidence for/against]
6. **Third-party services**: [Evidence for/against]

## Profiling Strategy

**Performance measurement approach**:

- [ ] **Browser profiling**: DevTools performance analysis
- [ ] **Network analysis**: Request/response timing
- [ ] **Database profiling**: Query execution analysis
- [ ] **Server profiling**: CPU/memory usage analysis
- [ ] **APM tools**: Application performance monitoring
- [ ] **Synthetic testing**: Automated performance testing

**Specific profiling targets**:

- [ ] Critical path: `[path/to/critical/code]` - [Why this is important]
- [ ] Suspected bottleneck: `[path/to/suspect/code]` - [Hypothesis to test]
- [ ] Integration point: `[path/to/integration]` - [Performance impact]

**Profiling tools and setup**:

```
[Specific tools to use and how to configure them]
```

## Optimization Targets

**Performance goals**:

- **Primary target**: [Most important metric to improve]
  - Current: [X units]
  - Target: [Y units]
  - Success criteria: [How to measure success]

- **Secondary targets**: [Additional metrics to improve]
  - Load time: [Current] → [Target]
  - Response time: [Current] → [Target]
  - Resource usage: [Current] → [Target]

**Optimization priorities**:

1. **Critical**: [Must-fix performance issues]
2. **Important**: [Should-fix performance issues]
3. **Nice-to-have**: [Could-fix performance issues]

**Acceptable trade-offs**:

```
[What trade-offs are acceptable to achieve performance goals]
```

## Investigation Scope and Appetite

**Investigation appetite allocation**:

- Profiling and analysis: [X units]
- Bottleneck identification: [Y units]
- Solution prototyping: [Z units]
- **Total investigation budget**: [X+Y+Z units]

**Investigation boundaries**:

- **In scope**: [What aspects to investigate]
- **Out of scope**: [What to exclude from investigation]
- **Circuit breakers**: [When to stop investigation and escalate]

**Success criteria for investigation**:

- [ ] Root cause identified with high confidence
- [ ] Performance impact quantified
- [ ] Optimization approach validated
- [ ] Implementation complexity estimated
- [ ] Risk assessment completed

## Context Transfer Package

**Performance evidence**:

- Metrics snapshots: `[path/to/metrics]`
- Performance profiles: `[path/to/profiles]`
- User feedback: `[path/to/feedback]`
- System logs: `[path/to/logs]`

**Code areas for investigation**:

- Primary suspects: `[path/to/code]` - [Performance hypothesis]
- Integration points: `[path/to/integrations]` - [Network/service delays]
- Database queries: `[path/to/queries]` - [Query optimization opportunities]

**Environmental factors**:

```
[Server configuration, network conditions, data volumes that might affect performance]
```

## Investigation Methodology

**Systematic investigation approach**:

1. **Baseline measurement**: Establish current performance metrics
2. **Hypothesis testing**: Test each bottleneck hypothesis systematically
3. **Profiling execution**: Run targeted profiling on suspected areas
4. **Data analysis**: Analyze profiling results to identify patterns
5. **Solution prototyping**: Test optimization approaches
6. **Impact validation**: Measure performance improvement

**Investigation checkpoints**:

- [ ] Checkpoint 1 (25% appetite): Baseline established, primary hypothesis tested
- [ ] Checkpoint 2 (50% appetite): Bottleneck identified, solution approach selected
- [ ] Checkpoint 3 (75% appetite): Solution prototyped, improvement validated
- [ ] Final checkpoint (100% appetite): Investigation complete, handoff ready

## Expected Deliverables

**Investigation outputs required**:

- [ ] **Root cause analysis**: Detailed explanation of performance bottleneck
- [ ] **Performance impact quantification**: Before/after metrics
- [ ] **Optimization roadmap**: Step-by-step improvement plan
- [ ] **Risk assessment**: Potential impacts of optimization changes
- [ ] **Implementation complexity estimate**: Appetite required for fixes

**Handoff package format**:

```
[Structure for investigation results handoff]
```

## Escalation and Decision Points

**Escalate to Human Navigator if**:

- Performance targets are unachievable within current architecture
- Optimization requires significant business logic changes
- Multiple optimization approaches have similar complexity/benefit
- Performance investigation reveals security implications

**Return to Orchestrator if**:

- Investigation reveals need for architectural changes
- Performance optimization requires cross-system coordination
- Multiple specialist modes needed for comprehensive solution

**Circuit breaker conditions**:

- Investigation appetite exceeded by >25%
- Root cause remains unclear after systematic investigation
- Optimization solutions exceed performance improvement appetite

## 70/30 Decision Routing

**70% (Autonomous Investigation)**:

- Performance profiling and measurement
- Code-level optimization identification
- Algorithm efficiency analysis
- Database query optimization
- Caching strategy evaluation
- Resource usage optimization

**30% (Escalate to Human)**:

- Performance vs. functionality trade-offs
- User experience impact of optimizations
- Infrastructure investment decisions
- Third-party service performance negotiations
- Performance SLA modifications

## Pattern Applications

**Applied from patterns/index.md**:

- [List performance investigation patterns to be used]
- [List optimization patterns relevant to suspected bottlenecks]

**New patterns expected**:

- [Any new performance investigation or optimization patterns this work might develop]

## Investigation Cross-References

**Related from investigations/index.md**:

- [Reference similar performance investigations]

**New investigation contribution**:

- [Insights this investigation will contribute to institutional knowledge]

## Success Metrics

**Investigation success indicators**:

- Root cause identified with >90% confidence
- Performance improvement path validated through prototyping
- Implementation complexity accurately estimated
- Risk factors identified and assessed

**Optimization success indicators**:

- Target performance metrics achieved
- No regression in other performance areas
- User experience improved measurably
- System stability maintained

## Session Continuity

**Current state**: Performance degradation identified, investigation parameters defined, profiling strategy ready
**Handoff artifacts**: [List all performance evidence and context being transferred]
**Resume conditions**: Investigation complete with optimization roadmap and implementation plan

---

_Handoff Date_: [Auto-generated]  
_Performance Target_: [Primary metric improvement goal]  
_Investigation Complexity_: [X units allocated]  
_Critical Path Impact_: [High/Medium/Low]
