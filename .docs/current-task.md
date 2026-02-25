# Post-Dormancy Remediation Plan

**Status**: In progress
**Created**: 2026-02-25
**Context**: Project dormant since 2025-10-17. Comprehensive review identified security, compatibility, and dependency issues accumulated over 6 months.

---

## Task 1: Remove Stale Docker Data (MANUAL — Human Required)

**Status**: Pending
**Type**: Manual cleanup
**Risk**: None (gitignored data, not project source)
**Blocks**: Local builds (Vercel deploys unaffected)

**Problem**: `.docker/postgres-data/` is owned by UID 70 (postgres container user). Next.js build glob scans the project directory and fails with `EACCES: permission denied`. This only affects local builds — Vercel has no `.docker/` directory.

**Fix**:
```bash
sudo rm -rf .docker/postgres-data .docker/.docker-build-backup-3197817
```

If you still use local Docker for development, recreate the volume after removal:
```bash
docker-compose up -d  # Recreates postgres-data with correct ownership
```

**Verification**: `ADMIN_JWT_SECRET=test pnpm next build` completes without `EACCES` errors.

---

## Task 2: Commit Quick Fixes (LLM — No TDD)

**Status**: Pending (changes already applied, needs commit after Task 1)
**Type**: Single commit
**Depends on**: Task 1 (build must work to verify)

**Changes already applied in this session**:

1. **Next.js patched**: 15.4.7 → 15.5.12 (fixes critical RCE GHSA-9qr9-h5gf-34mp)
2. **eslint-config-next synced**: 15.4.7 → 15.5.12
3. **Password comment removed**: Deleted plaintext password hint from `lib/auth/admin-auth.ts:30`
4. **Dead dependencies removed**: `jsonwebtoken` and `@types/jsonwebtoken` (code uses `jose`)
5. **Radix UI versions pinned**: 16 packages changed from `"latest"` to `^X.Y.Z` (locked versions)
6. **react-day-picker pinned**: `"latest"` → `"^9.11.1"`
7. **react-hook-form pinned**: `"latest"` → `"^7.65.0"`
8. **CSP hardened**: Removed `unsafe-eval` from Content-Security-Policy in `vercel.json`
9. **prisma moved to devDependencies**: CLI tool doesn't belong in production deps

**Files modified**:
- `package.json` — dependency changes
- `pnpm-lock.yaml` — lockfile updated
- `lib/auth/admin-auth.ts` — password comment removed
- `vercel.json` — CSP fix

**Verification**:
```bash
pnpm type-check           # Must pass (confirmed passing)
pnpm audit --production   # Should show 7 vulnerabilities (down from 13)
ADMIN_JWT_SECRET=test pnpm next build  # Must pass (requires Task 1 first)
```

**Commit message**: `fix(security): patch Next.js RCE, harden CSP, remove dead deps, pin versions`

---

## Task 3: Align CI Node.js Version (LLM — No TDD)

**Status**: Pending
**Type**: Config change
**Depends on**: Task 2

**Problem**: CI uses Node 20, local development runs Node 25.6.0. This 5-major-version gap causes incompatibilities (root cause of test suite failure).

**Changes needed**:

1. Update `.github/workflows/ci.yml`:
   - Change `NODE_VERSION: '20'` to `NODE_VERSION: '22'`
   - Node 22 is the current LTS (active until April 2027)

2. Create `.node-version` file in project root:
   ```
   22
   ```
   This signals the expected Node version to version managers (fnm, nvm, volta).

3. Update `pnpm` version in CI if needed:
   - Current: `PNPM_VERSION: '9'`
   - Local: pnpm 10.13.1
   - Update to `PNPM_VERSION: '10'` to match local

**Files to modify**:
- `.github/workflows/ci.yml` — Node 22, pnpm 10
- `.node-version` (new file) — `22`

**Verification**:
```bash
# CI passes on next push (verify via GitHub Actions)
```

**Commit message**: `ci: upgrade Node.js to 22 LTS and pnpm to 10`

---

## Task 4: Fix Test Suite — MSW + Node.js Compatibility (/tdd)

**Status**: Pending
**Type**: TDD workflow — multi-file infrastructure change
**Depends on**: Task 3 (Node version alignment)

**Problem**: All 77 test files fail with:
```
TypeError: localStorage.getItem is not a function
 ❯ CookieStore.getCookieStoreIndex (msw/src/core/utils/cookieStore.ts:43:40)
```

MSW 2.11.5's CookieStore assumes localStorage exists in the test environment. jsdom on Node 22+ handles localStorage differently than Node 20.

**Root cause**: `vitest.setup.ts` (555 lines) manually polyfills web platform APIs (Request, Response, Headers, ReadableStream, WritableStream, TransformStream, NextResponse, NextRequest) that were necessary for Node 18/20 but are now native in Node 22+. These polyfills conflict with MSW's expectations of the real APIs.

**Approach (Option B — modernize)**:

1. **Upgrade MSW**: 2.11.5 → latest 2.x (currently 2.12.10)
   - Check MSW 2.12+ changelog for localStorage/CookieStore fixes

2. **Strip obsolete polyfills from `vitest.setup.ts`**:
   - Remove: `TextEncoder`, `TextDecoder` polyfills (native since Node 18)
   - Remove: `Request`, `Response`, `Headers` polyfills (native since Node 18)
   - Remove: `ReadableStream`, `WritableStream`, `TransformStream` polyfills (native since Node 18)
   - Remove: `NextResponse` polyfill (should be handled by the `next/server` mock)
   - Keep: `BroadcastChannel` polyfill (verify if still needed on Node 22)
   - Keep: `IntersectionObserver`, `ResizeObserver`, `matchMedia` mocks (browser-only APIs)
   - Keep: `scrollIntoView`, `hasPointerCapture` mocks (browser-only APIs)
   - Keep: `nodemailer`, `jose`, `bcryptjs` mocks (test isolation)
   - Keep: `next/router`, `next/navigation`, `next/server` mocks (test isolation)

3. **Verify `next/server` mock works with MSW**:
   - The `next/server` mock in setup creates custom `NextResponse`/`NextRequest` classes
   - May need updating to extend the real `Response`/`Request` instead of polyfilled versions

4. **Fix `console.error`/`console.warn` suppression**:
   - Currently swallows all console output globally
   - Replace with targeted suppression (only catch React violations, let other errors through)

5. **Run full test suite**: Verify all 744+ tests pass
6. **Run quality gates**: `pnpm quality:gates`

**Key files**:
- `vitest.setup.ts` — Main target (rewrite from 555 lines to ~200)
- `__tests__/setup/server.ts` — MSW server setup (may need updates)
- `__tests__/setup/handlers.ts` — MSW handlers (verify compatibility)
- `package.json` — MSW version bump

**Success criteria**:
- All 77 test files execute without `localStorage` error
- Test pass rate >= 99% (744+ tests)
- Zero skipped tests
- `pnpm type-check` passes
- `pnpm lint` passes

**Estimated complexity**: Medium-high. The polyfill removal is straightforward, but there may be cascading failures in individual test files that relied on the polyfill behavior.

---

## Task 5: Upgrade Prisma 6 → 7 (/tdd)

**Status**: Pending
**Type**: TDD workflow — major dependency upgrade
**Depends on**: Task 4 (tests must work first)

**Problem**: Prisma 6.17.1 → 7.4.1 is a major version bump with potential breaking changes.

**Key concerns**:
- Client API changes (check migration guide)
- `@prisma/client` output path (`lib/generated/prisma`) may need updating
- Binary targets may change
- Schema syntax changes (if any)

**Approach**:
1. Read Prisma 7 migration guide
2. Update `prisma` and `@prisma/client` to `^7.0.0`
3. Run `pnpm prisma generate` — check for schema errors
4. Fix any API changes in `lib/prisma.ts`, `lib/db/` queries
5. Run full test suite
6. Run quality gates

**Files likely affected**:
- `package.json` — version bump
- `prisma/schema.prisma` — potential syntax changes
- `lib/prisma.ts` — client initialization
- Any file importing from `@prisma/client` or `lib/generated/prisma`
- Test files mocking Prisma

**Success criteria**:
- `pnpm prisma generate` succeeds
- All tests pass
- Build succeeds
- Type-check passes

---

## Task 6: Upgrade ESLint 8 → 9 (/tdd)

**Status**: Pending
**Type**: TDD workflow — major dependency upgrade
**Depends on**: Task 4 (tests must work first)
**Note**: Can run in parallel with Task 5

**Problem**: ESLint 8.57.1 → 9.x+ requires migration to flat config format. ESLint 8 is EOL.

**Key concerns**:
- `.eslintrc.*` → `eslint.config.js` (flat config migration)
- `@typescript-eslint/eslint-plugin` 7.x → 8.x
- `@typescript-eslint/parser` 7.x → 8.x
- `eslint-plugin-react-hooks` 4.x → 7.x (changed API)
- `eslint-config-prettier` 9.x → 10.x
- `eslint-config-next` already updated to 15.5.12

**Approach**:
1. Read ESLint 9 migration guide and @typescript-eslint v8 guide
2. Create `eslint.config.js` (flat config) from existing `.eslintrc.*`
3. Update all ESLint-related packages
4. Run `pnpm lint` — fix any new violations
5. Verify CI passes

**Note**: Skip ESLint 10 — go to 9 first (stable, well-documented migration path). ESLint 10 is very recent and may have ecosystem gaps.

**Files likely affected**:
- `.eslintrc.*` → `eslint.config.js` (replace)
- `package.json` — version bumps for 6 packages
- Possibly source files if new lint rules flag existing code

**Success criteria**:
- `pnpm lint` passes with zero errors
- CI lint job passes
- No suppressed warnings without justification

---

## Task 7: Upgrade Vitest 3 → 4 (/tdd)

**Status**: Pending
**Type**: TDD workflow — major dependency upgrade
**Depends on**: Task 4 (test infrastructure must be stable first)
**Note**: Run AFTER Tasks 5 and 6 to minimize variables

**Problem**: Vitest 3.2.4 → 4.0.18. Major version with potential config and API changes.

**Key concerns**:
- `vitest.config.ts` changes (check migration guide)
- `@vitest/coverage-v8` and `@vitest/ui` must match
- `@vitejs/plugin-react` compatibility
- `vite` 7.x compatibility with Vitest 4

**Approach**:
1. Read Vitest 4 migration guide
2. Update `vitest`, `@vitest/coverage-v8`, `@vitest/ui` together
3. Update config files if API changed
4. Run full test suite
5. Run quality gates

**Files likely affected**:
- `package.json` — version bumps
- `vitest.config.ts` — potential config changes
- `vitest.config.critical.ts` — same
- `vitest.config.accessibility.ts` — same
- `vitest.setup.ts` — potential setup API changes

**Success criteria**:
- All tests pass
- Coverage reporting works
- CI test jobs pass

---

## Remaining Vulnerabilities (Non-Actionable)

After Task 2, 7 vulnerabilities remain. All are in transitive dependencies:

- **`@types/nodemailer` → `@aws-sdk/client-ses` → `fast-xml-parser`**: 1 critical, 3 high. This project doesn't use AWS SES — the vulnerability is in an unused dependency of a type definition package. No fix available without upgrading `@types/nodemailer` to v7 (major).
- **`glob`/`minimatch` (via jscpd)**: 1 high. Dev-only tooling, not a production risk.
- **`@smithy/config-resolver`**: 1 low. Transitive, unused.

**Action**: Upgrade `@types/nodemailer` to v7 when doing Task 5 (Prisma upgrade) to batch dependency work. Or remove it entirely — Nodemailer 7.x includes its own types.

---

## Task Dependency Order

```
Task 1 (manual: rm docker data)
  └→ Task 2 (commit quick fixes)
       └→ Task 3 (CI Node/pnpm version)
            └→ Task 4 (/tdd: fix test suite — MSW + polyfills)
                 ├→ Task 5 (/tdd: Prisma 6→7)
                 ├→ Task 6 (/tdd: ESLint 8→9)
                 └→ Task 7 (/tdd: Vitest 3→4) — after 5 and 6
```

Tasks 5 and 6 can run in parallel after Task 4 completes. Task 7 should run last to minimize variables.
