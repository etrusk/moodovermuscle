# MoodOverMuscle

## Commands
- Test: `pnpm run test`   Lint + types: `pnpm run lint && pnpm run type-check`   Build: `pnpm run build`
- Run a single test, not the whole suite, while iterating: `pnpm vitest run <file>`.
- `.claude/gate.sh` is the turn-end gate: lint, types and the critical test subset. The global
  Stop hook runs it when the tree changed and blocks turn-end until it is green. The full
  pre-deploy gate (security, semgrep, build) is `pnpm run quality:gates`, run by husky and CI.

## How we work
- Verification-first for behavior changes: write the failing test, watch it fail, then
  implement. A Playwright or screenshot check is a fine oracle where a unit test is not.
- Build the smallest thing that passes. No abstraction, option or fallback without a present need.
- Complete tasks exactly as described; stop and ask if unclear. Report failures honestly. Never
  silently retry, work around, or change tests or gates to force a pass. Fix the root cause.
- Non-trivial change (several files, unfamiliar code, or the diff takes more than a sentence):
  plan first, then run `/code-review` on the diff before committing. Act on findings that affect
  correctness or the stated requirement, not style.
- Done means the gate is green, all tests passing and none skipped, with evidence shown.

## State
- `NOW.md` holds the one task in flight and its working notes, or nothing. It is printed at
  session start. When it is empty and no task was given, the top entry of `BACKLOG.md` is next:
  move it in, delete it there, start. A task that clears takes its NOW body and every artefact
  it created with it. What is still open goes back to its BACKLOG entry, or is proposed as one.
- `BACKLOG.md` has three lists. Queue: ordered by the human, entries human-approved, each with
  a done-condition; a settled entry is deleted. Ideas: one line each, added on the human's word.
  Not doing: one line each with the reason, so it is not raised again.
- Commit messages state why; the diff is the what. One commit per coherent change. Conventional
  commits (commitlint). Branching: `main` is prod (auto-deploys moodovermuscle.com.au; PR plus
  green CI only). `preview` is staging (direct commits; one feature at a time). Flow: commit on
  `preview`, approve the preview URL, PR `preview` to `main`. Tooling and docs may PR straight
  to `main`. Do not push unless asked.
- Processes this session started (dev server, tunnels, browser tabs) are stopped at session end.
- Working artefacts live in the session scratchpad. Evidence worth keeping goes to
  `.test-output`, gitignored.

## Where to look
| Question | Location |
|---|---|
| What is this, for a human? | `README.md` |
| Requirements | `.docs/spec.md` |
| Schema, APIs, security, module layout and deeper design | `.docs/architecture.md` |
| The real-time availability API | `app/api/availability/README.md` |
| GitHub issue templates | `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md` |

## Conventions
- Strict TS, no `any` (ESLint-enforced). Server components by default (App Router); Prisma with
  explicit `include`; Zod schemas in `lib/schemas.ts`; JWT in `lib/auth/`; tests in `__tests__/`
  mirroring source.
- Files: about 300 lines is a smell, 400 is the limit; split before exceeding.

## Deploy and verification access (this environment)
Agents here can drive the whole deploy and verify loop. Use it to check the real preview and
prod, not just localhost:
- GitHub: `gh` CLI, admin on `etrusk/moodovermuscle` (scopes include `repo`, `workflow`,
  `admin:repo_hook`): read and trigger Actions, read CI logs, manage PRs, issues and comments,
  read `deployment_status`.
- Vercel: `vercel` CLI (deploy, `inspect`, `logs`, `env ls`, rollback). The repo is not linked
  locally; link it or pass `--project` and `--scope`. Deploys to moodovermuscle.com.au. The
  invocation quirk and the token are in user memory.
- Claude-in-Chrome: interactive browser automation (navigate, click, screenshot, read console
  and network) against any preview or prod URL. Local and interactive only; a person kicks it
  off. It is not an unattended CI gate.
- Claude Design (claude.ai/design): interactive AI design surface. Prototype product UI on the
  real brand before building, then hand off to Claude Code to implement with the real
  components. Authorized 2026-07-12 (`/design consent` and `/design-login`); push the component
  library with `/design-sync` (plan-approval gated: it lists the files it will write, you
  approve). Local, interactive and person-initiated; not a CI gate. Design work only, in the
  presentational layer (`components/ui`, `components/sections`); `components/` TSX stays canonical.
Verified 2026-07-12.
