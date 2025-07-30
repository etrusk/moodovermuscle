# Orchestration Workflow

## 1. Immediate Setup

- Environment: `git status`, `git branch`, `pnpm dev`
- Restore session: `source .docs/session-restore.sh`
- Branch:
  - `git checkout main && git pull`
  - `git checkout -b feat/[task-name]`
  - `git push -u origin feat/[task-name]`
- Update [`.docs/current-task.md`](.docs/current-task.md:1)

## 2. Key Commands

| Phase    | Commands                                                              |
| -------- | --------------------------------------------------------------------- |
| RED      | `pnpm test:watch` → `git add . && git commit -m "test:…" && git push` |
| GREEN    | `pnpm test` → `git add . && git commit -m "feat:…" && git push`       |
| REFACTOR | `pnpm test` → `git add . && git commit -m "refactor:…" && git push`   |

### Quality Gates

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
pnpm test:a11y
pnpm build
pnpm analyze
```

## 3. Quality Gate Specifics

- Linting: `pnpm lint --fix` (`.eslintrc.json`)
- Type checking: `pnpm type-check` (`tsconfig.json`)
- Security scan: `pnpm audit` or `npm audit --audit-level=high`
- Performance: `npx lighthouse http://localhost:3000 --view`
- Bundle analysis: `pnpm analyze` (rollup-plugin-visualizer)
- Accessibility: `pnpm test:a11y`

## 4. Documentation Integration

Update if changes:

- [`.docs/current-task.md`](.docs/current-task.md:1): scope, tickets, branch
- [`.docs/architecture.md`](.docs/architecture.md:1): design diagrams, ADRs
- [`.docs/api-spec.md`](.docs/api-spec.md:1): endpoint contracts, mock data
- [`.docs/test-strategy.md`](.docs/test-strategy.md:1): new test cases, patterns
- [`.docs/debt.md`](.docs/debt.md:1): notes on tech debt, decisions

## 5. Validation Checklist

- [ ] Environment & branch set up
- [ ] RED/GREEN/REFACTOR cycles & atomic commits
- [ ] Tests, security & perf checks passed
- [ ] Documentation updated
- [ ] Cleanup & merge complete

---

## 6. Common Failure Scenarios & Recovery

- Test failures:
  - Symptoms: failing `pnpm test` or snapshot mismatches
  - Recovery: run `pnpm test -- --updateSnapshot`, inspect errors, fix assertions
- Lint/type errors:
  - Commands: `pnpm lint` / `pnpm type-check`
  - Recovery: auto-fix with `--fix`, adjust types, install missing deps
- Merge conflicts:
  - Detection: `git merge` errors
  - Recovery: `git merge --abort` → rebase onto main (`git pull --rebase`) → resolve conflicts, `git add`, `git rebase --continue`
- CI pipeline failures:
  - View logs in CI dashboard (e.g., GitHub Actions)
  - Reproduce locally: `pnpm build && pnpm test`
- Deployment issues:
  - Check Vercel logs (`vercel logs`)
  - Rollback: revert PR, redeploy main

## 7. Mode-specific Delegation Patterns

| Mode         | Use Case                                        | Example                       |
| ------------ | ----------------------------------------------- | ----------------------------- |
| code         | Writing or refactoring code                     | Implement feature functions   |
| debug        | Investigating failures or adding logs           | Trace intermittent bug        |
| ask          | Answering questions or researching tech options | Determine best package choice |
| architect    | Designing high-level system components          | Plan API endpoints            |
| orchestrator | Coordinating multi-step workflows               | Trigger build, tests, deploy  |

- Choose mode based on step: start with `architect` for design, `code` for implementation, `debug` for failures.
- Example: During TDD, switch between `code` and `debug` modes for red/green fixes.

## 8. Documentation Update Examples

- API change: After modifying `/app/api/book-session`, update [`.docs/api-spec.md`](.docs/api-spec.md:1) section:

  ```md
  ### POST /api/book-session

  - Request: `{ date, goals, experience }`
  - Response: `{ success: boolean, id: number }`
  ```

- New component: Update [`.docs/test-strategy.md`](.docs/test-strategy.md:1) with:

  ```md
  ## BookingForm Component Tests

  - Snapshot test
  - Form validation scenarios
  ```

- Architecture tweak: Add ADR to [`.docs/architecture.md`](.docs/architecture.md:1):

  ```md
  ## ADR-005: GraphQL vs REST decision

  - Chosen REST for simplicity
  ```

## 9. Troubleshooting & Quick Fixes

- Next.js hot reload not updating:
  - `pnpm dev -- --turbo` or restart server
- Environment variables not loading:
  - Verify `.env.local` exists; run `source .env.local`
- Prisma migrate errors:
  - `npx prisma migrate resolve --applied [migration]`
- Booking API returns 500:
  - Check handlers in [`__tests__/setup/server.ts`](__tests__/setup/server.ts:1)

## 10. Integration with Project Tools

- Build validation: `node scripts/build-validation.js`
- Health checks: `node scripts/health-check.js`
- Test error scenarios: `node scripts/test-error-scenarios.js`
- Domain verification: `node scripts/verify-domain.js`
- Lint-staged hooks: run `pnpm lint-staged`

---

**Version:** 1.2.0
**Last Updated:** 2025-07-30
