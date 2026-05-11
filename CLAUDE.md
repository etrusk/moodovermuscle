# MoodOverMuscle Project Configuration

<!-- TOKEN BUDGET: Keep under 800 tokens. Loads on EVERY prompt. -->

## Project Overview

A Next.js booking platform for personal training/wellness services. Features real-time session booking with conflict prevention, admin dashboard for booking management, calendar integration with availability management, and client-facing booking forms.

## Tech Stack

- Language: TypeScript 5.9 (strict mode)
- Framework: Next.js 15 (App Router) with React 19
- Database: Prisma 6 ORM with PostgreSQL (Neon)
- Styling: Tailwind CSS 3 with Radix UI components
- Auth: JWT (jose) with bcryptjs
- Email: Nodemailer (fire-and-forget pattern)
- Testing: Vitest 3 with Testing Library, Playwright for E2E
- Linting: ESLint 8 with TypeScript support
- Formatting: Prettier 3
- Package Manager: pnpm

## Key Commands

```bash
pnpm run build           # Prisma migrate + generate + Next.js build
pnpm run test            # Run all tests with Vitest
pnpm run test:watch      # TDD mode
pnpm run test:critical   # Critical path tests only
pnpm run lint            # Run ESLint via Next.js
pnpm run type-check      # TypeScript strict mode check
pnpm run test:quality    # Test quality validation (AAA, weak assertions)
pnpm run security:scan   # pnpm audit
pnpm run duplication-check # jscpd (3% threshold)
pnpm run quality:gates   # Full quality check pipeline
```

## Documentation Structure

This project maintains documentation in `.docs/`:

- **spec.md**: Requirements and acceptance criteria
- **architecture.md**: System design, schema, API endpoints, security
- **patterns/index.md**: Reusable code patterns catalog
- **decisions/index.md**: Architectural decision records
- **investigations/index.md**: Debugging sessions and known issues
- **lessons-learned/index.md**: Process improvements
- **workflow.md**: Development workflow and quality gates
- **current-task.md**: Project status tracking

**Agents MUST read relevant `.docs/` files before making changes.**

## TDD Workflow

Non-trivial tasks use `/tdd [task description]`:

1. Explorer reads `.docs/` and explores codebase
2. Planner creates implementation plan referencing spec and patterns
3. Test Designer designs tests with justifications
4. Test Reviewer validates test coverage and spec alignment
5. Coder implements tests (red), then code (green)
6. Reviewer validates against spec and patterns
7. Committer creates conventional commit and pushes

For requirement clarification before `/tdd`, use `/tdd-spec [task description]`.

## Critical Constraints

<constraints>
- Secrets, API keys, and credentials go in environment variables only
- All new code requires tests (TDD workflow)
- Max 300 lines per source file — extract if exceeded
- Max 600 lines per test file
- Max 50 lines per function (target 40)
- Max 3 function parameters (use options objects if more)
- Code duplication max 3% (extract on 2nd occurrence)
- Use explicit types — `any` is prohibited
- Follow patterns in `.docs/patterns/index.md`
- Prefer Claude CLI tools (Read, Write, Edit, Grep, Glob) over bash equivalents
</constraints>

## Branching

- `main` = prod (auto-deploys to `moodovermuscle.com.au`). PRs only, CI green required.
- `preview` = staging (auto-deploys to `preview.moodovermuscle.com.au`). Direct commits.
- **One feature on `preview` at a time.** No parallel feature branches.
- Flow: commit to `preview` → client approves preview URL → PR `preview → main` → merge.
- Trivial non-functional changes (docs, config, tooling): PR directly to `main`.
- Details and edge cases: `.docs/workflow.md`.

## Session State

- **Long-term project status**: `.docs/current-task.md`
- **Workflow-specific ephemeral state**: `.tdd/session.md` (deleted after commit)
- **Project knowledge**: `.docs/` (version controlled)

Read `.docs/current-task.md` and `.tdd/session.md` at workflow start for continuity.

## Project-Specific Patterns

- Server components by default (Next.js App Router)
- Prisma for all database access with explicit `include` for relations
- Zod schemas for validation at `lib/validation/schemas.ts`
- JWT auth service at `lib/auth/jwt-service.ts`
- Booking queries at `lib/db/booking-queries.ts`
- Tests in `__tests__/` directory mirroring source structure
- Pre-commit hooks enforce all quality gates
