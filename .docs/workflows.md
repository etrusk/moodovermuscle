# Appetite-Based Development Workflows

## Workflow Philosophy

**Appetite-Driven Development**: Workflows optimized for single developer + agentic LLM collaboration with time-boxed appetites rather than deadline-driven timelines.

**Core Principles**:

- **Quality Gates Over Speed**: Critical gates never bypassed regardless of appetite pressure
- **Agent Collaboration**: Workflows designed for Architect → Code → Debug → Resolution handoffs
- **Scope Flexibility**: Features shaped to fit appetite rather than appetite extended for features
- **Institutional Memory**: Patterns captured for future appetite estimation and risk assessment

## Git & Deployment Process

### Branch Strategy: Preview-First GitHub Flow

- **Main Branch**: `main` (production-ready, auto-deploys to Vercel Production)
- **Feature Development**: Appetite-scoped branches from main
- **Vercel Integration**: Automatic preview deploys on all PRs (Vercel Preview environment)
- **Preview-First Rule**: ALL functionality changes MUST go to preview for client approval before production
- **Appetite Gates**: Required scope validation before appetite completion

#### Preview-First Workflow Requirements

**MANDATORY for functionality changes**:

1. Create feature branch from main
2. Implement changes and pass quality gates
3. Push to feature branch → triggers Vercel Preview deployment
4. **PAUSE**: Use `ask_followup_question` tool to confirm client approval
   - Share preview URL with human for client review
   - Wait for explicit human confirmation that client has approved changes
   - Do NOT proceed to merge without human confirmation
5. Only merge to main after confirmed client approval
6. Main merge triggers Vercel Production deployment

**Human Confirmation Protocol**:

- Roo must explicitly ask: "Has the client reviewed and approved the changes at [preview-URL]?"
- Provide suggested responses: "Yes, client approved" / "No, needs changes" / "Client requested modifications"
- Never assume approval - always wait for explicit human confirmation

**Exceptions (can test locally, direct to main)**:

- Documentation updates (`.docs/`, `README.md`, etc.)
- Configuration changes (linting, testing, build tools)
- Internal tooling improvements
- Bug fixes that don't change user-facing functionality

### Branch Naming Conventions (Appetite-Aware)

```
feature/profile-editing                    # Appetite-scoped feature
feature/calendar-integration              # Clear scope indication
hotfix/security-patch                     # Emergency fixes
investigation/performance-analysis        # Investigation branch
```

**Branch Lifecycle**:

- Create from main: `git checkout -b feature/appetite-description`
- Short-lived: Complete within single appetite
- Auto-delete after merge to keep repository clean

### Commit Message Standards (Conventional Commits)

```
<type>(<scope>): <subject>

feat(profile): add user profile editing with avatar upload
fix(auth): resolve JWT token validation edge case
docs(handoff): update architect-to-code template
test(booking): add integration tests for conflict detection
refactor(api): simplify user endpoint error handling
```

**Commit Types**:

- `feat`: New features or enhancements
- `fix`: Bug fixes and corrections
- `docs`: Documentation updates
- `test`: Test additions or modifications
- `refactor`: Code improvements without functionality changes
- `perf`: Performance improvements
- `style`: Code formatting and style changes

### Pre-Commit Quality Gates (Automated)

**Critical Gates (Must Pass Before Any Commit)**:

```bash
# Automatic execution via husky pre-commit hooks
npm run lint                     # ESLint + Prettier (auto-fix where possible)
npm run type-check               # TypeScript compilation
npm run test:critical            # Essential tests only (< 30 seconds)
npm run security:scan            # Security vulnerability detection
npm run build:verify             # Build verification
```

**Pre-Commit Hook Configuration**:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:critical && npm run security:scan",
      "pre-push": "npm run test:full && npm run build:verify"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### Pull Request Process (Appetite-Scoped)

#### PR Template (Quality-Focused)

```markdown
## Changes Made

Brief description of what was implemented within appetite scope.

## Preview-First Workflow Compliance

- [ ] **Functionality Change**: This PR contains user-facing functionality changes
- [ ] **Preview URL**: [Insert Vercel preview URL here]
- [ ] **Client Approval**: Client has reviewed and approved changes via preview URL
- [ ] **Non-Functionality**: This PR contains only docs/config/tooling changes (skip client approval)

## Quality Gates Status

- [x] Linting passed (ESLint + Prettier)
- [x] Type checking passed (TypeScript)
- [x] Critical tests passed
- [x] Security scan clean
- [x] Build verification successful
- [x] Accessibility validation (WCAG 2.1 AA)
- [x] Performance targets met (Core Web Vitals)

## Testing Evidence

- [ ] Unit tests added/updated for new functionality
- [ ] Integration tests verify API contracts
- [ ] E2E tests cover critical user paths
- [ ] Manual testing completed on preview deployment

## Appetite Compliance

- **Original Scope**: [Brief appetite description]
- **Delivered Scope**: [What was actually completed]
- **Circuit Breakers**: None triggered | [Description if scope expanded]

## Review Notes

Any specific areas requiring reviewer attention or context for decisions made.
```

### Development Workflow (Quality-First)

1. **Appetite Planning**: Review .docs/spec.md for current appetite scope
2. **Design Review** (for complex features): Document design decisions before implementation
3. **Branch Creation**: `git checkout -b feature/descriptive-name`
4. **Environment Verification**: Ensure dev server, tests, and tools working
5. **TDD Implementation**: Red-green-refactor with continuous quality gates
6. **Continuous Integration**: Pre-commit hooks enforce quality automatically
7. **Agent Collaboration**: Use .docs/handoffs/ templates for mode transitions
8. **Quality Validation**: All gates must pass regardless of appetite pressure
9. **Preview Deployment**: Automatic Vercel preview for functionality changes
10. **Client Approval**: Required for all functionality changes via preview URL
11. **Peer Review**: Required PR review before merge to main
12. **Pattern Documentation**: Capture approaches in .docs/memory/
13. **Knowledge Distribution**: Update truck number tracking for critical knowledge

## Testing Strategy (Comprehensive Quality Assurance)

### Test Pyramid (Optimized for Speed + Coverage)

```bash
# Fast feedback during development
npm run test:watch              # Jest watch mode for TDD
npm run test:critical           # Essential tests only (< 30 seconds)
npm run test:unit               # All unit tests
npm run test:integration        # API and component integration tests
npm run test:e2e                # End-to-end user journey tests

# Full validation
npm run test                    # Complete test suite
npm run test:coverage           # Coverage report generation
npm run test:ci                 # CI-optimized test run
```

### Testing Tools & Configuration

**Unit Testing**: Jest + React Testing Library

```bash
# Fast, focused unit tests
npm run test:unit               # All unit tests
npm run test:unit:watch         # Watch mode for development
npm run test:unit:coverage      # Unit test coverage report
```

**Integration Testing**: MSW (Mock Service Worker) + Testing Library

```bash
# Realistic API testing without external dependencies
npm run test:integration        # Integration test suite
npm run test:api                # API endpoint testing
npm run test:components         # Component integration tests
```

**End-to-End Testing**: Playwright

```bash
# Critical user journey protection
npm run test:e2e                # Full E2E suite
npm run test:e2e:headed         # Visual E2E testing
npm run test:e2e:debug          # Debug mode for test development
```

### Quality Gates Framework

#### Critical Gates (Never Bypass)

**Code Quality (Automated)**:

```bash
npm run lint                    # ESLint + Prettier
npm run type-check              # TypeScript compilation
npm run build                   # Production build verification
npm run security:scan           # OWASP dependency check
```

**Testing Requirements**:

```bash
npm run test:critical          # Core business logic tests (must pass)
npm run test:security          # Security-focused test suite
npm run test:accessibility     # Automated accessibility tests
```

**Performance Standards**:

```bash
npm run lighthouse:ci          # Core Web Vitals validation
npm run bundle:analyze         # Bundle size analysis
npm run perf:budget           # Performance budget enforcement
```

**Accessibility Compliance (WCAG 2.1 AA)**:

```bash
npm run a11y:test             # Automated accessibility testing
npm run a11y:audit            # Lighthouse accessibility audit
npm run a11y:contrast         # Color contrast validation
```

#### Non-Critical Gates (Track but Don't Block)

**Performance Optimizations**:

- Bundle size optimizations beyond basic requirements
- Advanced performance metrics beyond Core Web Vitals
- Progressive enhancement features

**Enhanced Testing**:

- Complex integration test scenarios
- Advanced E2E edge cases
- Performance testing under load

**Documentation Quality**:

- API documentation completeness
- Code comment quality
- README and guide updates

### Automated Code Review Integration

**ESLint Configuration** (.eslintrc.js):

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'plugin:accessibility/recommended',
    'plugin:security/recommended',
  ],
  rules: {
    // Enforce code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',

    // Accessibility enforcement
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-labels': 'error',

    // Security rules
    'security/detect-object-injection': 'error',
    'security/detect-sql-injection': 'error',
  },
}
```

**Prettier Configuration** (.prettierrc):

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Design Review Process

### When Design Review is Required

**Mandatory for**:

- New features affecting multiple components
- Changes to core business logic or data models
- Integration with external services
- Security-sensitive implementations
- Performance-critical components

**Optional for**:

- Simple CRUD operations following existing patterns
- UI component updates using established design system
- Bug fixes with clear scope
- Documentation updates

### Design Review Workflow

1. **Design Documentation**: Create design document in `.docs/designs/[feature-name].md`
2. **Stakeholder Review**: Share with human navigator for business logic validation
3. **Technical Review**: Validate against architectural constraints and patterns
4. **Implementation Planning**: Break down into appetite-sized tasks
5. **Pattern Identification**: Identify reusable patterns for institutional memory

### Design Document Template

```markdown
# Design: [Feature Name]

## Problem Statement

[What problem are we solving?]

## Proposed Solution

[High-level approach and key decisions]

## Implementation Plan

[Breakdown into appetite-sized tasks]

## Risks and Mitigations

[Potential issues and how to address them]

## Success Criteria

[How we'll know this is working]

## Truck Number Impact

[What critical knowledge needs to be distributed?]
```

## Agent Collaboration Workflows

### Enhanced Orchestration with Mandatory Cleanup

**Orchestrated Task Flow** (New Standard):

```
Architect (Design) → Code (Implementation) → Architect (Mandatory Cleanup) → Complete
```

**Automatic Transition Triggers**:
- Code mode signals "READY_FOR_CLEANUP" when all implementation complete
- Architect mode automatically handles cleanup phase (never manual prompting)
- All cleanup tasks must complete before task considered finished

### Handoff Templates (Structured Context Transfer)

**Architect → Code Handoff** (.docs/handoffs/architect-to-code.md):

```markdown
## Implementation Ready

**Branch**: Create `feature/[description]` from main
**Context Files**:

- .docs/current-task.md (implementation roadmap)
- .docs/architecture.md#[relevant-section]
- .docs/decisions/[relevant-decision].md
- .docs/designs/[feature-name].md (if design review completed)

## Quality Requirements

- Run quality gates before each commit
- Follow TDD: red-green-refactor cycle
- Update progress in .docs/current-task.md
- Update truck number tracking for new knowledge

## Success Criteria

[Clear, testable acceptance criteria]

## Circuit Breakers

[Scope boundaries - when to escalate]

## Completion Protocol

When implementation complete:
1. Mark all roadmap items as [x] in .docs/current-task.md
2. Run critical quality gates (must pass)
3. Document any technical debt
4. Signal "READY_FOR_CLEANUP" for automatic Architect transition
```

**Code → Architect Cleanup Handoff** (Automatic):

```markdown
## Implementation Complete Context

**Implementation Summary**: [What was completed within appetite]
**Patterns Applied**: [Institutional patterns used from memory]
**New Patterns Identified**: [Reusable patterns discovered]
**Technical Debt**: [Any deferred items documented]
**Quality Status**: [Critical gates passed/failed]
**Appetite Compliance**: [Within/exceeding boundaries]

## Mandatory Cleanup Scope

- Documentation synchronization (.docs/current-task.md, patterns, memory)
- Pattern extraction and indexing (if new patterns developed)
- Institutional memory updates (complexity, outcomes, lessons)
- Git operations with conventional commit messages
- Index maintenance and cross-referencing
- Final quality verification and task completion
```

**Code → Debug Handoff** (.docs/handoffs/code-to-debug.md):

```markdown
## Issue Context

**Problem**: [Specific issue description]
**Reproduction**: [Steps to reproduce]
**Environment**: [Development/testing environment details]

## Investigation Scope

**Files Involved**: [Specific files and functions]
**Recent Changes**: [What was changed recently]
**Error Messages**: [Complete error output]

## Quality Context

**Tests Failing**: [Specific test failures]
**Quality Gates**: [Which gates are failing]
**Expected Behavior**: [What should happen]
```

### Agent Mode Transitions

**Automatic Escalation Triggers**:

- Code mode: Stuck for 15 minutes → Auto-escalate to Debug
- Debug mode: No progress after 3 investigation cycles → Escalate to human
- Any mode: Quality gates failing repeatedly → Pause and escalate

**Context Preservation**:

- All mode switches update .docs/current-task.md
- Decision rationale captured in .docs/decisions/
- Learning outcomes saved in .docs/memory/

## Deployment & CI/CD (Vercel + GitHub Actions)

### Vercel Configuration (Zero-Maintenance Deployment)

**vercel.json**:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### GitHub Actions Workflow (.github/workflows/ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint and format check
        run: |
          npm run lint
          npm run prettier:check

      - name: Type checking
        run: npm run type-check

      - name: Security scan
        run: npm run security:scan

      - name: Critical tests
        run: npm run test:critical

      - name: Build verification
        run: npm run build

      - name: Accessibility audit
        run: npm run a11y:ci

      - name: Performance budget
        run: npm run lighthouse:ci

  full-test-suite:
    runs-on: ubuntu-latest
    needs: quality-gates
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run full test suite
        run: npm run test:coverage

      - name: E2E tests
        run: npm run test:e2e:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: quality-gates
    steps:
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Package.json Scripts (Complete Toolchain)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",

    "lint": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "lint:check": "eslint . --ext .js,.jsx,.ts,.tsx",
    "prettier": "prettier --write .",
    "prettier:check": "prettier --check .",
    "type-check": "tsc --noEmit",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:critical": "jest --testPathPattern=critical --passWithNoTests",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ci": "playwright test --reporter=github",
    "test:coverage": "jest --coverage",
    "test:full": "npm run test && npm run test:e2e",

    "a11y:test": "jest --testPathPattern=accessibility",
    "a11y:audit": "lighthouse --only-categories=accessibility",
    "a11y:ci": "jest --testPathPattern=accessibility --passWithNoTests",

    "security:scan": "audit-ci --config audit-ci.json",
    "security:test": "jest --testPathPattern=security",

    "lighthouse:ci": "lhci autorun",
    "perf:budget": "bundlesize",
    "bundle:analyze": "ANALYZE=true npm run build",

    "quality:all": "npm run lint && npm run type-check && npm run test:critical && npm run security:scan",
    "ci:verify": "npm run quality:all && npm run build"
  }
}
```

## Performance & Accessibility Standards

### Core Web Vitals Requirements (Non-Negotiable)

**Performance Budgets**:

- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100 milliseconds
- Total Bundle Size: < 1MB initial load

**Lighthouse CI Configuration** (.lighthouserc.js):

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000', 'http://localhost:3000/booking'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
  },
}
```

### Accessibility Compliance (WCAG 2.1 AA)

**Automated Testing Integration**:

```javascript
// jest.accessibility.config.js
module.exports = {
  testMatch: ['**/__tests__/**/*.a11y.test.{js,ts}'],
  setupFilesAfterEnv: ['<rootDir>/jest.a11y.setup.js'],
}

// jest.a11y.setup.js
import { configureAxe } from 'jest-axe'
import 'jest-axe/extend-expect'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },
  },
})
```

**Component Accessibility Testing**:

```typescript
// Example: BookingForm.a11y.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import BookingForm from '../BookingForm'

expect.extend(toHaveNoViolations)

test('BookingForm has no accessibility violations', async () => {
  const { container } = render(<BookingForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Emergency & Recovery Procedures

### Hotfix Process (Critical Issues)

**Hotfix Workflow**:

1. **Create Branch**: `git checkout -b hotfix/critical-issue-description`
2. **Minimal Fix**: Address only the critical issue, no additional changes
3. **Quality Gates**: All critical gates must still pass
4. **Fast Review**: Single reviewer approval required
5. **Deploy**: Direct merge to main with immediate deployment
6. **Follow-up**: Document in .docs/debt.md for post-mortem

**Hotfix Quality Gates** (Reduced but not eliminated):

```bash
npm run lint                    # Still required
npm run type-check              # Still required
npm run test:critical           # Essential tests only
npm run security:scan           # Security still critical
npm run build                   # Build verification
```

### Rollback Procedures

**Vercel Rollback** (Immediate):

- One-click rollback via Vercel dashboard
- Automatic traffic routing to previous stable deployment
- DNS propagation within 30 seconds globally

**Git Rollback** (For Code Issues):

```bash
# Revert specific commit
git revert [commit-hash]

# Emergency reset (use cautiously)
git reset --hard [last-good-commit]
git push --force-with-lease
```

**Recovery Verification**:

1. Run full quality gate suite on rollback
2. Verify critical user journeys work
3. Monitor error rates and performance metrics
4. Document issue in .docs/investigations/

## Tool Configuration Files

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Jest Configuration (jest.config.js)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Playwright Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Monitoring & Analytics

### Error Tracking & Performance

**Vercel Analytics Integration**:

- Real-time Core Web Vitals monitoring
- User experience metrics tracking
- Performance trend analysis
- Zero configuration required

**Error Boundary Implementation**:

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>
    }
    return this.props.children
  }
}

export default ErrorBoundary
```

### Development Metrics

**Workflow Success Indicators**:

- Quality gate pass rate: > 95%
- Deployment success rate: > 99%
- Rollback frequency: < 1% of deployments
- Average time from commit to production: < 10 minutes

**Code Quality Metrics**:

- Test coverage: > 70% (enforced)
- ESLint violations: 0 (enforced)
- TypeScript errors: 0 (enforced)
- Security vulnerabilities: 0 critical/high (enforced)

---

**Last Updated**: 2025-08-03  
**Workflow Status**: Production-ready with comprehensive quality gates  
**Next Review**: After first month of usage to optimize based on real metrics  
**Evolution Driver**: Quality gate effectiveness and agent collaboration efficiency
