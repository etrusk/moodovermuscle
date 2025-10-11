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

## Mode System (4 Modes Only)

**CRITICAL**: Only 4 modes exist. Quality, review, and refactor are now automated via pre-commit hooks.

**IMPORTANT**: This project uses **custom mode slugs**, NOT Roo's default mode names. See `.roo/rules/01-mode-enforcement.md` for complete delegation rules.

### 🧭 Navigator (Entry Point)
**Mode slug:** `navigator` (custom mode - NOT `orchestrator`)
**Use for:** All new tasks, task routing, simple queries

**Delegates to:**
- Test mode (`test`): New features (write tests first)
- Implementation mode (`implementation`): Existing tests (implement code)
- Investigation mode (`investigation`): Bugs and errors

**Never use:** `code`, `debug`, `architect`, `orchestrator`, `ask` (these don't exist in this project)

**Auto-commits:** No (read-only mode)

### 🧪 Test Mode
**Mode slug:** `test` (custom mode, no default equivalent)
**Use for:** TDD approach, writing tests before implementation

**Behavior:**
- Always writes tests first, follows AAA pattern
- Auto-commits after tests pass: `git commit -m "test: [description]"`

### 💻 Implementation Mode
**Mode slug:** `implementation` (custom mode - NOT `code`)
**Use for:** Writing code after tests exist

**Behavior:**
- Checks patterns first, applies YAGNI, respects limits
- Auto-commits and pushes after tests pass: `git commit -m "feat: [description]" && git push`

### 🐛 Investigation Mode
**Mode slug:** `investigation` (custom mode - NOT `debug`)
**Use for:** Debugging, troubleshooting, root cause analysis

**Behavior:**
- Checks investigations index, systematic debugging
- Auto-commits and pushes after fix verified: `git commit -m "fix: [description]" && git push`

## Why Custom Mode Slugs?

**Display Compatibility**: Custom slugs (`navigator`, `test`, `implementation`, `investigation`) ensure proper display in Roo UI and map to specific tool groups defined in `.roomodes`.

**Mode Mapping for Reference:**
- Roo's `code` → This project's `implementation`
- Roo's `debug` → This project's `investigation`
- Roo's `orchestrator`/`architect`/`ask` → This project's `navigator`

**Delegation Quick Reference:**
```typescript
// ✅ CORRECT
new_task({ mode: "test" })
new_task({ mode: "implementation" })
new_task({ mode: "investigation" })

// ❌ WRONG (modes don't exist)
new_task({ mode: "code" })
new_task({ mode: "debug" })
new_task({ mode: "architect" })
```

## Removed Modes (Now Automated)

**DO NOT reference these modes - they no longer exist:**
- ❌ Review mode → Pre-commit hooks verify quality automatically
- ❌ Refactor mode → Pre-commit blocks duplication >3% automatically
- ❌ Quality mode → Pre-commit runs all gates automatically

**Why removed:** Pre-commit enforcement makes manual quality/review/refactor modes redundant.

## 70/30 Decision Routing

**AI Handles Autonomously (70%)**:
- Code structure and organization (using established patterns)
- Testing implementation (following proven testing patterns)
- Documentation generation (updates to existing files only)
- UI component implementation (applying UI patterns)
- CRUD operations (using database patterns)
- Error handling patterns (applying established error handling)
- Performance optimizations (within defined constraints)
- Auto-commit workflows (test, implementation, investigation modes)

**Escalate to Human (30%)**:
- Business rule implementation and validation logic
- Security policy decisions
- User experience flows and interface design decisions
- Integration strategies (architectural decisions)
- Data modeling and schema design
- Authentication/authorization logic
- Scope boundary decisions

## Documentation Creation Policy

**CRITICAL**: **NEVER create new documentation files unless explicitly requested by the user.**

**Updates ONLY**:
- Update existing `.docs/` files when adding new patterns, investigations, or memory
- Update existing rule files when clarifying practices
- Update `README.md` when core functionality changes

**NEVER Create**:
- New analysis documents
- New strategy documents
- New planning documents
- New reference documents
- New guides or tutorials

**If You Think Documentation is Needed**:
1. Ask user explicitly: "Should I create a new documentation file for [topic]?"
2. Wait for confirmation
3. Only proceed after explicit approval

**Rationale**: Prevents documentation bloat and maintains lean, focused documentation structure.

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

## Auto-Commit Workflow

**Test Mode:**
```bash
# After tests pass
git add -A
git commit -m "test: [description of tests added]"
# Then attempt_completion
```

**Implementation Mode:**
```bash
# After tests pass
git add -A
git commit -m "feat: [description of implementation]"
git push
# Then attempt_completion
```

**Investigation Mode:**
```bash
# After fix verified
git add -A
git commit -m "fix: [description of bug fix]"
git push
# Then attempt_completion
```

**Pre-commit enforces quality automatically** - no manual verification needed.

## Boomerang Task Completion

**When specialist mode finishes:**
1. Auto-commit changes (if applicable mode)
2. Use `attempt_completion` tool with clear result summary

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