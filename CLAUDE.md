# MoodOverMuscle

<!-- v7 minimal harness: this file + the Stop-hook quality gate + built-ins (plan mode,
     /code-review). No agent files, no commands, no .docs/ ceremony.
     Reference: .docs/spec.md (requirements), .docs/architecture.md (schema, APIs, security). -->

## Commands
- Test: `pnpm run test`   Lint + types: `pnpm run lint && pnpm run type-check`   Build: `pnpm run build`
- Run a single test, not the whole suite, while iterating: `pnpm vitest run <file>`.
- Full pre-deploy gate (security, semgrep, build) is `pnpm run quality:gates` — husky pre-commit +
  CI run it. The turn-end Stop hook runs only the fast lint + types + `test:critical` subset.

## How we work
- Verification-first: for behavior changes, write the failing test first, watch it fail, then
  implement. Test-first is the default; a Playwright/screenshot check is a fine oracle where a
  unit test isn't.
- Build the smallest thing that passes. No abstraction, option, or fallback without a present need.
- Complete tasks exactly as described; stop and ask if unclear. Report failures honestly — never
  silently retry, work around, or modify tests/gates to force a pass. Fix the root cause.
- Non-trivial change (multiple files, unfamiliar code, or you can't describe the diff in one
  sentence): plan first, then run `/code-review` on the diff before committing — act only on
  correctness/requirement findings, not style.
- Done = quality gate green (all tests pass, none skipped) with evidence shown, not "looks done."

## Conventions
- Strict TS, no `any` (ESLint-enforced). Server components by default (App Router); Prisma with
  explicit `include`; Zod schemas in `lib/schemas.ts`; JWT in `lib/auth/`; tests in `__tests__/`
  mirroring source. Module layout + deeper design: `.docs/architecture.md`.
- Branching: `main` = prod (auto-deploys moodovermuscle.com.au; PR + green CI only). `preview` =
  staging (direct commits; one feature at a time). Flow: commit `preview` → approve preview URL →
  PR `preview→main`. Tooling/docs may PR straight to `main`. Conventional commits (commitlint).
- Files: ~300 lines is a smell, 400 is a hard limit — split before exceeding.

## Maintaining this harness
- When you touch this file or the gate hook, cut what no longer earns its keep.
