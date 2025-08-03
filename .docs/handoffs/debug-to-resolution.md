# Debug → Resolution Documentation Template

## Investigation Summary

**Date**: [YYYY-MM-DD]  
**Debug Agent**: [Agent/Human Name]  
**Resolution Status**: [Fixed, Workaround Applied, Escalated, Deferred]

## Root Cause Analysis

### Problem Confirmed

[Validated description of the actual issue after investigation]

### Root Cause Identified

[The fundamental cause that created this problem]

### Contributing Factors

- **Factor 1**: [Secondary issue that made the problem worse]
- **Factor 2**: [Environmental or timing factors]
- **Factor 3**: [Design decisions that enabled the bug]

### Investigation Process

1. **Initial Hypothesis**: [What we thought the problem was]
2. **Testing Approach**: [How we validated/invalidated theories]
3. **Discovery Method**: [What led to finding the real cause]
4. **Validation Steps**: [How we confirmed the root cause]

## Resolution Implemented

### Solution Strategy

[High-level approach taken to fix the issue]

### Code Changes Made

- **File 1**: `path/to/file.ext`
  - **Changes**: [Specific modifications]
  - **Reasoning**: [Why this change fixes the issue]
- **File 2**: `path/to/file.ext`
  - **Changes**: [Specific modifications]
  - **Reasoning**: [Why this change was necessary]

### Database Changes

```sql
-- Any database migrations or data fixes
-- Include both forward and rollback scripts
```

### Configuration Updates

```typescript
// Environment variable changes
// Config file modifications
// Feature flag adjustments
```

## Testing & Validation

### Reproduction Test

- **Before Fix**: [Confirmed the bug reproduced]
- **After Fix**: [Confirmed the bug no longer occurs]
- **Edge Cases**: [Additional scenarios tested]

### Regression Testing

- [ ] **Critical functionality verified**: [Key features still work]
- [ ] **Related components tested**: [Adjacent systems checked]
- [ ] **Performance impact assessed**: [No degradation introduced]

### New Tests Added

```typescript
// Test cases added to prevent regression
// Include both unit and integration tests
```

## Impact Assessment

### Systems Affected

- **Primary Impact**: [Main system/feature that was broken]
- **Secondary Impact**: [Related systems that were affected]
- **User Impact**: [How users experienced the problem]

### Data Integrity

- **Data Loss**: [Any data that was corrupted/lost]
- **Data Recovery**: [Steps taken to restore data]
- **Future Prevention**: [Safeguards added]

### Performance Impact

- **Before Fix**: [Performance characteristics with bug]
- **After Fix**: [Performance after resolution]
- **Monitoring**: [Metrics to watch going forward]

## Prevention Measures

### Code Quality Improvements

- **Static Analysis**: [New linting rules or type checks added]
- **Code Review**: [Process improvements to catch similar issues]
- **Documentation**: [Missing docs that could have prevented this]

### Testing Enhancements

- **Test Coverage**: [Gaps filled in test suite]
- **Test Automation**: [New automated checks added]
- **Monitoring**: [Alerts or checks to detect similar issues early]

### Process Improvements

- **Development Process**: [Workflow changes to prevent recurrence]
- **Deployment Process**: [Safety checks added]
- **Review Process**: [Additional review requirements]

## Knowledge Capture

### Learning Outcomes

- **Technical Learning**: [New understanding gained about the system]
- **Process Learning**: [Workflow or methodology insights]
- **Tool Learning**: [Debugging techniques or tools discovered]

### Pattern Recognition

- **Similar Issues**: [Other places this pattern might occur]
- **Warning Signs**: [Early indicators to watch for]
- **Common Causes**: [Frequent sources of this type of problem]

### Documentation Updates

- [ ] **Architecture docs updated**: [If system understanding changed]
- [ ] **API specs updated**: [If interface behavior clarified]
- [ ] **Troubleshooting guide updated**: [New debugging info added]

## Memory & Institutional Knowledge

### Successful Debugging Techniques

```markdown
## [Issue Type] Debugging Pattern

**Symptoms**: [How this type of issue typically presents]
**Investigation Steps**:

1. [First place to look]
2. [Common validation technique]
3. [Key debugging tools to use]

**Common Causes**:

- [Frequent root cause 1]
- [Frequent root cause 2]

**Prevention**: [How to avoid this in future]
```

### Failed Approaches

- **Approach 1**: [What didn't work and why]
- **Approach 2**: [Dead end that wasted time]
- **Approach 3**: [Misleading symptoms or false leads]

### Tool Effectiveness

- **Most Helpful**: [Tools that provided key insights]
- **Least Helpful**: [Tools that didn't contribute]
- **Recommended**: [Debugging approach for similar issues]

## Resolution Verification

### Fix Validation

- [ ] **Bug no longer reproduces** in development
- [ ] **All tests pass** including new regression tests
- [ ] **Performance maintained** or improved
- [ ] **No new issues introduced** in related areas

### Deployment Verification

- [ ] **Fix deployed successfully** to production
- [ ] **Monitoring confirms resolution** in live environment
- [ ] **User feedback positive** (if user-facing)
- [ ] **Metrics show improvement** (if measurable)

### Follow-up Actions

- [ ] **Monitor for [X] days** to ensure stability
- [ ] **Update `.docs/debt.md`** if any technical debt created
- [ ] **Schedule follow-up review** in [timeframe]
- [ ] **Notify stakeholders** of resolution

## Handoff Instructions

### For Future Debugging

[Key insights that would help someone debug similar issues faster]

### For Code Maintenance

[Important considerations for anyone modifying the affected code]

### For System Monitoring

[What to watch for to detect if this issue recurs]

## Risk Assessment

### Resolution Risks

- **Risk 1**: [Potential negative consequences of the fix]
  - **Mitigation**: [How this risk is managed]
  - **Monitoring**: [How to detect if this risk materializes]

### Future Occurrence

- **Likelihood**: [Probability this exact issue returns]
- **Severity**: [Impact if it does return]
- **Prevention Confidence**: [How confident we are in prevention measures]

## Documentation Trail

### Investigation Files

- **Investigation Notes**: `.docs/investigations/[date]-[issue-summary].md`
- **Debug Session Logs**: [Links to relevant log files]
- **Test Results**: [Links to test output/reports]

### Resolution Evidence

- **Before/After Comparisons**: [Screenshots, logs, or metrics]
- **Code Review Links**: [PR/commit references]
- **Deployment Records**: [Links to deployment logs]

---

**Resolution Complete**: [Date/Time]  
**Next Actions**: Monitor system stability, update institutional knowledge in `.docs/memory/`, and celebrate the successful debugging effort.
