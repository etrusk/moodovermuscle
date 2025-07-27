# Release Management Workflow

## Overview

This document defines the complete release management process for the MoodOverMuscle fitness website, including versioning strategy, release candidate creation, deployment procedures, and post-release activities.

## Versioning Strategy

### Semantic Versioning (SemVer)
We follow [Semantic Versioning 2.0.0](https://semver.org/) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incompatible API changes or major feature releases
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

### Version Scheme Alignment
Given our project phase, we use the following versioning approach:

| Project Phase | Version Range | Description |
|---------------|---------------|-------------|
| MVP | 0.1.x | Initial release, core features |
| Beta | 0.2.x | Enhanced features, user feedback |
| Production | 1.0.x | Stable release, full feature set |
| Maintenance | 1.1.x | Bug fixes, minor improvements |
| Major Updates | 2.0.x | Significant feature additions |

### Pre-release Tags
- **alpha**: Internal testing, unstable features
- **beta**: Feature-complete, user testing
- **rc**: Release candidate, final testing

Example: `1.0.0-rc.1`

## Release Types

### Regular Releases
Scheduled releases following our sprint cycle:
- **Frequency**: Bi-weekly (aligned with sprints)
- **Scope**: Feature additions and bug fixes
- **Process**: Standard release workflow

### Hotfix Releases
Emergency fixes for critical issues:
- **Trigger**: Critical bugs or security vulnerabilities
- **Timeline**: Within 2-4 hours
- **Process**: Expedited workflow with minimal testing

### Feature Releases
Major feature additions:
- **Trigger**: Significant new functionality
- **Timeline**: Monthly or quarterly
- **Process**: Extended testing and documentation

## Release Process

### Phase 1: Planning & Preparation

#### Release Planning Meeting
**Frequency**: Bi-weekly (Monday of sprint start)
**Duration**: 30 minutes
**Attendees**: Product Owner, Tech Lead, QA Lead

**Agenda**:
- Review completed features
- Assess release readiness
- Define release scope
- Set release date
- Assign release owner

#### Release Scope Definition
```markdown
## Release v1.2.0 Scope

### Features
- [ ] New booking system integration
- [ ] Enhanced class scheduling
- [ ] Mobile app improvements

### Bug Fixes
- [ ] Fix calendar display issues
- [ ] Resolve booking confirmation emails

### Technical Debt
- [ ] Update Next.js to latest version
- [ ] Optimize image loading
```

### Phase 2: Release Candidate Creation

#### Branching Strategy
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version
npm version minor --no-git-tag-version
git add package.json
git commit -m "chore: bump version to v1.2.0"
```

#### Release Candidate Testing

##### Automated Testing Pipeline
```yaml
# .github/workflows/release-candidate.yml
name: Release Candidate Testing
on:
  push:
    branches: [release/*]

jobs:
  test-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:ci
      - run: pnpm test:e2e
      - run: pnpm lighthouse:ci
```

##### Manual Testing Checklist
**Functional Testing**:
- [ ] All user journeys work correctly
- [ ] Form submissions function properly
- [ ] Payment processing works
- [ ] Email notifications send correctly

**Cross-browser Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Testing**:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design verification

**Performance Testing**:
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals within thresholds
- [ ] Bundle size analysis

### Phase 3: Release Candidate Approval

#### Release Candidate Review
**Process**:
1. **Code Review**: Final review of release branch
2. **QA Sign-off**: QA team approval
3. **Product Approval**: Product owner sign-off
4. **Security Review**: Security checklist completion

#### Release Candidate Approval Template
```markdown
## Release Candidate v1.2.0 Approval

### Testing Results
- [ ] All automated tests passing
- [ ] Manual testing completed
- [ ] Performance benchmarks met
- [ ] Security scan passed

### Approvals
- [ ] QA Lead: _________________ Date: _________
- [ ] Tech Lead: _________________ Date: _________
- [ ] Product Owner: _________________ Date: _________

### Release Notes
- Feature: New booking system
- Feature: Enhanced class scheduling
- Bug fix: Calendar display issues
- Security: Updated dependencies
```

### Phase 4: Production Deployment

#### Pre-deployment Checklist
- [ ] Release notes prepared
- [ ] Deployment checklist reviewed
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Stakeholders notified

#### Deployment Steps
```bash
# 1. Merge release branch to main
git checkout main
git pull origin main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# 2. Deploy to production
# Automated via GitHub Actions on tag push
```

#### Deployment Verification
```bash
# Health check script
./scripts/health-check.js

# Performance verification
./scripts/performance-check.js

# Security scan
./scripts/security-scan.js
```

### Phase 5: Post-deployment Activities

#### Immediate Post-deployment (0-30 minutes)
- [ ] Verify deployment success
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Validate critical user journeys
- [ ] Confirm email notifications

#### Short-term Monitoring (30 minutes - 24 hours)
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify user feedback
- [ ] Monitor support tickets

#### Long-term Monitoring (24 hours - 1 week)
- [ ] Analyze user behavior
- [ ] Review performance trends
- [ ] Collect user feedback
- [ ] Plan follow-up improvements

## Release Notes Generation

### Automated Release Notes
```bash
# Generate changelog from commits
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Create GitHub release
gh release create v1.2.0 --notes-file release-notes.md
```

### Release Notes Template
```markdown
# Release v1.2.0

## What's New
- **New Booking System**: Streamlined class booking experience
- **Enhanced Scheduling**: Improved calendar functionality
- **Mobile Optimizations**: Better mobile experience

## Bug Fixes
- Fixed calendar display issues on mobile devices
- Resolved booking confirmation email delays
- Corrected timezone handling in class schedules

## Performance Improvements
- Reduced bundle size by 15%
- Improved page load times by 20%
- Optimized image loading

## Security Updates
- Updated all dependencies to latest versions
- Fixed security vulnerabilities
- Enhanced input validation

## Breaking Changes
- None in this release

## Migration Guide
- No migration required
```

## Hotfix Process

### Hotfix Triggers
- Critical security vulnerabilities
- Data loss or corruption
- Complete service outage
- Payment processing failures

### Hotfix Workflow
```bash
# 1. Create hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1

# 2. Apply fix
# Make necessary changes

# 3. Test fix
pnpm test:ci
pnpm test:e2e

# 4. Deploy immediately
git add .
git commit -m "fix: critical security patch"
git tag v1.2.1
git push origin main --tags
```

### Hotfix Approval Process
1. **Emergency Review**: 1-person approval (Tech Lead)
2. **Testing**: Minimal testing focused on fix
3. **Deployment**: Immediate deployment
4. **Post-fix**: Full regression testing

## Rollback Procedures

### Rollback Triggers
- Error rate > 5% for 10 minutes
- Critical functionality broken
- Performance degradation > 50%
- Security vulnerability discovered

### Rollback Process
```bash
# Immediate rollback
git checkout main
git reset --hard HEAD~1
git push origin main --force

# Or via Vercel
vercel rollback production --token=$VERCEL_TOKEN
```

### Rollback Communication
```markdown
## Rollback Notice

**Service**: MoodOverMuscle Website
**Version**: v1.2.0 → v1.1.9
**Time**: 2025-07-27 14:30 UTC
**Reason**: Critical booking system bug
**ETA**: 15 minutes
**Status**: Rollback in progress
```

## Release Communication

### Stakeholder Communication
- **Product Team**: Release notes and feature overview
- **Customer Support**: Known issues and FAQs
- **Marketing**: Feature announcements
- **Users**: In-app notifications

### Communication Channels
- **Slack**: #releases channel
- **Email**: release@moodovermuscle.com.au
- **Status Page**: status.moodovermuscle.com.au
- **Social Media**: Scheduled announcements

## Release Metrics

### Key Performance Indicators (KPIs)
- **Deployment Frequency**: Target 2 weeks
- **Lead Time**: Target < 4 hours
- **Change Failure Rate**: Target < 5%
- **Mean Time to Recovery**: Target < 1 hour

### Release Health Metrics
- Error rate post-deployment
- Performance impact
- User adoption rate
- Support ticket volume

## Tools and Automation

### Release Management Tools
- **GitHub**: Version control and releases
- **Vercel**: Deployment platform
- **Sentry**: Error monitoring
- **Lighthouse CI**: Performance monitoring
- **GitHub Actions**: CI/CD automation

### Automation Scripts
```bash
# Create release
./scripts/create-release.sh v1.2.0

# Deploy release
./scripts/deploy-release.sh v1.2.0

# Rollback release
./scripts/rollback-release.sh v1.1.9
```

## Compliance and Auditing

### Release Audit Trail
- All releases tagged in Git
- Deployment logs stored for 90 days
- Change requests documented
- Approval records maintained

### Compliance Requirements
- **GDPR**: Data handling compliance
- **Accessibility**: WCAG 2.1 compliance
- **Security**: OWASP compliance
- **Performance**: Core Web Vitals compliance

## Continuous Improvement

### Retrospectives
**Frequency**: After each release
**Duration**: 30 minutes
**Participants**: Release team

**Topics**:
- What went well?
- What could be improved?
- Action items for next release

### Process Optimization
- Monthly process review
- Tool evaluation and updates
- Training and documentation updates
- Feedback incorporation

---

**Last Updated**: July 2025  
**Next Review**: October 2025  
**Release Owner**: Development Team  
**Stakeholders**: Product, QA, Operations