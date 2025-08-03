# Handoffs Index

## Quick Reference

This index provides structured templates for agent-to-agent transitions within appetite-constrained workflows. Templates ensure consistent context transfer while respecting circuit breakers and scope boundaries.

## By Category

### Architecture to Code Handoffs

- `arch-to-code-new-feature.md` - _Feature design to implementation transition_
- `arch-to-code-bug-fix.md` - _Bug analysis to resolution implementation_

### Code to Debug Handoffs

- `code-to-debug-test-failures.md` - _Implementation issues to test debugging_
- `code-to-debug-runtime-errors.md` - _Production issues to error investigation_

### Cross-Domain Handoffs

- _Coming soon: Ask to Architect, Debug to Code, etc._

## Usage Guide

### For Orchestrator Mode

1. Select appropriate handoff template based on transition type
2. Populate with appetite constraints and circuit breakers
3. Include relevant context from .docs/ structure
4. Specify 70/30 decision boundaries for receiving agent

### For Receiving Agents

- Templates provide complete context for immediate productive work
- Circuit breaker conditions are pre-defined for scope protection
- Success criteria are measurable and appetite-aligned
- Escalation triggers ensure proper Navigator involvement

### Template Structure

Each handoff template includes:

- **Context Section**: Current state, appetite boundaries, constraints
- **Requirements Section**: Specific deliverables within scope
- **Success Criteria**: Measurable outcomes and quality gates
- **Escalation Triggers**: When to involve human Navigator

### Best Practices

- Always reference relevant .docs/memory/ patterns
- Include appetite timeline and resource constraints
- Specify documentation update requirements
- Define clear completion criteria for attempt_completion
