# Todo List Handback Protocol

## Mandatory Handback Enforcement

**ABSOLUTE REQUIREMENT**: ALL todo lists passed to specialist roles MUST end with explicit handback task to Navigator. Zero exceptions allowed.

## Core Protocol Rules

**MANDATORY FINAL TASK**: Every todo list delegated to specialists MUST include as the final item:

```
[ ] Hand back to Navigator for next phase coordination
```

**FORBIDDEN PATTERNS**:

- ❌ Missing handback tasks in todo lists
- ❌ Implicit handback assumptions
- ❌ Direct specialist-to-specialist transitions
- ❌ Self-completion without Navigator coordination
- ❌ Vague handback language ("complete task" instead of explicit handback)

**PRE-TRANSITION VALIDATION**: Before any role transitions, Navigator MUST verify:

- [ ] All todo list items completed (marked with [x])
- [ ] Explicit handback task present and completed
- [ ] Quality gates passed with evidence
- [ ] Knowledge capture documented
- [ ] Git operations completed with conventional commits

## Specialist Role Compliance

**AUTOMATIC HANDBACK PROTOCOL**: When any specialist completes their final todo item "Hand back to Navigator for next phase coordination", they MUST automatically switch to Navigator mode using the switch_mode tool.

**IMPLEMENTATION SPECIALIST**:

- MUST complete all roadmap items within appetite
- MUST execute quality gates (lint, type-check, test:critical, security:scan, build:verify)
- MUST apply institutional memory patterns
- MUST document pattern applications and new patterns
- MUST complete: "[ ] Hand back to Navigator for next phase coordination"
- **AUTO-TRANSITION**: Upon marking handback complete, immediately execute `switch_mode` to Navigator

**INVESTIGATION SPECIALIST**:

- MUST complete root cause analysis and solution implementation
- MUST document investigation findings in `.docs/investigations/`
- MUST execute quality gates with verification
- MUST update institutional memory with debugging insights
- MUST complete: "[ ] Hand back to Navigator for next phase coordination"
- **AUTO-TRANSITION**: Upon marking handback complete, immediately execute `switch_mode` to Navigator

**QUALITY SPECIALIST**:

- MUST complete testing strategy and coverage assessment
- MUST execute full quality gate suite
- MUST document quality metrics and improvements
- MUST update testing patterns in institutional memory
- MUST complete: "[ ] Hand back to Navigator for next phase coordination"
- **AUTO-TRANSITION**: Upon marking handback complete, immediately execute `switch_mode` to Navigator

**DEPLOYMENT SPECIALIST**:

- MUST complete deployment verification and client approval workflows
- MUST document deployment procedures and lessons learned
- MUST execute post-deployment quality verification
- MUST update deployment patterns in institutional memory
- MUST complete: "[ ] Hand back to Navigator for next phase coordination"
- **AUTO-TRANSITION**: Upon marking handback complete, immediately execute `switch_mode` to Navigator

## Navigator Enforcement Responsibilities

**TODO LIST VALIDATION**: Before delegating any work:

- [ ] Verify final handback task is present in todo list
- [ ] Confirm all required quality gates specified
- [ ] Validate appetite constraints are clear
- [ ] Ensure institutional memory references included

**HANDBACK VERIFICATION**: When receiving completed work:

- [ ] Verify explicit handback task completed
- [ ] Validate all quality gates passed with evidence
- [ ] Confirm knowledge capture completed
- [ ] Review git operations for conventional commit compliance

**VIOLATION RESPONSE**: If handback protocol violated:

- **IMMEDIATE**: Reject completion and require protocol compliance
- **DOCUMENT**: Record violation in `.docs/debt.md` for pattern improvement
- **EDUCATE**: Reinforce protocol requirements with specialist
- **PREVENT**: Update todo list templates to prevent future violations

## Quality Gate Integration

**MANDATORY VERIFICATION**: All handbacks must include evidence of:

```bash
npm run lint              # Exit code 0 required
npm run type-check        # Exit code 0 required
npm run test:critical     # Status documented
npm run security:scan     # No vulnerabilities
npm run build:verify      # Successful build
```

**GIT COMPLIANCE**: All handbacks must show:

- Conventional commit messages with pattern/investigation references
- All changes properly staged and committed
- No uncommitted work remaining

## Institutional Memory Integration

**PATTERN APPLICATION**: All handbacks must document:

- Which patterns from `.docs/patterns/index.md` were applied
- New reusable patterns developed during work
- Pattern gaps identified for future development

**KNOWLEDGE PRESERVATION**: All handbacks must update:

- Investigation findings in `.docs/investigations/` if debugging occurred
- Decision context in `.docs/decisions/` if architectural choices made
- Memory insights in `.docs/memory/` for appetite accuracy and complexity lessons

## Escalation Protocol

**SCOPE EXPANSION**: If appetite boundaries approached during work:

- Specialist MUST escalate to Navigator before violating circuit breakers
- Navigator evaluates appetite expansion vs scope reduction
- No unauthorized scope changes allowed

**QUALITY GATE FAILURES**: If critical quality gates cannot pass:

- Specialist escalates with specific failure details
- Navigator determines if appetite expansion needed for fixes
- No quality compromises allowed to fit appetite

**HANDBACK VIOLATIONS**: If specialist attempts completion without proper handback:

- Navigator immediately rejects completion
- Required protocol compliance before work accepted
- Documentation of violation for process improvement

## Success Metrics

- **100% Handback Compliance**: Zero todo lists without explicit handback tasks
- **100% Quality Gate Passage**: All handbacks include quality verification evidence
- **100% Knowledge Capture**: All patterns applied and new patterns documented
- **Zero Direct Transitions**: All specialist work flows through Navigator coordination
- **95% Appetite Compliance**: Handback protocol maintains scope discipline

## Automatic Handback Execution

**MANDATORY AUTOMATIC TRANSITION**: When specialists complete their work:

1. **Final Todo Completion**: When marking "[x] Hand back to Navigator for next phase coordination"
2. **Automatic Mode Switch**: Immediately execute switch_mode to Navigator
3. **No Manual Steps**: Transition happens automatically without user intervention

**Implementation Example**:

```markdown
## Todo List Completion

- [x] Complete implementation within appetite
- [x] Execute quality gates
- [x] Document patterns
- [x] Hand back to Navigator for next phase coordination

_Automatic action: Switching to Navigator mode..._
```

## Protocol Validation Checklist

Before any todo list delegation:

- [ ] Final task is: "[ ] Hand back to Navigator for next phase coordination"
- [ ] Quality gates specified in todo list
- [ ] Appetite constraints clearly defined
- [ ] Institutional memory references included
- [ ] Circuit breakers established

After any specialist handback:

- [ ] Explicit handback task marked complete [x]
- [ ] Quality gate evidence provided
- [ ] Knowledge capture documented
- [ ] Git operations completed properly
- [ ] Automatic switch to Navigator mode executed
- [ ] Ready for next phase coordination

**This protocol is mandatory - no exceptions, no workarounds, no compromises.**
**Automatic handback is enforced - specialists MUST switch_mode upon handback completion.**
