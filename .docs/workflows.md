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
- **Performance Tests**: Privacy-focused Lighthouse CI with automated quality gates

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

#### Non-Critical Gates (Can Bypass with Tracking)

- Integration test failures → Document in debt.md with timeline
- Performance regressions → Track in debt.md with impact assessment
- Minor accessibility issues → Plan remediation in debt.md

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
  - lighthouse: Privacy-focused performance audits with automated quality gates
```

### Performance Monitoring

- **Vercel Analytics**: Zero-maintenance user behavior tracking
- **SpeedInsights**: Real-time Core Web Vitals (LCP, FID, CLS)
- **Privacy-Focused Lighthouse CI**: Automated quality gates with build blocking
- **Build Monitoring**: Bundle size tracking and alerts
- **Local Testing**: `npm run lighthouse:test` for development validation

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
