# Mode System Configuration

## Mode Slug Override Strategy

To properly override Roo Code's default modes with our custom implementations, we use **matching slugs** in `.roomodes`:

- `orchestrator` → Overrides default orchestrator mode with our Navigator
- `code` → Overrides default code mode with our Implementation mode
- `debug` → Overrides default debug mode with our Investigation mode
- `test` → Custom mode (no default equivalent)

## Why Slug Matching Matters

**Previous Configuration (Didn't Work):**
- Custom slugs: `navigator`, `implementation`, `investigation`
- Result: Default modes remained active, custom modes were additional options
- Problem: Task delegation failed because default modes intercepted requests

**Current Configuration (Works):**
- Custom slugs: `orchestrator`, `code`, `debug`
- Result: Custom modes completely replace default modes
- Benefit: Reliable task delegation, consistent behavior

## Mode Delegation Reference

When using [`new_task`](../.roomodes:1) tool from orchestrator mode:

**Correct Mode Slugs:**
- `"test"` - Write tests before implementation (TDD)
- `"code"` - Implement features after tests exist
- `"debug"` - Debug and troubleshoot issues

**Incorrect (Don't Use):**
- ❌ `"navigator"` - doesn't exist anymore
- ❌ `"implementation"` - doesn't exist anymore
- ❌ `"investigation"` - doesn't exist anymore

## Mode Capabilities Matrix

| Mode | Slug | Groups | Can Edit Files | Can Run Commands | Auto-Commit |
|------|------|--------|----------------|------------------|-------------|
| 🧭 Navigator | `orchestrator` | read, browser | ❌ No | ❌ No | ❌ No |
| 🧪 Test | `test` | read, edit, command | ✅ Yes | ✅ Yes | ✅ Yes |
| 💻 Implement | `code` | read, edit, command | ✅ Yes | ✅ Yes | ✅ Yes |
| 🐛 Investigation | `debug` | read, edit, command, browser | ✅ Yes | ✅ Yes | ✅ Yes |

## File Restrictions by Mode

### Navigator (orchestrator)
**Can Access:**
- All files (read-only)
- Browser access for documentation

**Cannot Modify:**
- No file editing capabilities
- No command execution

### Test Mode
**Can Access:**
- Read all files
- Edit test files: `__tests__/**`, `*.test.ts`, `*.test.tsx`, `*.spec.ts`
- Edit test utilities: `__tests__/setup/**`, `jest.setup.js`, `jest.config*.ts`
- Run test commands

**Restrictions:**
- Should not edit implementation files directly
- Focus on test-first development

### Implementation Mode (code)
**Can Access:**
- Read all files
- Edit implementation files: `app/**`, `components/**`, `lib/**`, `types/**`
- Edit configuration: `*.config.js`, `*.config.ts`, `*.json`
- Run build and test commands

**Restrictions:**
- Should not edit test files (delegate to test mode)
- Should verify tests exist before implementing

### Investigation Mode (debug)
**Can Access:**
- Read all files
- Edit any file needed for bug fixes
- Run diagnostic commands
- Browser access for documentation

**Restrictions:**
- Should focus on debugging, not feature development
- Should document findings in `.docs/investigations/`

## Mode Workflow Patterns

### New Feature Development
1. **Navigator** receives request → delegates to **test mode**
2. **Test mode** writes tests → auto-commits → returns to navigator
3. **Navigator** delegates to **code mode**
4. **Code mode** implements → auto-commits + pushes → returns to navigator

### Bug Fix
1. **Navigator** receives bug report → delegates to **debug mode**
2. **Debug mode** investigates → fixes → auto-commits + pushes → returns to navigator

### Simple Query
1. **Navigator** receives question → answers directly (no delegation)

## Configuration Files

**Primary:** [`.roomodes`](../.roomodes:1) - Defines mode slugs, permissions, instructions
**Documentation:** This file - Explains strategy and usage
**Rules:** [`00-general.md`](./00-general.md:51) - References mode system in general rules

## Verification Checklist

After mode configuration changes:

- [ ] `.roomodes` uses correct slugs: `orchestrator`, `test`, `code`, `debug`
- [ ] Mode names remain descriptive: Navigator, Test, Implement, Investigation
- [ ] Group permissions match capabilities matrix
- [ ] Custom instructions reference correct mode slugs for delegation
- [ ] Documentation updated to reflect slug changes
- [ ] Task delegation tested between modes

## Troubleshooting

**Problem:** Task delegation fails
**Solution:** Verify mode slugs in `.roomodes` match: `orchestrator`, `code`, `debug`

**Problem:** Wrong mode activated
**Solution:** Check `new_task` calls use correct slugs: `test`, `code`, `debug`

**Problem:** Mode can't edit files
**Solution:** Verify `groups` includes `edit` in `.roomodes` for that mode

**Problem:** Mode can't run commands
**Solution:** Verify `groups` includes `command` in `.roomodes` for that mode