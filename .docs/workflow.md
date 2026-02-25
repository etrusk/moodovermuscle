# Development Workflows

## Core Principles

**Enforcement over process**: Pre-commit hooks enforce quality automatically. No manual protocols.

**Pattern-first development**: Check `.docs/patterns/index.md` before implementing. Apply existing solutions, document new ones.

**TDD by default**: Non-trivial tasks use the `/tdd` command, which orchestrates a multi-agent workflow automatically.

## TDD Workflow (Primary)

### Starting a Task

For non-trivial features or bug fixes:

```bash
# Optional: clarify requirements first
/tdd-spec [task description]

# Run TDD workflow
/tdd [task description]
```

### Workflow Phases

The `/tdd` command orchestrates 11 phases automatically:

| Phase | Agent | Purpose |
|-------|-------|---------|
| INIT | orchestrator | Create session state |
| EXPLORE | tdd-explorer | Read docs, find relevant files and patterns |
| PLAN | tdd-planner | Create implementation plan with file-level specificity |
| DESIGN_TESTS | tdd-test-designer | Design test cases with assertions and justifications |
| TEST_DESIGN_REVIEW | tdd-test-reviewer | Validate coverage, edge cases, spec alignment |
| WRITE_TESTS | tdd-coder | Implement tests (expect RED) |
| IMPLEMENT | tdd-coder | Write code to pass tests (expect GREEN) |
| REVIEW | tdd-reviewer | Validate against spec, patterns, architecture |
| SYNC_DOCS | tdd-doc-syncer | Update patterns, decisions, current-task |
| COMMIT | tdd-committer | Conventional commit + push |
| REFLECT | tdd-reflector | Process improvement (0-2 items per session) |

Conditional phases: ANALYZE_FIX → FIX (if review finds issues), HUMAN_VERIFY/HUMAN_APPROVAL (UI changes).

### Checking Status

```bash
/tdd-status    # Current phase, blockers, next steps
```

### Session State

- `.tdd/session.md` — ephemeral, tracks current TDD session (deleted after commit)
- `.docs/current-task.md` — persistent project status
- `.tdd/requirements.md` — optional, from `/tdd-spec`

## Simple Tasks (No TDD)

For trivial changes (typo fixes, single-line changes, config tweaks):
- Work directly without `/tdd`
- Pre-commit hooks still enforce quality

## Pattern Discovery (Before Coding)

**Always check first**:
- `.docs/patterns/index.md` — similar implementations
- `.docs/investigations/index.md` — known issues
- `.docs/decisions/index.md` — architectural decisions

## Pre-commit Enforcement

Pre-commit hook runs automatically on every commit:

```bash
# Automatic enforcement chain
pnpm run lint              # ESLint + Prettier (auto-fix)
pnpm run type-check        # TypeScript compilation
pnpm run test:quality      # AAA pattern, weak assertion detection
pnpm run test:critical     # Essential business logic tests
pnpm run duplication-check # jscpd (≤3% threshold)
pnpm run security:scan     # Vulnerability check
pnpm run build:verify      # Build verification
```

Test-first enforcement: Implementation files require corresponding test files.

**If commit fails**: Fix issue, re-stage with `git add -A`, retry commit.

## Git Operations

**Conventional commits** (enforced by commitlint):
```
feat(booking): add email notifications
fix(auth): resolve JWT validation edge case
test(calendar): add conflict detection tests
docs(api): update booking endpoint docs
refactor(user): simplify registration flow
chore(deps): update dependencies
```

## Testing Strategy

```bash
# TDD mode
pnpm run test:watch        # Watch mode during implementation

# Pre-commit (automatic)
pnpm run test:critical     # Fast feedback (<30s)

# Full suite
pnpm run test              # All Vitest tests
pnpm run test:e2e          # Playwright E2E tests

# Quality checks
pnpm run test:quality      # AAA pattern + assertion quality
pnpm run quality:gates     # Full pipeline
```

**Test pyramid**: Unit > Integration > E2E

## Quality Standards (Enforced Automatically)

### Code Quality
- ESLint compliance (enforced)
- TypeScript strict mode (enforced)
- Zero `any` types (enforced)
- Prettier formatting (auto-fixed)

### Complexity Limits
- Functions ≤ 50 lines (enforced)
- Source files ≤ 300 lines (enforced)
- Test files ≤ 600 lines (enforced)
- Parameters ≤ 3 (enforced)
- Duplication ≤ 3% (enforced)

### Testing
- Critical tests pass (enforced)
- No security vulnerabilities (enforced)
- AAA pattern required (enforced)
- No weak assertions (enforced)

## Preview-First Deployment

**MANDATORY** for functionality changes (new features, UI mods, behavior changes):
1. Push branch → Vercel creates preview
2. Share preview URL with client
3. Get explicit approval
4. Merge to production

**Skip preview** for: docs, config, internal tooling, non-user-facing fixes.

## Anti-Patterns to Avoid

- **Using `--no-verify`** — bypasses all quality enforcement
- **Creating abstractions prematurely** — wait until 2nd use
- **Ignoring pattern library** — reinventing existing solutions
- **Skipping investigation check** — missing known solutions
- **Merging without client approval** — breaking preview-first rule

---

**Quick Reference**: `/tdd-spec` (clarify) → `/tdd` (implement) → pre-commit enforces → push → preview (if needed) → client approval → merge
