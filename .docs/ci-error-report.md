# GitHub CI/CD Pipeline Error Report

**Repository:** etrusk/moodovermuscle  
**Workflow:** CI/CD  
**Run ID:** 18547092777  
**Branch:** main  
**Commit:** 7c9fb677e53e6844d88f0ce9cc58a1cbe6055bf3  
**Run Date:** 2025-10-16T01:07:30Z  
**Status:** ❌ FAILED  
**URL:** https://github.com/etrusk/moodovermuscle/actions/runs/18547092777

---

## Executive Summary

The CI/CD pipeline failed with **5 out of 7 jobs failing**. The failures fall into two main categories:

1. **Missing npm scripts** (3 jobs) - Scripts referenced in workflow don't exist in package.json
2. **Build failures** (2 jobs) - Missing environment variable causing build process to fail

---

## Failed Jobs Overview

| Job | Status | Duration | Error Type |
|-----|--------|----------|------------|
| test-critical | ❌ Failed | ~30s | Missing npm script |
| build | ❌ Failed | ~56s | Missing environment variable |
| size-check | ❌ Failed | ~55s | Missing environment variable |
| test-accessibility | ❌ Failed | ~1m 46s | Missing npm script |
| test-integration | ❌ Failed | ~22s | Invalid vitest option |

---

## Detailed Error Analysis

### 1. test-critical Job

**Job ID:** 52867151636  
**Status:** ❌ Failed  
**Duration:** 30 seconds  
**Step Failed:** Run critical tests

#### Error Message
```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "test:critical:ci" not found

Did you mean "pnpm test:critical"?
```

#### Root Cause
The workflow attempts to run `pnpm test:critical:ci`, but this script does not exist in [`package.json`](package.json).

#### Stack Trace
```
Command executed: pnpm test:critical:ci
Exit code: 254
```

#### Fix Required
**Option 1:** Add the missing script to package.json:
```json
{
  "scripts": {
    "test:critical:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

**Option 2:** Update [`.github/workflows/ci.yml`](.github/workflows/ci.yml) to use existing script:
```yaml
- name: Run critical tests
  run: pnpm test:critical
```

---

### 2. build Job

**Job ID:** 52867151706  
**Status:** ❌ Failed  
**Duration:** 56 seconds  
**Step Failed:** Build application

#### Error Message
```
Error: ADMIN_JWT_SECRET must be set in production
    at <unknown> (.next/server/app/api/admin/login/route.js:1:1866)
    at new h (.next/server/app/api/admin/login/route.js:1:1919)
    at 12918 (.next/server/app/api/admin/login/route.js:1:1952)
    at c (.next/server/webpack-runtime.js:1:127)
    at 98071 (.next/server/app/api/admin/login/route.js:1:3591)
```

#### Root Cause
The Next.js build process is failing because `ADMIN_JWT_SECRET` environment variable is required during build time but not provided in the GitHub Actions environment.

#### Stack Trace
```
Command: pnpm build
Build Stage: Collecting page data
Failed Route: /api/admin/login
Error: Failed to collect page data for /api/admin/login
Exit code: 1
```

#### Build Warnings (Non-Critical)
```
./node_modules/.pnpm/bcryptjs@3.0.2/node_modules/bcryptjs/index.js
- A Node.js module is loaded ('crypto' at line 32) which is not supported in the Edge Runtime.
- A Node.js API is used (process.nextTick, setImmediate) which is not supported in the Edge Runtime.
```

#### Fix Required
**Option 1:** Add environment variable to GitHub Actions secrets and update workflow:
```yaml
- name: Build application
  run: pnpm build
  env:
    ADMIN_JWT_SECRET: ${{ secrets.ADMIN_JWT_SECRET }}
```

**Option 2:** Modify code to handle missing env var during build:
- Update [`lib/auth/admin-auth.ts`](lib/auth/admin-auth.ts) to defer secret validation until runtime
- Use a placeholder during build: `ADMIN_JWT_SECRET: "build-time-placeholder"`

**Recommended:** Use Option 1 with actual secret value configured in GitHub repository settings.

---

### 3. size-check Job

**Job ID:** 52867151708  
**Status:** ❌ Failed  
**Duration:** 55 seconds  
**Step Failed:** Build application

#### Error Message
```
Error: ADMIN_JWT_SECRET must be set in production
    at <unknown> (.next/server/app/api/admin/login/route.js:1:1866)
    at new h (.next/server/app/api/admin/login/route.js:1:1919)
```

#### Root Cause
Same as build job - the size-check job requires building the application first, which fails due to missing `ADMIN_JWT_SECRET`.

#### Stack Trace
```
Command: pnpm build
Exit code: 1
```

#### Fix Required
Same fix as build job - add `ADMIN_JWT_SECRET` to the workflow environment variables.

---

### 4. test-accessibility Job

**Job ID:** 52867151716  
**Status:** ❌ Failed  
**Duration:** 1 minute 46 seconds  
**Step Failed:** Run comprehensive accessibility tests

#### Error Message
```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "accessibility:ci" not found

Did you mean "pnpm accessibility:report"?
```

#### Root Cause
The workflow attempts to run `pnpm accessibility:ci`, but this script does not exist in [`package.json`](package.json).

#### Stack Trace
```
Command executed: pnpm accessibility:ci
Exit code: 254
```

#### Fix Required
**Option 1:** Add the missing script to package.json:
```json
{
  "scripts": {
    "accessibility:ci": "playwright test -c playwright.config.accessibility.ts"
  }
}
```

**Option 2:** Update [`.github/workflows/ci.yml`](.github/workflows/ci.yml) to use existing script:
```yaml
- name: Run comprehensive accessibility tests
  run: pnpm accessibility:report
```

**Note:** The job successfully installed Playwright browsers before failing, so the setup is correct.

---

### 5. test-integration Job

**Job ID:** 52867151737  
**Status:** ❌ Failed  
**Duration:** 22 seconds  
**Step Failed:** Run integration tests

#### Error Message
```
CACError: Unknown option `--grep`
    at Command.checkUnknownOptions (vitest@3.2.4/.../cac.Cb-PYCCB.js:404:17)
    at CAC.runMatchedCommand (vitest@3.2.4/.../cac.Cb-PYCCB.js:604:13)
    at CAC.parse (vitest@3.2.4/.../cac.Cb-PYCCB.js:545:12)
```

#### Root Cause
The script `test:integration:ci` in package.json uses `--grep` option which is not supported in Vitest 3.2.4. This option was renamed to `--testNamePattern` or should use `--include` pattern.

#### Stack Trace
```
Command: vitest run --grep integration --passWithNoTests
Exit code: 1
Node.js version: v20.19.5
```

#### Current Script
```json
{
  "scripts": {
    "test:integration:ci": "vitest run --grep integration --passWithNoTests"
  }
}
```

#### Fix Required
Update the script in [`package.json`](package.json) to use the correct Vitest option:

**Option 1:** Use file pattern matching:
```json
{
  "scripts": {
    "test:integration:ci": "vitest run --include **/*.integration.test.{ts,tsx} --passWithNoTests"
  }
}
```

**Option 2:** Use testNamePattern:
```json
{
  "scripts": {
    "test:integration:ci": "vitest run --testNamePattern=integration --passWithNoTests"
  }
}
```

**Recommended:** Use Option 1 with file pattern matching as it's more explicit and reliable.

---

## Skipped Jobs

### deploy Job

**Job ID:** 52867237289  
**Status:** ⏭️ Skipped  
**Reason:** Depends on failed jobs (build job must succeed for deployment)

---

## Action Items Summary

### High Priority (Blocking All Builds)

1. **Add ADMIN_JWT_SECRET to GitHub Actions**
   - Navigate to: Repository Settings → Secrets and variables → Actions
   - Add new secret: `ADMIN_JWT_SECRET` with appropriate value
   - Update workflow to inject this secret during build steps
   - **Affects:** build, size-check jobs
   - **Files to modify:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

### Medium Priority (Test Failures)

2. **Add missing npm script: test:critical:ci**
   - **Affects:** test-critical job
   - **File to modify:** [`package.json`](package.json)
   - Add script: `"test:critical:ci": "vitest run --coverage --reporter=verbose"`

3. **Fix vitest --grep option**
   - **Affects:** test-integration job
   - **File to modify:** [`package.json`](package.json)
   - Replace `--grep` with `--include` pattern or `--testNamePattern`

4. **Add missing npm script: accessibility:ci**
   - **Affects:** test-accessibility job
   - **File to modify:** [`package.json`](package.json)
   - Add script: `"accessibility:ci": "playwright test -c playwright.config.accessibility.ts"`

### Low Priority (Warnings)

5. **Review Edge Runtime compatibility warnings**
   - **Affects:** build, size-check jobs (warnings only)
   - **File to review:** [`lib/auth/admin-auth.ts`](lib/auth/admin-auth.ts)
   - Consider using Edge Runtime compatible alternatives to bcryptjs if using Edge middleware

---

## Recommended Fix Order

1. **First:** Add `ADMIN_JWT_SECRET` to GitHub Actions secrets and update workflow
2. **Second:** Fix the three missing/incorrect npm scripts in package.json
3. **Third:** Address Edge Runtime warnings (optional)

---

## Verification Steps

After implementing fixes:

1. Verify all scripts exist in package.json:
   ```bash
   pnpm test:critical:ci
   pnpm test:integration:ci
   pnpm accessibility:ci
   ```

2. Verify environment variables are accessible:
   ```bash
   echo $ADMIN_JWT_SECRET
   ```

3. Test build locally:
   ```bash
   ADMIN_JWT_SECRET="test-secret" pnpm build
   ```

4. Push changes and monitor new CI run at:
   https://github.com/etrusk/moodovermuscle/actions

---

## Additional Context

### Workflow Configuration
- **File:** `.github/workflows/ci.yml`
- **Node Version:** 20
- **Package Manager:** pnpm 9
- **CI Environment:** Ubuntu 24.04.3 LTS
- **Runner:** GitHub Actions (ubuntu-24.04)

### Dependencies Status
- All dependencies installed successfully
- Playwright browsers installed correctly for accessibility tests
- Build cache working correctly

### Related Files
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) - CI workflow configuration
- [`package.json`](package.json) - npm scripts and dependencies
- [`lib/auth/admin-auth.ts`](lib/auth/admin-auth.ts) - Admin authentication module requiring JWT secret

---

**Report Generated:** 2025-10-16T01:12:31Z  
**Generated By:** GitHub CLI (gh version 2.81.0)