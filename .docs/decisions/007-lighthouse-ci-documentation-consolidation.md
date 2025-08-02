# Decision: Lighthouse CI Documentation Consolidation

**Date**: 2025-08-02
**Status**: Decided
**Context**: Eliminate documentation duplication and improve maintainability

## Problem

The lighthouse CI implementation created significant documentation duplication:

- **lighthouse-ci-implementation.md** (336 lines): Standalone comprehensive guide
- **architecture.md** (lines 106-144): Duplicated technical architecture content
- **workflows.md** (lines 54, 185, 192-194): Duplicated workflow and usage content

This violates the single-source-of-truth principle and creates maintenance burden with potential for outdated information.

## Options Considered

### Option A: Keep Standalone Document

- **Pros**: Complete reference in one place
- **Cons**: Duplication with core docs, maintenance overhead, discoverability issues

### Option B: Consolidate into Core Documentation

- **Pros**: Single source of truth, better discoverability, follows established patterns
- **Cons**: Information distributed across multiple files

### Option C: Hybrid Approach

- **Pros**: Best of both worlds
- **Cons**: Still maintains some duplication

## Decision

**Consolidate lighthouse-ci-implementation.md into core documentation structure**

### Content Distribution Strategy

1. **Technical Architecture** → [`architecture.md`](.docs/architecture.md:106-144)
   - Privacy protection implementation details
   - Quality gate framework configuration
   - Chrome isolation and cleanup mechanisms
   - Integration with existing testing architecture

2. **Workflow & Usage** → [`workflows.md`](.docs/workflows.md:54,185,192-194)
   - Development commands and usage patterns
   - CI/CD integration procedures
   - Quality gate enforcement workflow
   - Troubleshooting and emergency procedures

3. **Decision Rationale** → [`decisions/007-lighthouse-ci-documentation-consolidation.md`](.docs/decisions/007-lighthouse-ci-documentation-consolidation.md)
   - Local vs Docker approach decision
   - Privacy protection strategy
   - Quality gate framework design

## Implementation Notes

### Enhanced Architecture Section

- Expand existing Lighthouse CI Architecture section (lines 106-144)
- Add detailed privacy protection mechanisms
- Include comprehensive quality gate configuration
- Document automated cleanup workflows

### Enhanced Workflows Section

- Integrate lighthouse commands into testing strategy
- Add performance monitoring workflow details
- Include troubleshooting procedures
- Document emergency override procedures

### Benefits Achieved

- **Eliminates Duplication**: Single source of truth for each aspect
- **Improves Discoverability**: Information where developers expect it
- **Reduces Maintenance**: Updates in one place per topic
- **Follows Patterns**: Consistent with other complex features (testing, deployment)

## Related Docs

- [`.docs/architecture.md`](.docs/architecture.md) - Enhanced lighthouse CI architecture
- [`.docs/workflows.md`](.docs/workflows.md) - Integrated lighthouse CI workflows
- [`.docs/current-task.md`](.docs/current-task.md) - Updated implementation status

## Migration Checklist

- [x] Create decision record documenting consolidation rationale
- [ ] Enhance architecture.md with comprehensive lighthouse CI technical details
- [ ] Enhance workflows.md with lighthouse CI usage and workflow integration
- [ ] Update current-task.md to reflect documentation consolidation
- [ ] Remove lighthouse-ci-implementation.md after content migration
- [ ] Verify all internal references are updated
