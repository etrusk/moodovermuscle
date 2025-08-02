# Development Workflows

## Git & Deployment Process

### Branch Strategy: GitHub Flow

- **Main Branch**: `main` (production-ready, auto-deploys to Vercel)
- **Feature Development**: Direct feature branches from main
- **Vercel Integration**: Automatic preview deploys on all PRs
- **Client Approval**: Required gate before production releases

### Branch Naming Conventions

```
feature/MOM-123-add-calendar-integration
bugfix/MOM-200-fix-mobile-booking-form
hotfix/MOM-300-urgent-security-patch
```

### Commit Message Standards (Conventional Commits)

```
<type>(<scope>): <subject>

feat(booking): add calendar integration with Google Calendar API
fix(ui): resolve mobile booking form validation issues
docs(api): update booking endpoint documentation
```

### Pull Request Process

- **Required Approvals**: 1 team member review
- **Status Checks**: lint, test, build, size-check, lighthouse
- **Merge Strategy**: Squash and merge for clean history
- **Branch Protection**: Force push restrictions, up-to-date requirements

### Development Workflow

1. Check existing terminal windows before starting servers
2. Run development server on port 3000 if not already running
3. Create feature branch from main: `git checkout -b feature/MOM-XXX-description`
4. Implement changes with TDD approach
5. Use agentic LLM assistance for complex features
6. Manual testing assistance when debugging issues arise
7. Open PR with comprehensive description and testing instructions

## Testing Strategy

### Test Pyramid Architecture

- **Unit Tests**: Jest + React Testing Library (fast feedback loop)
- **Integration Tests**: MSW for realistic API mocking
- **E2E Tests**: Playwright for critical user journeys
- **Performance Tests**: Privacy-focused Lighthouse CI with automated quality gates and build blocking

### Testing Tools Integration

```typescript
// Jest Configuration
const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/msw-setup.js',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
}
```

### Test Execution Commands

- **Critical Tests**: `npm run test:critical` (fast feedback for commits)
- **Full Suite**: `npm run test` (comprehensive coverage)
- **E2E Testing**: `npm run test:e2e` (user journey validation)
- **Performance Testing**: `npm run lighthouse:test` (automated quality gates with build blocking)
- **Watch Mode**: `npm run test:watch` (TDD development)

### Test Organization

```
__tests__/
├── api/                    # API route tests
├── components/             # Component unit tests
├── lib/                    # Utility function tests
├── integration/            # MSW integration tests
├── setup/                  # Test configuration
└── constants/              # Maintainable test data

e2e/
├── booking-wizard.spec.ts  # Complete booking flow
├── mobile-accessibility.spec.ts  # A11y compliance
└── booking-form-calendar.spec.ts  # Calendar interaction
```

### Quality Gates Framework

#### Critical Gates (Never Bypass)

- Type checking failures
- Linting errors
- Build failures
- Security vulnerabilities
- Core business logic test failures
- **Lighthouse CI Critical Gates**:
  - Accessibility ≥90% (WCAG compliance)
  - SEO ≥90% (search visibility)
  - Best Practices ≥85% (security standards)
  - LCP <2.5s (Core Web Vital)
  - CLS <0.1 (Core Web Vital)
  - Color contrast 100% (critical accessibility)
  - Image alt text 100% (critical accessibility)
  - Meta descriptions 100% (SEO essential)
  - HTTPS 100% (security requirement)

#### Non-Critical Gates (Can Bypass with Tracking)

- Integration test failures → Document in [`.docs/debt.md`](.docs/debt.md) with timeline
- Performance regressions → Track in [`.docs/debt.md`](.docs/debt.md) with impact assessment
- Minor accessibility issues → Plan remediation in [`.docs/debt.md`](.docs/debt.md)
- **Lighthouse CI Warning Gates**:
  - Performance ≥85% (overall score)
  - FCP <2s (loading experience)
  - TBT <300ms (interactivity)
  - Total byte weight <1MB (resource budget)
  - DOM size <1500 elements (performance budget)

### Testing Patterns

#### API Route Testing

```typescript
// Custom NextRequest helper
function makeJsonRequest(data: Record<string, unknown>): NextRequest {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  return new NextRequest('http://localhost/api/book-session', {
    method: 'POST',
    body: blob,
  })
}
```

#### MSW Integration Testing

```typescript
// Realistic API mocking at network level
export const handlers = [
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequestBody

    if (body.email === 'fail@example.com') {
      return new HttpResponse(
        JSON.stringify({ message: 'Internal Server Error' }),
        { status: 500 }
      )
    }

    return new HttpResponse(
      JSON.stringify({ message: 'Booking submitted successfully!' }),
      { status: 200 }
    )
  }),
]
```

#### E2E Accessibility Testing

```typescript
test('Complete booking flow with accessibility validation', async ({
  page,
}) => {
  // Multi-step form testing with a11y validation
  await page.getByPlaceholder('Your beautiful name').fill('Jane Doe')

  const btn = page.getByRole('button', { name: 'Book session' })
  await btn.click()
  await expect(btn).toHaveAttribute('aria-busy', 'true')
  await expect(btn).toHaveAttribute('disabled', '')
})
```

## Deployment Automation

### Vercel Integration

- **Production Deployment**: Every merge to main
- **Preview Deployments**: Every pull request gets unique URL
- **Environment Variables**: Managed via Vercel dashboard
- **Rollback**: One-click rollback through Vercel interface

### CI/CD Pipeline (GitHub Actions)

```yaml
# Workflow triggers: pushes and PRs to main
jobs:
  - lint-and-typecheck: Code quality validation
  - test: Unit and integration tests
  - build: Application build verification
  - size-check: Bundle size monitoring
  - lighthouse: Privacy-focused performance audits with automated quality gates and build blocking
```

### Performance Monitoring

- **Vercel Analytics**: Zero-maintenance user behavior tracking
- **SpeedInsights**: Real-time Core Web Vitals (LCP, FID, CLS)
- **Privacy-Focused Lighthouse CI**: Automated quality gates with build blocking
- **Build Monitoring**: Bundle size tracking and alerts

#### Lighthouse CI Workflow Integration

**Development Workflow**

```bash
# Standard development testing (zero manual intervention required)
npm run lighthouse:test          # Complete automated validation with quality gates
# Exit codes: 0 = Pass (proceed), 1 = Fail (fix issues listed)

# Quality gate validation on existing reports
npm run lighthouse:validate      # Check quality gates without running new tests

# Performance summary and detailed results
npm run lighthouse:check         # View comprehensive performance metrics

# Manual cleanup (if needed)
npm run lighthouse:clean         # Clean Chrome profile manually
```

**Pre-commit Integration**

```bash
# Add to .husky/pre-commit for automated quality enforcement
npm run lint
npm run type-check
npm run lighthouse:test          # Blocks commits if quality gates fail
```

**Quality Gate Results Interpretation**

✅ **Quality Gates Passed**

```
🎉 AUTOMATED QUALITY GATES: PASSED
✅ Build can proceed to deployment

Performance:     91% (threshold: 85%)
Accessibility:   100% (threshold: 90%)
Best Practices:  96% (threshold: 85%)
SEO:             100% (threshold: 90%)
```

- **Action**: None required - proceed automatically with commit/deployment
- **Result**: Automated deployment proceeds without manual review

❌ **Quality Gates Failed**

```
🚫 AUTOMATED QUALITY GATES: FAILED
❌ Build blocked - fix issues before deployment

Failed assertions:
  - audits:largest-contentful-paint: 3200 (required: 2500)
  - categories:accessibility: 0.85 (required: 0.9)
```

- **Action**: Fix specific issues listed in output
- **Result**: Build/deployment automatically blocked until resolved

**Privacy Protection Workflow**

- **Profile Isolation**: Dedicated `~/.lighthouse-chrome-profile` (never personal browsing)
- **Automatic Cleanup**: Profile wiped before and after each test
- **Process Management**: All Chrome processes terminated after testing
- **Zero Persistent Data**: Complete cleanup prevents data accumulation

**Troubleshooting Common Issues**

_Performance Failures_

```bash
# LCP > 2.5s: Optimize images, reduce server response time
# CLS > 0.1: Fix layout shifts, reserve space for dynamic content
# FCP > 2s: Optimize critical rendering path
```

_Accessibility Failures_

```bash
# Add alt text to images
# Improve color contrast ratios
# Add proper form labels
# Ensure keyboard navigation
```

_SEO Issues_

```bash
# Add meta descriptions
# Ensure proper heading structure
# Optimize page titles
# Fix broken links
```

**Emergency Override (Document in Debt)**

```bash
# Skip quality gates (NOT RECOMMENDED - use only for critical hotfixes)
npm run lighthouse:local         # Run without quality gate enforcement

# REQUIRED: Document bypass in technical debt
echo "Performance regression: LCP 3.2s (budget: 2.5s) - Fix by [date]" >> .docs/debt.md
```

## Accessibility Requirements

### Compliance Standards

- **WCAG 2.1 AA**: Zero violations requirement
- **Mobile-First**: Responsive design across all devices
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Compatible with assistive technologies

### Testing Protocol

- **Automated**: Playwright accessibility audits in E2E tests
- **Manual**: Screen reader testing for complex interactions
- **Performance**: Regular accessibility performance audits
- **Continuous**: Accessibility checks in CI/CD pipeline

## Emergency Procedures

### Hotfix Process

1. **Critical Issue Identified**: Security, data corruption, or booking system failure
2. **Create Hotfix Branch**: `hotfix/MOM-XXX-description` from main
3. **Implement & Test**: Quick fix with minimal testing in preview
4. **Emergency Review**: Single reviewer approval (can be self-approved if critical)
5. **Deploy**: Merge to main triggers automatic production deployment
6. **Monitor**: Watch for resolution and any side effects

### Rollback Procedures

- **Vercel Dashboard**: One-click rollback to previous deployment
- **Git Revert**: Create revert PR if rollback not sufficient
- **Database**: Manual intervention if schema changes involved
- **Monitoring**: Verify system health after rollback

## Collaboration Guidelines

### Daily Development Flow

1. **Sync**: `git pull origin main` to get latest changes
2. **Branch**: Create descriptive feature branch
3. **TDD Cycle**: Red-green-refactor with Jest watch mode
4. **Commit**: Use conventional commit messages
5. **Test**: Run critical tests before push
6. **PR**: Comprehensive description with testing instructions
7. **Review**: Address feedback and merge when approved

### Code Review Checklist

- [ ] **Functionality**: Works as expected
- [ ] **Performance**: No regressions
- [ ] **Security**: No vulnerabilities
- [ ] **Accessibility**: WCAG 2.1 compliance
- [ ] **Mobile**: Responsive design verified
- [ ] **Tests**: Adequate coverage
- [ ] **Documentation**: Updated as needed
