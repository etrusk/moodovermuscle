# CI/CD Pipeline Error Report v2

**Generated:** 2025-10-16T01:24:30Z (UTC+10:00)  
**Workflow Run:** [#18547274882](https://github.com/etrusk/moodovermuscle/actions/runs/18547274882)  
**Commit:** f4a218664af51d44e6d70aded0338260398a16f1  
**Branch:** main  
**Status:** ❌ FAILED (3 of 5 jobs failed)

---

## Executive Summary

After implementing the previous CI/CD fixes (adding missing npm scripts and environment variables), **3 jobs still fail**:

1. **test-accessibility** - Playwright test failures (expect API and accessibility violations)
2. **test-integration** - Unknown Vitest CLI option error
3. **size-check** - Missing ADMIN_JWT_SECRET during build

### ✅ Jobs Now Passing (Previously Failed)
- **lint-and-typecheck** - Successfully resolved with script additions
- **build** - Successfully resolved with ADMIN_JWT_SECRET environment variable

---

## Detailed Failure Analysis

### 1. test-accessibility Job ❌

**Job ID:** 52867636841  
**Duration:** ~4 minutes  
**Status:** Failed at step "Run comprehensive accessibility tests"

#### Error Summary
- **3 failed tests** across all browsers (chromium, firefox, mobile)
- **1 flaky test** (mobile viewport)
- **Error Type 1:** `ReferenceError: expect is not defined` 
- **Error Type 2:** Accessibility violations (color contrast)

#### Detailed Errors

##### Error 1: ReferenceError in Test Code
```
ReferenceError: expect is not defined

  41 |     const tester = new PlaywrightAccessibilityTester(page)
  42 |     const expectedError = {
> 43 |       message: expect.any(String)
     |                ^
  44 |     }
```

**File:** [`e2e/accessibility-comprehensive.spec.ts:43`](e2e/accessibility-comprehensive.spec.ts:43)  
**Test:** "throws error when accessibility violations found"  
**Affected Browsers:** chromium, firefox, mobile (all failed with same error)

**Root Cause:** The test uses `expect.any(String)` from Jest/Vitest API, but `expect` is not imported or available in the Playwright test context.

**Impact:** This test cannot verify error handling for accessibility violations.

##### Error 2: Color Contrast Violation (Flaky)
```
Error: Accessibility violations found:

Violation: color-contrast - Elements must meet minimum color contrast ratio thresholds
Impact: serious
  Selector: .text-primary-foreground
    Failure Summary: Fix any of the following:
  Element has insufficient color contrast of 4.17 
  (foreground color: #fafafa, background color: #e0345c, 
   font size: 10.5pt (14px), font weight: normal). 
  Expected contrast ratio of 4.5:1
```

**File:** [`e2e/utils/accessibility-helpers.ts:44`](e2e/utils/accessibility-helpers.ts:44)  
**Test:** "Booking Wizard Flow Accessibility" (mobile viewport only)  
**Status:** Flaky (passed on retry #1)

**Root Cause:** The `.text-primary-foreground` class has insufficient color contrast (4.17:1 actual vs 4.5:1 required).

**Impact:** WCAG AA compliance violation, affects users with visual impairments.

#### Recommended Fixes

**Fix 1: Import expect in Playwright Test**
```typescript
// e2e/accessibility-comprehensive.spec.ts
import { test, expect } from '@playwright/test'
import { PlaywrightAccessibilityTester } from './utils/accessibility-helpers'

test.describe('E2E Accessibility Comprehensive', () => {
  test('throws error when accessibility violations found', async ({ page }) => {
    const tester = new PlaywrightAccessibilityTester(page)
    const expectedError = {
      message: expect.any(String) // Now expect is properly imported
    }
    
    // Test implementation...
  })
})
```

**Fix 2: Adjust Color Contrast**

Option A - Update CSS color values:
```css
/* Adjust in your Tailwind config or CSS */
.text-primary-foreground {
  /* Current: #fafafa on #e0345c = 4.17:1 */
  /* Option 1: Darken background to #c02347 = 4.52:1 ✓ */
  /* Option 2: Lighten foreground to #ffffff = 4.51:1 ✓ */
}
```

Option B - Update Tailwind theme colors:
```javascript
// tailwind.config.js or theme configuration
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c02347', // Adjusted for better contrast
          foreground: '#ffffff', // Pure white for maximum contrast
        }
      }
    }
  }
}
```

**Verification Steps:**
1. Add missing import: `import { test, expect } from '@playwright/test'`
2. Run accessibility tests locally: `pnpm accessibility:ci`
3. Verify contrast with browser DevTools or [contrast checker](https://webaim.org/resources/contrastchecker/)
4. Commit and push to trigger CI

---

### 2. test-integration Job ❌

**Job ID:** 52867636852  
**Duration:** ~23 seconds  
**Status:** Failed at step "Run integration tests"

#### Error Details
```
CACError: Unknown option `--include`

    at Command.checkUnknownOptions
    at CAC.runMatchedCommand
    at CAC.parse
```

**Command Executed:**
```bash
vitest run --include **/*.integration.test.{ts,tsx} --passWithNoTests
```

**Root Cause:** Vitest 3.x no longer supports the `--include` CLI option. This was the deprecated option that should have been fixed in the previous iteration.

**Current Script:** [`package.json:44`](package.json:44)
```json
{
  "scripts": {
    "test:integration:ci": "vitest run --include **/*.integration.test.{ts,tsx} --passWithNoTests"
  }
}
```

#### Recommended Fix

**Update package.json script to use supported Vitest 3.x syntax:**

```json
{
  "scripts": {
    "test:integration:ci": "vitest run --passWithNoTests **/*.integration.test.{ts,tsx}"
  }
}
```

**Alternative (using vitest.config.ts):**

Update [`vitest.config.ts`](vitest.config.ts) to include integration test pattern:
```typescript
export default defineConfig({
  test: {
    include: [
      '__tests__/**/*.{test,spec}.{ts,tsx}',
      '__tests__/**/*.integration.test.{ts,tsx}' // Add this pattern
    ],
    // ... rest of config
  }
})
```

Then simplify the npm script:
```json
{
  "scripts": {
    "test:integration:ci": "vitest run --passWithNoTests"
  }
}
```

**Verification Steps:**
1. Update the script in [`package.json`](package.json)
2. Test locally: `pnpm test:integration:ci`
3. Verify all integration tests are discovered and run
4. Commit and push to trigger CI

---

### 3. size-check Job ❌

**Job ID:** 52867636860  
**Duration:** ~2 minutes  
**Status:** Failed at step "Check bundle size" → Build phase

#### Error Details
```
Error: ADMIN_JWT_SECRET must be set in production
    at <unknown> (.next/server/app/api/admin/login/route.js:1:1866)
    at new h (.next/server/app/api/admin/login/route.js:1:1919)
    at 12918 (.next/server/app/api/admin/login/route.js:1:1952)

> Build error occurred
[Error: Failed to collect page data for /api/admin/login] {
  type: 'Error'
}
```

**Root Cause:** The `size-check` job uses [`preactjs/compressed-size-action@v2`](https://github.com/preactjs/compressed-size-action), which runs a **separate build** that doesn't inherit environment variables from the workflow's build job.

**Current Configuration:** [`.github/workflows/ci.yml:164`](.github/workflows/ci.yml:164)
```yaml
- name: Check bundle size
  uses: preactjs/compressed-size-action@v2
  with:
    pattern: '.next/**/*.{js,css}'
    exclude: '{.next/cache/**}'
    # Missing: ADMIN_JWT_SECRET is not passed to this action
```

#### Recommended Fix

**Add environment variable to the size-check action:**

```yaml
# .github/workflows/ci.yml
size-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with:
        version: 9
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'pnpm'
    - run: pnpm install --frozen-lockfile
    - run: pnpm build
      env:
        ADMIN_JWT_SECRET: ${{ secrets.ADMIN_JWT_SECRET }}  # Add for main build
    - name: Check bundle size
      uses: preactjs/compressed-size-action@v2
      with:
        pattern: '.next/**/*.{js,css}'
        exclude: '{.next/cache/**}'
      env:
        ADMIN_JWT_SECRET: ${{ secrets.ADMIN_JWT_SECRET }}  # Add for action's build too
```

**Critical Note:** This fix **requires manual configuration** in GitHub repository settings.

#### GitHub Repository Secret Configuration Required

**⚠️ ACTION REQUIRED BY REPOSITORY OWNER:**

1. Go to: https://github.com/etrusk/moodovermuscle/settings/secrets/actions
2. Click "New repository secret"
3. Name: `ADMIN_JWT_SECRET`
4. Value: A secure random string (minimum 32 characters recommended)
   ```bash
   # Generate a secure secret (run locally):
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Or:
   openssl rand -hex 32
   ```
5. Click "Add secret"

**Verification Steps:**
1. **First:** Configure `ADMIN_JWT_SECRET` in GitHub repository secrets (above)
2. Update [`.github/workflows/ci.yml`](.github/workflows/ci.yml) to pass the secret to size-check
3. Commit and push to trigger CI
4. Verify the build succeeds in the size-check job

---

## Summary of Required Actions

### 1. Code Changes (Can be implemented immediately)

**File:** [`e2e/accessibility-comprehensive.spec.ts`](e2e/accessibility-comprehensive.spec.ts)
```typescript
// Add at top of file (if not already present)
import { test, expect } from '@playwright/test'
```

**File:** [`package.json`](package.json)
```json
{
  "scripts": {
    "test:integration:ci": "vitest run --passWithNoTests **/*.integration.test.{ts,tsx}"
  }
}
```

**File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
```yaml
# In size-check job, both steps need ADMIN_JWT_SECRET:
- run: pnpm build
  env:
    ADMIN_JWT_SECRET: ${{ secrets.ADMIN_JWT_SECRET }}

- name: Check bundle size
  uses: preactjs/compressed-size-action@v2
  with:
    pattern: '.next/**/*.{js,css}'
    exclude: '{.next/cache/**}'
  env:
    ADMIN_JWT_SECRET: ${{ secrets.ADMIN_JWT_SECRET }}
```

**File:** Tailwind theme (optional but recommended for accessibility)
```javascript
// tailwind.config.js - adjust primary colors for WCAG compliance
colors: {
  primary: {
    DEFAULT: '#c02347', // Darker for better contrast
    foreground: '#ffffff', // Pure white
  }
}
```

### 2. GitHub Repository Configuration (Requires manual action)

**⚠️ CRITICAL: Must be done before CI will pass**

1. Navigate to repository settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `ADMIN_JWT_SECRET`
   - Value: Secure random string (32+ characters)
3. Verify secret is available in Actions

### 3. Verification Checklist

After implementing all fixes:

- [ ] Import `expect` added to accessibility test
- [ ] Integration test script updated to remove `--include`
- [ ] CI workflow updated with `ADMIN_JWT_SECRET` for size-check
- [ ] `ADMIN_JWT_SECRET` configured in GitHub repository secrets
- [ ] Color contrast issue addressed (optional but recommended)
- [ ] Run tests locally to verify fixes
- [ ] Commit and push changes
- [ ] Monitor CI workflow run for success

---

## Impact Assessment

### Jobs Fixed (from previous iteration)
- ✅ **lint-and-typecheck** - Now passing
- ✅ **build** - Now passing (with ADMIN_JWT_SECRET)

### Jobs Still Failing (this iteration)
- ❌ **test-accessibility** - Test implementation issue + accessibility violation
- ❌ **test-integration** - Deprecated CLI option usage
- ❌ **size-check** - Missing environment variable in action

### Estimated Fix Time
- **Code changes:** 10-15 minutes
- **GitHub secret configuration:** 2-3 minutes
- **Testing and verification:** 5-10 minutes
- **Total:** ~20-30 minutes

### Risk Level
- **Low** - All fixes are straightforward with clear solutions
- **No breaking changes** - Fixes align with current Vitest 3.x and Playwright best practices
- **Accessibility improvement** - Color contrast fix improves WCAG compliance

---

## Related Documentation

- [Vitest 3.x Migration Guide](https://vitest.dev/guide/migration.html)
- [Playwright Test Expect API](https://playwright.dev/docs/test-assertions)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Report generated by:** Claude (Develop Mode)  
**Next Steps:** Review fixes, configure GitHub secret, implement code changes, verify CI passes