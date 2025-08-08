# Circuit Breakers - LLM-Optimized Quality Framework

## Overview

Circuit breakers are non-negotiable boundaries that protect business value and system integrity in LLM-driven development. Unlike appetite constraints (which manage scope), circuit breakers trigger **mandatory escalation** when quality or business protection is threatened.

## Core Principle: Scope vs Quality Separation

**SCOPE EXPANSION**: Managed through appetite constraints
- Features beyond defined scope → Escalate to Navigator
- Nice-to-have additions → Document for future appetite
- Optimization opportunities → Queue for next iteration

**QUALITY COMPROMISE**: Triggers circuit breakers
- Critical test failures → Block deployment, escalate
- Security vulnerabilities → Mandatory remediation
- Business logic errors → Immediate escalation

## Circuit Breaker Categories

### 1. Scope Expansion Breakers (Appetite Management)

**TRIGGER CONDITIONS**:
- Implementation requires features beyond current roadmap
- Dependencies demand architectural changes not in scope  
- Timeline pressure suggests cutting planned features
- Business logic complexity exceeds appetite estimation

**ACTIONS**:
- **STOP**: Halt current implementation
- **DOCUMENT**: Scope expansion requirement in `.docs/current-task.md`
- **ESCALATE**: Switch to Navigator mode for appetite adjustment
- **PROTECT**: Never compromise existing functionality for scope

**ESCALATION TEMPLATE**:
```markdown
## SCOPE EXPANSION BREAKER TRIGGERED
**Current Appetite**: [Original scope definition]
**Expansion Need**: [Specific additional scope required]
**Impact**: [How this affects timeline/quality]
**Options**: [Reduce scope vs expand appetite vs defer]
**Recommendation**: [Suggested path forward]
```

### 2. Quality Gate Breakers (Non-Negotiable Standards)

**CRITICAL QUALITY GATES** (Block deployment):
```bash
npm run lint              # Code quality standards
npm run type-check        # TypeScript compilation
npm run test:critical     # Essential business logic tests  
npm run security:scan     # Security vulnerability detection
npm run build:verify      # Production build verification
```

**TRIGGER CONDITIONS**:
- Any critical quality gate failure
- Test coverage drops below 85% for critical paths
- Security scan identifies HIGH/CRITICAL vulnerabilities
- TypeScript errors in production code
- ESLint errors in business logic components

**ACTIONS**:
- **BLOCK**: Prevent any git commits until resolved
- **ESCALATE**: If fixes require scope expansion
- **MAINTAIN**: Never bypass quality for appetite pressure
- **DOCUMENT**: Quality issues in `.docs/current-task.md`

**NON-CRITICAL GATES** (Track but don't block):
- Integration tests requiring external dependencies
- Performance tests beyond current appetite
- Accessibility features not in current scope
- Advanced TypeScript configurations

### 3. Business Protection Breakers (Alternative Verification Insufficient)

**DATABASE INTEGRITY BREAKERS**:
- Booking conflicts despite database constraints
- Data consistency failures in critical paths
- Transaction rollback failures
- Migration failures affecting existing data

**USER EXPERIENCE BREAKERS**:
- Form submission failures without user feedback
- Authentication failures with misleading errors
- Payment processing errors without proper handling
- Accessibility violations preventing system use

**MONITORING BREAKERS**:
- Critical business processes unmonitored
- Error rates exceeding 1% without alerts
- Performance degradation without detection
- Security events without logging

## Escalation Pathways

### Level 1: Implementation Specialist → Navigator
**WHEN**: Scope expansion needed, appetite boundaries reached
**HOW**: Switch to Navigator mode with circuit breaker documentation
**TIMELINE**: Immediate (within 15 minutes of trigger)

### Level 2: Navigator → Human Developer  
**WHEN**: Business logic decisions, security policies, UX flows
**HOW**: Document decision requirements, schedule human intervention
**TIMELINE**: Within 1 business day for critical paths

### Level 3: Human Developer → Business Stakeholder
**WHEN**: Appetite expansion, business rule changes, priority shifts
**HOW**: Formal appetite adjustment process
**TIMELINE**: Within 2 business days for scope changes

## Quality Gate Automation Integration

### Pre-commit Hooks (Husky Integration)
```bash
#!/bin/sh
. "$(dirname -- "$0")/_/husky.sh"

# Run circuit breaker verification
npm run circuit-breakers:verify

# Block commit on breaker trigger
if [ $? -ne 0 ]; then
  echo "🚨 CIRCUIT BREAKER TRIGGERED - Commit blocked"
  exit 1
fi
```

### Continuous Integration Blocks
```yaml
# GitHub Actions integration
- name: Circuit Breaker Verification
  run: npm run circuit-breakers:verify
  
- name: Block Deploy on Breaker
  if: failure()
  run: |
    echo "::error::Circuit breaker triggered - deployment blocked"
    exit 1
```

## LLM Development Team Guidance

### For Implementation Specialists
1. **Check circuit breakers BEFORE starting implementation**
2. **Monitor quality gates throughout development**
3. **Document breaker encounters immediately**
4. **Never compromise functionality to fit appetite**
5. **Escalate scope needs before quality compromise**

### For Investigation Specialists  
1. **Use breakers to guide debugging priority**
2. **Focus on business protection breakers first**
3. **Document investigation insights for future breaker refinement**
4. **Escalate when debugging requires scope expansion**

### For Quality Specialists
1. **Maintain circuit breaker automation**
2. **Refine quality gate thresholds based on business impact**
3. **Monitor breaker trigger frequencies**
4. **Recommend breaker adjustments to Navigator**

## Circuit Breaker Monitoring

### Metrics to Track
- **Breaker trigger frequency**: Target <5% of implementations
- **Escalation response time**: Target <15 minutes for critical
- **False positive rate**: Target <10% of triggers
- **Business impact prevention**: Track value protected

### Breaker Refinement Process
1. **Weekly review** of breaker triggers with Navigator
2. **Monthly calibration** of quality gate thresholds  
3. **Quarterly assessment** of business protection effectiveness
4. **Annual review** of escalation pathway efficiency

## Success Indicators

### Framework Effectiveness
- **99.5%+ production deployment success rate**
- **<1% post-deployment critical issues**
- **100% critical security vulnerability prevention**
- **95% appetite boundary compliance**

### LLM Team Efficiency  
- **<15 minutes average escalation time**
- **90% circuit breaker resolution without scope compromise**
- **95% quality gate pass rate on first attempt**
- **85% successful appetite completion within boundaries**

## Integration with Testing Framework

### Multi-Layer Verification Approach
1. **Database Constraints**: Prevent conflicts at data layer
2. **Application Logic**: Validate business rules
3. **E2E Testing**: Verify user experience flows
4. **Monitoring**: Detect production issues
5. **Circuit Breakers**: Enforce quality boundaries

### LLM-Optimized Test Strategy Alignment
- **Critical path coverage**: 99.7% test success rate maintenance
- **Business logic protection**: Zero compromise tolerance
- **Scope boundary enforcement**: Clear escalation triggers
- **Quality gate automation**: Seamless CI/CD integration

## Framework Evolution

### Version 1.0: Foundation (Current)
- Basic circuit breaker definitions
- Quality gate automation
- Escalation pathway establishment

### Version 2.0: Intelligence (Planned)
- ML-based breaker threshold optimization
- Predictive scope expansion detection
- Automated quality regression analysis

### Version 3.0: Adaptive (Future)
- Self-tuning quality gates
- Dynamic appetite boundary adjustment
- Intelligent business impact assessment

---

**Remember**: Circuit breakers exist to **protect business value**, not restrict development. When triggered, they indicate the need for **strategic decisions**, not implementation shortcuts.