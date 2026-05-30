# Project Status

**Updated**: 2026-05-30
**Branch**: `preview` (primary development branch)
**Deployment**: `preview.moodovermuscle.com.au` → `preview` branch

---

## Completed

### CI + Dependency Automation (was Task A)
- CI upgraded: Node 22 LTS, pnpm 10, triggers on `main` and `preview`
- Security audit job added to CI pipeline
- Weekly scheduled security audit (`.github/workflows/security-audit.yml`) — creates GitHub issues on failure
- `.node-version` file created (`22`)
- Renovate GitHub App installed (automerge patch/minor, manual review major)
- Dependabot disabled (replaced by Renovate)
- GitHub notification settings verified

### Content Pivot (complete as of 2026-05-30)
- **Company name is "MoodOverMuscle" (one word) everywhere — this is the legal/brand name.** An earlier pass wrongly spaced it to "Mood Over Muscle" in email templates (`lib/email.ts`, `lib/email-templates.ts`) and the `EMAIL_FROM_NAME` default; reverted 2026-05-30. Do NOT re-space it.
- Replaced "Pilates Mat" → "Movement on Mat" in service cards and about section; test fixtures updated off `sessionType: 'Pilates'`.
- Renamed "Emily" → "Emilia" across customer/admin copy and email templates
- Renamed `public/images/emily-portrait.jpeg` → `emilia-portrait.jpeg` + updated `ProfileImage.tsx` src
- Updated `app/layout.tsx` metadata: broadened from mums-only to general audience

### Security Fixes
- **nodemailer** 7.0.9 → 7.0.13, **@types/nodemailer** 6.4.20 → 6.4.23
- **pnpm overrides** for glob/minimatch (transitive via tailwindcss-animate→sucrase)
- Production audit clean: 0 vulnerabilities
- Semgrep check fix: `command -v` → `semgrep --version`

### Test Infrastructure
- localStorage polyfill in `vitest.setup.ts` for MSW 2.x CookieStore
- All 73 test files / 799 tests passing

### Branch Cleanup
- Only `main` and `preview` remain (all feature branches deleted)
- Vercel preview domain assigned to `preview` branch

### Housekeeping pass (2026-05-11)
- Renovate `baseBranches: ["preview"]` set — open Renovate PRs targeting `main` will be rebased to `preview` on next run
- Husky pre-commit: removed deprecated `husky.sh` sourcing (was breaking under husky v10)
- `.docker/` confirmed empty (Task 4 from prior queue is moot)
- Untracked `lib/generated/prisma/` (gitignored). `postinstall` runs `prisma generate` so fresh installs materialise the client. CI workflow exports a placeholder `DATABASE_POSTGRES_PRISMA_URL` for schema validation.
- Split `build` script into a CI-friendly `build` (`prisma generate && next build`) and `build:deploy` (with `prisma migrate deploy`). Vercel's `buildCommand` already wraps with `prisma migrate deploy` so deploys are unchanged.
- CI build/size-check were red since the schema env-var rename in February. Now green.
- Security audit: 13 advisories → 0. Achieved via `pnpm update`, bumping nodemailer 7 → 8 (only API break is the `NoAuth` → `ENOAUTH` rename, which the codebase does not use), and adding a `postcss@<8.5.10 → >=8.5.10` pnpm override to force a patched version through next>postcss.
- Updated e2e/accessibility tests to match the post-pivot "Book a Free Session" CTA text (was "Book Your FREE Session" — broken across 9 files).
- All 799 tests pass.

### Follow-up pass (2026-05-30)
- `.env.example` aligned to `DATABASE_POSTGRES_PRISMA_URL` (commit `cdea284`) — the prior "still dirty" item is resolved.
- Task 2 (vitest.setup.ts polyfill cleanup) landed in commit `141aa01`.
- Content pivot closed out: reverted the erroneous "Mood Over Muscle" spacing back to the real one-word brand "MoodOverMuscle" in email templates + `EMAIL_FROM_NAME` default; renamed the portrait image; updated `Pilates` test fixtures. See Completed → Content Pivot above.
- Added `.claude/scheduled_tasks.lock` to `.gitignore` (untracked runtime lock).

---

## Task Queue

Work items below are ordered for "grab the next task" sessions. Each is self-contained and assumes no prior context beyond reading this file.

---

### 1. ~~Complete content pivot~~ — DONE (2026-05-30)
The original version of this task assumed "MoodOverMuscle" should be spaced to "Mood Over Muscle". **That premise was wrong** — the human confirmed the legal/brand name is the one-word "MoodOverMuscle". The spacing that had leaked into email templates was reverted. Emily→Emilia, the Pilates fixtures, and the portrait image rename are all complete. No further content-pivot work outstanding.

**Note on admin credentials (still relevant)**: `lib/auth/admin-auth.ts` uses email `emily@moodovermuscle.com.au`. Changing the email address would lock out the admin — only change if the actual mailbox has been renamed. Ask the human before touching the email address.

---

### 2. ~~Clean up vitest.setup.ts~~ — DONE (commit `141aa01`)
Node-native polyfills dropped; browser-only mocks and the localStorage CookieStore polyfill retained.

**Next up: the major dependency upgrades below (Tasks 3–6) are the remaining real work.**

---

### 3. Upgrade Prisma 6 → 7
**Type**: Major dependency upgrade
**Scope**: Check migration guide, update schema if needed, verify all DB queries.

**Key files**: `package.json`, `prisma/schema.prisma`, `lib/prisma.ts`, `lib/db/booking-queries.ts`, any file importing from `@prisma/client` or `lib/generated/prisma`.
**Verification**: `pnpm prisma generate`, `pnpm test`, `pnpm build`, `pnpm type-check`.

---

### 4. Upgrade ESLint 8 → 9
**Type**: Major dependency upgrade + config migration
**Scope**: Flat config migration (`.eslintrc.*` → `eslint.config.js`). Also migrates away from deprecated `next lint` CLI (removed in Next.js 16) to direct ESLint CLI.

**Packages to update**: `eslint` 8→9, `@typescript-eslint/eslint-plugin` 7→8, `@typescript-eslint/parser` 7→8, `eslint-plugin-react-hooks` 4→5+, `eslint-config-prettier` 9→10.

**Note**: Tasks 3 and 4 can run in parallel.
**Verification**: `pnpm lint` (zero errors), `pnpm type-check`, CI lint job passes.

---

### 5. Upgrade Vitest 3 → 4
**Type**: Major dependency upgrade
**Depends on**: Tasks 3, 4 (minimize variables)

**Packages**: `vitest`, `@vitest/coverage-v8`, `@vitest/ui` — all must match.
**Key files**: `vitest.config.ts`, `vitest.config.critical.ts`, `vitest.config.accessibility.ts`, `vitest.setup.ts`.
**Verification**: `pnpm test`, coverage reporting works, CI test jobs pass.

---

### 6. Migrate Tailwind CSS 3 → 4
**Type**: Major dependency upgrade + config migration
**Depends on**: Tasks 3, 4, 5 (stabilise first)

**Changes**:
- Replace `tailwindcss` v3 + `postcss` + `autoprefixer` with `tailwindcss` v4 + `@tailwindcss/postcss`
- Replace `tailwindcss-animate` with `tw-animate-css` (v4-compatible drop-in)
- Migrate `tailwind.config.ts` → CSS-first config (`@theme` directives in `globals.css`)
- **Eliminates pnpm overrides** — v4 drops sucrase→glob→minimatch chain entirely
- Remove `pnpm.overrides` from `package.json`

**Verification**: `pnpm build`, visual check of all pages, `pnpm test`.

---

## Known Technical Debt

### pnpm overrides (remove at Task 6)
```json
"glob@>=10.2.0 <10.5.0": ">=10.5.0",
"minimatch@>=9.0.0 <9.0.6": ">=9.0.6"
```
Forced patched versions of transitive deps via tailwindcss-animate→tailwindcss→sucrase. Eliminated entirely by Tailwind v4 migration.

### Pre-commit hook inconsistencies
- Uses `npm run` instead of `pnpm run` in several places (steps 1, 2, 4, 7, 8)
- Security scan step (`command -v npm run security:scan`) is effectively dead — `command -v` only checks if `npm` binary exists, doesn't validate the script
- Low priority: hooks work correctly despite these issues
