# Development Workflows

## Core Principles

**Enforcement over process**: Pre-commit hooks enforce quality automatically. Boomerang tasks handle delegation. No manual protocols.

**Pattern-first development**: Check `.docs/patterns/index.md` before implementing. Apply existing solutions, document new ones.

**Preview-first deployment**: All functionality changes require client approval via preview URL before production.

## Standard Development Flow

### 1. Start in Navigator Mode

Navigator is your entry point for all tasks. It either:
- Answers simple queries directly
- Delegates complex work via boomerang tasks

```javascript
// Navigator delegates using new_task
{
  mode: "implementation",
  message: "Add email notifications on booking confirmation",
  context: "Check .docs/patterns/index.md for email patterns"
}

// Specialist completes using attempt_completion
{
  result: "Email notifications implemented. Tests passing. Pattern documented."
}
```

### 2. Pattern Discovery (Before Coding)

**Always check first**:
- `.docs/patterns/index.md` - Similar implementations
- `.docs/investigations/index.md` - Known issues

Apply existing patterns. Document new reusable patterns.

### 3. Implementation with Pre-commit Enforcement

Pre-commit hook runs automatically on every commit:

```bash
# Automatic enforcement (no bypass)
npm run lint                        # ESLint + Prettier (auto-fix)
npm run type-check                  # TypeScript compilation
npm run test:critical               # Essential tests
npm run security:scan               # Vulnerability check
npm run build:verify                # Build verification
node scripts/complexity-check.js    # ≤50 lines/function, ≤300 lines/file, ≤3 params
npx jscpd --threshold 3            # ≤3% code duplication
node scripts/check-npm-packages.js  # Validate npm imports exist
```

**If commit fails**: Fix issue, re-stage with `git add -A`, retry commit.

### 4. Git Operations

```bash
# Standard workflow
git checkout -b feature/descriptive-name
# ... make changes ...
git add -A                          # Stage ALL changes
git commit -m "type(scope): description"  # Pre-commit runs
git push origin feature/descriptive-name
```

**Branch naming**:
- `feature/profile-editing`
- `hotfix/security-patch`
- `investigation/performance-analysis`

**Conventional commits**:
```
feat(booking): add email notifications
fix(auth): resolve JWT validation edge case
docs(api): update booking endpoint docs
test(calendar): add conflict detection tests
refactor(user): simplify registration flow
```

## Git Staging Protocol

**CRITICAL**: Pre-commit checks staged content, not working directory.

```bash
# Correct workflow
git status                          # Check what's modified
npm run lint && npm run type-check  # Verify locally first
git add -A                          # Stage everything including fixes
git commit -m "conventional message"

# If commit fails:
# 1. Fix the issue
# 2. git add -A  (re-stage)
# 3. Retry commit
```

**Never**:
- ❌ Commit with unstaged changes to modified files
- ❌ Use `--no-verify` (emergency only, requires documentation)
- ❌ Assume files are staged without checking `git status`

## Preview-First Deployment

### When Preview Required

**MANDATORY** for functionality changes:
- New features
- UI modifications
- Behavior changes
- API changes

**Skip preview** for:
- Documentation updates (`.docs/`, `README.md`)
- Configuration (linting, testing, build tools)
- Internal tooling
- Non-user-facing bug fixes

### Preview Workflow

```bash
# 1. Create PR (triggers Vercel preview)
git push origin feature/email-notifications

# 2. Get preview URL from Vercel
# https://moodovermuscle-git-feature-email-notifications.vercel.app

# 3. Share with client for approval
# Wait for explicit confirmation

# 4. Merge after approval
git checkout main
git merge feature/email-notifications
git push origin main  # Triggers production deploy
```

**Client approval checklist**:
- [ ] Preview URL shared with client
- [ ] Client reviewed functionality
- [ ] Client approved changes explicitly
- [ ] Ready to merge to production

## Mode Reference

| Mode | Use When | Persistent Behavior |
|------|----------|---------------------|
| **Navigator** | Entry point (always start here) | Routes work, delegates tasks |
| **Test** | Before implementing features | Always TDD, tests-first approach |
| **Implementation** | With existing tests | Always checks patterns first |
| **Investigation** | Debugging issues | Always checks investigations first |
| **Review** | After implementation | Always verifies APIs with browser |
| **Refactor** | When duplication detected | Always tests after each change |
| **Quality** | Pre-deployment validation | Always runs full gate suite |

### Mode Switching

```bash
# Slash commands
/test          # Switch to Test mode
/implement     # Switch to Implementation mode
/investigate   # Switch to Investigation mode
/review        # Switch to Review mode
/refactor      # Switch to Refactor mode
/quality       # Switch to Quality mode

# Or use dropdown menu
```

## Testing Strategy

```bash
# Development cycle
npm run test:watch        # TDD during implementation

# Pre-commit (automatic)
npm run test:critical     # Fast feedback (<30s)

# Before PR
npm run test              # Full test suite
npm run test:coverage     # Coverage report

# Pre-deployment
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
```

**Test pyramid**:
- Unit tests: Component-level functionality
- Integration tests: API and component interactions  
- E2E tests: Critical user journeys

## Quality Standards (Enforced Automatically)

### Code Quality
- ✅ ESLint compliance (enforced)
- ✅ TypeScript strict mode (enforced)
- ✅ Zero `any` types (enforced)
- ✅ Prettier formatting (auto-fixed)

### Complexity Limits
- ✅ Functions ≤ 50 lines (enforced)
- ✅ Files ≤ 300 lines (enforced)
- ✅ Parameters ≤ 3 (enforced)
- ✅ Duplication ≤ 3% (enforced)

### Testing
- ✅ Coverage ≥ 70% (enforced)
- ✅ Critical tests pass (enforced)
- ✅ No security vulnerabilities (enforced)

### Performance
- ✅ LCP < 2.5s (monitored)
- ✅ CLS < 0.1 (monitored)
- ✅ FID < 100ms (monitored)
- ✅ Bundle < 1MB (monitored)

## Emergency Procedures

### Hotfix Workflow

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue-description

# 2. Minimal fix only (no scope creep)
# ... implement fix ...

# 3. Pre-commit gates still required (no bypass)
git add -A
git commit -m "fix(critical): description"

# 4. Fast-track review and merge
git push origin hotfix/critical-issue-description
# Get single reviewer approval
# Merge to main

# 5. Document for post-mortem
# Add to .docs/debt.md
```

### Rollback Procedures

**Vercel rollback** (immediate):
1. Open Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"
4. Traffic routes to stable version in <30s

**Git rollback**:
```bash
# Revert specific commit
git revert [commit-hash]
git push origin main

# Emergency reset (use cautiously)
git reset --hard [last-good-commit]
git push --force-with-lease origin main
```

**Post-rollback**:
1. Run quality gates on rolled-back code
2. Verify critical user journeys
3. Document issue in `.docs/investigations/`
4. Create plan to fix root cause

## Documentation Maintenance

### During Development

**Update as you go**:
- `.docs/patterns/index.md` - New reusable patterns
- `.docs/investigations/index.md` - Debugging insights
- `.docs/debt.md` - Technical debt items

### Pattern Documentation

When developing new reusable approaches:

```markdown
# Add to .docs/patterns/index.md

## [Feature Category]
- **Pattern**: [Short description]
- **Code**: `path/to/implementation.ts`
- **Usage**: When to apply this pattern
- **Prerequisites**: Dependencies or setup needed
```

### Investigation Documentation

When debugging issues:

```markdown
# Add to .docs/investigations/index.md

## [Issue Description]
- **Problem**: What went wrong
- **Root Cause**: Why it happened
- **Solution**: How it was fixed
- **Prevention**: How to avoid in future
- **Code**: `path/to/fixed-code.ts`
```

## What's Automatic

✅ Quality enforcement (pre-commit blocks bad commits)  
✅ Complexity limits (functions, files, parameters)  
✅ Duplication detection (>3% blocks commit)  
✅ Type checking (TypeScript errors block)  
✅ Security scanning (vulnerabilities block)  
✅ Task completion (attempt_completion returns to parent)  
✅ Vercel deployment (git push triggers deploy)  
✅ Preview generation (PR creates preview URL)

## What's Manual

❌ Pattern discovery (check `.docs/patterns/index.md` before coding)  
❌ Client approval (share preview URL, get confirmation)  
❌ Git operations (add, commit, push)  
❌ Mode switching (when workflow changes)  
❌ Documentation updates (patterns, investigations, debt)

## Anti-Patterns to Avoid

❌ **Committing with unstaged changes** - Pre-commit misses your fixes  
❌ **Using `--no-verify`** - Bypasses all quality enforcement  
❌ **Creating abstractions prematurely** - Wait until 2nd use  
❌ **Ignoring pattern library** - Reinventing existing solutions  
❌ **Merging without client approval** - Breaking preview-first rule  
❌ **Skipping investigation check** - Missing known solutions

## Success Metrics

Track these indicators:
- Pre-commit pass rate >95%
- Deployment success rate >99%
- Test coverage >70%
- Zero bypassed quality gates
- Pattern reuse rate >80%

---

**Quick Reference**: Start in Navigator → Check patterns → Implement → Pre-commit enforces → Push → Preview (if needed) → Client approval → Merge → Production deploy