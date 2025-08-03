# Architect → Code Handoff Template

## Context Summary

**Date**: [YYYY-MM-DD]  
**Architect**: [Agent/Human Name]  
**Handoff Reason**: Design phase complete, ready for implementation

## Architecture Decisions Made

### Problem Statement

[Clear description of the problem being solved]

### Solution Approach

[High-level solution strategy with key architectural decisions]

### Technical Specifications

[Detailed technical requirements and constraints]

## Implementation Requirements

### Required Files & Changes

- [ ] **File 1**: `path/to/file.ext`
  - **Purpose**: [What this file does]
  - **Key Changes**: [Specific modifications needed]
  - **Dependencies**: [Other files that depend on this]

- [ ] **File 2**: `path/to/file.ext`
  - **Purpose**: [What this file does]
  - **Key Changes**: [Specific modifications needed]
  - **Dependencies**: [Other files that depend on this]

### Database Schema Changes

```sql
-- Migration script or Prisma schema updates
-- Include rollback plan if needed
```

### API Contract Specifications

```typescript
// Interface definitions
// Request/response schemas
// Validation rules
```

### Configuration Updates

```typescript
// Environment variables
// Config file changes
// Feature flags
```

## Quality Gates & Testing Requirements

### Critical Tests (Must Pass)

- [ ] **Test Type 1**: [Description of required tests]
- [ ] **Test Type 2**: [Description of required tests]

### Acceptance Criteria

- [ ] **Criterion 1**: [Specific, measurable outcome]
- [ ] **Criterion 2**: [Specific, measurable outcome]

### Performance Requirements

- **Response Time**: [Target metrics]
- **Memory Usage**: [Constraints]
- **Database Queries**: [Optimization requirements]

## Integration Points

### Existing Systems

- **System A**: [How this integrates]
- **System B**: [Dependencies and interactions]

### External Dependencies

- **Service/Library**: [Version and usage requirements]

## Risk Assessment

### Technical Risks

- **Risk 1**: [Description and mitigation strategy]
- **Risk 2**: [Description and mitigation strategy]

### Rollback Plan

[Clear steps to revert changes if implementation fails]

## Success Metrics

### Functional Success

- [ ] **Feature works as designed**
- [ ] **All tests pass**
- [ ] **Performance targets met**

### Non-Functional Success

- [ ] **Code quality standards maintained**
- [ ] **Documentation updated**
- [ ] **Security requirements satisfied**

## Context Files to Read

### Required Reading

- [ ] **`.docs/spec.md`**: Current appetite and scope
- [ ] **`.docs/architecture.md`**: System design constraints
- [ ] **`.docs/api-spec.md`**: Interface contracts

### Relevant Context

- [ ] **`.docs/decisions/[relevant-adr].md`**: Architectural decisions
- [ ] **`path/to/existing/implementation`**: Related code patterns

## Handoff Checklist

- [ ] **Architecture documented** in `.docs/architecture.md`
- [ ] **Decision recorded** in `.docs/decisions/` if significant
- [ ] **Implementation plan** clearly defined above
- [ ] **Quality gates** established with measurable criteria
- [ ] **Context files** identified for Code mode review
- [ ] **Success metrics** defined and verifiable

## Notes & Assumptions

### Key Assumptions

- [Assumption 1]: [Why this assumption was made]
- [Assumption 2]: [Context and validation]

### Implementation Notes

- [Important consideration 1]
- [Important consideration 2]

---

**Next Action**: Code mode should review context files, implement according to specifications, and verify against success metrics before completion.
