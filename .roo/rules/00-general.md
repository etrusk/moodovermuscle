# MoodOverMuscle General Rules

**MANDATORY UNIVERSAL RULES**: Apply to all modes without exception.

## Project Context

Next.js 14 booking platform for personal training/wellness services. TypeScript, Prisma ORM, PostgreSQL.

**Technology Stack:**
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Prisma ORM
- Database: PostgreSQL
- Testing: Jest, Playwright
- Quality: ESLint, Prettier, Husky pre-commit hooks

## Pre-Commit Enforcement

**CRITICAL**: All quality standards are enforced at commit time. Code that violates limits is automatically blocked.

**Enforced Limits:**
- Function ≤ 50 lines (AST-based detection)
- File ≤ 300 lines
- Function params ≤ 3
- Code duplication ≤ 3%
- All quality gates must pass

**Pre-Commit Hook Runs:**
1. ESLint + Prettier (auto-fix)
2. TypeScript compilation
3. Critical tests
4. Complexity check
5. NPM package validation
6. Duplication check
7. Security scan
8. Build verification

## Institutional Memory Integration

**MANDATORY BEFORE IMPLEMENTATION:**
- Check `.docs/patterns/index.md` for similar implementations
- Review `.docs/investigations/index.md` for component-related issues
- Apply existing patterns rather than creating new approaches
- Reference proven solutions from past work

**Pattern-First Development:**
1. Search patterns index for similar functionality
2. Apply existing pattern if found
3. Implement with minimal modifications
4. Document new patterns only if genuinely reusable

## Mode Usage Guidelines

### 🧭 Navigator (Entry Point)
**Use for:** All new tasks, task routing, simple queries

**Delegates to:**
- Test mode: New features (write tests first)
- Implementation mode: Existing tests (implement code)
- Investigation mode: Bugs and errors
- Review mode: Code review and verification
- Refactor mode: Duplication consolidation
- Quality mode: Pre-deployment validation

### 🧪 Test Mode
**Use for:** TDD approach, writing tests before implementation

**Behavior:** Always writes tests first, follows AAA pattern

### 💻 Implementation Mode
**Use for:** Writing code after tests exist

**Behavior:** Checks patterns first, applies YAGNI, respects limits

### 🐛 Investigation Mode
**Use for:** Debugging, troubleshooting, root cause analysis

**Behavior:** Checks investigations index, systematic debugging

### 👁️ Review Mode
**Use for:** Finding errors, API verification, security review

**Behavior:** Browser verification, no code changes

### ♻️ Refactor Mode
**Use for:** Consolidating duplication, code cleanup

**Behavior:** Tests after every change, reverts if tests fail

### 🔍 Quality Mode
**Use for:** Comprehensive pre-deployment validation

**Behavior:** Runs all quality gates, reports pass/fail

## YAGNI Enforcement

**Don't create until actually needed:**
- ❌ Interfaces with single implementation
- ❌ Factories for single type
- ❌ Abstractions used once
- ❌ Generic utilities for specific use

**Wait for second use:**
- ✅ Extract to shared utility on 2nd occurrence
- ✅ Create interface when 2+ implementations exist
- ✅ Build abstraction when pattern repeats

## Git Standards

**Conventional Commits:**
```bash
feat(auth): add JWT refresh token rotation
fix(booking): resolve calendar conflict detection
docs(api): update booking endpoint documentation
test(calendar): add availability integration tests
refactor(user): extract validation to shared utility
```

**Commit Message Structure:**
- Type: feat, fix, docs, test, refactor, style, chore
- Scope: Component or feature area
- Subject: Present tense, imperative mood
- Body (optional): Detailed explanation
- Footer (optional): Breaking changes, issue references

## Security Requirements

**MANDATORY:**
- Validate ALL user inputs at API boundaries (use Zod)
- Use established JWT patterns for authentication
- NEVER commit secrets or API keys
- Hash passwords with bcrypt
- Implement rate limiting on public endpoints
- Follow principle of least privilege

## Anti-Patterns to Avoid

❌ **Scope creep** - Pre-commit enforces limits
❌ **Pattern amnesia** - Always check patterns/index.md first
❌ **Over-engineering** - YAGNI until 2nd use
❌ **Quality bypass** - Pre-commit blocks bad code
❌ **Duplication** - Pre-commit blocks >3%
❌ **Complexity** - Pre-commit blocks violations
❌ **Manual verification** - Pre-commit automates it

## Boomerang Task Completion

**When specialist mode finishes:**
1. Run quality gates (pre-commit will verify)
2. Commit changes with conventional message
3. Use `attempt_completion` tool with clear result summary

**Parent mode automatically resumes** - no manual handback needed.

## Success Metrics

- 100% pre-commit compliance (automatic)
- 90%+ pattern reuse from institutional memory
- Zero manual quality verification (automated)
- <3% code duplication (enforced)
- All functions <50 lines (enforced)
- All files <300 lines (enforced)

## Implementation Protocol

1. **Check Patterns** - Review .docs/patterns/index.md
2. **Use TDD** - Tests before implementation when possible
3. **Apply Patterns** - Use existing approaches
4. **Respect Limits** - Pre-commit enforces automatically
5. **Document New Patterns** - Only if genuinely reusable
6. **Complete Work** - Use attempt_completion with summary

**Pre-commit is your safety net. Write code, commit, and limits are enforced automatically.**