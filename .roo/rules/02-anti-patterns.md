# Anti-Patterns (Pre-Commit Enforced)

## Automatically Blocked

These violations are caught by pre-commit hooks and prevent commits:

### Complexity Violations
- **Function >50 lines** → BLOCKED by complexity-check.js
- **File >300 lines** → BLOCKED by complexity-check.js
- **Function >3 params** → BLOCKED by complexity-check.js

### Code Quality
- **Duplication >3%** → BLOCKED by jscpd
- **Lint errors** → BLOCKED by ESLint
- **Type errors** → BLOCKED by TypeScript
- **Test failures** → BLOCKED by test suite

### Import Issues
- **Non-existent packages** → BLOCKED by package-check.js
- **Build failures** → BLOCKED by build verification

## Conceptual Anti-Patterns

Not automatically enforced but critical to avoid:

### Pattern Amnesia
❌ Not checking `.docs/patterns/index.md` before implementation
✅ Always search patterns first, apply existing approaches

### YAGNI Violations
❌ Creating interfaces before 2nd implementation
❌ Building abstractions before 2nd use
❌ Premature optimization
✅ Wait for actual need, then extract

### Over-Engineering
❌ Complex factory for single type
❌ Generic utility for specific use case
❌ Abstraction layers without clear benefit
✅ Simplest solution first, evolve when needed

### Context Blindness
❌ Implementing without reading `.roo/context.md`
❌ Ignoring institutional memory
❌ Recreating existing patterns
✅ Context-aware implementation using proven patterns

### Testing Anti-Patterns
❌ Tests after implementation (when TDD possible)
❌ Testing implementation details vs behavior
❌ Brittle tests coupled to internals
✅ TDD approach, behavior testing, maintainable tests

## How to Avoid

1. **Before coding**: Check `.docs/patterns/index.md`
2. **During coding**: Follow YAGNI, respect limits
3. **Before commit**: Pre-commit catches violations automatically
4. **After blocking**: Fix issue, don't bypass checks

## If Pre-Commit Blocks

### Complexity Violation
```bash
# Break function into smaller functions
# Or split file into multiple modules
# Then retry commit
```

### Duplication Violation
```bash
# Use refactor mode to consolidate
# Extract duplicated code to shared utility
# Then retry commit
```

### Package Import Error
```bash
# Install missing package: pnpm add <package>
# Or fix typo in import path
# Then retry commit
```

**Never bypass pre-commit hooks. Fix the underlying issue.**