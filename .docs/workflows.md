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
npm run test:critical            # Essential tests + documentation health (< 30 seconds)
npm run security:scan            # Security vulnerability detection
npm run build:verify             # Build verification
```

### Git Staging Awareness Protocol

**CRITICAL**: Pre-commit hooks check staged content, not working directory content.

**Mandatory Pre-commit Procedure**:

```bash
# 1. Check current status
git status

# 2. Verify local quality gates
npm run lint
npm run type-check

# 3. Stage ALL current work (including fixes)
git add .

# 4. Commit with hooks enabled
git commit -m "conventional commit message"

# If commit fails:
# - Make required fixes
# - Re-stage with `git add .`
# - Retry commit
# NEVER use --no-verify unless documented emergency
```

**Common Anti-Patterns to Avoid**:

- ❌ Committing with unstaged changes to modified files
- ❌ Using `--no-verify` to bypass quality gates in routine development
- ❌ Ignoring the root cause when hooks fail repeatedly with "same" errors
- ❌ Assuming files are staged when `git status` shows "Changes not staged for commit"

**--no-verify Flag Policy**:

- **EMERGENCY ONLY**: Production down, critical security fix
- **REQUIRES**: Explicit documentation of why bypass was necessary
- **REQUIRES**: Immediate follow-up task to address bypassed issues
- **NEVER**: Acceptable for routine development or scope pressure

### Mandatory Deployment Gates (Orchestration)

**Critical Deployment Gates (Must Complete Before Task Completion)**:

```bash
# POST-IMPLEMENTATION MANDATORY SEQUENCE
git add .                        # Stage all changes
git commit -m "conventional-message"  # Commit with conventional format
git push origin [branch-name]    # Push to trigger deployment/preview
# Verify deployment success (Vercel/GitHub Actions)
```

**Orchestrator Completion Protocol Enhancement**:

- **NO TASK** can be marked complete without git commit + push
- **ALL TODO LISTS** must include deployment gates as mandatory items
- **ATTEMPT_COMPLETION** tool cannot be used until git operations verified

**Pre-Commit Hook Configuration**:

See [Package.json Pre-commit Configuration](reference/tool-configurations.md#packagejson-pre-commit-configuration) for complete setup.

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

**Documentation Health**:

- Automated staleness detection (integrated with `npm run test:critical`)
- > 90% documentation health score target (30-day threshold)
- Zero-maintenance overhead monitoring via git timestamps

**Documentation Quality**:

- API documentation completeness
- Code comment quality
- README and guide updates

### Automated Code Review Integration

**Configuration Files**:

- [ESLint Configuration (.eslintrc.js)](reference/tool-configurations.md#eslint-configuration-eslintrcjs)
- [Prettier Configuration (.prettierrc)](reference/tool-configurations.md#prettier-configuration-prettierrc)

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

## Role Routing & Completion Protocols

### Documentation-First Task Routing

**PRIMARY ROUTING RULE**: Documentation-related tasks with minimal/no code work → **Architect role**

#### Task Assignment Decision Matrix

| Task Type                  | Indicators                                    | Primary Role   | Justification               |
| -------------------------- | --------------------------------------------- | -------------- | --------------------------- |
| **Documentation Creation** | Creating/updating .md files, README, guides   | **Architect**  | Technical writing expertise |
| **System Design**          | Architecture planning, design specs, roadmaps | **Architect**  | Design and strategy focus   |
| **Workflow Definition**    | Process documentation, role definitions       | **Architect**  | Process design expertise    |
| **Feature Implementation** | Writing application code, CRUD operations     | **Code**       | Implementation expertise    |
| **Bug Fixes**              | Code debugging, test fixes, issue resolution  | **Code/Debug** | Technical problem solving   |
| **Testing Implementation** | Writing tests, test data, test configuration  | **Code**       | Implementation detail       |
| **Information Requests**   | Research, explanations, recommendations       | **Ask**        | Analysis and information    |

#### Collaboration Rules

- **Architect CAN call Code**: When implementation work is needed after design
- **Code CANNOT call Architect**: Must hand back instead of making design decisions
- **Debug/Ask CANNOT initiate**: Always called by general roles (Orchestrator/Architect)

### Mandatory Handoff Protocol

**CRITICAL RULE**: Specialized roles (Code, Debug, Ask) MUST hand back to calling general role (Orchestrator, Architect) on task completion.

#### Prohibited Behaviors

❌ **Code role ending conversations** with `attempt_completion`
❌ **Debug role providing final solutions** without handoff to calling role
❌ **Ask role concluding tasks** independently
❌ **Any specialized role making** `attempt_completion` calls

#### Required Behaviors

✅ **Hand back to calling role** with comprehensive status update
✅ **Document completion status** in .docs/current-task.md
✅ **Provide clear handoff summary** of work completed
✅ **Include next steps recommendations** for continuing work

#### Role Completion Matrix

| Role             | Can End Tasks | Must Hand Back | Can Call Others     | Completion Method    |
| ---------------- | ------------- | -------------- | ------------------- | -------------------- |
| **Orchestrator** | ✅ Yes        | ❌ No          | ✅ All roles        | `attempt_completion` |
| **Architect**    | ✅ Yes        | ❌ No          | ✅ Code, Debug, Ask | `attempt_completion` |
| **Code**         | ❌ Never      | ✅ Always      | ❌ None             | Hand back only       |
| **Debug**        | ❌ Never      | ✅ Always      | ❌ None             | Hand back only       |
| **Ask**          | ❌ Never      | ✅ Always      | ❌ None             | Hand back only       |

## Agent Collaboration Workflows

### Enhanced Orchestration with Mandatory Deployment Gates

**Orchestrated Task Flow** (Updated Standard):

```
Architect (Design + Documentation) → Code (Implementation) → Architect (Mandatory Deployment + Cleanup) → Complete
```

**Role Transition Requirements**:

- **Architect** handles all documentation and design work first
- **Code** called only when implementation needed, must hand back when complete
- **Debug** called only for technical problems, must hand back with solution
- **Ask** called only for information needs, must hand back with answers
- **CRITICAL**: All deployment gates must complete before task considered finished

**Mandatory Deployment Gate Sequence** (Never Skip):

1. **Quality Gates**: All critical gates must pass
2. **Git Commit**: Conventional commit with proper staging
3. **Git Push**: Push to appropriate branch (main/feature)
4. **Deployment Verification**: Confirm Vercel/GitHub Actions success
5. **Documentation Updates**: Patterns, memory, current-task completion
6. **Task Completion**: Only after all gates verified

**Workflow Anti-Pattern Prevention**:

- ❌ **Inappropriate Task Routing**: Documentation tasks to Code role
- ❌ **Premature Completion**: Specialized roles using `attempt_completion`
- ❌ **Conversation Termination**: Code/Debug/Ask ending without handoff
- ❌ **Quality Gate Bypass**: Skipping any critical gates for speed
- ❌ **Documentation Debt**: Completing without pattern/memory updates
- ❌ **Git Staging Confusion**: Committing with unstaged changes to modified files
- ❌ **False Success Declaration**: Claiming completion when quality gates were bypassed

### Handoff Templates (Structured Context Transfer)

**Architect → Code Handoff** (.docs/handoffs/architect-to-code.md):

````markdown
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
3. **MANDATORY**: Execute deployment gates (git commit + push)
4. **MANDATORY**: Verify deployment/build success
5. Document any technical debt
6. Signal "READY_FOR_CLEANUP" for automatic Architect transition

**Enhanced Deployment Gates (Never Skip)**:

```bash
git add .                        # Stage all changes
git commit -m "type(scope): description"  # Conventional commit
git push origin main             # Push to main (or feature branch)
# Wait for Vercel deployment confirmation
```
````

````

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
- **CRITICAL**: Git operations with conventional commit messages
- **CRITICAL**: Git push to trigger deployment/preview
- **CRITICAL**: Deployment verification (Vercel build success)
- Index maintenance and cross-referencing
- Final quality verification and task completion

**Git Operations Cannot Be Skipped**:
- Every orchestrated task MUST end with committed and pushed changes
- Deployment verification MUST be confirmed before task completion
- No exceptions for any task type (features, fixes, documentation)
````

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

### Mandatory Handoff Templates (Required Format)

#### Code → Architect Handoff (Required Format)

```markdown
## Implementation Complete - Handing Back to Architect

### Work Completed

- [x] Feature implementation: [specific description]
- [x] Tests written and passing: [test coverage details]
- [x] Quality gates validated: [specific gates passed]
- [x] Documentation updated: [what was documented]

### Files Modified/Created

- `path/to/file.ts`: [description of changes made]
- `path/to/test.ts`: [test coverage added]
- `.docs/current-task.md`: [progress updates made]

### Technical Details

- **Patterns Applied**: [from institutional memory]
- **New Patterns Identified**: [for future documentation]
- **Quality Status**: All critical gates passed ✅
- **Appetite Status**: [within/exceeding boundaries]

### Ready For Architect

- [ ] Final documentation review and updates
- [ ] Pattern extraction and indexing
- [ ] Deployment verification and cleanup
- [ ] Next phase planning

**STATUS**: Implementation complete. Handing back to Architect for final review and deployment.
```

#### Debug → Calling Role Handoff (Required Format)

```markdown
## Debug Analysis Complete - Handing Back to [Calling Role]

### Issue Resolution

- **Root Cause**: [specific problem identified]
- **Solution Applied**: [exact fix implemented]
- **Verification Method**: [how fix was confirmed]
- **Files Modified**: [list of changed files]

### Prevention Recommendations

- [architectural improvements to prevent recurrence]
- [testing enhancements needed]
- [documentation updates required]

### Institutional Memory Updates

- **Investigation Outcome**: [for .docs/investigations/]
- **Pattern Discovery**: [any debugging patterns to preserve]
- **Complexity Insights**: [for future estimation]

### Next Steps for [Calling Role]

- [recommended follow-up actions]
- [quality gate re-validation needed]
- [additional testing suggested]

**STATUS**: Issue resolved and verified. Handing back for task continuation.
```

#### Ask → Calling Role Handoff (Required Format)

```markdown
## Information Provided - Handing Back to [Calling Role]

### Questions Answered

- **Primary Question**: [restate original question]
- **Comprehensive Answer**: [detailed response provided]
- **Supporting Context**: [additional background shared]

### Recommendations Provided

- **Immediate Actions**: [next steps suggested]
- **Long-term Considerations**: [strategic implications]
- **Risk Assessment**: [potential issues identified]

### Decision Support

- **Options Analysis**: [pros/cons where applicable]
- **Resource Requirements**: [time/complexity estimates]
- **Success Criteria**: [how to measure outcomes]

### Ready for [Calling Role] Decision

- [summary of key decision points]
- [recommended approach based on analysis]
- [any follow-up information needs identified]

**STATUS**: Analysis complete. Information provided for informed decision-making.
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

See [Vercel Configuration (vercel.json)](reference/tool-configurations.md#vercel-configuration-verceljson) for complete configuration.

### GitHub Actions Workflow

See [GitHub Actions CI/CD Workflow](reference/tool-configurations.md#github-actions-cicd-workflow-githubworkflowsciyml) for complete workflow configuration.

### Package.json Scripts (Complete Toolchain)

See [Complete Package.json Scripts](reference/tool-configurations.md#complete-packagejson-scripts) for all development, testing, and quality scripts.

## Performance & Accessibility Standards

### Core Web Vitals Requirements (Non-Negotiable)

**Performance Budgets**:

- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100 milliseconds
- Total Bundle Size: < 1MB initial load

**Configuration Files**:

- [Lighthouse CI Configuration (.lighthouserc.js)](reference/tool-configurations.md#lighthouse-ci-configuration-lighthousercjs)

### Accessibility Compliance (WCAG 2.1 AA)

**Automated Testing Integration**:

See [Jest Accessibility Configuration](reference/tool-configurations.md#jest-accessibility-configuration) for complete accessibility testing setup.

**Component Accessibility Testing**:

Standard pattern for testing components - see accessibility configuration reference above for setup details.

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
