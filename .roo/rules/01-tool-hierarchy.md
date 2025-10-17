# Tool Selection Hierarchy

## CRITICAL: Commands Run From Workspace Root

All tools operate from the workspace root automatically. Never use `cd` in commands.

❌ WRONG: `cd /home/user/project && npm test`
✅ CORRECT: `npm test`

## Tool Selection Decision Tree

Use tools in this priority order:

### 1. Direct Access Tools (Highest Priority)
- **read_file**: Reading any file content
  - Use for: checking test results, reading config, analyzing code
  - NOT execute_command with `cat`, `head`, `tail`
- **list_files**: Listing directory contents
  - NOT execute_command with `ls`, `find`, `tree`
- **search_files**: Finding text in files
  - NOT execute_command with `grep`, `ag`, `rg`

### 2. Data Processing Tools
- **For JSON/CSV/structured data**: Read with `read_file`, process in memory if needed
  - NOT execute_command with `jq`, `cat | grep`, complex pipes

### 3. Build/Test Commands (Medium Priority)
- **execute_command**: ONLY for:
  - Running npm/pnpm/yarn commands (`npm test`, `pnpm build`)
  - Git operations (`git commit`, `git push`)
  - Installing dependencies
  - Starting/stopping services

### 4. Complex Operations (Last Resort)
- **execute_command with pipes**: Only when no other tool applies
  - Must justify why direct tools can't work
  - Keep commands simple (2 pipes maximum)

## Common Anti-Patterns to Avoid

❌ Using terminal to read files:
```bash
execute_command: cat coverage-final.json
```
✅ Use read_file directly:
```
read_file: coverage/coverage-final.json
```

❌ Using terminal to check if tests pass:
```bash
execute_command: npm test 2>&1 | grep "PASS"
```
✅ Run tests directly:
```
execute_command: npm test
# Output is captured automatically - just read the result
```

❌ Complex bash for data extraction:
```bash
execute_command: cat file.json | jq '.data' | head -100
```
✅ Read file and describe what you need:
```
read_file: file.json
# Then analyze the content in your response
```

## When Verification Is Needed

If your role requires verifying outcomes:
1. Run the appropriate test/build command
2. Read the command output (captured automatically)
3. If output unclear, read relevant files directly
4. Complete task with summary

**Do NOT**:
- Parse output with bash pipes
- Use `head`/`tail` to limit output (already managed)
- Chain multiple commands unnecessarily