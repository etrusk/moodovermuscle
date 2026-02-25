# Project Status

**Updated**: 2026-02-25
**Branch**: `preview` (primary development branch)
**Deployment**: `preview.moodovermuscle.com.au` → `preview` branch

---

## Completed (this session)

### Content Pivot
- Renamed "MoodOverMuscle" → "Mood Over Muscle" in all user-facing text
- Replaced "Pilates Mat" → "Movement on Mat", removed all Pilates mentions
- Renamed "Emily" → "Emilia" in user-facing content
- Updated metadata: title and description broadened from mums-only to general audience

### Security Fixes
- **nodemailer** 7.0.9 → 7.0.13 (fixes DoS via recursive addressparser)
- **@types/nodemailer** 6.4.20 → 6.4.23 (drops @aws-sdk/client-ses, eliminates all fast-xml-parser CVEs)
- **pnpm overrides** for glob >=10.5.0 and minimatch >=9.0.6 (transitive via tailwindcss-animate→tailwindcss→sucrase)
- Production audit now clean: 0 vulnerabilities
- Fixed semgrep check: `command -v` → `semgrep --version` (handles broken pipx installs)

### Test Infrastructure
- Added localStorage polyfill in `vitest.setup.ts` for MSW 2.x CookieStore init
- All 73 test files / 799 tests passing

### Branch Cleanup
- Deleted all feature branches (local + remote)
- Only `main` and `preview` remain
- Vercel preview domain assigned to `preview` branch

---

## Task Queue

### Task A: Fix CI + Enable Dependency Automation (CRITICAL)
**Status**: Pending
**Why first**: Everything else is blocked by broken CI. Renovate can't automerge, security drift goes undetected, and PRs targeting `preview` aren't tested.

**A1. Fix CI workflow** (`.github/workflows/ci.yml`):
- Node 20 → 22 LTS, pnpm 9 → 10
- Add `preview` to push/PR trigger branches (currently only `main`)
- Add `pnpm audit --audit-level moderate --production` step
- Create `.node-version` file (`22`)

**A2. Install Renovate GitHub App** (MANUAL — human required):
- Go to https://github.com/apps/renovate → Install → select `etrusk/moodovermuscle`
- Config already exists at `.github/renovate.json` with automerge, grouping, vulnerability alerts
- Renovate will create a dashboard issue and start opening PRs immediately

**A3. Disable Dependabot** (MANUAL — human required):
- GitHub repo → Settings → Code security → Dependabot → disable version updates and security updates
- Prevents duplicate PRs with Renovate
- Dependabot config file doesn't exist (it ran on defaults), so no file to delete

**A4. Add scheduled security audit workflow** (new file: `.github/workflows/security-audit.yml`):
- Runs weekly on cron
- Runs `pnpm audit --audit-level moderate --production`
- Creates a GitHub issue if vulnerabilities found
- Sends email notification via GitHub's built-in issue notification system

**A5. Configure GitHub notification settings** (MANUAL — human required):
- GitHub repo → Settings → Notifications → ensure email notifications are on for failed checks
- You'll receive emails when: Renovate PRs fail CI, security audit finds issues, any PR check fails

### Task B: Remove Stale Docker Data (MANUAL)
**Status**: Pending — human required
**Impact**: Blocks local `next build` only (Vercel unaffected)
```bash
sudo rm -rf .docker/postgres-data .docker/.docker-build-backup-3197817
```

### Task C: Clean Up vitest.setup.ts
**Status**: Pending
**Depends on**: Task A1 (Node version alignment)
**Why**: ~570 lines of polyfills for APIs native since Node 18. The localStorage polyfill we added is a band-aid on top of other band-aids. Strip obsolete polyfills, keep only browser API mocks and test isolation mocks. Target: ~200 lines.

### Task D: Upgrade Prisma 6 → 7
**Status**: Pending
**Depends on**: Task A (CI must work)
**Scope**: Major version bump. Check migration guide, update schema if needed, verify all DB queries.

### Task E: Upgrade ESLint 8 → 9
**Status**: Pending (flat config migration: `.eslintrc` → `eslint.config.js`)
**Depends on**: Task A (CI must work)
**Note**: Can run in parallel with Task D

### Task F: Upgrade Vitest 3 → 4
**Status**: Pending
**Depends on**: Tasks D, E (minimize variables)

### Task G: Migrate Tailwind CSS 3 → 4
**Status**: Pending
**Depends on**: Tasks D, E, F (stabilise first)
**Scope**:
- Replace `tailwindcss` v3 + `postcss` + `autoprefixer` with `tailwindcss` v4 + `@tailwindcss/postcss`
- Replace `tailwindcss-animate` with `tw-animate-css` (v4-compatible drop-in)
- Migrate `tailwind.config.ts` → CSS-first config
- **Eliminates pnpm overrides** (v4 drops sucrase→glob→minimatch chain entirely)

---

## Known Technical Debt

### pnpm overrides (remove at Task G)
```json
"glob@>=10.2.0 <10.5.0": ">=10.5.0",
"minimatch@>=9.0.0 <9.0.6": ">=9.0.6"
```
Forced patched versions of transitive deps. Eliminated entirely by Tailwind v4 migration.

### Dead Renovate config (until Task A2)
`.github/renovate.json` exists but the Renovate GitHub App is not installed. Config does nothing until app is installed.

### CI doesn't cover `preview` branch (until Task A1)
Workflow only triggers on `main`. Since `preview` is the development branch, PRs and pushes to it are untested in CI.

---

## Task Dependency Order

```
Task A (CI + automation) ← CRITICAL, do first
  A1: Fix CI workflow (LLM)
  A2: Install Renovate app (MANUAL)
  A3: Disable Dependabot (MANUAL)
  A4: Security audit workflow (LLM)
  A5: Notification settings (MANUAL)

Task B (docker cleanup — MANUAL, independent)

Task C (vitest.setup.ts cleanup)
  └→ depends on A1

Task D (Prisma 6→7) ─┐
Task E (ESLint 8→9) ──┤ depend on A, can run in parallel
                       │
Task F (Vitest 3→4) ───┘ after D and E

Task G (Tailwind 3→4) ── after D, E, F (removes pnpm overrides)
```
