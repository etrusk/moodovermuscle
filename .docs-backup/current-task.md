# MoodOverMuscle Roo Code Overhaul - Complete Implementation Plan

## Overview

Transform from over-engineered specialist system to lean, pre-commit enforced workflow with persistent behavioral modes.

**Core Changes:**
- Pre-commit enforcement (complexity, duplication, hallucinations)
- 7 lean custom modes with persistent behaviors
- Consolidate 146 documentation files → ~20 files
- Remove manual protocols (handback, appetite tracking, quality verification)

---

## Phase 1: Pre-Commit Enforcement (20 minutes)

### Step 1.1: Install Dependencies

```bash
pnpm add -D jscpd @typescript-eslint/typescript-estree @typescript-eslint/parser
```

### Step 1.2: Create Complexity Check Script

**File**: `scripts/complexity-check.js`

```javascript
const fs = require('fs');
const path = require('path');
const parser = require('@typescript-eslint/typescript-estree');

const MAX_FUNCTION_LINES = 50;
const MAX_FILE_LINES = 300;
const MAX_PARAMS = 3;

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Check file size
    if (lines.length > MAX_FILE_LINES) {
      console.error(`❌ ${filePath}: ${lines.length} lines (max ${MAX_FILE_LINES})`);
      return false;
    }
    
    // Parse AST
    const ast = parser.parse(content, {
      loc: true,
      range: true,
      jsx: true,
      ecmaVersion: 'latest',
      sourceType: 'module'
    });
    
    let violations = [];
    
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      
      // Check all function types
      if (['FunctionDeclaration', 'ArrowFunctionExpression', 
           'FunctionExpression', 'MethodDefinition'].includes(node.type)) {
        
        const params = node.params?.length || 0;
        const lines = node.loc ? node.loc.end.line - node.loc.start.line : 0;
        
        if (params > MAX_PARAMS) {
          violations.push(`Line ${node.loc.start.line}: ${params} params (max ${MAX_PARAMS})`);
        }
        
        if (lines > MAX_FUNCTION_LINES) {
          violations.push(`Line ${node.loc.start.line}: ${lines} lines (max ${MAX_FUNCTION_LINES})`);
        }
      }
      
      // Recurse through AST
      for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
          }
        }
      }
    }
    
    visit(ast);
    
    if (violations.length > 0) {
      console.error(`❌ ${filePath}:`);
      violations.forEach(v => console.error(`   ${v}`));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: Parse error - ${error.message}`);
    return false;
  }
}

// Process files from arguments
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(analyzeFile);

if (allPassed) {
  console.log('✅ All complexity checks passed');
}

process.exit(allPassed ? 0 : 1);
```

### Step 1.3: Create NPM Package Check Script

**File**: `scripts/check-npm-packages.js`

```javascript
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const installed = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Match npm package imports (not relative paths)
    const importRegex = /from ['"]([^'".\/][^'"]*)['"]/g;
    let match;
    let allValid = true;
    
    while ((match = importRegex.exec(content)) !== null) {
      const fullPath = match[1];
      
      // Extract base package name
      const basePkg = fullPath.startsWith('@') 
        ? fullPath.split('/').slice(0, 2).join('/')
        : fullPath.split('/')[0];
      
      if (!installed[basePkg]) {
        console.error(`❌ ${filePath}: Package '${basePkg}' not in package.json`);
        console.error(`   Run: pnpm add ${basePkg}`);
        allValid = false;
      }
    }
    
    return allValid;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(checkFile);

if (allPassed) {
  console.log('✅ All package imports valid');
}

process.exit(allPassed ? 0 : 1);
```

### Step 1.4: Create jscpd Configuration

**File**: `.jscpd.json`

```json
{
  "threshold": 3,
  "reporters": ["console"],
  "ignore": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "node_modules/**",
    ".next/**",
    "build/**",
    "dist/**"
  ],
  "format": ["typescript", "javascript"],
  "minLines": 5,
  "minTokens": 50,
  "exitCode": 1,
  "skipEmpty": true
}
```

### Step 1.5: Update package.json Scripts

**File**: `package.json` (add to scripts section)

```json
{
  "scripts": {
    "complexity-check": "node scripts/complexity-check.js",
    "package-check": "node scripts/check-npm-packages.js",
    "duplication-check": "jscpd --config .jscpd.json"
  }
}
```

### Step 1.6: Update Pre-Commit Hook

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Get changed files
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' | tr '\n' ' ')

# Exit early if no relevant files changed
if [ -z "$CHANGED_FILES" ]; then
  echo "✅ No TypeScript/JavaScript files changed"
  exit 0
fi

echo "📁 Checking files: $CHANGED_FILES"

# 1. Lint (auto-fix enabled)
echo "🎨 Running lint..."
npm run lint || exit 1

# 2. Type check
echo "📘 Running type check..."
npm run type-check || exit 1

# 3. Critical tests
echo "🧪 Running critical tests..."
npm run test:critical || exit 1

# 4. Complexity check (AST-based)
echo "📊 Checking complexity..."
echo $CHANGED_FILES | xargs node scripts/complexity-check.js || exit 1

# 5. Package validation (hallucination detection)
echo "📦 Checking package imports..."
echo $CHANGED_FILES | xargs node scripts/check-npm-packages.js || exit 1

# 6. Duplication check (scoped to changed files)
echo "🔁 Checking duplication..."
echo $CHANGED_FILES | xargs jscpd --threshold 3 --min-lines 5 --min-tokens 50 || exit 1

# 7. Security scan (if configured)
if command -v npm run security:scan &> /dev/null; then
  echo "🔒 Running security scan..."
  npm run security:scan || exit 1
fi

# 8. Build verification
echo "🏗️ Verifying build..."
npm run build:verify || exit 1

echo "✅ All pre-commit checks passed!"
```

---

## Phase 2: Lean Custom Modes (15 minutes)

### Step 2.1: Replace .roomodes

**File**: `.roomodes`

```yaml
customModes:
  - slug: navigator
    name: "🧭 Navigator"
    description: "Entry point for all tasks. Routes simple work or delegates complex tasks."
    roleDefinition: >-
      You are the entry point for all user requests. You assess task complexity and either
      handle simple queries directly or delegate complex work via boomerang tasks to
      specialized modes. You have read and browser access but cannot modify code directly.
    whenToUse: "Always - this is the user's starting point for all tasks"
    groups:
      - read
      - browser
    customInstructions: |
      ## Your Role
      1. Receive all new user requests
      2. Assess complexity
      3. Handle simple queries OR delegate via boomerang tasks
      
      ## Routing Decision Tree
      
      **Handle directly:**
      - Simple questions (no code changes)
      - Documentation lookups
      - Clarification requests
      
      **Delegate via new_task tool:**
      - New feature → test mode (write tests first)
      - Implement feature → implementation mode (with existing tests)
      - Bug/issue → investigation mode
      - Code review → review mode
      - Refactoring → refactor mode
      - Pre-deployment → quality mode
      
      ## Delegation Format
      Use new_task with:
      - Clear objective and success criteria
      - Target mode
      - Relevant context (.docs/patterns/, .docs/investigations/)
      
      ## What You Don't Track
      - No handback checklists (automatic via attempt_completion)
      - No quality verification (pre-commit enforces)
      - No appetite tracking (pre-commit enforces limits)

  - slug: test
    name: "🧪 Test"
    description: "Test-driven development. Write tests before implementation."
    roleDefinition: >-
      You are a test engineer who always writes tests BEFORE implementation.
      Tests define requirements and acceptance criteria. You follow TDD principles
      and use AAA pattern (Arrange, Act, Assert).
    whenToUse: "Before implementing any new feature or fixing bugs"
    groups:
      - read
      - edit
      - command
    customInstructions: |
      ## Always TDD
      1. Check .docs/patterns/index.md for test patterns
      2. Write tests covering: happy path, edge cases, errors
      3. Use AAA pattern (Arrange, Act, Assert)
      4. Tests must be clear and maintainable
      
      ## Before Completion
      Run: npm run test:critical
      
      Use attempt_completion with summary of tests written.

  - slug: implementation
    name: "💻 Implement"
    description: "Pattern-first implementation. Simplest code passing tests."
    roleDefinition: >-
      You write the simplest code that passes tests. You always check institutional
      memory (.docs/patterns/index.md) before writing code to apply existing patterns.
      You respect complexity limits enforced by pre-commit hooks.
    whenToUse: "After tests exist, for implementing features or fixes"
    groups:
      - read
      - edit
      - command
    customInstructions: |
      ## Before Writing Code
      1. Check .docs/patterns/index.md for similar implementations
      2. Apply existing patterns rather than creating new ones
      3. Ensure tests exist (if not, suggest test mode first)
      
      ## Hard Limits (pre-commit enforced)
      - Function ≤ 50 lines
      - File ≤ 300 lines
      - Params ≤ 3
      - Duplication ≤ 3%
      
      ## YAGNI Principle
      - No interfaces until 2+ implementations exist
      - No abstraction until 2nd use
      - Search codebase before creating similar code
      
      ## Before Completion
      Run: npm run lint && npm run type-check && npm run test:critical
      Commit: git add -A && git commit -m "feat: [description]"
      
      Use attempt_completion with summary of implementation.

  - slug: investigation
    name: "🐛 Investigation"
    description: "Systematic debugging using institutional memory."
    roleDefinition: >-
      You are a debugging specialist who uses systematic approaches and institutional
      memory. You always check .docs/investigations/index.md for similar issues before
      starting, apply root cause analysis, and document findings.
    whenToUse: "When bugs, test failures, or errors occur"
    groups:
      - read
      - edit
      - command
      - browser
    customInstructions: |
      ## Before Debugging
      1. Check .docs/investigations/index.md for similar issues
      2. Apply proven debugging patterns from past resolutions
      3. Use systematic diagnosis (reproduce, isolate, analyze, fix)
      
      ## After Resolution
      1. Update .docs/investigations/index.md with new insights
      2. Document: problem, root cause, solution, prevention
      
      ## Before Completion
      Run: npm run test:critical
      
      Use attempt_completion with: root cause, fix applied, prevention strategy.

  - slug: review
    name: "👁️ Review"
    description: "Find errors AI misses. Verify APIs exist."
    roleDefinition: >-
      You find errors that AI implementations miss: logic errors, security issues,
      hallucinated APIs. You use browser tools to verify external APIs actually exist.
      You don't modify code, only identify issues.
    whenToUse: "After implementation, before deployment"
    groups:
      - read
      - browser
    customInstructions: |
      ## What to Check
      1. Edge cases and error handling
      2. Security issues (SQL injection, XSS, CSRF)
      3. APIs exist (use browser to verify documentation)
      4. Over-engineering (unnecessary abstractions)
      5. Pattern violations
      
      ## Output Format
      For each issue:
      - Severity: Critical / High / Medium / Low
      - Description: What's wrong
      - Fix: How to resolve
      - Pattern: Reference to .docs/patterns/ if relevant
      
      Use attempt_completion with review findings.

  - slug: refactor
    name: "♻️ Refactor"
    description: "Consolidate duplication. Test after every change."
    roleDefinition: >-
      You consolidate code duplication while maintaining behavior. You NEVER change
      behavior during refactoring. You test after EVERY extraction to ensure nothing broke.
      If tests fail, you immediately revert.
    whenToUse: "When jscpd detects >3% duplication or code smells identified"
    groups:
      - read
      - edit
      - command
    customInstructions: |
      ## Refactoring Protocol
      1. Identify duplication (>5 lines repeated)
      2. Extract to shared utility/function
      3. Run tests IMMEDIATELY after extraction
      4. If tests fail: REVERT and try different approach
      5. Repeat for next duplication
      
      ## Rules
      - NEVER change behavior
      - Test after EVERY change (not at end)
      - One extraction at a time
      - If stuck after 3 attempts, stop and report
      
      ## Before Completion
      Run: npm run test:critical
      Ensure: All tests still passing
      
      Use attempt_completion with refactorings completed.

  - slug: quality
    name: "🔍 Quality"
    description: "Run all quality gates. No compromises."
    roleDefinition: >-
      You run comprehensive quality gates before deployment. You execute all checks
      in order and report which pass or fail. You never compromise quality standards.
    whenToUse: "Before deployment or when comprehensive validation needed"
    groups:
      - read
      - command
    customInstructions: |
      ## Execute in Order
      
      ```bash
      npm run lint
      npm run type-check
      npm run test:critical
      npm run test:integration
      npm run test:e2e
      npm run security:scan
      npm run build:verify
      ```
      
      ## If Using Lighthouse CI
      ```bash
      npm run lighthouse:ci
      ```
      
      ## Report Format
      - ✅ Gates passed
      - ❌ Gates failed (with error details)
      - Recommendations for fixing failures
      
      Use attempt_completion with quality gate report.
```

### Step 2.2: Delete Old Custom Mode Configurations

```bash
# Delete specialist rule directories
rm -rf .roo/rules-implementation-specialist/
rm -rf .roo/rules-investigation-specialist/
rm -rf .roo/rules-quality-specialist/
rm -rf .roo/rules-deployment-specialist/
rm -rf .roo/rules-navigator/

# Delete protocol files
rm -rf .docs/protocols/

# Delete handoff templates
rm -rf .docs/handoffs/
```

---

## Phase 3: Consolidate Rules (20 minutes)

### Step 3.1: Update General Rules

**File**: `.roo/rules/00-general.md`

```markdown
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
```

### Step 3.2: Keep Coding Style Rules

**File**: `.roo/rules/01-coding-style.md` - Keep as-is from current version

### Step 3.3: Create Anti-Patterns Reference

**File**: `.roo/rules/02-anti-patterns.md`

```markdown
# Anti-Patterns (Pre-Commit Enforced)

## Automatically Blocked

These violations are caught by pre-commit hooks and prevent commits:

### Complexity Violations
- **Function >50 lines** → BLOCKED by complexity-check.js
- **File >300 lines** → BLOCKED by complexity-check.js
- **Function >3 params** → BLOCKED by complexity-check.js

### Code Quality
- **Duplication >3%** → BLOCKED by jscpd
- **Lint errors** → BLOCKED by ESLint
- **Type errors** → BLOCKED by TypeScript
- **Test failures** → BLOCKED by test suite

### Import Issues
- **Non-existent packages** → BLOCKED by package-check.js
- **Build failures** → BLOCKED by build verification

## Conceptual Anti-Patterns

Not automatically enforced but critical to avoid:

### Pattern Amnesia
❌ Not checking `.docs/patterns/index.md` before implementation
✅ Always search patterns first, apply existing approaches

### YAGNI Violations
❌ Creating interfaces before 2nd implementation
❌ Building abstractions before 2nd use
❌ Premature optimization
✅ Wait for actual need, then extract

### Over-Engineering
❌ Complex factory for single type
❌ Generic utility for specific use case
❌ Abstraction layers without clear benefit
✅ Simplest solution first, evolve when needed

### Context Blindness
❌ Implementing without reading `.roo/context.md`
❌ Ignoring institutional memory
❌ Recreating existing patterns
✅ Context-aware implementation using proven patterns

### Testing Anti-Patterns
❌ Tests after implementation (when TDD possible)
❌ Testing implementation details vs behavior
❌ Brittle tests coupled to internals
✅ TDD approach, behavior testing, maintainable tests

## How to Avoid

1. **Before coding**: Check `.docs/patterns/index.md`
2. **During coding**: Follow YAGNI, respect limits
3. **Before commit**: Pre-commit catches violations automatically
4. **After blocking**: Fix issue, don't bypass checks

## If Pre-Commit Blocks

### Complexity Violation
```bash
# Break function into smaller functions
# Or split file into multiple modules
# Then retry commit
```

### Duplication Violation
```bash
# Use refactor mode to consolidate
# Extract duplicated code to shared utility
# Then retry commit
```

### Package Import Error
```bash
# Install missing package: pnpm add <package>
# Or fix typo in import path
# Then retry commit
```

**Never bypass pre-commit hooks. Fix the underlying issue.**
```

### Step 3.4: Delete Redundant Rule Files

```bash
rm .roo/rules/00-user-instructions.txt
rm .roo/rules/03-automatic-handback.md
rm .roo/rules/04-terminal-cleanup.md
rm .roo/rules/05-specialist-common.md
```

---

## Phase 4: Create Context File (5 minutes)

**File**: `.roo/context.md`

```markdown
# MoodOverMuscle Project Context

## What We're Building

Next.js 14 booking platform for personal training/wellness services.

**Core Features:**
- Real-time session booking with conflict prevention
- Admin dashboard for booking management
- Calendar integration with availability management
- Client-facing booking forms

## Technology Stack

### Frontend
- **Next.js 14 (App Router)** - Server components, improved data fetching
- **React 18** - Component library
- **TypeScript** - Type safety across codebase
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database queries, migrations
- **PostgreSQL** - ACID compliance for booking conflicts
- **JWT** - Authentication with refresh token rotation

### Testing
- **Jest** - Unit and integration tests
- **Playwright** - End-to-end testing
- **Accessibility Testing** - WCAG 2.1 AA compliance

### Quality
- **ESLint + Prettier** - Code formatting
- **TypeScript Strict** - No `any` types allowed
- **Husky** - Pre-commit hooks
- **jscpd** - Duplication detection

## Architecture

```
app/
  api/
    bookings/        # Booking CRUD endpoints
    auth/            # JWT authentication
    availability/    # Calendar availability
  admin/             # Admin dashboard pages
  (public)/          # Public booking pages
  
lib/
  db/                # Prisma queries
  auth/              # JWT service
  validation/        # Zod schemas
  
components/
  booking/           # Booking UI components
  forms/             # Form components
  
tests/
  integration/       # API integration tests
  e2e/              # End-to-end flows
```

## Key Architectural Decisions

See `.docs/decisions/index.md` for full ADRs.

**Critical Decisions:**
1. **App Router** - Better data fetching, server components
2. **Prisma ORM** - Type-safe queries, migration management
3. **PostgreSQL** - ACID for booking conflict prevention
4. **JWT Strategy** - Refresh token rotation for security
5. **Zod Validation** - Runtime type safety at API boundaries

## Recent Changes

- 2025-01-10: Added pre-commit enforcement (complexity, duplication)
- 2025-01-10: Migrated to lean custom modes
- 2025-01-05: Implemented JWT refresh token rotation
- 2024-12-20: Fixed calendar DST boundary bug

## Known Issues & Gotchas

See `.docs/investigations/index.md` for details.

**Common Issues:**
- Bookings <15min apart cause conflicts (by design)
- UTC conversion breaks on DST boundaries (documented fix)
- Prisma relations must use explicit `include` (not implicit)
- Jest mocks must use `jest.unstable_mockModule()` for ESM

## Patterns

See `.docs/patterns/index.md` for reusable code patterns.

**Core Patterns:**
- **Auth**: JWT service at `lib/auth/jwt-service.ts`
- **Validation**: Zod schemas at `lib/validation/schemas.ts`
- **Database**: Booking queries at `lib/db/booking-queries.ts`
- **Testing**: Integration test setup at `tests/integration/booking.test.ts`

## Performance Requirements

- API response time <500ms (p95)
- Lighthouse CI score >90 (all categories)
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

## Constraints

**Hard Limits (pre-commit enforced):**
- Function ≤ 50 lines
- File ≤ 300 lines
- Function params ≤ 3
- Code duplication ≤ 3%
- No `any` types in TypeScript

**Development Principles:**
- TDD when implementing new features
- Pattern-first (check `.docs/patterns/index.md`)
- YAGNI (no abstraction until 2nd use)
- Security-first (validate all inputs)
```

---

## Phase 5: Consolidate Documentation (30 minutes)

### Step 5.1: Consolidate Patterns

**File**: `.docs/patterns/index.md`

```markdown
# Pattern Index

Reference for proven, reusable code patterns. Always check this before implementing similar functionality.

## Auth Patterns

### JWT Authentication
**Location**: `lib/auth/jwt-service.ts`
**Use for**: Login, token refresh, token validation
**Key functions**: `generateToken()`, `refreshToken()`, `validateToken()`

### Auth Middleware
**Location**: `middleware/auth-middleware.ts`
**Use for**: Protecting API routes
**Pattern**: Verify JWT in Authorization header, attach user to request

## Form Patterns

### Zod Validation Schemas
**Location**: `lib/validation/schemas.ts`
**Use for**: Runtime input validation
**Pattern**: Define schema, use `.parse()` for validation, catch ZodError

### Multi-Step Forms
**Location**: `components/forms/MultiStepForm.tsx`
**Use for**: Complex forms with multiple pages
**Pattern**: State machine for step management, validate per-step

### Form Error Handling
**Location**: `components/forms/FormError.tsx`
**Use for**: Displaying validation errors
**Pattern**: Map Zod errors to field-specific messages

## Database Patterns

### Prisma Queries
**Location**: `lib/db/booking-queries.ts`
**Use for**: Booking CRUD operations
**Pattern**: Use `include` for relations, proper error handling

### Transaction Wrapper
**Location**: `lib/db/transaction-wrapper.ts`
**Use for**: Multiple operations in single transaction
**Pattern**: Wrap in `prisma.$transaction()`, rollback on error

### Availability Checks
**Location**: `lib/db/availability-check.ts`
**Use for**: Preventing booking conflicts
**Pattern**: Query overlapping time ranges, lock for update

## Testing Patterns

### Integration Tests
**Location**: `tests/integration/booking.test.ts`
**Use for**: API endpoint testing
**Pattern**: Setup/teardown database, test full request/response cycle

### Prisma Mocking
**Location**: `tests/mocks/prisma-mock.ts`
**Use for**: Mocking database in tests
**Pattern**: Use `jest.unstable_mockModule()` for ESM compatibility

### E2E Tests
**Location**: `tests/e2e/booking-flow.spec.ts`
**Use for**: User workflow testing
**Pattern**: Playwright test, full browser automation

## Component Patterns

### Component Decomposition
**Principle**: Keep components <300 lines
**Pattern**: Extract sub-components when component grows too large
**Example**: BookingForm → BookingFormFields + BookingFormActions

### State Management
**Location**: Components use React Query for server state
**Pattern**: `useQuery` for reads, `useMutation` for writes
**Avoid**: Duplicating server state in local state

## API Patterns

### API Route Structure
**Location**: `app/api/bookings/route.ts`
**Pattern**:
```typescript
export async function POST(request: Request) {
  // 1. Parse and validate input (Zod)
  // 2. Authenticate/authorize
  // 3. Business logic
  // 4. Return Response.json()
}
```

### Error Response Format
**Pattern**:
```typescript
{
  success: false,
  error: {
    message: "Human-readable error",
    code: "ERROR_CODE",
    details: {} // Optional additional context
  }
}
```

## Common Implementation Approaches

### When to Extract a Pattern

**Extract when:**
- Code duplicated 2+ times (5+ lines)
- Clear reusable abstraction
- Multiple similar implementations

**Don't extract when:**
- Used only once
- Highly specific to single use case
- Abstraction adds more complexity than it removes

### How to Apply Patterns

1. Search this index for similar functionality
2. Review referenced file for implementation details
3. Copy pattern structure (don't duplicate code)
4. Adapt pattern to specific use case
5. If creating new pattern, document here only if genuinely reusable
```

### Step 5.2: Consolidate Investigations

**File**: `.docs/investigations/index.md`

```markdown
# Known Issues & Resolutions

Reference for debugging similar issues. Check here before investigating problems.

## Time & Date Issues

### Time Format Validation
**Problem**: Booking times failed validation in tests
**Root Cause**: Inconsistent time format (12hr vs 24hr, with/without timezone)
**Solution**: Standardized on ISO 8601 format throughout codebase
**Code**: `lib/validation/time-utils.ts`
**Prevention**: Always use `new Date().toISOString()` for API data

### DST Boundary Bugs
**Problem**: Calendar availability incorrect at DST transitions
**Root Cause**: Timezone conversion logic didn't account for DST changes
**Solution**: Use `date-fns-tz` library for timezone-aware operations
**Code**: `lib/utils/timezone.ts`
**Prevention**: Always use timezone-aware date libraries

## Testing Issues

### Jest Mock Hoisting
**Problem**: Mocks not hoisted in ES modules
**Root Cause**: Jest hoisting doesn't work with `import` statements
**Solution**: Use `jest.unstable_mockModule()` instead of `jest.mock()`
**Code**: `tests/mocks/prisma-mock.ts`
**Pattern**: Always use unstable_mockModule for ESM mocks

### Transaction Test Failures
**Problem**: Tests fail due to transaction rollback timing
**Root Cause**: Race condition in async transaction cleanup
**Solution**: Use `await prisma.$transaction()` with proper cleanup
**Code**: `tests/integration/booking.test.ts`
**Prevention**: Always await transaction completion in tests

## Build Issues

### Next.js Cache Corruption
**Problem**: Stale cache caused build failures after dependency updates
**Root Cause**: `.next/` directory cached outdated module resolution
**Solution**: Clear `.next/` directory on dependency changes
**Script**: `npm run clean && npm run build`
**Prevention**: Add postinstall script to clean cache

## Git/Commit Issues

### Pre-Commit Hook Bypass
**Problem**: Changes not staged caused pre-commit hooks to pass incorrectly
**Root Cause**: Hooks run on staged files, unstaged changes bypassed checks
**Solution**: Always `git add -A` before commit
**Prevention**: Pre-commit hook now checks for unstaged changes

## Database Issues

### Booking Conflicts Not Detected
**Problem**: Overlapping bookings allowed despite conflict detection
**Root Cause**: Race condition in availability check
**Solution**: Use `FOR UPDATE` lock in availability query
**Code**: `lib/db/availability-check.ts`
**Pattern**: Always use pessimistic locking for conflict-prone operations

### Prisma Relation Loading
**Problem**: Relations undefined at runtime despite type showing them
**Root Cause**: Forgot to use `include` in query
**Solution**: Always explicitly `include` relations in Prisma queries
**Pattern**: Never rely on implicit relation loading

## Performance Issues

### Slow API Response Times
**Problem**: Booking endpoint >1s response time
**Root Cause**: N+1 query problem loading nested relations
**Solution**: Use `include` with proper select to load relations in single query
**Code**: `lib/db/booking-queries.ts`
**Pattern**: Always profile queries, use Prisma's query logging

## Security Issues

### JWT Token Rotation
**Problem**: Long-lived access tokens presented security risk
**Root Cause**: No refresh token mechanism
**Solution**: Implement refresh token rotation with short-lived access tokens
**Code**: `lib/auth/jwt-service.ts`
**Pattern**: 15min access tokens, 7day refresh tokens with rotation

## Common Debugging Steps

### API Endpoint Issues
1. Check request validation (Zod schema)
2. Verify authentication middleware applied
3. Check database query (enable Prisma logging)
4. Verify response format matches expected structure

### UI/Component Issues
1. Check React DevTools for component state
2. Verify props passed correctly
3. Check browser console for errors
4. Verify API calls returning expected data

### Database Issues
1. Enable Prisma query logging: `DEBUG=prisma:query`
2. Check for N+1 queries
3. Verify relations included explicitly
4. Check for transaction deadlocks

## When to Document New Issues

**Document when:**
- Issue took >1 hour to debug
- Root cause non-obvious
- Solution reusable for similar issues
- Prevention pattern can be established

**Don't document:**
- Typos or simple mistakes
- One-off issues specific to local environment
- Issues with obvious solutions
```

### Step 5.3: Trim ADRs

Keep only these 10 non-obvious ADRs in `.docs/decisions/`:
- adr-002-database-schema-design.md
- adr-009-jwt-token-strategy.md
- adr-011-bundle-optimization.md
- adr-012-caching-strategy.md
- adr-013-session-management.md
- adr-014-rate-limiting.md
- adr-017-code-quality-gates.md
- adr-021-accessibility-standards.md
- adr-024-deployment-strategy.md
- adr-032-password-security-policy.md

```bash
# Move obvious ADRs to archive
mkdir -p .docs/backups/adrs-archive
mv .docs/decisions/adr-001-nextjs-app-router.md .docs/backups/adrs-archive/
mv .docs/decisions/adr-003-testing-architecture.md .docs/backups/adrs-archive/
mv .docs/decisions/adr-004-mobile-first-accessibility.md .docs/backups/adrs-archive/
mv .docs/decisions/adr-006-image-optimization-strategy.md .docs/backups/adrs-archive/
mv .docs/decisions/adr-010-database-technology.md .docs/backups/adrs-archive/
mv .docs/decisions/adr-015-component-library.md .docs/backups/adrs-archive/
mv .docs/decisions/adr-030-frontend-framework.md .docs/backups/adrs-archive/
# ... move other obvious ones
```

### Step 5.4: Delete Memory Subdirectories

```bash
rm -rf .docs/memory/architect/
rm -rf .docs/memory/code/
rm -rf .docs/memory/debug/
```

### Step 5.5: Delete Obsolete Files

```bash
rm .docs/circuit-breakers.md
rm .docs/memory/complexity-estimation-framework-and-historical-calibration.md
rm .docs/designs/custom-role-implementation-plan.md
rm .docs/designs/custom-role-migration-guide.md
rm .docs/reference/custom-roles-guide.md
```

### Step 5.6: Delete Individual Pattern Files

Keep ONLY `patterns/index.md`:

```bash
cd .docs/patterns
ls *.md | grep -v "index.md" | xargs rm
cd ../..
```

### Step 5.7: Delete Individual Investigation Files

Keep ONLY `investigations/index.md` and `investigation-template.md`:

```bash
cd .docs/investigations
ls 2025-*.md | xargs rm
cd ../..
```

---

## Phase 6: Validation (10 minutes)

### Step 6.1: Test Pre-Commit Hook

```bash
# Create test file with violations
cat > test-violations.ts << 'EOF'
// This should fail pre-commit

// 1. Function too long (>50 lines)
function tooLong() {
  const line1 = 1;
  const line2 = 2;
  // ... add 50+ lines
  const line60 = 60;
}

// 2. Too many params (>3)
function tooManyParams(a, b, c, d, e) {
  return a + b + c + d + e;
}

// 3. Non-existent package
import { fake } from 'non-existent-package';
EOF

# Try to commit
git add test-violations.ts
git commit -m "test: verify pre-commit blocks violations"
# Should fail with specific error messages

# Clean up
git reset HEAD test-violations.ts
rm test-violations.ts
```

### Step 6.2: Test Custom Modes

```bash
# Start Roo Code
# Verify all 7 modes appear in dropdown:
# - 🧭 Navigator
# - 🧪 Test
# - 💻 Implement
# - 🐛 Investigation
# - 👁️ Review
# - ♻️ Refactor
# - 🔍 Quality

# Test mode switching
# /navigator → switches to Navigator
# /test → switches to Test
# etc.
```

### Step 6.3: Test Boomerang Task

In Navigator mode:

```
User: "Add a new API endpoint for listing bookings"

Navigator should:
1. Recognize complexity
2. Create boomerang task to Test mode
3. Test mode writes tests
4. Returns to Navigator with completion
```

### Step 6.4: Verify File Consolidation

```bash
# Count documentation files
find .docs -type f -name "*.md" | wc -l
# Should be ~20 files (down from 146)

# Verify deleted files
ls .roo/rules-*-specialist/ 2>/dev/null
# Should show "No such file or directory"

ls .docs/handoffs/ 2>/dev/null
# Should show "No such file or directory"

ls .docs/protocols/ 2>/dev/null
# Should show "No such file or directory"
```

---

## Summary of Changes

### Pre-Commit Enforcement
✅ Complexity limits enforced (AST-based)
✅ Duplication threshold enforced (jscpd)
✅ Package hallucination detection
✅ Quality gates automatic

### Mode System
✅ 7 lean custom modes with persistent behaviors
✅ Navigator as entry point
✅ Boomerang task delegation
✅ No manual handback protocols

### Documentation
✅ 146 files → ~20 files (86% reduction)
✅ Single patterns/index.md (code locations)
✅ Single investigations/index.md (known issues)
✅ 10 ADRs (non-obvious decisions only)
✅ Context file for session-level awareness

### Eliminated
❌ Appetite tracking (pre-commit enforces)
❌ Manual handback protocols
❌ Quality verification checklists
❌ 70/30 decision routing
❌ Specialist rule directories
❌ Handoff templates
❌ Circuit breaker tracking
❌ Complexity estimation

### Result
- Pre-commit blocks bad code automatically
- Modes provide persistent behaviors
- Patterns prevent duplication before it's written
- Investigations prevent repeating past debugging
- No manual protocols, no ceremony, just enforcement