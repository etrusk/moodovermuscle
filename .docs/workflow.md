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

## Branching & Deployment

**Branches:**
- `main` — production. Auto-deploys to `moodovermuscle.com.au` on push. Branch-protected: PRs only, CI required green.
- `preview` — staging. Auto-deploys to `preview.moodovermuscle.com.au` on push. Direct commits allowed.

**Invariant: one feature on `preview` at a time.** No parallel feature branches. `preview` is either identical to `main` (idle) or `main` + one in-flight feature.

**Per-feature flow** (functionality changes — features, UI, behavior):
1. Confirm `preview` is idle (== `main`). If not, finish or abandon the in-flight feature first.
2. Commit directly to `preview`.
3. Push → `preview.moodovermuscle.com.au` updates.
4. Share preview URL with client.
5. Iterate on `preview` until approved.
6. **Promote to prod**: PR `preview → main`, CI green required, merge. Vercel auto-deploys `main` to prod.

**Skip preview** for docs, config, internal tooling, non-user-facing fixes — PR directly to `main`.

**Edge cases (manual intervention by solo dev, not encoded in tooling):**
- **Abandoned feature**: `git reset --hard origin/main` on `preview` and force-push before starting the next feature. Otherwise dead commits stack.
- **Mid-review prod hotfix**: hotfix branch off `main` → PR to `main`. Then rebase `preview` onto new `main` to keep the pending feature on top.

**Why PRs only for `preview → main`:** CI runs on push to both branches, so PRs add no quality gate for `feature → preview`. The `preview → main` PR exists to enforce CI-green-before-prod via branch protection (Vercel deploys `main` in parallel with CI; without the gate, broken code can ship). It's the technical safety net, not code review.

## Anti-Patterns to Avoid

- **Using `--no-verify`** — bypasses all quality enforcement
- **Creating abstractions prematurely** — wait until 2nd use
- **Ignoring pattern library** — reinventing existing solutions
- **Skipping investigation check** — missing known solutions
- **Merging `preview → main` without client approval** — breaking preview-first rule
- **Stacking features on `preview`** — violates one-at-a-time invariant; reset or finish first

---

**Quick Reference**: `/tdd-spec` (clarify) → `/tdd` (implement) → pre-commit enforces → commit to `preview` → client approves preview URL → PR `preview → main` → merge
