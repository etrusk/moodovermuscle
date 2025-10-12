# Scripts Cleanup - Remove Over-Engineered Files

**Status:** In Progress
**Started:** 2025-10-12
**Mode:** Navigator

## Goal
Remove three over-engineered/orphaned scripts from /scripts directory and update documentation references.

## Scripts to Remove
1. `preview-workflow.js` - Redundant with Vercel's automatic PR previews
2. `circuit-breaker-check.js` - Meta-verification for non-existent framework
3. `check-docs-staleness.js` - Orphaned, solving non-existent problem

## Acceptance Criteria
- [ ] Three scripts deleted from /scripts directory
- [ ] package.json checked and cleaned of references
- [ ] README.md updated to reference correct workflow documentation
- [ ] Pre-commit hooks still functional
- [ ] Quality gates still pass
- [ ] Build verification successful
- [ ] Changes committed with conventional commit message

## Progress
- [ ] Delete orphaned scripts
- [ ] Check and clean package.json references
- [ ] Update README.md documentation
- [ ] Verify pre-commit functionality
- [ ] Verify quality gates
- [ ] Verify build
- [ ] Commit changes

## Context for Next Session
Starting cleanup process. Will verify all references before deletion.