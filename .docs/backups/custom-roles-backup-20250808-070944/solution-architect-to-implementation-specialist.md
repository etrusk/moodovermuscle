# Solution Architect → Implementation Specialist: Pattern-Driven Implementation Handoff

## Handoff Type: Curated Context Implementation

**From**: Solution Architect Mode → **To**: Implementation Specialist Mode  
**Context**: Architectural design complete with curated implementation context, ready for pattern-driven execution  
**Complexity**: [1-10] **Appetite**: [Time constraint]  
**Risk Level**: Low/Medium/High

## Curated Context Package

**SOLUTION ARCHITECT RESPONSIBILITY**: Complete context discovery and curation for Implementation Specialist

### Context Discovery Completed

**Comprehensive Discovery Executed**:

- ✅ Solution Architect analyzed `.docs/patterns/index.md` - Selected applicable implementation patterns
- ✅ Solution Architect reviewed `.docs/memory/index.md` - Applied complexity insights and lessons learned  
- ✅ Solution Architect evaluated `.docs/decisions/index.md` - Identified architectural constraints
- ✅ Solution Architect scanned `.docs/investigations/index.md` - Noted potential issues and prevention strategies
- ✅ Solution Architect confirmed `.docs/spec.md` - Validated appetite and scope boundaries
- ✅ Solution Architect assessed `.docs/architecture.md` - Applied system design constraints
- ✅ Solution Architect verified `.docs/workflows.md` - Integrated quality gates and deployment protocols

### Curated Implementation Context

**NO BROAD DISCOVERY REQUIRED FOR IMPLEMENTATION SPECIALIST**: All relevant context curated below

## Architectural Design Summary

**Problem statement**:

```
[Clear description of the problem being solved]
```

**Solution approach**:

```
[High-level architectural solution with key design decisions]
```

**Implementation roadmap**:

1. [ ] **Step 1**: [Specific implementation milestone with pattern reference]
2. [ ] **Step 2**: [Specific implementation milestone with pattern reference]  
3. [ ] **Step 3**: [Specific implementation milestone with pattern reference]
4. [ ] **Step 4**: [Specific implementation milestone with pattern reference]

## Pattern Application Guide

**Primary patterns selected for implementation**:

- **[Pattern Name 1]**: [`path/to/pattern.md`](../patterns/pattern-name-1.md)
  - **Application context**: [Where and how to apply this pattern]
  - **Implementation notes**: [Specific guidance for this use case]
  - **Prerequisites**: [Dependencies or setup required]

- **[Pattern Name 2]**: [`path/to/pattern.md`](../patterns/pattern-name-2.md)
  - **Application context**: [Where and how to apply this pattern]
  - **Implementation notes**: [Specific guidance for this use case]
  - **Prerequisites**: [Dependencies or setup required]

**Pattern application sequence**:

```
[Order in which patterns should be applied and why]
```

**Pattern adaptation requirements**:

```
[Any modifications needed to standard patterns for this specific implementation]
```

## Implementation Specification

### Files and Components to Create/Modify

**Core implementation files**:

- [ ] **`path/to/component.tsx`** - [Purpose and pattern application]
- [ ] **`path/to/api/endpoint.ts`** - [Purpose and pattern application]  
- [ ] **`path/to/types.ts`** - [Purpose and pattern application]
- [ ] **`path/to/utils.ts`** - [Purpose and pattern application]

**Supporting files**:

- [ ] **`__tests__/component.test.tsx`** - [Testing requirements using testing patterns]
- [ ] **`path/to/styles.module.css`** - [Styling requirements using UI patterns]
- [ ] **`path/to/config.ts`** - [Configuration using config patterns]

### Technical Requirements

**API contracts**:

```typescript
// Interface definitions following TypeScript patterns
interface RequestSchema {
  // [Specific schema requirements]
}

interface ResponseSchema {
  // [Specific schema requirements]
}
```

**Database schema changes** (if applicable):

```sql
-- Prisma schema modifications or migration script
-- [Specific schema changes required]
```

**Configuration updates**:

```typescript
// Environment variables and config changes
// [Specific configuration requirements]
```

## Quality Gate Requirements

**MANDATORY PRE-COMMIT GATES** (Must pass before any commit):

```bash
# Critical gates - never bypass these
npm run lint              # ESLint + Prettier (auto-fix enabled)
npm run type-check        # TypeScript compilation (zero errors)
npm run test:critical     # Essential tests (< 30 seconds)
npm run security:scan     # Security vulnerability detection
npm run build:verify      # Production build verification
```

**Quality gate expectations**:

- **Linting**: Auto-fix applied, manual fixes for remaining issues
- **Type checking**: Zero TypeScript errors, no `any` types introduced
- **Critical tests**: All essential functionality tests must pass
- **Security scan**: No critical or high vulnerabilities
- **Build verification**: Production build must succeed without warnings

**Non-critical gates** (track in .docs/debt.md if failed due to appetite):

- Integration tests requiring external systems
- Performance tests beyond current appetite scope
- Advanced accessibility features not in current appetite

## Deployment Gate Protocol

**MANDATORY DEPLOYMENT SEQUENCE** (Never skip):

1. **Stage Changes**: `git add .` (stage all implementation changes)
2. **Commit with Convention**: `git commit -m "feat(scope): description [pattern applied]"`  
3. **Push to Feature Branch**: `git push origin feature/[branch-name]`
4. **Verify Deployment**: Confirm Vercel preview build success

**Conventional commit format**:

```bash
# Format: type(scope): subject [pattern applied]
feat(auth): add JWT middleware using auth pattern
fix(validation): resolve type errors using TypeScript pattern  
refactor(user): improve registration using validation pattern
test(auth): add unit tests using testing pattern
```

**Branch naming convention**:

```bash
# Use feature/ prefix for new features
feature/user-authentication
feature/booking-validation
feature/api-endpoints
```

## Circuit Breaker Integration

**Appetite boundary protection**:

- **Green Zone**: Implementation progressing within 80% of allocated appetite
- **Yellow Zone**: 80-95% appetite consumed, heightened monitoring required
- **Red Zone**: >95% appetite consumed, immediate escalation required

**Circuit breaker triggers**:

- **Scope expansion detected**: Stop work, escalate to Solution Architect
- **Pattern application failure**: If patterns don't fit, escalate rather than custom solution
- **Quality gate failures**: If critical gates repeatedly fail, escalate for appetite reassessment
- **Dependencies blocking**: External dependencies preventing progress, escalate immediately

**Escalation protocol**:

```bash
# When circuit breaker triggers:
1. Document current progress in .docs/current-task.md
2. Note specific circuit breaker condition encountered  
3. Escalate using structured template (specify which condition)
4. Preserve all work in progress for handback
```

## 70/30 Decision Routing for Implementation Specialist

**70% (Implement Autonomously)**:

- Code structure and organization using provided patterns
- Testing implementation following testing patterns  
- Documentation generation and updates
- UI component implementation using UI patterns
- CRUD operations using database patterns
- Error handling using established error patterns
- Performance optimizations within appetite scope
- TypeScript typing using typing patterns

**30% (Escalate to Solution Architect/Human Navigator)**:

- Business rule implementation and validation logic
- Security policy decisions and authentication logic
- User experience flows and interaction patterns
- Data validation rules requiring business knowledge
- Integration strategies affecting architecture
- Cross-system dependencies and communication protocols

## Context Synthesis Protocols

**Pattern application tracking**:

```markdown
## Pattern Application Log
**[Pattern Name]**: Applied to [Component] - [Success/Issues]
**[Pattern Name]**: Applied to [Component] - [Success/Issues]

## New Pattern Discoveries
**[New Pattern Candidate]**: [Description and potential reuse]
```

**Implementation progress tracking**:

```markdown  
## Implementation Progress (Within Appetite)
- [x] Step 1: [Description] - Applied [Pattern Name]
- [x] Step 2: [Description] - Applied [Pattern Name]  
- [ ] Step 3: [Description] - Using [Pattern Name]
- [ ] Step 4: [Description] - Using [Pattern Name]

## Quality Gate Status
- [x] npm run lint (passed with auto-fixes)
- [x] npm run type-check (passed - no TypeScript errors)
- [ ] npm run test:critical (in progress)
- [ ] npm run security:scan (pending)
- [ ] npm run build:verify (pending)
```

**Escalation documentation template**:

```markdown
## Escalation Required
**Circuit Breaker Condition**: [Specific condition that triggered]
**Current Progress**: [What has been completed within appetite]
**Blocking Issue**: [Specific issue requiring escalation]
**Appetite Status**: [X% consumed, Y hours remaining]
**Recommended Action**: [Suggested approach for resolution]
```

## Success Criteria and Handback Requirements

**Definition of done**:

- [ ] All implementation roadmap steps completed within appetite
- [ ] All specified patterns successfully applied
- [ ] All critical quality gates passed
- [ ] All deployment gates executed successfully
- [ ] Implementation progress documented in .docs/current-task.md

**Handback deliverables**:

- [ ] **Completed implementation** with all specified functionality
- [ ] **Pattern application report** documenting which patterns were used where
- [ ] **Quality gate compliance verification** with all critical gates passed
- [ ] **New pattern discoveries** documented for institutional memory
- [ ] **Appetite consumption analysis** showing actual vs. estimated effort
- [ ] **Deployment verification** confirming successful feature branch deployment

**MANDATORY HANDBACK TO SOLUTION ARCHITECT**:

- Always hand back to Solution Architect for review and integration
- Never use attempt_completion - Implementation Specialist always returns to Solution Architect
- Update .docs/current-task.md with "IMPLEMENTATION_COMPLETE" signal
- Document any deviations from provided patterns with justification

## Investigation Prevention Strategy

**Known issues to avoid** (from investigations/index.md):

- [List specific issues identified in discovery that this implementation should avoid]
- [Reference specific investigation files for details]

**Early warning indicators**:

- [Signs that implementation might be heading toward known problems]
- [Monitoring points to catch issues early]

**Prevention measures**:

- [Specific steps to avoid known pitfalls]
- [Pattern applications that prevent common issues]

## Session Continuity

**Current state**: Architecture complete, curated context provided, pattern applications specified
**Implementation expectations**: Execute roadmap within appetite using specified patterns  
**Handback conditions**: Implementation complete with quality gates passed, ready for Solution Architect review

## Template Metadata

**Pattern dependencies**: [List patterns this template expects to be available]
**Complexity suitability**: [Complexity range this template works best for]
**Appetite range**: [Typical appetite range for implementations using this template]
**Quality gate alignment**: [Which quality gates are most relevant]

---

**Handoff Date**: [Auto-generated]  
**Appetite Allocated**: [X hours for implementation]  
**Patterns Specified**: [Number of patterns to apply]  
**Quality Gates Required**: [Critical gates that must pass]  
**Circuit Breaker Level**: [Green/Yellow/Red based on current appetite]