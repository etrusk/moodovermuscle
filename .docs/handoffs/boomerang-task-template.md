# Boomerang Task Handoff Template

For subtasks that need to return structured findings to orchestrator for decision-making rather than direct implementation.

## Task Definition

**Type**: Boomerang Investigation
**Purpose**: [Specific information gathering goal]
**Complexity**: [Usually 1-3 for investigation tasks]
**Return Requirement**: Structured findings for orchestrator decision

## Investigation Scope

### What to Investigate

- [ ] Option A: [First approach/solution to evaluate]
- [ ] Option B: [Second approach/solution to evaluate]
- [ ] Option C: [Third approach if applicable]

### Information to Gather Per Option

- Technical feasibility assessment
- Complexity scoring using memory/index.md
- Risk identification and mitigation strategies
- Pattern matches from patterns/index.md
- Similar investigations from investigations/index.md
- Architectural constraints from decisions/index.md

## Required Findings Structure

```json
{
  "investigation_summary": "Brief overview of investigation",
  "options_analyzed": {
    "option_a": {
      "description": "Clear description of approach",
      "feasibility": "high|medium|low",
      "complexity_score": 1-10,
      "appetite_estimate": "complexity units required",
      "risks": ["risk_1", "risk_2"],
      "benefits": ["benefit_1", "benefit_2"],
      "pattern_matches": ["patterns/pattern-name.md"],
      "similar_work": ["memory/reference.md"]
    },
    "option_b": {
      "description": "Clear description of approach",
      "feasibility": "high|medium|low",
      "complexity_score": 1-10,
      "appetite_estimate": "complexity units required",
      "risks": ["risk_1", "risk_2"],
      "benefits": ["benefit_1", "benefit_2"],
      "pattern_matches": ["patterns/pattern-name.md"],
      "similar_work": ["memory/reference.md"]
    }
  },
  "recommendation": {
    "preferred_option": "option_a|option_b|neither|needs_more_investigation",
    "reasoning": "Clear explanation for recommendation",
    "confidence_level": "high|medium|low"
  },
  "institutional_context": {
    "similar_decisions": ["decisions/adr-xxx.md"],
    "relevant_investigations": ["investigations/issue.md"],
    "applicable_patterns": ["patterns/pattern.md"],
    "historical_complexity": "From memory/complexity-scoring.md"
  },
  "blockers_identified": [
    "List any blockers that prevent decision"
  ],
  "additional_investigation_needed": [
    "List any gaps requiring further investigation"
  ]
}
```

## Success Criteria

- [ ] All specified options investigated thoroughly
- [ ] Complexity scoring calibrated with memory/index.md
- [ ] Institutional memory checked and referenced
- [ ] Clear recommendation with supporting evidence
- [ ] Structured findings enable orchestrator decision
- [ ] No implementation attempted (investigation only)

## Common Use Cases

### Technical Feasibility Assessment

- Evaluating multiple implementation approaches
- Comparing third-party service options
- Assessing integration strategies

### Complexity Discovery

- Investigating unknown complexity before commitment
- Validating appetite estimates
- Identifying hidden dependencies

### Risk Assessment

- Security implication investigation
- Performance impact analysis
- Architectural compatibility checking

### Pattern Discovery

- Finding applicable patterns for new features
- Identifying pattern gaps
- Validating pattern applicability

## Handoff Process

### From Orchestrator

1. Define specific investigation goals
2. List options to evaluate
3. Set complexity budget for investigation (usually 1-3 units)
4. Specify decision criteria

### Back to Orchestrator

1. Complete structured findings as specified
2. Include all institutional context discovered
3. Provide clear recommendation or flag blockers
4. Return without implementing any option

## Example Boomerang Task

```markdown
# Boomerang: Investigate Email Service Options

## Task Definition

**Purpose**: Evaluate email service options for transactional emails
**Complexity**: 2 units for investigation

## Options to Investigate

- Option A: Continue with SMTP/Nodemailer
- Option B: Migrate to Resend API
- Option C: Use Vercel Email Functions

## Findings Returned

{
"recommendation": {
"preferred_option": "option_a",
"reasoning": "Existing SMTP setup working well, migration complexity not justified",
"confidence_level": "high"
},
"options_analyzed": {
"option_a": {
"complexity_score": 0,
"appetite_estimate": "0 (already implemented)",
"benefits": ["working solution", "zero migration cost"],
"pattern_matches": ["patterns/fire-and-forget-email-pattern.md"]
}
}
}
```

## Anti-Patterns to Avoid

❌ **Implementation Creep**: Starting to implement preferred option
❌ **Shallow Investigation**: Not checking institutional memory
❌ **Unstructured Return**: Free-form findings instead of structured data
❌ **Missing Context**: Not referencing patterns/decisions/investigations
❌ **Bias Confirmation**: Only investigating to confirm preconception
