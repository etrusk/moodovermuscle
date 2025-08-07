# Custom Roles Troubleshooting Guide & Best Practices
**Version**: 1.0  
**Date**: 2025-08-07  
**Status**: Production Ready

## Quick Reference

### Emergency Commands
```bash
# System health check
pnpm run quality-gates                    # Verify all quality gates
pnpm run performance:validate             # Check system readiness
pnpm run workflow:detect                  # Check for functionality changes

# Rollback procedures
mv .roomodes .roomodes.backup             # Disable custom roles (emergency)
git checkout main                         # Return to stable state
pnpm run deployment:gates                 # Verify system integrity
```

### System Status Indicators
- **✅ All systems operational**: All quality gates pass, performance targets met
- **⚠️ Degraded performance**: Some quality gates fail, targets not met
- **❌ System failure**: Critical quality gates fail, requires immediate attention

---

## Common Issues & Solutions

### 1. Custom Roles Not Loading

**Symptoms**:
- `roo --list-modes` shows only built-in roles
- Custom role commands fail with "unknown mode" errors
- Roo Code reverts to default behavior

**Diagnostics**:
```bash
# Check if .roomodes file exists and is valid
ls -la .roomodes
cat .roomodes | head -20

# Verify YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.roomodes'))" 2>/dev/null && echo "Valid YAML" || echo "Invalid YAML"

# Check Roo Code status
roo --version
roo --list-modes
```

**Solutions**:

**Solution A: YAML Syntax Error**
```bash
# Common issues in .roomodes:
# - Incorrect indentation (use 2 spaces, not tabs)
# - Missing quotes around special characters
# - Malformed YAML structure

# Fix example:
# Wrong: custom_instructions: "Line 1\nLine 2"
# Right: custom_instructions: |
#   Line 1
#   Line 2
```

**Solution B: File Permissions**
```bash
chmod 644 .roomodes
```

**Solution C: Roo Code Refresh**
```bash
roo --reload
# Or restart Roo Code CLI completely
```

**Prevention**:
- Always validate YAML syntax before committing `.roomodes` changes
- Keep backup of working `.roomodes` file
- Test role loading after any configuration changes

### 2. Quality Gates Failing

**Symptoms**:
- `pnpm run quality-gates` exits with non-zero code
- Specific gates show "failed" status in output
- Deployment blocked by quality requirements

**Diagnostics**:
```bash
# Check individual gates
pnpm run lint                             # ESLint/Prettier issues
pnpm run type-check                       # TypeScript errors
pnpm run test:critical                    # Test failures
pnpm run security:scan                    # Security vulnerabilities
pnpm run build >/dev/null 2>&1           # Build failures

# Review quality gates report
cat .quality-gates-report.json | jq .
```

**Solutions**:

**Solution A: Linting Failures**
```bash
# Auto-fix most issues
pnpm run lint

# Common manual fixes:
# - Remove unused imports
# - Fix naming conventions
# - Correct async/await usage
```

**Solution B: TypeScript Errors**
```bash
# Check specific errors
pnpm run type-check

# Common fixes:
# - Add missing type definitions
# - Remove `any` types (replace with proper types)
# - Fix interface definitions
# - Update import paths
```

**Solution C: Test Failures**
```bash
# Run tests with verbose output
pnpm run test:critical --verbose

# Common issues:
# - Mock data format mismatches
# - Async test timing issues
# - Environment setup problems
```

**Solution D: Security Vulnerabilities**
```bash
# Check specific vulnerabilities
pnpm audit

# Fix with dependency updates
pnpm audit fix

# For unfixable issues, document in security exceptions
```

**Solution E: Build Failures**
```bash
# Check build output for errors
pnpm run build

# Common issues:
# - Missing environment variables
# - Import resolution failures
# - Asset processing errors
```

**Prevention**:
- Run quality gates locally before committing
- Set up pre-commit hooks to catch issues early
- Monitor quality gate trends to identify patterns

### 3. Preview Workflow Issues

**Symptoms**:
- Functionality changes not detected when expected
- Preview branch creation fails
- Client approval workflow not triggering

**Diagnostics**:
```bash
# Check workflow state
cat .preview-workflow-state.json

# Verify git history
git log --oneline -10

# Check file change detection
pnpm run workflow:detect --verbose
```

**Solutions**:

**Solution A: Changes Not Detected**
```bash
# Verify files are committed
git status

# Check if files match detection patterns
# Patterns include: app/api/**, components/**, lib/**, prisma/**
# Review patterns in scripts/preview-workflow.js

# Force detection update
rm .preview-workflow-state.json
pnpm run workflow:detect
```

**Solution B: Branch Creation Failure**
```bash
# Check git permissions and state
git status
git branch -a

# Ensure clean working directory
git add .
git commit -m "prep: prepare for preview branch"

# Retry branch creation
pnpm run workflow:create-preview
```

**Solution C: Git Integration Issues**
```bash
# Check remote configuration
git remote -v

# Ensure push permissions
git push origin $(git branch --show-current)

# Reset workflow state if corrupted
rm .preview-workflow-state.json
```

**Prevention**:
- Always commit changes before running preview workflow
- Regularly clean up old preview branches
- Monitor workflow state file for corruption

### 4. Institutional Memory Integration Problems

**Symptoms**:
- Pattern applications not being recorded
- Memory updates failing
- Index files becoming corrupted

**Diagnostics**:
```bash
# Check memory update functionality
pnpm run memory:update

# Verify index file integrity
cat .docs/patterns/index.md | tail -20
cat .docs/memory/index.md | tail -20

# Check current task content
cat .docs/current-task.md
```

**Solutions**:

**Solution A: Memory Update Failures**
```bash
# Check file permissions
chmod 644 .docs/patterns/index.md
chmod 644 .docs/memory/index.md

# Verify index file structure
# Files should have ## Recently Updated sections
```

**Solution B: Pattern Extraction Issues**
```bash
# Check current-task.md format
# Memory updater looks for:
# - "applied [pattern] pattern"
# - "new patterns developed"
# - "70/30 routing" mentions
# - "appetite boundary" mentions

# Ensure proper formatting in task documentation
```

**Solution C: Index File Corruption**
```bash
# Restore from git if corrupted
git checkout HEAD -- .docs/patterns/index.md
git checkout HEAD -- .docs/memory/index.md

# Manually add missing entries if needed
```

**Prevention**:
- Regularly backup institutional memory files
- Monitor memory update execution in task workflows
- Use consistent terminology in task documentation

### 5. Performance Validation Issues

**Symptoms**:
- Performance metrics not updating
- Validation reports showing incorrect data
- System readiness validation failing

**Diagnostics**:
```bash
# Check performance metrics file
cat .performance-metrics.json

# Generate fresh performance report
pnpm run performance:report

# Validate system readiness
pnpm run performance:validate
```

**Solutions**:

**Solution A: Metrics Not Updating**
```bash
# Reset metrics to baseline
rm .performance-metrics.json
pnpm run performance:report

# Manually record sample data
pnpm run performance:appetite '{"estimatedHours":4,"actualHours":3.5,"taskComplexity":5}'
```

**Solution B: Incorrect Baseline Data**
```bash
# Update baseline values in performance script
# Edit scripts/performance-validation.js
# Adjust baseline values in constructor
```

**Solution C: System Readiness Validation**
```bash
# Check individual requirements
pnpm run performance:validate

# Address specific failures:
# - Appetite accuracy: Use institutional memory for estimation
# - Token optimization: Increase pattern reuse
# - Quality compliance: Fix systematic gate failures
# - Pattern reuse: Mandate pattern checks
```

**Prevention**:
- Regularly record performance data during tasks
- Monitor trends to identify degradation early
- Update baselines as system matures

---

## Best Practices

### Development Workflow

#### Daily Workflow Optimization

**Morning Setup**:
```bash
# Start with system health check
pnpm run quality-gates
pnpm run performance:validate

# Update institutional memory
pnpm run memory:update
```

**During Development**:
```bash
# Before starting new feature
# 1. Research patterns first
grep -r "similar-feature" .docs/patterns/

# 2. Check for known issues
grep -r "potential-problem" .docs/investigations/

# 3. Set appetite boundaries
echo "Appetite: X hours, Circuit breaker: Y conditions" >> .docs/current-task.md
```

**Before Commits**:
```bash
# Mandatory pre-commit sequence
pnpm run deployment:gates

# If functionality changes detected
pnpm run workflow:detect
# Follow preview workflow if changes found
```

#### Role Usage Patterns

**Strategic Planning** → Use **Navigator**:
```bash
# For complex multi-domain work
roo navigator "Coordinate user authentication system with email integration"

# Expected: Context synthesis, specialist handoffs, appetite management
```

**Technical Design** → Use **Architect**:
```bash
# For system design and specifications
roo architect "Design real-time booking notification system"

# Expected: Pattern-informed design, implementation roadmap, quality gates
```

**Implementation** → Use **Code**:
```bash
# For pattern-driven implementation
roo code "Implement booking form validation using established patterns"

# Expected: Pattern application, quality gates enforcement, memory updates
```

**Problem Investigation** → Use **Debug**:
```bash
# For systematic debugging
roo debug "Investigate intermittent booking creation failures"

# Expected: Root cause analysis, comprehensive solutions, knowledge capture
```

### Quality Assurance

#### Quality Gate Strategy

**Critical Gates** (Never bypass):
- **Linting**: ESLint + Prettier for code consistency
- **Type Checking**: TypeScript compilation for type safety
- **Critical Tests**: Essential functionality validation
- **Security Scan**: Vulnerability detection and prevention
- **Build Verification**: Production readiness confirmation

**Performance Gates** (Monitor trends):
- **Lighthouse CI**: Core Web Vitals and performance metrics
- **Accessibility Check**: WCAG 2.1 AA compliance validation

#### Testing Approach

**Three-Layer Testing**:
1. **Unit Tests**: Component and function isolation
2. **Integration Tests**: API and database interaction
3. **End-to-End Tests**: Complete user workflow validation

**Test Data Management**:
```bash
# Use consistent test data formats
# Reference established patterns for mock data
# Maintain test database separately from production
```

### Performance Optimization

#### Token Usage Optimization

**Model Tiering Strategy**:
- **Navigator**: Claude Sonnet 4 (complex coordination)
- **Architect**: Claude Sonnet 4 (high-level design reasoning)
- **Code**: Claude Haiku 3 (efficient implementation)
- **Debug**: Claude Sonnet 4 (complex problem solving)
- **QA**: Claude Haiku 3 (systematic testing)
- **Deploy**: Claude Haiku 3 (infrastructure tasks)

**Context Curation**:
- **Synthesized Context**: Navigator provides research-based context
- **Curated Context**: Architect provides design-specific guidance
- **Specialized Context**: Code/Debug receive targeted instructions

#### Appetite Management

**Estimation Guidelines**:
```bash
# Simple tasks (1-3 complexity): 1-4 hours
# Medium tasks (4-6 complexity): 4-8 hours  
# Complex tasks (7-10 complexity): 8+ hours (break down)

# Apply historical calibration from .docs/memory/complexity-estimation-framework-and-historical-calibration.md
```

**Circuit Breaker Rules**:
- **Time Boundaries**: Stop at estimated time + 25%
- **Scope Boundaries**: No feature expansion beyond specification
- **Quality Boundaries**: Never compromise functionality for appetite

### Institutional Memory Management

#### Pattern Development

**Creating New Patterns**:
1. **Identify Reusable Approach**: Solution used 2+ times
2. **Document Pattern**: Use pattern template format
3. **Reference Prerequisites**: Dependencies and constraints
4. **Include Examples**: Working code and usage scenarios
5. **Update Index**: Add to appropriate category in patterns/index.md

**Pattern Application**:
```bash
# Always check patterns before implementing
grep -r "authentication" .docs/patterns/

# Reference pattern in implementation
# Comment code with pattern reference
# "Applying JWT Middleware Pattern from patterns/auth-jwt-middleware-pattern.md"
```

#### Knowledge Capture

**During Implementation**:
- Document pattern applications in task notes
- Record any adaptations or improvements made
- Note appetite accuracy and complexity insights

**After Completion**:
- Run memory update to capture learning: `pnpm run memory:update`
- Review captured patterns for accuracy
- Update pattern documentation if improvements found

### Security & Compliance

#### Security Best Practices

**Authentication & Authorization**:
- Always use established JWT patterns
- Implement proper session management
- Apply role-based access control correctly
- Document security decisions in decisions/index.md

**Input Validation**:
- Validate all user inputs server-side
- Use established validation patterns
- Apply consistent sanitization approaches
- Test for injection vulnerabilities

**Data Protection**:
- Encrypt sensitive data at rest and in transit
- Implement proper audit trails
- Follow data retention policies
- Document compliance requirements

#### Compliance Monitoring

**Quality Gate Compliance**:
- 100% critical gate passage required
- Monitor gate performance trends
- Address systematic failures quickly
- Document any approved exceptions

**Accessibility Compliance**:
- Maintain WCAG 2.1 AA standards
- Test with assistive technologies
- Monitor Lighthouse accessibility scores
- Regular accessibility audits

---

## Escalation Procedures

### Level 1: Systematic Resolution

**Scope**: Common issues with documented solutions

**Process**:
1. **Identify Issue**: Use diagnostic commands to understand problem
2. **Apply Solution**: Follow documented resolution steps
3. **Verify Fix**: Confirm issue resolved with system tests
4. **Document**: Update troubleshooting guide if new solution found

**Timeline**: 15-30 minutes per issue

### Level 2: Investigation Required

**Scope**: Complex issues requiring systematic debugging

**Process**:
1. **Use Debug Role**: Systematic investigation with institutional memory
2. **Root Cause Analysis**: Identify fundamental causes, not symptoms
3. **Comprehensive Solution**: Address causes and prevent recurrence
4. **Knowledge Capture**: Document findings in institutional memory

**Timeline**: 1-4 hours depending on complexity

### Level 3: Human Escalation

**Scope**: Business decisions, security issues, architectural changes

**Triggers**:
- Business logic decisions (30% decisions in Navigator-Driver model)
- Security vulnerabilities requiring disclosure
- System architecture changes beyond appetite
- Critical production issues affecting business operations

**Process**:
1. **Document Issue**: Complete problem description with context
2. **Use Escalation Templates**: Reference .docs/handoffs/ templates
3. **Provide Recommendations**: Include technical analysis and options
4. **Coordinate Response**: Support human decision-making process

**Timeline**: Immediate escalation, response depends on severity

---

## Monitoring & Maintenance

### Daily Health Checks

```bash
# System health verification
pnpm run quality-gates >/dev/null && echo "✅ Quality gates healthy" || echo "❌ Quality issues detected"
pnpm run workflow:detect >/dev/null && echo "✅ Preview workflow operational" || echo "❌ Workflow issues detected"  
pnpm run memory:update >/dev/null && echo "✅ Memory system functional" || echo "❌ Memory issues detected"
```

### Weekly Maintenance

```bash
# Performance trend analysis
pnpm run performance:report

# Institutional memory review
ls -la .docs/patterns/ | grep "$(date -d '7 days ago' +%Y-%m-%d)"
ls -la .docs/memory/ | grep "$(date -d '7 days ago' +%Y-%m-%d)"

# Quality gate trend analysis  
jq '.summary' .quality-gates-report.json
```

### Monthly Reviews

**System Optimization**:
- Review performance metrics trends
- Update baseline values for improved system
- Identify optimization opportunities
- Plan infrastructure improvements

**Knowledge Management**:
- Review pattern effectiveness and usage
- Archive obsolete patterns and decisions
- Update institutional memory documentation
- Calibrate appetite estimation accuracy

**Process Improvement**:
- Analyze workflow efficiency metrics
- Update troubleshooting procedures
- Refine quality gate thresholds
- Enhance automation capabilities

---

## Emergency Procedures

### Critical Production Issues

**Immediate Response** (< 5 minutes):
```bash
# System rollback if needed
mv .roomodes .roomodes.emergency-backup
git checkout main
pnpm run quality-gates

# If custom roles stable, investigate with Debug role
roo debug "Critical production issue: [description]"
```

### Security Incidents

**Security Response Protocol**:
1. **Isolate Impact**: Contain security exposure
2. **Document Evidence**: Preserve logs and system state
3. **Use Security Escalation Template**: .docs/handoffs/security-issue-escalation.md
4. **Coordinate Response**: Include legal and compliance considerations
5. **Implement Fixes**: Apply comprehensive security solutions
6. **Post-Incident Review**: Update security patterns and procedures

### Data Loss or Corruption

**Recovery Procedures**:
```bash
# Institutional memory recovery
git checkout HEAD~1 -- .docs/patterns/index.md
git checkout HEAD~1 -- .docs/memory/index.md
git checkout HEAD~1 -- .docs/investigations/index.md

# Performance metrics recovery
cp .performance-metrics.json.backup .performance-metrics.json

# Quality gates configuration recovery
git checkout HEAD -- scripts/quality-gates.js
```

---

**Troubleshooting Complete**: Comprehensive guide covers common issues, best practices, escalation procedures, and emergency protocols for production-ready custom role operations.