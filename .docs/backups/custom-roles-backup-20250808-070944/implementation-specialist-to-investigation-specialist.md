# Implementation Specialist → Investigation Specialist: Systematic Debugging Handoff

## Handoff Type: Specialized Technical Investigation

**From**: Implementation Specialist Mode → **To**: Investigation Specialist Mode  
**Context**: Implementation work encountered technical issues requiring systematic debugging expertise  
**Complexity**: [1-10] **Appetite**: [Time constraint for investigation]  
**Risk Level**: Low/Medium/High

## Specialized Role Context

**NO BROAD DISCOVERY REQUIRED**: Context provided by Implementation Specialist with pattern-driven implementation context

### Implementation Context Preserved

**Implementation work completed**:

- ✅ Implementation Specialist applied patterns from curated context
- ✅ Implementation Specialist executed within appetite boundaries  
- ✅ Implementation Specialist followed quality gate protocols
- ✅ Implementation Specialist encountered technical issue requiring investigation expertise

### Investigation Context Package

**FOCUSED INVESTIGATION REQUIRED**: Specific technical issue within implementation work

## Issue Discovery and Classification

**Issue type classification**:

- [ ] **Runtime Errors**: Application crashes, exceptions, or unexpected behavior
- [ ] **Test Failures**: Unit, integration, or e2e tests failing
- [ ] **Performance Issues**: Response time, memory usage, or throughput problems  
- [ ] **Integration Problems**: Third-party service or API integration failures
- [ ] **Build/Deployment Failures**: Compilation, bundling, or deployment issues
- [ ] **Data Integrity Issues**: Database consistency or validation problems

**Severity assessment**:

- [ ] **Critical**: Blocking all progress, system unusable
- [ ] **High**: Major functionality broken, significant user impact
- [ ] **Medium**: Important features degraded, moderate impact
- [ ] **Low**: Minor issues, workarounds available

## Problem Statement

**Symptoms observed**:

```
[Detailed description of what's not working as expected during implementation]
```

**Expected behavior**:

```
[Clear description of what should happen based on implementation specification]
```

**Actual behavior**:

```
[What actually happens, including complete error messages and stack traces]
```

**Reproduction steps**:

1. [Step 1 to reproduce the issue within implementation context]
2. [Step 2 to reproduce the issue within implementation context]  
3. [Step 3 to reproduce the issue within implementation context]

## Implementation Context Transfer

### Pattern Application State

**Patterns being applied during issue**:

- **[Pattern Name 1]**: [Status - successful/partial/failed application]
- **[Pattern Name 2]**: [Status - successful/partial/failed application]
- **[Pattern Name 3]**: [Status - successful/partial/failed application]

**Pattern application timeline**:

```
[Sequence of pattern applications and when issue manifested]
```

**Pattern-related hypotheses**:

```
[Whether issue might be related to pattern application or adaptation]
```

### Implementation Work In Progress

**Files modified during implementation**:

- **`path/to/file1.ts`**: [Changes made, current state]
- **`path/to/file2.tsx`**: [Changes made, current state]  
- **`path/to/file3.test.ts`**: [Changes made, current state]

**Implementation roadmap progress**:

- [x] **Step 1**: [Completed successfully]
- [x] **Step 2**: [Completed successfully]
- [ ] **Step 3**: [In progress when issue occurred] ← **ISSUE POINT**
- [ ] **Step 4**: [Blocked by current issue]

### Quality Gate Status at Issue Discovery

**Quality gate results when issue was discovered**:

```bash
npm run lint              # [PASS/FAIL - details]
npm run type-check        # [PASS/FAIL - details]  
npm run test:critical     # [PASS/FAIL - details]
npm run security:scan     # [PASS/FAIL - details]
npm run build:verify      # [PASS/FAIL - details]
```

**Quality gate failure analysis**:

```
[Which gates are failing and potential relationship to the issue]
```

## Technical Evidence Package

### Error Messages and Stack Traces

**Primary error**:

```
[Complete error message with full stack trace]
```

**Secondary errors** (if applicable):

```
[Related error messages that might provide context]
```

**Console/browser logs**:

```
[Relevant console output, warnings, or browser developer tools information]
```

### System State at Issue Discovery

**Environment details**:

- **Node.js version**: [Version]
- **Browser**: [Browser and version if applicable]
- **Database state**: [Relevant database information]
- **External services**: [Status of third-party integrations]

**Configuration state**:

```typescript
// Environment variables and configuration at time of issue
// [Current configuration that might be relevant]
```

**Recently modified files with git context**:

```bash
# Git changes since last working state
git log --oneline -5
git status  
git diff HEAD~1 [key files]
```

## Investigation Pattern Application

**Check investigations/index.md for similar issues**:

- **[Related Investigation 1]**: [`path/to/investigation.md`](../investigations/investigation-1.md)
  - **Similarity**: [How this relates to current issue]
  - **Resolution pattern**: [What approach was successful]
  - **Prevention measures**: [What prevented recurrence]

- **[Related Investigation 2]**: [`path/to/investigation.md`](../investigations/investigation-2.md)
  - **Similarity**: [How this relates to current issue]  
  - **Resolution pattern**: [What approach was successful]
  - **Prevention measures**: [What prevented recurrence]

**Investigation patterns to apply**:

```
[Specific systematic debugging approaches based on issue type and institutional memory]
```

## Systematic Investigation Approach

### Multi-System Debugging Protocol

**Layer-by-layer investigation strategy**:

1. **Application Layer**: [Implementation code, business logic]
2. **Framework Layer**: [Next.js, React, libraries]  
3. **Runtime Layer**: [Node.js, browser environment]
4. **Infrastructure Layer**: [Database, external services]
5. **Configuration Layer**: [Environment, build tools]

**Investigation sequence priority**:

```
[Order of investigation based on likelihood and institutional memory]
```

### Debugging Tools and Resources

**Available debugging tools**:

- [ ] **Browser DevTools**: [Specific tabs and features to examine]
- [ ] **Node.js Debugger**: [Debugging configuration if needed]
- [ ] **Database Console**: [Queries to run for data verification]
- [ ] **API Testing Tools**: [Endpoints to test and validate]
- [ ] **Performance Profiling**: [Tools for performance-related issues]
- [ ] **Network Analysis**: [Tools for integration issues]

**Monitoring and logging setup**:

```bash
# Additional logging or monitoring that might help
[Specific monitoring commands or configurations]
```

## Root Cause Investigation Plan

### Primary Investigation Hypotheses

**Hypothesis 1** (Most likely based on symptoms):

- **Theory**: [Most probable root cause]
- **Evidence**: [Why this theory is most likely]  
- **Investigation approach**: [Specific steps to validate/disprove]
- **Validation tests**: [How to confirm this hypothesis]

**Hypothesis 2** (Secondary theory):

- **Theory**: [Alternative probable cause]
- **Evidence**: [Supporting information for this theory]
- **Investigation approach**: [Steps to investigate this angle]  
- **Validation tests**: [How to confirm this hypothesis]

**Hypothesis 3** (Edge case consideration):

- **Theory**: [Less likely but possible cause]
- **Evidence**: [Why this could be the issue]
- **Investigation approach**: [How to rule this in or out]
- **Validation tests**: [Verification approach]

### Investigation Timeline and Appetite Management

**Investigation phases**:

- **Phase 1 (0-2 hours)**: [Immediate investigation priorities]
- **Phase 2 (2-4 hours)**: [Secondary investigation if Phase 1 unsuccessful]  
- **Phase 3 (4+ hours)**: [Comprehensive analysis if needed]

**Circuit breaker for investigation**:

- **Green Zone**: Investigation progressing, clear leads being followed
- **Yellow Zone**: Multiple failed hypotheses, need to broaden approach
- **Red Zone**: Investigation appetite exceeded, escalation required

## Institutional Memory Integration

### Prevention Strategy Development  

**Pattern for future prevention**:

```markdown
## Investigation Pattern: [Issue Type]
**Trigger conditions**: [When this type of issue typically occurs]
**Investigation sequence**: [Proven debugging approach]  
**Resolution patterns**: [Typical solutions that work]
**Prevention measures**: [How to avoid this in future implementations]
```

**Memory documentation requirements**:

- [ ] Document root cause when identified
- [ ] Create prevention measures for future implementation work
- [ ] Update relevant pattern documentation with lessons learned
- [ ] Add early warning indicators to implementation patterns

### Cross-Reference Updates

**Investigations index update required**:

```markdown  
## [Issue Type] - [Brief Description]
**Pattern**: [Investigation approach that was effective]
**Resolution**: [Root cause and solution]
**Prevention**: [Measures added to prevent recurrence]
**Related Patterns**: [Implementation patterns updated with prevention]
```

## Success Criteria and Resolution Requirements

**Investigation completion criteria**:

- [ ] **Root cause identified** with clear evidence and validation
- [ ] **Solution approach verified** through testing or proof-of-concept
- [ ] **Fix implementation plan** documented with specific steps
- [ ] **Prevention measures identified** for future similar issues
- [ ] **Pattern updates documented** for institutional memory

**Resolution validation requirements**:

- [ ] **Issue reproduction confirmed** before attempting fix
- [ ] **Fix approach tested** in isolation where possible  
- [ ] **Regression impact assessed** for any proposed changes
- [ ] **Quality gate impact evaluated** for fix implementation

## Handback Protocol

### Return to Implementation Specialist

**Handback deliverables**:

- [ ] **Root cause analysis** with clear explanation and evidence  
- [ ] **Fix implementation guidance** with specific technical steps
- [ ] **Pattern adaptations** needed for successful implementation
- [ ] **Quality gate adjustments** if needed for fix implementation
- [ ] **Testing requirements** for validating the fix

**Implementation guidance format**:

```markdown
## Fix Implementation Guide
**Root cause**: [Clear technical explanation]
**Solution approach**: [High-level strategy for fix]  
**Implementation steps**: [Specific technical steps]
**Pattern applications**: [How to apply patterns with fix]
**Quality gate considerations**: [Any gate impacts]
**Testing validation**: [How to confirm fix works]
```

### Escalation Conditions for Investigation Specialist

**Escalate to Solution Architect if**:

- Root cause reveals architectural design problems
- Fix requires significant pattern modifications or new patterns
- Issue indicates broader system design issues
- Investigation reveals appetite boundary violations

**Escalate to Human Navigator if**:

- Security implications discovered during investigation
- Business logic errors identified requiring policy decisions  
- User experience impacts requiring UX judgment
- Resource allocation changes needed for fix

## Investigation Documentation Template

```markdown
## Investigation: [Issue Title]

### Summary
**Issue**: [Brief description of problem]
**Root Cause**: [Technical root cause identified]
**Resolution**: [How it was fixed]
**Prevention**: [Measures to prevent recurrence]

### Investigation Process Applied
**Patterns Used**: [Which investigation patterns were applied]
**Tools Used**: [Debugging tools and techniques]
**Time Spent**: [Actual vs. estimated investigation time]

### Lessons Learned  
**What Worked**: [Effective investigation approaches]
**What Didn't**: [Ineffective approaches to avoid]
**New Patterns**: [Any new investigation patterns developed]

### Implementation Impact
**Pattern Updates**: [How implementation patterns were improved]
**Quality Gates**: [Any quality gate refinements]
**Prevention Integration**: [How prevention was integrated into patterns]
```

## Session Continuity

**Current state**: Implementation work blocked by technical issue requiring systematic debugging
**Investigation scope**: [Specific technical issue within implementation context]  
**Resolution conditions**: Root cause identified, fix approach validated, implementation guidance provided

## Template Metadata

**Issue type suitability**: [Which types of issues this template handles best]
**Complexity range**: [Investigation complexity this template supports]
**Pattern dependencies**: [Investigation patterns this template expects]
**Integration requirements**: [How this connects back to implementation work]

---

**Handoff Date**: [Auto-generated]  
**Issue Severity**: [Critical/High/Medium/Low]  
**Investigation Appetite**: [X hours allocated]  
**Implementation Context**: [Patterns being applied when issue occurred]  
**Quality Gate Status**: [Current gate status at issue discovery]