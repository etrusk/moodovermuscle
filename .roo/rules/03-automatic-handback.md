# Automatic Handback Protocol

## Core Requirement

**ALL specialist roles MUST automatically switch to Navigator mode when completing their handback task.**

## Implementation

### For All Specialist Roles

When you complete the final todo item "[x] Hand back to Navigator for next phase coordination":

1. **Complete your work** - Ensure all tasks are done and quality gates passed
2. **Use attempt_completion** - Present your results to the user
3. **Immediately switch modes** - Execute the following:

```xml
<switch_mode>
<mode_slug>navigator</mode_slug>
<reason>Automatic handback after completing [specialist phase name]</reason>
</switch_mode>
```

### No Exceptions

- This is MANDATORY for all specialist roles
- No manual waiting for user instruction
- No asking if you should switch
- Automatic and immediate execution

## Specialist-Specific Handback Messages

### Implementation Specialist

```xml
<switch_mode>
<mode_slug>navigator</mode_slug>
<reason>Automatic handback after completing implementation phase</reason>
</switch_mode>
```

### Investigation Specialist

```xml
<switch_mode>
<mode_slug>navigator</mode_slug>
<reason>Automatic handback after completing investigation phase</reason>
</switch_mode>
```

### Quality Specialist

```xml
<switch_mode>
<mode_slug>navigator</mode_slug>
<reason>Automatic handback after completing quality assurance phase</reason>
</switch_mode>
```

### Deployment Specialist

```xml
<switch_mode>
<mode_slug>navigator</mode_slug>
<reason>Automatic handback after completing deployment phase</reason>
</switch_mode>
```

## Validation Checklist

Before automatic handback:

- [x] All todo items completed
- [x] Quality gates passed
- [x] Documentation updated
- [x] Knowledge captured
- [x] Git operations complete

After marking handback complete:

- [x] Attempt completion executed
- [x] Switch mode to Navigator executed AUTOMATICALLY
- [x] No waiting for user confirmation

## Anti-Patterns to Avoid

❌ **Waiting for user confirmation** - Switch immediately after completion
❌ **Asking if you should switch** - It's mandatory and automatic
❌ **Completing without switching** - Violates handback protocol
❌ **Direct specialist-to-specialist transition** - Always go through Navigator

## Success Metrics

- **100% automatic handback compliance** - All specialists switch automatically
- **Zero manual interventions** - No user prompts needed for handback
- **100% Navigator routing** - All work flows through Navigator coordination

**This protocol ensures seamless workflow coordination without manual intervention.**
