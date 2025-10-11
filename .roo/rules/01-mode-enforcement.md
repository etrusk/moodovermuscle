# CRITICAL: Mode System Enforcement

## Project-Specific Custom Modes

This project uses **4 custom modes** that are DIFFERENT from Roo's default modes.

### Available Modes (ONLY THESE)

1. **navigator** - Entry point, task routing (read + browser only)
2. **test** - Test-driven development (read + edit + command)
3. **implementation** - Code implementation (read + edit + command)
4. **investigation** - Debugging and troubleshooting (read + edit + command + browser)

### Forbidden Modes (DO NOT USE)

These default Roo mode slugs are NOT configured for this project:

- ❌ `code` - Does not exist, use `implementation` instead
- ❌ `debug` - Does not exist, use `investigation` instead
- ❌ `architect` - Does not exist, use `navigator` instead
- ❌ `orchestrator` - Does not exist, use `navigator` instead
- ❌ `ask` - Does not exist, use `navigator` instead

## Delegation Rules for Navigator Mode

When Navigator mode uses the `new_task` tool, it MUST specify one of these mode names:

### ✅ Correct Delegation Syntax
```typescript
// New feature requiring tests
new_task({
  task: "Create tests for user authentication feature",
  mode: "test"  // ✅ Correct
})

// Implementation with existing tests
new_task({
  task: "Implement user authentication passing all tests",
  mode: "implementation"  // ✅ Correct
})

// Debugging or troubleshooting
new_task({
  task: "Debug failing authentication test",
  mode: "investigation"  // ✅ Correct
})
```

### ❌ Wrong Delegation Syntax
```typescript
// These will FAIL because modes don't exist:
new_task({ mode: "code" })        // ❌ Use "implementation"
new_task({ mode: "debug" })       // ❌ Use "investigation"
new_task({ mode: "architect" })   // ❌ Use "navigator"
new_task({ mode: "orchestrator" }) // ❌ Use "navigator"
new_task({ mode: "ask" })         // ❌ Use "navigator"
```

## Mode Mapping Reference

| Roo Default Mode | This Project's Mode | Purpose |
|------------------|---------------------|---------|
| `code` | `implementation` | Writing code after tests exist |
| `debug` | `investigation` | Debugging, troubleshooting, root cause analysis |
| `architect` | `navigator` | Planning, routing, task delegation |
| `orchestrator` | `navigator` | Entry point for all tasks |
| `ask` | `navigator` | Answering questions, simple queries |

## Why Custom Mode Names?

**Display Compatibility**: The custom mode slugs (`navigator`, `test`, `implementation`, `investigation`) are used to ensure proper display in the Roo UI. These map to specific tool groups and behaviors defined in `.roomodes`.

**NOT Roo Defaults**: These are project-specific custom modes, not Roo's built-in modes. Always use the exact slugs defined above.

## Complete Mode Specifications

### 🧭 Navigator Mode
- **Slug:** `navigator`
- **Display:** 🧭 Navigator
- **Tool Groups:** read, browser
- **Use For:** Entry point, task routing, simple queries
- **Cannot:** Edit files, run commands
- **Delegates To:** test, implementation, investigation

### 🧪 Test Mode
- **Slug:** `test`
- **Display:** 🧪 Test
- **Tool Groups:** read, edit, command
- **Use For:** TDD, writing tests before implementation
- **Auto-Commits:** Yes (`test: [description]`)
- **Pattern:** AAA (Arrange, Act, Assert)

### 💻 Implementation Mode
- **Slug:** `implementation`
- **Display:** 💻 Implement
- **Tool Groups:** read, edit, command
- **Use For:** Writing code after tests exist
- **Auto-Commits:** Yes (`feat: [description]`)
- **Enforces:** Complexity limits, YAGNI, pattern reuse

### 🐛 Investigation Mode
- **Slug:** `investigation`
- **Display:** 🐛 Investigation
- **Tool Groups:** read, edit, command, browser
- **Use For:** Debugging, troubleshooting, root cause analysis
- **Auto-Commits:** Yes (`fix: [description]`)
- **Uses:** .docs/investigations/index.md for similar issues

## Workflow Patterns

### TDD Workflow (New Feature)
```
Navigator receives request
  ↓
Delegates to "test" mode
  ↓
Test mode writes tests
  ↓
Auto-commits tests
  ↓
Navigator delegates to "implementation" mode
  ↓
Implementation mode writes code passing tests
  ↓
Auto-commits and pushes implementation
```

### Bug Fix Workflow
```
Navigator receives bug report
  ↓
Delegates to "investigation" mode
  ↓
Investigation mode: reproduce, isolate, analyze
  ↓
Investigation mode: apply fix
  ↓
Auto-commits and pushes fix
```

### Simple Query Workflow
```
Navigator receives question
  ↓
Navigator answers directly (no delegation)
  ↓
Uses read/browser tools for context
```

## Verification Checklist

Before delegating from Navigator mode, verify:

- [ ] Mode slug is one of: `test`, `implementation`, `investigation`
- [ ] Task description is clear and specific
- [ ] Relevant context files mentioned (.docs/patterns/, .docs/investigations/)
- [ ] Success criteria defined
- [ ] NOT using: `code`, `debug`, `architect`, `orchestrator`, `ask`

## Error Prevention

**Common Mistakes:**
1. Using `code` instead of `implementation`
2. Using `debug` instead of `investigation`
3. Assuming Roo default modes exist
4. Not specifying mode slug in new_task

**Prevention:**
1. Always use exact slugs from Available Modes section
2. Reference this file before delegating
3. Use mode mapping table for translation
4. Test delegation syntax before committing

## Quick Reference

**For Navigator Mode Prompts:**
```
When delegating, ONLY use these mode names:
- "test" (for TDD)
- "implementation" (for coding)
- "investigation" (for debugging)

NEVER use: "code", "debug", "architect", "orchestrator", "ask"
```

**For Mode Instructions:**
```
This project uses custom mode slugs:
- navigator (not orchestrator)
- test (custom mode)
- implementation (not code)
- investigation (not debug)
```

## Success Criteria

- 100% correct mode slug usage in delegations
- Zero references to non-existent modes
- Clear mode routing in all workflows
- Consistent use of custom mode names across documentation