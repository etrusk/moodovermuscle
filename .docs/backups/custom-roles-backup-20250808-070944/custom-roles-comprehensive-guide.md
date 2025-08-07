# Custom Roles Comprehensive Guide & Training Materials
**Version**: 1.0  
**Date**: 2025-08-07  
**Status**: Production Ready

## Overview

This comprehensive guide provides detailed documentation, usage patterns, and training materials for all 6 custom roles in the MoodOverMuscle development workflow.

### Custom Role Architecture Summary

- **🧭 Navigator**: Strategic project orchestration with institutional memory coordination
- **🏗️ Architect**: Technical design with appetite-constrained planning
- **💻 Code**: Pattern-driven implementation with deployment gates
- **🐞 Debug**: Systematic investigation with institutional knowledge
- **🧪 QA**: Quality verification with comprehensive testing patterns
- **🚀 Deploy**: Production deployment with infrastructure management

---

## 🧭 Navigator Role Documentation

### Purpose & Specialization
Strategic project orchestrator for complex multi-domain initiatives with institutional memory synthesis.

### Key Capabilities
- **Institutional Memory Orchestration**: Curates context from all `.docs/` indexes
- **Project Coordination**: Manages appetite boundaries across multiple work streams
- **Strategic Context Curation**: Provides rich context packages to specialized roles
- **Appetite Management**: Enforces circuit breakers and scope protection

### When to Use Navigator
- **Complex Multi-Step Projects**: Requires coordination across domains
- **Strategic Planning**: Need to synthesize institutional knowledge
- **Cross-Role Coordination**: Work spans multiple specialist expertise areas
- **Appetite-Constrained Planning**: Large initiatives need appetite decomposition

### Navigator Workflow Pattern

```bash
# 1. Start with institutional memory discovery
roo navigator "Coordinate user authentication system implementation"

# Navigator will:
# - Read .docs/patterns/index.md for proven approaches
# - Check .docs/investigations/index.md for known risks
# - Review .docs/decisions/index.md for constraints
# - Package context for specialist handoffs

# 2. Receive curated context packages and coordination plan
# 3. Execute handoffs to specialist roles with structured templates
```

### Navigator Context Curation Template

```markdown
## Curated Context Package for [Specialist Role]
**Project**: [current initiative]
**Appetite**: [time/scope constraints] 
**Circuit Breakers**: [scope boundaries]

**Relevant Patterns**: [from patterns/index.md with specific applications]
**Known Risks**: [from investigations/index.md with mitigation approaches]
**Architectural Constraints**: [from decisions/index.md with compliance requirements]

**Implementation Roadmap**:
1. [Specific step with pattern application]
2. [Quality gates and verification points]
3. [Integration requirements and testing]

**Handoff to**: [Target role] for [specific scope of work]
```

### Navigator Success Metrics
- 95% of handoffs include sufficient context for autonomous work
- 90% of projects complete within appetite boundaries
- 100% of new patterns captured in institutional memory
- 85% of coordination issues resolved without human escalation

### Navigator Training Exercises

**Exercise 1: Context Synthesis**
```bash
# Scenario: Implement real-time booking notifications
roo navigator "Plan real-time booking notification system implementation"

# Expected Navigator Actions:
# 1. Research notification patterns from patterns/index.md
# 2. Check WebSocket implementation investigations
# 3. Review real-time architecture decisions
# 4. Create context packages for Architect and Code roles
```

**Exercise 2: Appetite Decomposition**
```bash
# Scenario: Large feature with 20+ hour estimate
roo navigator "Coordinate admin dashboard enhancement with 18-hour appetite"

# Expected Navigator Actions:
# 1. Break down into 4-6 hour appetite chunks
# 2. Define circuit breakers for each phase
# 3. Plan specialist handoffs with context preservation
# 4. Coordinate dependencies between phases
```

---

## 🏗️ Architect Role Documentation

### Purpose & Specialization
Technical design specialist creating comprehensive specifications with institutional memory integration.

### Key Capabilities
- **Architecture Design**: System architecture following established patterns
- **Pattern-Informed Planning**: Leverages `.docs/patterns/index.md` for proven approaches
- **Implementation Roadmapping**: Creates detailed implementation plans for Code role
- **Design Validation**: Ensures architectural soundness and constraint compliance

### When to Use Architect
- **New Feature Design**: Complex features need architectural planning
- **System Integration**: Multiple system components require coordination
- **Technical Specifications**: Code role needs detailed implementation guidance
- **Pattern Application**: New work should leverage institutional patterns

### Architect Workflow Pattern

```bash
# 1. Start with pattern and constraint discovery
roo architect "Design user dashboard with real-time data integration"

# Architect will:
# - Check patterns/index.md for UI and API patterns
# - Review decisions/index.md for architectural constraints
# - Scan investigations/index.md for design-related risks
# - Create comprehensive technical specifications

# 2. Receive detailed design specifications and implementation roadmap
# 3. Handoff to Code role with curated context
```

### Architect Design Specification Template

```markdown
# Technical Design: [Feature/System Name]

## Architecture Overview
**Pattern Applied**: [From patterns/index.md]
**Appetite**: [Time/scope constraints]
**Circuit Breakers**: [Design scope boundaries]

## System Design
[Detailed technical architecture with diagrams]

## Implementation Roadmap
1. [Phase 1 with appetite boundaries and patterns]
2. [Phase 2 with quality gates and validation]
3. [Integration and testing phases]

## Quality Gates
- [Technical validation points]
- [Performance requirements]
- [Security considerations]

## Handoff to Code Role
**Context Package**: [Curated implementation context]
**Patterns to Apply**: [Specific pattern implementations]
**Constraints**: [Technical and appetite boundaries]
```

### Architect Success Metrics
- 100% of designs reference institutional patterns
- 90% of implementations follow architectural specifications
- 85% of appetite boundaries respected during implementation
- Zero architectural rework required post-implementation

### Architect Training Exercises

**Exercise 1: Pattern-Driven Design**
```bash
# Scenario: Design booking confirmation email system
roo architect "Design automated booking confirmation system with email templates"

# Expected Architect Actions:
# 1. Apply Email Template Pattern from patterns/index.md
# 2. Reference Notification System Pattern for multi-channel approach
# 3. Create implementation roadmap with specific pattern applications
# 4. Define quality gates and testing requirements
```

**Exercise 2: Constraint Integration**
```bash
# Scenario: Design with existing system constraints
roo architect "Design admin analytics dashboard respecting current authentication system"

# Expected Architect Actions:
# 1. Review authentication decisions from decisions/index.md
# 2. Check admin authentication patterns
# 3. Design within existing architectural constraints
# 4. Plan integration with current systems
```

---

## 💻 Code Role Documentation

### Purpose & Specialization
Pattern-driven implementation specialist with mandatory deployment gates and institutional memory integration.

### Key Capabilities
- **Focused Implementation**: Executes using curated context from Architect/Navigator
- **Pattern Application**: Uses established patterns from `.docs/patterns/index.md`
- **Deployment Gate Enforcement**: Mandatory quality gates before completion
- **Preview-First Workflow**: Functionality changes require client approval

### When to Use Code Role
- **Implementation Tasks**: Execute designs created by Architect role
- **Bug Fixes**: Implement solutions identified by Debug role  
- **Feature Development**: Build functionality with pattern guidance
- **Quality Implementation**: Maintain standards with automated gates

### Code Workflow Pattern

```bash
# 1. Receive curated context from Architect or Navigator
roo code "Implement user dashboard using UI Dashboard Pattern"

# Code will:
# - Apply specified patterns from context package
# - Follow implementation roadmap from Architect
# - Execute within appetite boundaries
# - Run mandatory deployment gates

# 2. Mandatory deployment gates execution
pnpm run deployment:gates

# 3. Preview workflow for functionality changes
pnpm run workflow:detect
# If changes detected:
pnpm run workflow:create-preview

# 4. Quality gate enforcement
# - All critical gates must pass before completion
# - Institutional memory automatically updated
```

### Code Implementation Checklist

**Before Implementation**:
- [ ] Curated context received from Architect/Navigator
- [ ] Relevant patterns identified and reviewed
- [ ] Appetite boundaries and circuit breakers understood
- [ ] Quality gates and acceptance criteria clear

**During Implementation**:
- [ ] Apply specified patterns consistently
- [ ] Follow architectural specifications exactly
- [ ] Update progress in current-task documentation
- [ ] Flag when approaching appetite boundaries

**Deployment Gates (MANDATORY)**:
```bash
pnpm run lint                    # ESLint + Prettier auto-fix
pnpm run type-check             # TypeScript compilation
pnpm run test:critical          # Essential tests < 30s
pnpm run security:scan          # Security vulnerability check
pnpm run build >/dev/null 2>&1  # Production build verification
```

**After Implementation**:
- [ ] All critical quality gates passed
- [ ] Preview workflow completed (if functionality changes)
- [ ] Client approval received (if required)
- [ ] Institutional memory updated
- [ ] Changes committed with conventional messages

### Code Role Success Metrics
- 100% critical quality gate compliance
- 80% pattern reuse rate from institutional memory
- Zero functionality compromised for appetite compliance
- 95% implementations complete within appetite boundaries

### Code Training Exercises

**Exercise 1: Pattern-Driven Implementation**
```bash
# Scenario: Implement booking form validation
roo code "Implement booking form validation using Form Validation Pattern"

# Expected Code Actions:
# 1. Apply Form Validation Pattern from patterns/index.md
# 2. Use TypeScript validation patterns for type safety
# 3. Implement comprehensive error handling
# 4. Execute all deployment gates before completion
```

**Exercise 2: Deployment Gates Enforcement**
```bash
# Scenario: Feature implementation with quality gates
roo code "Add admin dashboard statistics with real-time updates"

# Expected Code Actions:
# 1. Implement using provided patterns and context
# 2. Run deployment gates: pnpm run deployment:gates
# 3. Address any gate failures before completion
# 4. Update institutional memory automatically
```

---

## 🐞 Debug Role Documentation

### Purpose & Specialization
Systematic investigation specialist using institutional knowledge for complex debugging scenarios.

### Key Capabilities
- **Systematic Diagnosis**: Methodical problem investigation using proven patterns
- **Root Cause Analysis**: Deep dive analysis with institutional memory integration
- **Solution Development**: Comprehensive fixes addressing causes, not symptoms
- **Knowledge Capture**: Documents findings for institutional memory growth

### When to Use Debug Role
- **Complex Issues**: Problems require systematic investigation
- **Recurring Failures**: Issues need root cause analysis
- **System Interactions**: Multi-component failure scenarios
- **Knowledge Building**: Debugging patterns need documentation

### Debug Workflow Pattern

```bash
# 1. Start with institutional knowledge research
roo debug "Investigate booking form submission failures in production"

# Debug will:
# - Check investigations/index.md for similar issues
# - Apply debugging patterns from patterns/index.md
# - Use comprehensive context discovery
# - Create detailed diagnostic reports

# 2. Systematic investigation process
# - Reproduce issue reliably
# - Analyze with institutional patterns
# - Trace to root cause with evidence
# - Develop comprehensive solution
# - Test solution thoroughly
# - Document for institutional memory

# 3. Solution handoff to Code role with context
```

### Debug Investigation Template

```markdown
# Debug Report: [Issue Description]

## Issue Summary
**Symptoms**: [Observable problems and user impact]
**Reproduction**: [Reliable steps to trigger issue]
**Frequency**: [How often issue occurs]

## Investigation Process
**Known Issues Checked**: [References from investigations/index.md]
**Patterns Applied**: [Debugging patterns used]
**Analysis Tools**: [Debugging techniques and tools applied]

## Root Cause Analysis
**Primary Cause**: [Fundamental issue identified with evidence]
**Contributing Factors**: [Secondary issues that compound problem]
**System Impact**: [Broader implications and affected components]

## Solution Recommendation
**Immediate Fix**: [Quick resolution for immediate relief]
**Comprehensive Solution**: [Long-term fix addressing root cause]
**Prevention Strategy**: [How to avoid recurrence]
**Testing Plan**: [Verification approach for solution]

## Institutional Memory Update
**New Patterns**: [Debugging approaches to document]
**Investigation Updates**: [Add to known issues index]
**Prevention Insights**: [Lessons for future development]
```

### Debug Success Metrics
- 90% of investigations identify root cause within appetite
- 85% of solutions prevent issue recurrence
- 100% of findings documented for institutional memory
- Zero regressions introduced by debug solutions

### Debug Training Exercises

**Exercise 1: Systematic Investigation**
```bash
# Scenario: Authentication failures in admin dashboard
roo debug "Admin login authentication failing intermittently"

# Expected Debug Actions:
# 1. Check investigations/index.md for auth-related issues
# 2. Apply JWT debugging patterns systematically
# 3. Reproduce issue with reliable steps
# 4. Trace to root cause with evidence
# 5. Develop comprehensive solution addressing cause
```

**Exercise 2: Multi-System Debugging**
```bash
# Scenario: Booking creation failing with multiple symptoms
roo debug "Booking creation fails with database errors and email notification issues"

# Expected Debug Actions:
# 1. Apply Multi-System Debugging Pattern
# 2. Analyze transaction flow across components
# 3. Identify cascading failure points
# 4. Document comprehensive solution
# 5. Update institutional memory with patterns
```

---

## 🧪 QA Role Documentation

### Purpose & Specialization
Quality verification specialist ensuring comprehensive testing and compliance using established patterns.

### Key Capabilities
- **Comprehensive Testing**: Functional, integration, and accessibility testing
- **Quality Gate Enforcement**: Ensures standards compliance before release
- **Test Automation**: Implements and maintains automated quality verification
- **Pattern-Based Testing**: Uses testing patterns from institutional memory

### When to Use QA Role
- **Feature Validation**: New functionality needs comprehensive testing
- **Regression Testing**: Changes require impact verification  
- **Quality Assurance**: Features need compliance verification
- **Test Automation**: Testing infrastructure needs implementation/maintenance

### QA Workflow Pattern

```bash
# 1. Receive feature for quality verification
roo qa "Verify booking form validation with accessibility compliance"

# QA will:
# - Apply testing patterns from patterns/index.md
# - Execute comprehensive test suites
# - Verify accessibility compliance (WCAG 2.1 AA)
# - Run security validation
# - Check performance requirements

# 2. Quality gate execution
pnpm run test:critical          # Essential functionality tests
pnpm run test:accessibility     # Accessibility compliance
pnpm run security:scan          # Security verification
pnpm run lighthouse:ci          # Performance validation

# 3. Comprehensive quality report
# - Test results with coverage metrics
# - Issues found with reproduction steps
# - Quality recommendations
```

### QA Testing Checklist

**Functional Testing**:
- [ ] Core functionality works as specified
- [ ] Edge cases handled appropriately
- [ ] Error scenarios return proper feedback
- [ ] User workflows complete successfully

**Integration Testing**:
- [ ] API endpoints respond correctly
- [ ] Database operations maintain consistency
- [ ] External services integrate properly
- [ ] System components communicate correctly

**Accessibility Testing**:
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader compatibility tested
- [ ] Keyboard navigation functional
- [ ] Color contrast ratios meet standards

**Security Testing**:
- [ ] Input validation prevents injection
- [ ] Authentication/authorization working
- [ ] Sensitive data properly protected
- [ ] Security headers configured correctly

**Performance Testing**:
- [ ] Core Web Vitals within targets
- [ ] API responses < 500ms
- [ ] Bundle size optimized
- [ ] Database queries performant

### QA Quality Report Template

```markdown
# QA Report: [Feature/Release Name]

## Testing Summary
**Scope**: [Features and functionality tested]
**Patterns Applied**: [Testing patterns from institutional memory]
**Quality Gates**: [Pass/fail status for all gates]

## Test Results
**Functional Tests**: [Results, coverage, pass rate]
**Integration Tests**: [System integration verification results]
**Accessibility Tests**: [WCAG 2.1 AA compliance status]
**Security Tests**: [Vulnerability assessment results]
**Performance Tests**: [Core Web Vitals and performance metrics]

## Issues Found
[Detailed issue reports with reproduction steps, severity, and recommendations]

## Quality Metrics
**Test Coverage**: [Percentage and areas covered]
**Performance Scores**: [Lighthouse scores and Core Web Vitals]
**Accessibility Score**: [Compliance percentage and issues]
**Security Status**: [Vulnerabilities and resolution status]

## Recommendations
[Quality improvement suggestions and follow-up actions]

## Release Readiness
- [ ] All critical issues resolved
- [ ] Quality gates passed
- [ ] Performance targets met
- [ ] Security requirements satisfied
```

### QA Success Metrics
- 100% critical quality gates passed
- 95%+ accessibility compliance scores
- Zero security vulnerabilities in production
- <500ms average API response times

### QA Training Exercises

**Exercise 1: Comprehensive Feature Testing**
```bash
# Scenario: Test new booking confirmation system
roo qa "Verify booking confirmation system with email notifications"

# Expected QA Actions:
# 1. Apply Email Testing Pattern from patterns/index.md
# 2. Test functional workflow end-to-end
# 3. Verify accessibility compliance
# 4. Check email template rendering across clients
# 5. Validate security of confirmation process
```

**Exercise 2: Quality Gate Enforcement**
```bash
# Scenario: Pre-release quality validation
roo qa "Execute comprehensive quality validation for admin dashboard release"

# Expected QA Actions:
# 1. Run full test suite with all quality gates
# 2. Execute accessibility and security scans
# 3. Verify performance targets met
# 4. Generate comprehensive quality report
# 5. Confirm release readiness
```

---

## 🚀 Deploy Role Documentation

### Purpose & Specialization
Production deployment and infrastructure specialist ensuring reliable releases with operational excellence.

### Key Capabilities
- **Deployment Orchestration**: Safe and reliable production deployments
- **Infrastructure Management**: System health and scalability monitoring
- **Operational Monitoring**: Application performance and availability tracking
- **Deployment Automation**: CI/CD pipeline maintenance and optimization

### When to Use Deploy Role
- **Production Releases**: Features ready for deployment
- **Infrastructure Management**: System configuration and scaling
- **Operational Issues**: Production monitoring and incident response
- **Deployment Automation**: CI/CD pipeline implementation/maintenance

### Deploy Workflow Pattern

```bash
# 1. Pre-deployment verification
roo deploy "Deploy booking confirmation system to production"

# Deploy will:
# - Verify all quality gates passed
# - Check security and performance requirements
# - Execute deployment procedures safely
# - Monitor system health post-deployment
# - Maintain rollback procedures

# 2. Deployment verification gates
pnpm run build:production       # Production build verification
pnpm run test:production        # Production environment testing
pnpm run security:scan          # Pre-deployment security check
pnpm run lighthouse             # Performance verification

# 3. Production deployment with monitoring
# 4. Post-deployment health checks and verification
```

### Deploy Pre-Deployment Checklist

**Quality Verification**:
- [ ] All critical quality gates passed
- [ ] Security scan completed with clean results
- [ ] Performance requirements verified
- [ ] Accessibility compliance confirmed

**Environment Preparation**:
- [ ] Production environment configured
- [ ] Database migrations tested
- [ ] External services verified
- [ ] Rollback procedures prepared

**Deployment Execution**:
- [ ] Blue-green deployment strategy applied
- [ ] Configuration management verified
- [ ] Security hardening patterns applied
- [ ] Monitoring systems configured

**Post-Deployment Validation**:
- [ ] System health metrics normal
- [ ] Application functionality verified
- [ ] Performance within targets
- [ ] Error rates acceptable

### Deploy Deployment Report Template

```markdown
# Deployment Report: [Release Version]

## Deployment Summary
**Version**: [Release version/tag]
**Environment**: [Production/staging environment]
**Patterns Applied**: [Deployment patterns used]
**Duration**: [Total deployment time]

## Pre-deployment Verification
**Quality Gates**: [All gates passed/issues resolved]
**Security Scan**: [Clean/vulnerabilities addressed]
**Performance Check**: [Metrics within targets]
**Environment Status**: [Configuration verified]

## Deployment Process
**Strategy**: [Blue-green/rolling/other deployment approach]
**Configuration**: [Environment settings applied]
**Database**: [Migration status and verification]
**External Services**: [Integration status]

## Post-deployment Health
**System Metrics**: [CPU, memory, disk usage normal]
**Application Performance**: [Response times, error rates]
**Availability**: [Uptime and accessibility status]
**Monitoring**: [Alerts and notification status]

## Rollback Plan
[Prepared rollback procedures and trigger conditions]
[Recovery time objectives and procedures]
```

### Deploy Success Metrics
- 100% successful deployments without rollback
- <5 minute deployment times for standard releases
- Zero downtime deployments achieved
- 99.9%+ application availability maintained

### Deploy Training Exercises

**Exercise 1: Production Deployment**
```bash
# Scenario: Deploy new feature to production
roo deploy "Deploy real-time booking notifications to production environment"

# Expected Deploy Actions:
# 1. Verify all pre-deployment quality gates
# 2. Execute blue-green deployment strategy
# 3. Monitor system health during deployment
# 4. Validate functionality post-deployment
# 5. Confirm rollback procedures available
```

**Exercise 2: Infrastructure Management**
```bash
# Scenario: Scale application for increased load
roo deploy "Scale booking system infrastructure for peak holiday traffic"

# Expected Deploy Actions:
# 1. Apply infrastructure scaling patterns
# 2. Monitor performance metrics during scaling
# 3. Verify database connection pool scaling
# 4. Test load balancer configuration
# 5. Document infrastructure changes
```

---

## Cross-Role Integration Patterns

### Handoff Workflows

**Navigator → Architect → Code → QA → Deploy**
```bash
# 1. Strategic planning and coordination
roo navigator "Plan user authentication enhancement project"

# 2. Technical design with patterns
roo architect "Design enhanced authentication system with MFA"

# 3. Implementation with deployment gates  
roo code "Implement MFA authentication using Security Pattern"

# 4. Quality verification
roo qa "Verify MFA authentication system compliance"

# 5. Production deployment
roo deploy "Deploy MFA authentication to production"
```

**Code → Debug → Code (Issue Resolution)**
```bash
# 1. Implementation encounters issue
roo code "Implement booking validation encountering database errors"

# 2. Systematic debugging
roo debug "Investigate database transaction failures in booking validation"

# 3. Implementation of solution
roo code "Implement database transaction fix from Debug analysis"
```

### Emergency Escalation Patterns

**Production Issues**:
```bash
# Critical production issue
roo debug "Investigate production booking system failure"
# → Escalate to human Navigator for business decisions
# → Use Deploy role for immediate mitigation
```

**Security Vulnerabilities**:
```bash  
# Security issue discovered
roo debug "Investigate potential SQL injection vulnerability"
# → Use security-issue-escalation.md template
# → Coordinate Debug → Code → QA → Deploy response
```

---

## Performance Optimization Guidelines

### Token Usage Optimization
- **Model Tiering**: Use appropriate model per role complexity
- **Context Curation**: Provide targeted context vs generic discovery
- **Pattern Reuse**: Apply institutional patterns (80% target)
- **Circuit Breakers**: Prevent scope expansion and token waste

### Appetite Management
- **Estimation Accuracy**: Target 85% accuracy vs 45% baseline
- **Circuit Breakers**: Stop at scope boundaries consistently  
- **Quality Gates**: Prevent rework through upfront quality
- **Institutional Memory**: Learn from historical complexity data

### Quality Consistency
- **Deployment Gates**: 100% critical gate compliance
- **Pattern Application**: Consistent implementation approaches
- **Cross-Role Handoffs**: Complete context preservation
- **Continuous Learning**: Update patterns and memory continuously

---

## Troubleshooting Common Issues

### Role Coordination Problems
**Symptom**: Context loss between role transitions
**Solution**: Use structured handoff templates from `.docs/handoffs/index.md`

### Quality Gate Failures
**Symptom**: Deployment gates failing consistently
**Solution**: Address systematic issues, update thresholds if needed

### Pattern Application Gaps
**Symptom**: Low pattern reuse rates (<80%)
**Solution**: Mandate pattern checks, improve pattern discovery

### Appetite Boundary Violations
**Symptom**: Consistent scope expansion beyond appetites
**Solution**: Strengthen circuit breaker enforcement, improve estimation

---

## Success Metrics Dashboard

Track these key metrics across all custom roles:

**Appetite Accuracy**: 85% target (vs 45% baseline)
**Token Reduction**: 77% reduction through optimization  
**Quality Compliance**: 100% critical gate compliance
**Pattern Reuse**: 80% institutional memory application
**Cross-Role Efficiency**: 95% successful handoffs
**Production Stability**: 99.9% availability with zero-downtime deployments

---

**Training Complete**: All 6 custom roles are now fully documented with comprehensive usage patterns, success metrics, and training exercises for production deployment.