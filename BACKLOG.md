# Backlog

## Queue

- **Type-check the tests.** `tsconfig.json` excludes `__tests__`. Including it shows 126 type errors, most in four integration test files. Done when `pnpm run type-check` covers `__tests__`, reports 0 errors and runs in CI.
- **Give preview its own database and secrets.** Preview shares the production Neon database. It also shares `ADMIN_JWT_SECRET`. So every branch deploy can write live data and sign admin logins that prod accepts. Renovate branches deploy too. Done when preview uses its own database branch and `ADMIN_JWT_SECRET`. A test booking on preview must leave the production database unchanged.

## Ideas

## Not doing
