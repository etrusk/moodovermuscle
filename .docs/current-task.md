# Project Status

**Updated**: 2026-05-11
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

### Content Pivot (partial)
- Renamed "MoodOverMuscle" → "Mood Over Muscle" in frontpage sections and footer copyright
- Replaced "Pilates Mat" → "Movement on Mat" in service cards and about section
- Renamed "Emily" → "Emilia" in about header and profile image alt text
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

**Still dirty after this pass**:
- `.env.example` references `DATABASE_URL` but the schema uses `DATABASE_POSTGRES_PRISMA_URL`. Sandbox blocked `.env*` access from this session — needs a manual edit.

---

## Task Queue

Work items below are ordered for "grab the next task" sessions. Each is self-contained and assumes no prior context beyond reading this file.

---

### 1. Complete content pivot
**Type**: Find/replace across source + tests
**Why now**: The initial pivot only covered frontpage sections. Admin pages, error pages, email templates, and tests still have old names.

**Remaining "MoodOverMuscle" → "Mood Over Muscle"** (user-facing):
- `components/header/Logo.tsx:17` — alt text
- `components/sections/footer/FooterContent.tsx:25` — alt text
- `app/admin/layout.tsx:53` — admin header title
- `app/admin/login/page.tsx:84` — login description
- `app/not-found.tsx:17` — alt text
- `app/error.tsx:23` — alt text
- `app/500.tsx:18` — alt text

**Remaining "Emily" → "Emilia"** (user-facing):
- `lib/email-templates.ts:53,64,100,110,151,195` — customer/admin emails say "Emily will contact you", "Hi Emily"
- `app/admin/login/page.tsx:101` — placeholder email (display only)
- `lib/auth/admin-auth.ts:29` — admin display name (safe to change)

**Note on admin credentials**: `lib/auth/admin-auth.ts` uses email `emily@moodovermuscle.com.au`. Changing the email address would lock out the admin — only change if the actual mailbox has been renamed. Ask the human before touching the email address.

**Remaining "Pilates"** (test data):
- `__tests__/lib/email.templates.test.ts:32` — `sessionType: 'Pilates'`
- `__tests__/lib/email.test.ts:81` — `sessionType: 'Pilates'`

**Image file rename**:
- Rename `public/images/emily-portrait.jpeg` → `public/images/emilia-portrait.jpeg`
- Update `components/sections/about/ProfileImage.tsx:10` src path

**Test updates**: ~30 test files reference `emily@moodovermuscle.com.au`, `name: 'Emily'`, and `'MoodOverMuscle Admin'` in assertions. These must be updated to match the source changes. Key files:
- `__tests__/setup/handlers.ts` — MSW mock handlers (central, update first)
- `vitest.setup.ts:540-542` — mock admin user
- `__tests__/components/admin/` — all layout test files use mock admin user
- `__tests__/lib/auth/` — all auth test files
- `__tests__/integration/admin-*` — admin integration tests
- `e2e/admin/admin-workflow.spec.ts` — Playwright E2E tests

**Verification**: `pnpm test` (all 799 tests pass), `pnpm lint`, `pnpm type-check`.

---

### 2. Clean up vitest.setup.ts
**Type**: Refactor (1 file, ~370 lines to remove)
**Why**: ~570 lines of polyfills for APIs native since Node 18. The localStorage polyfill added in this session is a band-aid on top of other band-aids.

**Keep**: browser-only API mocks (IntersectionObserver, ResizeObserver, matchMedia, scrollIntoView, hasPointerCapture), test isolation mocks (nodemailer, jose, bcryptjs, next/router, next/navigation, next/server), and the localStorage polyfill (needed until MSW/jsdom fix the CookieStore issue).

**Remove**: TextEncoder, TextDecoder, Request, Response, Headers, ReadableStream, WritableStream, TransformStream polyfills — all native since Node 18. Remove the NextResponse polyfill (covered by next/server mock). Remove global console suppression (replace with targeted suppression).

**Target**: ~200 lines.
**Verification**: `pnpm test` (all 799 tests pass), `pnpm type-check`.

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
