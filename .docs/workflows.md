# Appetite-Based Development Workflows

## Workflow Philosophy

**Appetite-Driven Development**: Workflows optimized for single developer + agentic LLM collaboration with time-boxed appetites rather than deadline-driven timelines.

**Core Principles**:

- **Quality Gates Over Speed**: Critical gates never bypassed regardless of appetite pressure
- **Agent Collaboration**: Workflows designed for Architect → Code → Debug → Resolution handoffs
- **Scope Flexibility**: Features shaped to fit appetite rather than appetite extended for features
- **Institutional Memory**: Patterns captured for future appetite estimation and risk assessment

## Git & Deployment Process

### Branch Strategy: GitHub Flow (Appetite-Enhanced)

- **Main Branch**: `main` (production-ready, auto-deploys to Vercel)
- **Feature Development**: Appetite-scoped branches from main
- **Vercel Integration**: Automatic preview deploys on all PRs
- **Appetite Gates**: Required scope validation before appetite completion

### Branch Naming Conventions (Appetite-Aware)

```
feature/MOM-123-calendar-integration-4w    # 4-week appetite scope
feature/MOM-200-transaction-safety-2w      # 2-week appetite scope
hotfix/MOM-300-security-patch-1d           # 1-day emergency appetite
investigation/MOM-400-performance-analysis # Investigation branch
```

**Appetite Indicators**:

- `1d` = 1-day appetite (hotfixes, simple fixes)
- `2w` = 2-week appetite (small features, specific improvements)
- `4w` = 4-week appetite (medium features, architectural changes)
- `6w` = 6-week appetite (major features, system integrations)

### Commit Message Standards (Appetite-Enhanced Conventional Commits)

```
<type>(<scope>): <subject> [appetite: Xw]

feat(booking): add transaction safety with conflict detection [appetite: 2w]
fix(ui): resolve mobile booking form validation issues [appetite: 1d]
docs(handoff): update architect-to-code template [appetite: 1d]
investigation(performance): analyze booking form rendering bottlenecks [appetite: 3d]
```

**Appetite Tracking in Commits**:

- Documents time investment for future complexity scoring
- Enables appetite vs. actual analysis for institutional memory
- Supports pattern recognition for similar work estimates

### Pull Request Process (Appetite-Scoped)

- **Appetite Validation**: Scope matches original appetite estimation
- **Quality Gates**: Critical gates enforced regardless of appetite pressure
- **Handoff Documentation**: Context preserved for future agent collaboration
- **Pattern Capture**: Successful approaches documented in .docs/memory/

#### PR Template (Appetite-Enhanced)

```markdown
## Appetite Scope

- **Original Appetite**: 2 weeks
- **Actual Time**: 1.5 weeks
- **Scope Changes**: None | [describe changes]
- **Circuit Breaker Triggered**: No | [describe if appetite exceeded]

## Quality Gate Status

- [ ] Critical gates passed (type check, lint, build, security)
- [ ] Accessibility ≥95% (WCAG 2.1 AA compliance)
- [ ] Performance ≥85% (Core Web Vitals within budget)
- [ ] Test coverage maintained (unit, integration, e2e)

## Agent Handoff Context

- **Mode Used**: Architect | Code | Debug | Manual-Debug
- **Complexity Score**: [1-10 based on .docs/memory/complexity-scoring.md]
- **Patterns Applied**: [reference to .docs/memory/successful-patterns.md]
- **Knowledge Captured**: [what was learned for institutional memory]

## Testing Evidence

- [ ] Unit tests added/updated
- [ ] Integration tests verify business logic
- [ ] E2E tests cover critical user journeys
- [ ] Accessibility testing automated
- [ ] Performance impact measured
```

### Development Workflow (Appetite-Constrained)

1. **Appetite Planning**: Review .docs/spec.md for current appetite scope
2. **Complexity Assessment**: Use .docs/memory/complexity-scoring.md for estimation
3. **Pattern Review**: Check .docs/memory/successful-patterns.md for similar work
4. **Environment Setup**: Check terminals, ensure dev server on port 3000
5. **Branch Creation**: `git checkout -b feature/MOM-XXX-description-Yw`
6. **TDD Implementation**: Red-green-refactor within appetite boundaries
7. **Agent Collaboration**: Use .docs/handoffs/ templates for mode transitions
8. **Circuit Breakers**: Stop if appetite exceeded by 50% - reassess scope
9. **Quality Validation**: All critical gates must pass regardless of appetite pressure
10. **Pattern Documentation**: Capture successful approaches in .docs/memory/
11. **Handoff Completion**: Update .docs/current-task.md with progress and context

## Testing Strategy (Quality-First Appetite Approach)

### Appetite-Aware Test Pyramid

- **Unit Tests**: Fast feedback within TDD cycles (Jest + React Testing Library)
- **Integration Tests**: Realistic API validation (MSW network-level mocking)
- **E2E Tests**: Critical user journey protection (Playwright automation)
- **Performance Gates**: Automated quality enforcement (Privacy-focused Lighthouse CI)
- **Accessibility Gates**: Zero-tolerance WCAG 2.1 AA compliance validation

### Testing Commands (Appetite Optimization)

```bash
# Fast feedback for appetite-constrained development
npm run test:critical          # Essential tests only (< 30 seconds)
npm run test:appetite          # Appetite-scoped test subset
npm run test:full              # Complete test suite (when appetite allows)

# TDD cycle optimization
npm run test:watch             # Real-time feedback during development
npm run test:changed           # Only test files affected by changes

# Quality gate validation
npm run quality:gates          # All critical gates (accessibility, performance, security)
npm run quality:validate       # Gate validation without running new tests
```

### Appetite-Based Test Execution Strategy

#### 2-Week Appetite or Less

- **Focus**: Critical tests only during development
- **Gates**: All critical gates enforced at PR
- **Coverage**: Maintain existing coverage, add focused tests

#### 4-Week Appetite

- **Focus**: Full test suite with enhancement
- **Gates**: All gates enforced with improvement targets
- **Coverage**: Expand test coverage with new patterns

#### 6-Week Appetite

- **Focus**: Comprehensive testing strategy evolution
- **Gates**: Enhanced quality gates with new metrics
- **Coverage**: Test infrastructure improvements included

### Quality Gates Framework (Appetite-Independent)

#### Critical Gates (Never Bypass - Regardless of Appetite Pressure)

**Build & Code Quality**:

- Type checking failures
- Linting errors
- Build failures
- Security vulnerabilities
- Core business logic test failures

**Accessibility (Zero Tolerance)**:

- Unit accessibility tests: 100% pass rate
- Accessibility score ≥95% (WCAG 2.1 AA compliance)
- Color contrast: 100% compliance
- Image alt text: 100% coverage
- Form labeling: 100% compliance
- Keyboard navigation: 100% compliance
- Screen reader compatibility: 100% compliance

**Performance (Core Web Vitals)**:

- LCP <2.5s (Largest Contentful Paint)
- CLS <0.1 (Cumulative Layout Shift)
- SEO ≥90% (search visibility)
- HTTPS 100% (security requirement)

#### Non-Critical Gates (Track in .docs/debt.md)

**Performance Targets**:

- Overall performance ≥85%
- FCP <2s (First Contentful Paint)
- TBT <300ms (Total Blocking Time)
- Total byte weight <1MB
- DOM size <1500 elements

**Advanced Features**:

- Integration test edge cases
- E2E accessibility enhancements
- Performance optimizations beyond Core Web Vitals
- Advanced ARIA implementations

### Circuit Breaker Protocol

#### When to Stop (Appetite Exceeded)

**50% Appetite Overrun**: Mandatory scope reassessment

```bash
# If 2-week appetite reaches 3 weeks
echo "CIRCUIT BREAKER: Appetite exceeded 50%" >> .docs/current-task.md
echo "Scope reassessment required before continuing" >> .docs/current-task.md
```

**Technology Learning Required**: Switch to simpler approach

- If implementation requires extensive new learning
- If testing becomes more complex than implementation
- If performance targets not achievable with current approach

**Quality Gate Failures**: Never bypass critical gates

- Accessibility violations must be fixed
- Security issues must be resolved
- Performance regressions must be addressed

#### Scope Adjustment Strategies

**Reduce Scope**: Cut features to fit original appetite

- Remove nice-to-have features
- Simplify complex interactions
- Defer advanced functionality

**Split Appetite**: Break into smaller appetites

- Create follow-up appetite for remaining work
- Document handoff context for continuation
- Preserve institutional memory for future work

**Architecture Simplification**: Choose proven patterns

- Use existing successful patterns from .docs/memory/
- Avoid cutting-edge solutions under appetite pressure
- Prioritize functionality over elegance

## Agent Collaboration Workflows

### Architect → Code Handoff

**Handoff Trigger**: When planning is complete and implementation ready

**Required Context** (use .docs/handoffs/architect-to-code.md):

- Implementation requirements with acceptance criteria
- Quality gates and success metrics
- Context files to read before starting
- Complexity assessment and appetite boundaries
- Pattern recommendations from .docs/memory/

**Success Criteria**:

- Code mode has clear implementation path
- All dependencies and constraints understood
- Quality gates defined and measurable
- Rollback plan established if appetite exceeded

### Code → Debug Handoff

**Handoff Trigger**: When implementation issues arise that need investigation

**Required Context** (use .docs/handoffs/code-to-debug.md):

- Problem description with symptoms
- Investigation starting points
- Rollback plan and safe fallback state
- Appetite remaining for debugging effort
- Expected resolution complexity

**Success Criteria**:

- Debug mode has clear investigation path
- Problem scope is bounded
- Resolution timeline fits remaining appetite
- Escalation path defined if debugging exceeds scope

### Debug → Resolution Handoff

**Handoff Trigger**: When root cause identified and solution path clear

**Required Context** (use .docs/handoffs/debug-to-resolution.md):

- Root cause analysis with evidence
- Recommended solution approach
- Prevention measures for future
- Knowledge to capture in institutional memory
- Testing strategy for resolution validation

**Success Criteria**:

- Resolution approach fits remaining appetite
- Prevention measures identified
- Knowledge captured for future similar issues
- Quality gates maintained throughout resolution

## Deployment Automation (Appetite-Aware)

### Vercel Integration (Zero-Maintenance)

- **Production Deployment**: Every merge to main (appetite completion)
- **Preview Deployments**: Every PR for appetite validation
- **Environment Variables**: Managed via Vercel dashboard
- **Rollback**: One-click rollback if appetite delivery fails

### CI/CD Pipeline (Quality-First)

```yaml
# Appetite-aware workflow triggers
on:
  push:
    branches: [main] # Appetite completion
  pull_request:
    branches: [main] # Appetite validation

jobs:
  appetite-validation: # Validate scope matches appetite
    - Check appetite indicators in branch/commits
    - Validate scope creep boundaries
    - Assess complexity vs. original estimation

  quality-gates: # Never bypass regardless of appetite
    - lint-and-typecheck: Code quality
    - test-critical: Essential business logic
    - build: Application build verification
    - accessibility: WCAG 2.1 AA compliance
    - performance: Core Web Vitals validation

  deployment-readiness: # Appetite completion validation
    - appetite-scope-match: Delivered scope matches planned appetite
    - quality-debt-tracking: Any bypassed non-critical gates documented
    - institutional-memory: Patterns captured for future appetites
```

### Performance Monitoring (Privacy-First)

**Vercel Analytics**: Zero-maintenance user behavior insights

- Real-time Core Web Vitals monitoring
- Performance trend analysis across appetite deliveries
- User experience impact measurement

**Lighthouse CI Integration**: Automated quality enforcement

```bash
# Appetite-scoped performance validation
npm run lighthouse:appetite            # Quick validation for small appetites
npm run lighthouse:comprehensive       # Full audit for major appetites
npm run lighthouse:gates               # Quality gate enforcement only
```

**Privacy-Hardened Configuration**:

- Dedicated Chrome profile isolation
- Automatic profile cleanup after testing
- Zero persistent data accumulation
- Local-only performance analysis

## Accessibility Excellence (Zero Manual Verification)

### Appetite-Independent Accessibility Requirements

**WCAG 2.1 AA Compliance**: Non-negotiable regardless of appetite size

- 100% automated accessibility validation
- Zero tolerance for critical violations
- Cross-browser compatibility testing
- Mobile accessibility verification

### Three-Layer Accessibility Automation

**Unit Level**: Component accessibility validation

```typescript
// Automated in every component test
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

test('component has no accessibility violations', async () => {
  const { container } = render(<BookingForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Integration Level**: Complex interaction accessibility

```typescript
// Automated in user journey tests
test('booking wizard maintains accessibility throughout flow', async ({
  page,
}) => {
  await page.getByPlaceholder('Your beautiful name').fill('Jane Doe')
  const btn = page.getByRole('button', { name: 'Book session' })
  await btn.click()
  await expect(btn).toHaveAttribute('aria-busy', 'true')
})
```

**System Level**: Lighthouse CI with 95% threshold

```javascript
// Automated quality gates
'categories:accessibility': ['error', { minScore: 0.95 }],
'audits:color-contrast': ['error', { minScore: 1.0 }],
'audits:image-alt': ['error', { minScore: 1.0 }],
'audits:label': ['error', { minScore: 1.0 }],
```

### Accessibility Development Commands

```bash
# Appetite-optimized accessibility workflow
npm run a11y:critical             # Essential accessibility checks (< 30 seconds)
npm run a11y:full                 # Comprehensive accessibility validation
npm run a11y:dev                  # Watch mode for accessibility development

# Quality gate validation
npm run a11y:gates                # Critical gate validation only
npm run a11y:validate             # Check compliance without new tests

# Debug and investigation
npm run a11y:debug                # Debug accessibility issues
npm run a11y:audit-local          # Local audit without external reporting
```

## Emergency Procedures (Appetite Override)

### Hotfix Process (1-Day Appetite)

**Critical Issue Identification**: Security, data corruption, booking system failure

1. **Emergency Appetite**: 1-day maximum for hotfix resolution
2. **Create Branch**: `hotfix/MOM-XXX-description-1d`
3. **Minimal Implementation**: Fix only the critical issue, nothing more
4. **Quality Gates**: Critical gates still enforced (accessibility, security)
5. **Emergency Review**: Single reviewer approval (document in .docs/debt.md)
6. **Deploy & Monitor**: Immediate deployment with enhanced monitoring

### Rollback Procedures (Circuit Breaker)

**Appetite Failure**: When appetite significantly exceeded without delivery

- **Vercel Rollback**: One-click rollback to previous working state
- **Scope Reset**: Return to last known good appetite scope
- **Context Preservation**: Document lessons learned in .docs/memory/
- **Appetite Reassessment**: Plan new appetite with updated complexity understanding

**Quality Gate Failure**: When critical gates cannot be satisfied

- **Automatic Rollback**: CI/CD automatically prevents deployment
- **Issue Resolution**: Fix quality issues before proceeding
- **Gate Validation**: Re-run quality gates after fixes
- **Process Learning**: Update .docs/memory/ with prevention strategies

## Institutional Memory Integration

### Pattern Capture During Development

**Successful Patterns**: Document in .docs/memory/successful-patterns.md

- Implementation approaches that worked well within appetite
- Testing strategies that provided fast feedback
- Architecture decisions that scaled appropriately
- Problem-solving approaches that prevented scope creep

**Failure Recovery**: Document in .docs/memory/failure-recovery.md

- Issues that caused appetite overruns with prevention strategies
- Quality gate failures with specific resolution approaches
- Performance bottlenecks with optimization solutions
- Accessibility issues with compliance restoration methods

**Complexity Scoring**: Update .docs/memory/complexity-scoring.md

- Actual implementation time vs. estimated appetite
- Factors that increased complexity unexpectedly
- Indicators for future appetite estimation accuracy
- Risk factors that suggest larger appetite needed

### Handoff Context Preservation

**Agent Transitions**: Use structured templates for mode switching

- Preserve context across Architect → Code → Debug workflows
- Document decision rationale for future reference
- Capture implementation patterns for reuse
- Record debugging approaches for similar issues

**Session State Management**: Track in .docs/current-task.md

- Current appetite progress and remaining scope
- Quality debt accumulated and resolution timeline
- Next logical steps for workflow continuation
- Blockers or escalation triggers encountered

## Workflow Success Metrics

### Appetite Delivery Metrics

- **Scope Match**: 80% of appetites deliver planned scope
- **Time Accuracy**: Actual time within 120% of appetite estimate
- **Quality Maintenance**: 100% critical gate compliance
- **Pattern Reuse**: 60% of appetites use documented successful patterns

### Quality Excellence Metrics

- **Accessibility Compliance**: 100% WCAG 2.1 AA compliance maintained
- **Performance Standards**: 95% of deliveries meet Core Web Vitals
- **Test Coverage**: Maintain or improve coverage with each appetite
- **Security Standards**: Zero security vulnerabilities in production

### Agent Collaboration Metrics

- **Handoff Efficiency**: Smooth transitions between modes
- **Context Preservation**: Complete handoff information transferred
- **Knowledge Capture**: Patterns documented for institutional memory
- **Workflow Optimization**: Continuous improvement in collaboration patterns

---

**Last Updated**: 2025-08-03  
**Workflow Status**: Appetite-based development ready  
**Next Review**: After first appetite completion using new workflows  
**Evolution Driver**: Agent collaboration effectiveness and appetite accuracy
