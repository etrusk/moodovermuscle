# Runbooks and Playbooks

## Overview

This document contains operational guides and playbooks for common scenarios, troubleshooting procedures, and incident response for the MoodOverMuscle fitness website.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Incident Response Playbooks](#incident-response-playbooks)
3. [Troubleshooting Runbooks](#troubleshooting-runbooks)
4. [Operational Procedures](#operational-procedures)
5. [Emergency Procedures](#emergency-procedures)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Performance Optimization](#performance-optimization)
8. [Security Procedures](#security-procedures)
9. [Backup and Recovery](#backup-and-recovery)
10. [Communication Templates](#communication-templates)
11. [Tools and Scripts](#tools-and-scripts)

---

**Document Information**
- **Last Updated**: 2025-07-27
- **Version**: 1.0
- **Owner**: DevOps Team
- **Review Schedule**: Quarterly

---

## Quick Reference

### Emergency Contacts
- **On-call Engineer**: +61-XXX-XXX-XXXX
- **Tech Lead**: tech@moodovermuscle.com.au
- **Product Owner**: product@moodovermuscle.com.au
- **Customer Support**: support@moodovermuscle.com.au

### Critical URLs
- **Production**: https://moodovermuscle.com.au
- **Staging**: https://staging.moodovermuscle.com.au
- **Status Page**: https://status.moodovermuscle.com.au
- **GitHub**: https://github.com/etrusk/moodovermuscle

## Incident Response Playbooks

### Playbook 1: Website Down

#### Symptoms
- Users report website inaccessible
- Monitoring alerts triggered
- Error rate > 5%

#### Immediate Actions (0-5 minutes)
1. **Check Status Page**
   ```bash
   curl -I https://moodovermuscle.com.au
   ```

2. **Verify DNS Resolution**
   ```bash
   nslookup moodovermuscle.com.au
   ```

3. **Check Vercel Status**
   - Visit https://www.vercel-status.com/

#### Investigation (5-15 minutes)
1. **Check Error Logs**
   ```bash
   # Via Vercel dashboard
   # Go to Deployments → [Latest] → Logs
   ```

2. **Review Recent Deployments**
   ```bash
   git log --oneline -10
   ```

3. **Check Build Status**
   ```bash
   # In GitHub Actions
   # Check latest workflow runs
   ```

#### Resolution (15-30 minutes)
1. **Rollback if Necessary**
   ```bash
   # Via Vercel dashboard
   # Deployments → Previous deployment → Promote to Production
   ```

2. **Emergency Fix**
   ```bash
   git checkout -b hotfix/critical-fix
   # Make necessary changes
   git commit -m "fix: critical issue resolution"
   git push origin hotfix/critical-fix
   ```

3. **Verify Fix**
   ```bash
   ./scripts/health-check.js
   ```

#### Communication
- **Slack**: Post in #incidents channel
- **Email**: Send to stakeholders
- **Status Page**: Update status

### Playbook 2: High Error Rate

#### Symptoms
- Error rate > 2% sustained for 5 minutes
- Users report booking failures
- API response errors

#### Investigation Steps
1. **Check Error Patterns**
   ```bash
   # Review error logs
   # Look for common error types
   ```

2. **Identify Affected Features**
   - Booking system
   - User authentication
   - Payment processing

3. **Check Database**
   ```bash
   # Verify database connectivity
   # Check for slow queries
   ```

#### Common Fixes
- **Database Connection**: Restart connection pool
- **API Rate Limits**: Increase rate limits
- **Third-party Service**: Check external service status

### Playbook 3: Performance Degradation

#### Symptoms
- Page load time > 3 seconds
- Core Web Vitals degradation
- User complaints about slowness

#### Investigation Steps
1. **Check Performance Metrics**
   ```bash
   ./scripts/performance-check.js
   ```

2. **Analyze Bundle Size**
   ```bash
   pnpm build && pnpm analyze
   ```

3. **Review Recent Changes**
   ```bash
   git log --oneline -20
   ```

#### Optimization Actions
- **Image Optimization**: Compress and optimize images
- **Code Splitting**: Implement lazy loading
- **CDN Configuration**: Verify CDN settings
- **Database Queries**: Optimize slow queries

## Troubleshooting Runbooks

### Runbook 1: Build Failures

#### Common Build Errors

**Error: Module not found**
```bash
# Solution
rm -rf node_modules
pnpm install
pnpm build
```

**Error: TypeScript compilation failed**
```bash
# Solution
pnpm type-check
# Fix type errors
pnpm build
```

**Error: Out of memory**
```bash
# Solution
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

### Runbook 2: Deployment Issues

#### Deployment Failures

**Error: Vercel deployment failed**
```bash
# Check build logs
vercel logs moodovermuscle --follow

# Common fixes
pnpm build
vercel --prod
```

**Error: Environment variables missing**
```bash
# Check environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME production
```

### Runbook 3: Database Issues

#### Database Connection Problems

**Error: Connection timeout**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
./scripts/test-database-connection.sh
```

**Error: Query timeout**
```bash
# Check slow queries
./scripts/analyze-slow-queries.sh

# Optimize queries
# Update indexes if needed
```

### Runbook 4: SSL Certificate Issues

#### Certificate Problems

**Error: SSL certificate expired**
```bash
# Check certificate validity
openssl s_client -connect moodovermuscle.com.au:443

# Vercel handles SSL automatically
# Contact support if issues persist
```

**Error: Mixed content warnings**
```bash
# Check for HTTP resources
# Update all resources to HTTPS
```

## Operational Procedures

### Daily Operations Checklist

#### Morning Checks (9:00 AM)
- [ ] Review overnight alerts
- [ ] Check error rates
- [ ] Verify website accessibility
- [ ] Review performance metrics

#### Evening Checks (5:00 PM)
- [ ] Check deployment status
- [ ] Review user feedback
- [ ] Monitor error logs
- [ ] Update incident reports

### Weekly Operations

#### Monday
- [ ] Review weekend metrics
- [ ] Check dependency updates
- [ ] Update documentation
- [ ] Plan weekly tasks

#### Friday
- [ ] Deploy weekly updates
- [ ] Update status page
- [ ] Review incident reports
- [ ] Plan next week

## Emergency Procedures

### Emergency Rollback
```bash
# Immediate rollback
git checkout main
git reset --hard HEAD~1
git push origin main --force

# Notify team
slack-notify "Emergency rollback completed"
```

### Emergency Communication
```markdown
## Emergency Communication Template

**Subject**: [URGENT] MoodOverMuscle Service Issue

**Impact**: [Brief description]
**Status**: [Investigating/Fixing/Resolved]
**ETA**: [Estimated resolution time]
**Next Update**: [Time for next update]
```

## Monitoring and Alerting

### Alert Response Procedures

#### Critical Alert (P1)
- **Response Time**: 5 minutes
- **Escalation**: On-call engineer
- **Communication**: Immediate Slack + SMS

#### High Alert (P2)
- **Response Time**: 15 minutes
- **Escalation**: Tech lead
- **Communication**: Slack channel

#### Medium Alert (P3)
- **Response Time**: 1 hour
- **Escalation**: Development team
- **Communication**: Slack channel

### Alert Escalation Matrix
| Severity | First Response | Escalation 1 | Escalation 2 |
|----------|----------------|--------------|--------------|
| Critical | On-call | Tech Lead | CTO |
| High | Tech Lead | CTO | CEO |
| Medium | Dev Team | Tech Lead | - |

## Performance Optimization

### Performance Monitoring
```bash
# Check Core Web Vitals
./scripts/check-web-vitals.sh

# Analyze bundle size
pnpm build && pnpm analyze

# Monitor API response times
./scripts/monitor-api-performance.sh
```

### Optimization Procedures

#### Image Optimization
```bash
# Compress images
./scripts/optimize-images.sh

# Generate responsive images
./scripts/generate-responsive-images.sh
```

#### Database Optimization
```bash
# Analyze slow queries
./scripts/analyze-slow-queries.sh

# Update indexes
./scripts/update-indexes.sh
```

## Security Procedures

### Security Incident Response

#### Security Breach Detection
1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation**
   - Analyze logs
   - Identify attack vector
   - Assess impact

3. **Recovery**
   - Patch vulnerabilities
   - Reset credentials
   - Update security measures

### Security Maintenance
```bash
# Weekly security scan
./scripts/security-scan.sh

# Monthly security audit
./scripts/security-audit.sh
```

## Backup and Recovery

### Backup Procedures

#### Daily Backup
```bash
# Automated daily backup
./scripts/daily-backup.sh

# Verify backup integrity
./scripts/verify-backup.sh
```

#### Recovery Testing
```bash
# Monthly recovery test
./scripts/test-recovery.sh

# Generate recovery report
./scripts/generate-recovery-report.sh
```

## Communication Templates

### Incident Communication
```markdown
## Incident Report Template

**Incident ID**: INC-2025-001
**Date**: 2025-07-27
**Severity**: High
**Status**: Resolved

### Summary
Brief description of the incident

### Timeline
- 09:00 - Issue detected
- 09:05 - Investigation started
- 09:30 - Fix deployed
- 09:45 - Verified resolved

### Impact
- Duration: 45 minutes
- Users affected: ~500
- Revenue impact: Minimal

### Root Cause
Detailed explanation of what went wrong

### Lessons Learned
- What we learned
- How to prevent recurrence
```

### Status Update Template
```markdown
## Status Update

**Service**: MoodOverMuscle Website
**Status**: Operational
**Last Updated**: 2025-07-27 10:00 UTC

### Current Metrics
- Uptime: 99.9%
- Error Rate: 0.1%
- Response Time: 200ms

### Recent Changes
- Deployed v1.2.0
- Updated dependencies
- Performance improvements
```

## Tools and Scripts

### Essential Scripts
```bash
# Health check
./scripts/health-check.sh

# Performance check
./scripts/performance-check.sh

# Security scan
./scripts/security-scan.sh

# Backup verification
./scripts/verify-backup.sh
```

### Monitoring Commands
```bash
# Check service status
systemctl status moodovermuscle

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connectivity
ping moodovermuscle.com.au
```

---

**Last Updated**: July 2025  
**Next Review**: October 2025  
**Owner**: DevOps Team  
**Emergency Contact**: +61-XXX-XXX-XXXX