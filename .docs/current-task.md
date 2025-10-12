# LLM Test Workflow Improvements

**Status:** In Progress
**Started:** 2025-10-12
**Mode:** navigator (delegating to implementation)

## Goal
Implement a two-phase test workflow where Test mode creates a design document for human review before writing test code. Add AI test quality safeguards and fix appetite tracking metrics to use tokens/review time instead of fake "hours".

## Acceptance Criteria
- [ ] Test mode creates design docs before writing tests
- [ ] Human reviews designs before test implementation
- [ ] Test quality gate blocks commits with weak assertions
- [ ] Appetite tracking measures tokens/review time instead of "hours"
- [ ] Pre-commit hook includes test quality check
- [ ] `.docs/test-designs/` directory exists

## Implementation Plan

### Phase 1: Test Workflow Documentation
- Create `.roo/rules-test/00-test-workflow.md` with two-phase workflow
- Create `.roo/rules-test/02-ai-test-quality.md` with AI anti-patterns

### Phase 2: Quality Safeguards
- Create `scripts/test-quality-check.js` to validate test quality
- Add `test:quality` script to package.json
- Update `.husky/pre-commit` to include test quality check

### Phase 3: Appetite Tracking Fix
- Update `measureAppetiteAccuracy` function in `scripts/performance-validation.js`
- Replace estimatedHours/actualHours with estimatedTokens/actualTokens
- Add humanReviewMinutes and toolCalls tracking

### Phase 4: Integration
- Update `.roomodes` navigator delegation instructions
- Create `.docs/test-designs/` directory
- Test the workflow

## Progress
- [x] Task documented in .docs/current-task.md
- [ ] Delegating to implementation mode

## Context for Next Session
Implementation mode will create all required files following the specification in the task description.