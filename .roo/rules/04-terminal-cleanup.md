# Terminal Cleanup Protocol

## Core Requirement

**ALL specialist roles MUST clean up active terminals as part of their mandatory completion protocol.**

## Terminal Management Requirements

### Mandatory Terminal Cleanup

Before executing handback protocol, ALL specialists must:

1. **Identify Active Terminals**: Check for any running processes started during the task
2. **Graceful Termination**: Allow processes to shut down cleanly where possible
3. **Force Termination**: Kill any hanging processes that don't respond to graceful shutdown
4. **Verify Cleanup**: Confirm no orphaned terminals remain active

### Terminal Cleanup Commands

```bash
# List active terminal processes (if needed)
ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep

# Graceful shutdown for common processes
# If you started dev server: Ctrl+C or kill with SIGTERM
# If you started test watchers: Ctrl+C or kill with SIGTERM

# Force kill specific processes if needed
# pkill -f "npm run dev"
# pkill -f "npm run test:watch"
# pkill -f "next dev"

# Verify all terminals cleaned up
# Should show no active development processes
ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep
```

## Integration with Completion Protocol

### Updated Completion Checklist

ALL specialist roles must update their completion protocols to include:

```markdown
## Mandatory Completion Checklist

1. **Quality Gates**: All critical gates passed
2. **Git Operations**: All changes committed with clean status
3. **Knowledge Capture**: Patterns and insights documented
4. **Terminal Cleanup**: All active terminals terminated ← NEW
5. **Handback Task**: Navigate back to Navigator mode
```

### Terminal Cleanup in Todo Lists

All specialist todo lists MUST include before handback:

```
[ ] Run all quality gates
[ ] Commit all changes with clean git status
[ ] Clean up all active terminals
[ ] Hand back to Navigator for next phase coordination
```

## Implementation by Role

### Implementation Specialist
- Clean up any `npm run dev` or build processes
- Terminate any file watchers or hot reload servers
- Kill any test runners in watch mode

### Investigation Specialist
- Terminate any debugging servers or log watchers
- Clean up any monitoring processes started for investigation
- Kill any reproduction environment processes

### Quality Specialist
- Clean up all test runners (unit, integration, e2e)
- Terminate any Playwright or Lighthouse servers
- Kill any performance monitoring processes

### Deployment Specialist
- Clean up any preview servers
- Terminate any build or deployment processes
- Kill any production monitoring tools

## Automatic Detection and Cleanup

### Terminal State Tracking

Specialists should track terminals they start:

```bash
# Before starting a new terminal process, note it
echo "Starting npm run dev..."
npm run dev &
DEV_PID=$!

# At cleanup time
if [ -n "$DEV_PID" ]; then
  kill $DEV_PID 2>/dev/null || true
fi
```

### Cleanup Verification

Before handback, verify cleanup:

```bash
# Check for common development processes
ACTIVE_TERMINALS=$(ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep | wc -l)

if [ "$ACTIVE_TERMINALS" -gt 0 ]; then
  echo "⚠️ Warning: Active terminals detected. Cleaning up..."
  # Perform cleanup
else
  echo "✅ No active terminals found. Clean state confirmed."
fi
```

## Anti-Patterns to Avoid

❌ **Leaving dev servers running** - Wastes resources and causes port conflicts
❌ **Orphaned test watchers** - Continue consuming CPU in background
❌ **Forgotten build processes** - Can interfere with future builds
❌ **Abandoned debugging sessions** - Leave ports open and processes hanging
❌ **Skipping cleanup for speed** - Creates technical debt and confusion

## Success Metrics

- **100% terminal cleanup rate** - No orphaned processes after task completion
- **Zero port conflicts** - Clean ports for next development session
- **Resource efficiency** - No unnecessary CPU/memory consumption
- **Clean handoffs** - Next specialist starts with clean slate

## Enforcement

### Handback Validation

Navigator mode should verify terminal cleanup:

1. Check for active development processes
2. Reject handback if terminals remain active
3. Document violations in `.docs/debt.md`
4. Require cleanup before accepting handback

### Continuous Improvement

- Track terminal cleanup violations
- Identify patterns of missed cleanups
- Update role-specific guidance as needed
- Share best practices across specialists

## Quick Reference

**Before Handback Checklist**:
- [ ] All development servers stopped
- [ ] All test watchers terminated
- [ ] All build processes completed/killed
- [ ] All debugging sessions closed
- [ ] Terminal cleanup verified with `ps aux` check
- [ ] Clean state confirmed

This protocol ensures clean workspace transitions and prevents resource waste from orphaned processes.