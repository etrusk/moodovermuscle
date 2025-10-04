# Pattern: Terminal Cleanup Protocol

**Complexity**: Simple
**Files Affected**: 6 (rule files across all specialist roles)
**Prerequisites**: None
**Use Cases**: Applied at the end of every specialist task before handback

## Problem Statement

Development terminals (npm run dev, test watchers, build processes) are often left running after task completion, causing:
- Port conflicts for next development session
- Unnecessary CPU/memory consumption
- Confusion about which processes are active
- Technical debt from orphaned processes

## Solution

Implement mandatory terminal cleanup as part of standard workflow completion for all specialist roles.

## Implementation Steps

### 1. Check for Active Terminals

Before completing any task, check for running development processes:

```bash
# List any running Node.js-related processes
ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep
```

### 2. Graceful Termination

For any active terminals you started:

```bash
# If you have the process ID
kill $PID

# Or use Ctrl+C in the terminal where process is running
```

### 3. Force Cleanup if Needed

If processes don't respond to graceful shutdown:

```bash
# Force kill specific processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm run test:watch" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
```

### 4. Verify Clean State

Confirm all terminals are cleaned up:

```bash
# Should return nothing if clean
ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep
```

## Integration with Todo Lists

All specialist todo lists must include before handback:

```markdown
[ ] Run all quality gates
[ ] Commit all changes with clean git status
[ ] Clean up all active terminals
[ ] Hand back to Navigator for next phase coordination
```

## Role-Specific Cleanup Requirements

### Implementation Specialist
- Development servers (`npm run dev`)
- File watchers and hot reload servers
- Test runners in watch mode
- Build processes

### Investigation Specialist
- Debugging servers
- Log watchers
- Monitoring processes
- Reproduction environment processes

### Quality Specialist
- Test runners (unit, integration, e2e)
- Playwright browsers
- Lighthouse servers
- Performance monitoring tools

### Deployment Specialist
- Preview servers
- Build processes
- Deployment scripts
- Production monitoring tools

## Automated Detection Script

Create a cleanup verification script:

```bash
#!/bin/bash
# verify-terminal-cleanup.sh

ACTIVE_TERMINALS=$(ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep | wc -l)

if [ "$ACTIVE_TERMINALS" -gt 0 ]; then
  echo "⚠️ Warning: Active terminals detected:"
  ps aux | grep -E "npm|node|pnpm|yarn|next" | grep -v grep
  echo ""
  echo "Please clean up these processes before completing task."
  exit 1
else
  echo "✅ No active terminals found. Clean state confirmed."
  exit 0
fi
```

## Testing Strategy

1. **Manual Verification**: Run `ps aux` check before handback
2. **Automated Check**: Include in completion checklist
3. **Navigator Validation**: Verify during handback acceptance

## Common Pitfalls

1. **Forgetting Background Processes**: Processes started with `&` are easy to forget
2. **Multiple Terminal Windows**: Check all terminal tabs/windows
3. **Docker Containers**: Remember to stop any Docker containers started
4. **Port Locks**: Some processes may hold ports even after terminal closes

## Success Criteria

- Zero orphaned processes after task completion
- No port conflicts for next development session
- Clean resource usage (CPU/memory)
- Smooth handoffs between specialists

## Related Patterns

- [Orchestrated Task Completion Pattern](./orchestrated-task-completion-pattern.md)
- [Systematic Git Workflow Pattern](./git-workflow-systematic-pattern.md)
- [Mandatory Completion Protocol Pattern](../protocols/mandatory-completion-checklist.md)

## Enforcement

This pattern is enforced through:
1. Updated specialist role rules requiring terminal cleanup
2. Todo list templates including cleanup task
3. Navigator verification during handback
4. Documentation in `.roo/rules/04-terminal-cleanup.md`

## Benefits

- **Resource Efficiency**: No wasted CPU/memory from orphaned processes
- **Clean Development Environment**: Next session starts fresh
- **Reduced Confusion**: Clear state between tasks
- **Better Collaboration**: Clean handoffs between team members