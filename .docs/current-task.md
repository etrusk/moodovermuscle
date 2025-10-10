# Comprehensive Roo Code Overhaul Plan

## Index

1. [Research Findings → Deliverables Matrix](#1-research-findings--deliverables-matrix)
2. [Current State Assessment](#2-current-state-assessment)
3. [Target State Architecture](#3-target-state-architecture)
4. [Pre-commit Enforcement Layer](#4-pre-commit-enforcement-layer)
5. [Mode Structure](#5-mode-structure)
6. [Rules Consolidation](#6-rules-consolidation)
7. [Documentation Consolidation](#7-documentation-consolidation)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Validation & Success Metrics](#9-validation--success-metrics)

---

## 1. Research Findings → Deliverables Matrix

| Research Finding | Evidence | Deliverable | Implementation |
|-----------------|----------|-------------|----------------|
| **8x code duplication increase** | GitClear 211M lines analysis | Pre-commit jscpd check | `npx jscpd` blocks >3% duplication |
| **65% missing context issue** | Qodo developer survey | `.roo/context.md` + `.docs/patterns/index.md` | Context priming for every AI session |
| **21.7% JS package hallucinations** | Package hallucination study | Pre-commit npm package validator | `scripts/check-npm-packages.js` |
| **19% slower with AI (METR study)** | Experienced dev RCT | TDG workflow + constraints | Test mode enforces tests-first |
| **7.2% delivery stability decrease** | Google DORA 2024 | Quality gates + appetite constraints | Quality mode runs full gate suite |
| **Over-engineering spiral** | O'Reilly pattern analysis | AST-based complexity limits | `scripts/complexity-check.js` (AST) |
| **Refactoring decline (25%→10%)** | GitClear temporal analysis | Dedicated Refactor mode | Weekly consolidation sprints |
| **YAGNI violations** | Practitioner consensus | Constraint-based prompts | "No abstraction until 2nd use" rule |
| **Pattern amnesia** | Industry case studies | Minimal pattern documentation | `.docs/patterns/index.md` (1-page) |
| **Context awareness #1 issue** | 65% Qodo survey | Enhanced context template | `.roo/context.md` with WHY decisions |
| **Hallucination detection gaps** | 21.7% persistent rate | TypeScript + npm validator | Existing type-check + new validator |
| **Progressive refinement needed** | Google/Augment best practices | Navigator mode | Task decomposition before work |
| **70/30 decision routing** | Solo+AI workflow research | Navigator delegation | Explicit human vs AI boundaries |
| **Modular architecture critical** | MASAI 40% improvement | Architecture enforcement | `.roo/rules/00-general.md` boundaries |
| **Quality gate bypass** | Multiple industry reports | Mandatory pre-commit gates | No bypasses allowed, enforced |
| **Test-driven generation (TDG)** | Emerging practice 2024-2025 | Test mode precedence | Tests before implementation |
| **Code churn 2x increase** | GitClear metrics | Git conventional commits | Pattern/investigation references |
| **Technical debt acceleration** | Multiple sources | Debt tracking + resolution log | `.docs/debt.md` + achievements |
| **Knowledge continuity loss** | Developer over-reliance | Session continuity protocol | End-of-session context capture |
| **Constraint-based prompting** | Effective practice pattern | Mode customInstructions | Hard limits in all modes |

---

## 2. Current State Assessment

### Critical Problems

**Configuration Bloat**:
- 5 specialist modes (over-engineered for solo dev)
- 12 Roo config files across 6 directories
- Specialist role overlap and unclear boundaries
- 146+ documentation files with significant duplication

**Institutional Memory Chaos**:
- 32 pattern files (should be 1-2 page index)
- 10 memory files (redundant with patterns)
- 18 handoff templates (automated away by modes)
- Pattern discovery requires searching 32 files

**Enforcement Gaps**:
- Quality gates documented but not enforced
- Manual handback protocol (should be automatic)
- No duplication detection
- No complexity enforcement
- No hallucination detection

**Documentation Debt**:
- 36 ADRs (valuable but not in AI context)
- Multiple backup directories
- Redundant README files
- Outdated specialist documentation

---

## 3. Target State Architecture

### Configuration Structure

```
.roo/
├── context.md                    # Single context file (NEW)
├── .roomodes                     # 5 lean modes (YAML)
└── rules/
    ├── 00-general.md             # Core principles (CONSOLIDATED)
    ├── 01-coding-style.md        # Keep as-is
    └── 02-anti-patterns.md       # Enforced + conceptual (NEW)

.docs/
├── patterns/
│   └── index.md                  # 1-2 page pattern index (CONSOLIDATED)
├── decisions/                    # ADRs (KEEP, not in AI context)
├── investigations/               # Keep minimal (10 files OK)
└── debt.md                       # Active debt only

scripts/
├── complexity-check.js           # AST-based (NEW)
├── check-npm-packages.js         # Package validator (NEW)
└── check-duplication.sh          # jscpd wrapper (NEW)

.husky/
└── pre-commit                    # Enforce all constraints (UPDATED)
```

### Deleted Structure

```
DELETE:
.roo/rules/03-automatic-handback.md              → Merged into modes
.roo/rules/04-terminal-cleanup.md                → Not needed
.roo/rules/05-specialist-common.md               → Merged into 00-general.md
.roo/rules-{specialist}/                          → All 5 directories
.docs/handoffs/                                   → 18 files (automated)
.docs/memory/ (partial)                           → Consolidated to patterns
.docs/patterns/ (30 files)                        → Consolidated to index.md
.docs/designs/                                    → Outdated planning docs
.docs/protocols/                                  → Merged into rules
.docs/backups/                                    → Archive elsewhere
```

---

## 4. Pre-commit Enforcement Layer

### File: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit quality gates..."

# Get changed files for scoped checks
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
TS_JS_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)

# 1. Linting (existing)
echo "📋 Running linter..."
npm run lint || exit 1

# 2. Type checking (existing - catches most hallucinations)
echo "🔍 Type checking..."
npm run type-check || exit 1

# 3. Critical tests (existing)
echo "🧪 Running critical tests..."
npm run test:critical || exit 1

# 4. NEW: Complexity check (AST-based)
if [ -n "$TS_JS_FILES" ]; then
  echo "📊 Checking code complexity..."
  echo "$TS_JS_FILES" | xargs node scripts/complexity-check.js || exit 1
fi

# 5. NEW: Duplication check (scoped to changed files)
if [ -n "$TS_JS_FILES" ]; then
  echo "🔎 Checking code duplication..."
  npx jscpd $TS_JS_FILES --threshold 3 --reporters console --min-lines 5 --min-tokens 50 || {
    echo "❌ Duplication >3% detected. Run 'npm run refactor' to consolidate."
    exit 1
  }
fi

# 6. NEW: NPM package validation (catches 21.7% hallucination problem)
if [ -n "$TS_JS_FILES" ]; then
  echo "📦 Validating npm packages..."
  echo "$TS_JS_FILES" | xargs node scripts/check-npm-packages.js || exit 1
fi

# 7. Security scan (existing)
echo "🔒 Security scanning..."
npm run security:scan || exit 1

# 8. Build verification (existing)
echo "🏗️  Build verification..."
npm run build:verify || exit 1

echo "✅ All pre-commit gates passed!"
```

### File: `scripts/complexity-check.js` (AST-based)

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const parser = require('@typescript-eslint/typescript-estree');

const MAX_FUNCTION_LINES = 50;
const MAX_FILE_LINES = 300;
const MAX_PARAMS = 3;

const CONFIG = {
  loc: true,
  range: true,
  comment: false,
  jsx: true
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // File length check
  if (lines.length > MAX_FILE_LINES) {
    console.error(`❌ ${filePath}: ${lines.length} lines (max ${MAX_FILE_LINES})`);
    return false;
  }
  
  let violations = [];
  
  try {
    const ast = parser.parse(content, CONFIG);
    
    function visit(node) {
      // Check all function types
      const functionTypes = [
        'FunctionDeclaration',
        'FunctionExpression', 
        'ArrowFunctionExpression',
        'MethodDefinition'
      ];
      
      if (functionTypes.includes(node.type)) {
        // Parameter count check
        const params = node.params?.length || 0;
        if (params > MAX_PARAMS) {
          violations.push(
            `${filePath}:${node.loc.start.line} - Function has ${params} parameters (max ${MAX_PARAMS})`
          );
        }
        
        // Function length check
        if (node.loc) {
          const funcLines = node.loc.end.line - node.loc.start.line;
          if (funcLines > MAX_FUNCTION_LINES) {
            violations.push(
              `${filePath}:${node.loc.start.line} - Function is ${funcLines} lines (max ${MAX_FUNCTION_LINES})`
            );
          }
        }
      }
      
      // Recurse through AST
      for (let key in node) {
        const child = node[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach(c => c && typeof c === 'object' && visit(c));
          } else {
            visit(child);
          }
        }
      }
    }
    
    visit(ast);
  } catch (error) {
    console.error(`❌ ${filePath}: Parse error - ${error.message}`);
    return false;
  }
  
  if (violations.length > 0) {
    violations.forEach(v => console.error(`❌ ${v}`));
    return false;
  }
  
  return true;
}

// Process files from stdin or args
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ File not found: ${file}`);
    return false;
  }
  return analyzeFile(file);
});

if (!allPassed) {
  console.error('\n💡 Tip: Break large functions into smaller utilities');
  console.error('💡 Tip: Use object parameters for functions with >3 params');
  console.error('💡 Tip: Split large files by responsibility\n');
}

process.exit(allPassed ? 0 : 1);
```

### File: `scripts/check-npm-packages.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load package.json
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
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Match: import/require from 'package' or '@scope/package'
  // Excludes relative imports (starting with . or /)
  const importRegex = /(?:import|require)\s*(?:.*?\s*from\s*)?['"]([^'".\/][^'"]*)['"]/g;
  
  let match;
  const violations = [];
  
  while ((match = importRegex.exec(content)) !== null) {
    const fullPath = match[1];
    
    // Extract base package name
    const basePkg = fullPath.startsWith('@')
      ? fullPath.split('/').slice(0, 2).join('/')  // @scope/package
      : fullPath.split('/')[0];                     // package
    
    // Check if package is installed
    if (!installed[basePkg]) {
      violations.push({
        line: content.substring(0, match.index).split('\n').length,
        package: basePkg,
        fullPath: fullPath
      });
    }
  }
  
  if (violations.length > 0) {
    console.error(`\n❌ ${filePath}: Uninstalled packages detected`);
    violations.forEach(v => {
      console.error(`   Line ${v.line}: '${v.package}' not in package.json`);
      console.error(`   → Run: pnpm add ${v.package}`);
    });
    return false;
  }
  
  return true;
}

// Process files
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ File not found: ${file}`);
    return false;
  }
  return checkFile(file);
});

if (!allPassed) {
  console.error('\n💡 Tip: AI may have hallucinated a package name');
  console.error('💡 Tip: Search npm for similar package names');
  console.error('💡 Tip: Check official docs for correct import path\n');
}

process.exit(allPassed ? 0 : 1);
```

### File: `.jscpd.json`

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
    "dist/**",
    "build/**",
    ".next/**",
    "coverage/**"
  ],
  "format": ["typescript", "javascript"],
  "minLines": 5,
  "minTokens": 50,
  "exitCode": 1,
  "silent": false
}
```

### Package Dependencies

```json
// package.json additions
{
  "devDependencies": {
    "jscpd": "^4.0.5",
    "@typescript-eslint/typescript-estree": "^6.21.0"
  },
  "scripts": {
    "complexity-check": "git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx|js|jsx)$' | xargs -r node scripts/complexity-check.js",
    "duplication-check": "git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx|js|jsx)$' | xargs -r npx jscpd --threshold 3",
    "hallucination-check": "git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx|js|jsx)$' | xargs -r node scripts/check-npm-packages.js"
  }
}
```

---

## 5. Mode Structure

### File: `.roomodes` (YAML)

```yaml
customModes:
  # Test-Driven Generation (TDG)
  - slug: test
    name: "🧪 Test"
    description: "Write tests BEFORE implementation - tests define requirements"
    roleDefinition: |
      You write comprehensive tests BEFORE any implementation code.
      Tests define requirements and success criteria.
      
      Max 50 lines/function, 300 lines/file, 3 params.
    whenToUse: "Before implementing any new feature or fixing bugs"
    groups:
      - read
      - - edit
        - fileRegex: '\.(test|spec)\.(ts|tsx|js|jsx)$'
          description: "Test files only"
    customInstructions: |
      ## Test-Driven Generation Protocol
      
      1. **Read existing tests** for patterns
      2. **Write tests covering**:
         - Happy path scenarios
         - Edge cases (empty, null, max values)
         - Error conditions
         - Integration points
      
      3. **Test structure** (AAA pattern):
         - Arrange: Setup test data
         - Act: Execute code under test
         - Assert: Verify results
      
      4. **Before handback**:
         ```bash
         npm run test:critical
         ```
      
      ## Context Sources
      - Check `.roo/context.md` for project overview
      - Review `.docs/patterns/index.md` for testing patterns
      - See existing test files for examples
      
      **CRITICAL**: Tests must PASS after implementation. If implementation can't pass tests within appetite, escalate to Navigator.
    source: project

  # Implementation with Constraints
  - slug: implement
    name: "💻 Implement"
    description: "Simplest code passing tests - enforced complexity limits"
    roleDefinition: |
      You implement the simplest solution that passes existing tests.
      Pre-commit enforces: ≤50 lines/function, ≤300 lines/file, ≤3 params.
      
      YAGNI: No abstraction until 2nd use.
    whenToUse: "After tests exist, to implement features within constraints"
    groups:
      - read
      - edit
      - command
    customInstructions: |
      ## Constraint-Based Implementation
      
      **PREREQUISITE**: Tests must exist (check test files first).
      
      **Hard Limits** (pre-commit enforced):
      - Function ≤ 50 lines
      - File ≤ 300 lines  
      - Parameters ≤ 3
      - Duplication ≤ 3%
      
      **YAGNI Enforcement**:
      - ❌ NO interfaces unless 2+ implementations exist NOW
      - ❌ NO factories unless 2+ types exist NOW
      - ❌ NO abstraction until 2nd identical use
      - ✅ Search codebase BEFORE creating similar code
      
      **Implementation Protocol**:
      1. Read `.docs/patterns/index.md` for similar implementations
      2. Check `.docs/investigations/index.md` for known issues
      3. Implement simplest solution passing tests
      4. Run quality gates before handback:
         ```bash
         npm run lint
         npm run type-check
         npm run test:critical
         ```
      
      **Context Sources**:
      - `.roo/context.md` - Project overview
      - `.docs/patterns/index.md` - Proven approaches
      - `.docs/investigations/index.md` - Known issues
      
      **Escalate to Navigator if**:
      - Approaching complexity limits repeatedly
      - Business logic decisions needed
      - Security policy unclear
      - Architecture changes required
    source: project

  # Consolidation and Cleanup
  - slug: refactor
    name: "♻️ Refactor"
    description: "Consolidate duplication - NEVER change behavior"
    roleDefinition: |
      You consolidate code duplication detected by jscpd.
      NEVER change external behavior. Tests must pass after every change.
    whenToUse: "When jscpd detects >3% duplication or for weekly cleanup"
    groups:
      - read
      - edit
      - command
    customInstructions: |
      ## Refactoring Protocol
      
      **RULES**:
      - NEVER change external behavior
      - Run tests after EVERY change
      - If tests fail: REVERT immediately
      
      **Process**:
      1. Run duplication check:
         ```bash
         npx jscpd --threshold 3
         ```
      
      2. For each duplication found:
         - Extract to shared utility
         - Replace both instances
         - Run tests: `npm run test:critical`
         - If tests fail: REVERT
      
      3. Commit incrementally:
         ```bash
         git add -A
         git commit -m "refactor: consolidate [description]"
         ```
      
      **Context Sources**:
      - `.docs/patterns/index.md` - Consolidation patterns
      - Existing utilities for extraction targets
      
      **Before handback**:
      ```bash
      npm run lint
      npm run type-check  
      npm run test:critical
      npx jscpd --threshold 3  # Verify duplication reduced
      ```
    source: project

  # Verification Layer
  - slug: verify
    name: "✓ Verify"
    description: "Find errors AI misses + run quality gates"
    roleDefinition: |
      You perform systematic code review and quality gate execution.
      Find logic errors, security issues, hallucinations, over-engineering.
    whenToUse: "After implementation, before deployment"
    groups:
      - read
      - browser
      - command
    customInstructions: |
      ## Verification Protocol
      
      **Review Checklist**:
      1. **Logic Errors**:
         - Edge cases handled?
         - Error conditions caught?
         - Null/undefined checks present?
      
      2. **Security Issues**:
         - SQL injection prevented? (parameterized queries)
         - XSS prevented? (sanitized outputs)
         - Auth checks present on protected routes?
         - Input validation using Zod schemas?
      
      3. **Hallucination Detection**:
         - All imports exist? (browser search official docs)
         - APIs match documentation?
         - Methods exist on objects?
         - Deprecated APIs avoided?
      
      4. **Over-Engineering**:
         - Interfaces with single implementation?
         - Factories for single type?
         - Unused abstractions?
         - Violates YAGNI?
      
      5. **Quality Gates**:
         ```bash
         npm run lint
         npm run type-check
         npm run test:critical
         npm run test:integration
         npm run test:e2e
         npm run security:scan
         npm run build:verify
         ```
      
      **Output Format**:
      For each issue found:
      - **Severity**: Critical/High/Medium/Low
      - **Issue**: Specific problem description
      - **Location**: File:line
      - **Fix**: Recommended solution
      - **Pattern**: Reference to `.docs/patterns/index.md` if applicable
      
      **Browser Verification**:
      - Search official docs to verify APIs exist
      - Check npm for package existence
      - Validate method signatures match docs
    source: project

  # Investigation and Debugging  
  - slug: investigate
    name: "🐛 Debug"
    description: "Systematic debugging using institutional memory"
    roleDefinition: |
      You perform systematic debugging using proven patterns.
      Always check `.docs/investigations/index.md` for similar issues first.
    whenToUse: "When bugs occur or tests fail"
    groups:
      - read
      - edit
      - command
      - browser
    customInstructions: |
      ## Investigation Protocol
      
      **MANDATORY FIRST STEP**:
      1. Check `.docs/investigations/index.md` for similar issues
      2. If found: Apply proven solution pattern
      3. If not found: Proceed with systematic diagnosis
      
      **Debugging Workflow**:
      1. **Gather Context**:
         - Reproduction steps
         - Error messages (full stack traces)
         - Expected vs actual behavior
         - Recent changes (git log)
      
      2. **Systematic Diagnosis**:
         - Binary search (comment out code to isolate)
         - Add logging at boundaries
         - Check assumptions with assertions
         - Verify data shapes with console.log
      
      3. **Pattern-Informed Resolution**:
         - Check `.docs/patterns/index.md` for debugging patterns
         - Apply established solution approaches
         - Avoid known anti-patterns
      
      4. **Fix Implementation**:
         - Make minimal change to fix issue
         - Run tests: `npm run test:critical`
         - Verify fix resolves original issue
      
      5. **Knowledge Capture**:
         - If new issue type: Document in `.docs/investigations/`
         - Update patterns if reusable solution found
      
      **Before handback**:
      ```bash
      npm run lint
      npm run type-check
      npm run test:critical
      ```
      
      **Escalate to Navigator if**:
      - Investigation exceeds appetite boundary
      - Architectural changes needed
      - Root cause requires infrastructure changes
    source: project

  # Coordination and Direction
  - slug: navigator
    name: "🧭 Navigator"
    description: "Strategic coordination - route work, enforce appetite, validate handbacks"
    roleDefinition: |
      You coordinate all work, enforce appetite constraints, and route decisions.
      You set direction, manage scope, and validate all specialist handbacks.
      
      70% to AI: implementation, tests, docs, CRUD
      30% to Human: business logic, security, UX, integrations
    whenToUse: "For project coordination, task breakdown, and decision routing"
    groups:
      - read
      - browser
      - mcp
    customInstructions: |
      ## Navigator Responsibilities
      
      **Task Decomposition**:
      1. Break complex work into appetite-sized chunks
      2. Define clear success criteria for each chunk
      3. Identify which mode handles each chunk
      4. Route to appropriate mode with context
      
      **70/30 Decision Routing**:
      
      **Route to AI (70% - Autonomous)**:
      - Code structure and organization
      - CRUD operations
      - UI component implementation
      - Test writing and documentation
      - Error handling implementation
      - Performance optimizations (within scope)
      
      **Route to Human (30% - Strategic)**:
      - Business logic rule definitions
      - Security policy decisions
      - User experience flow decisions
      - Data validation rules (business logic)
      - Integration strategies
      - Authentication/authorization logic
      - Appetite boundary decisions
      
      **Appetite Enforcement**:
      - Set clear circuit breakers for all work
      - Monitor progress against boundaries
      - Escalate immediately when boundaries approached
      - NEVER allow scope expansion without human approval
      
      **Handback Validation**:
      When receiving work from specialists, verify:
      - [ ] All todo items completed
      - [ ] Quality gates passed (evidence required)
      - [ ] Git status clean (no uncommitted work)
      - [ ] Patterns applied (document which ones)
      - [ ] Knowledge captured (if new patterns/issues)
      
      **Mode Transition Template**:
      ```markdown
      ## Context
      - Current situation: [brief description]
      - Appetite: [time/complexity constraint]
      - Circuit breaker: [stop condition]
      
      ## Task
      - [ ] Specific todo item 1
      - [ ] Specific todo item 2
      - [ ] [Mode name] handback to Navigator
      
      ## Success Criteria
      - [How to know it's done]
      
      ## Constraints
      - Complexity: ≤50 lines/function
      - Patterns: Check `.docs/patterns/index.md`
      - Quality: All gates must pass
      ```
      
      **Context Sources**:
      - `.roo/context.md` - Project overview
      - `.docs/patterns/index.md` - Available patterns
      - `.docs/investigations/index.md` - Known issues
      - `.docs/debt.md` - Active technical debt
    source: project
```

---

## 6. Rules Consolidation

### File: `.roo/rules/00-general.md` (Consolidated)

```markdown
# General Development Rules

**MANDATORY**: These rules apply to ALL modes and override any conflicting instructions.

## Project Context Reference

**FIRST**: Always read `.roo/context.md` for current project state and recent decisions.

## Core Principles

### YAGNI (You Aren't Gonna Need It)
- Implement features ONLY when actually needed
- NO interfaces unless 2+ implementations exist NOW
- NO factories unless 2+ types exist NOW
- NO abstraction until 2nd identical use
- Justify every abstraction with current, concrete use

### DRY (Don't Repeat Yourself)
- **BEFORE creating new code**: Search codebase for similar functionality
- Consolidate duplication immediately when detected
- Create reusable utilities for repeated logic
- Pre-commit blocks >3% duplication

### Modular Architecture
- Each module has ONE clearly-defined responsibility
- All inter-module communication through explicit interfaces
- Maximum function length: 50 lines (enforced)
- Maximum file length: 300 lines (enforced)
- Maximum parameters: 3 (enforced)

### KISS (Keep It Simple)
- Simplest solution that works is almost always best
- Avoid premature optimization
- Clear is better than clever
- Readable > concise

## Institutional Memory Protocol

### Mandatory Pattern Discovery
**BEFORE starting any work**:
1. Read `.docs/patterns/index.md` for similar implementations
2. Check `.docs/investigations/index.md` for known issues
3. Apply existing patterns rather than creating new approaches

### Knowledge Capture
**AFTER completing work**:
- Document new reusable patterns in `.docs/patterns/index.md`
- Record debugging insights in `.docs/investigations/`
- Update `.docs/debt.md` if technical debt identified

## Quality Gates (Pre-commit Enforced)

**MANDATORY BEFORE EVERY COMMIT**:
```bash
npm run lint              # ESLint + Prettier
npm run type-check        # TypeScript compilation
npm run test:critical     # Essential tests
npm run security:scan     # Security vulnerabilities
npm run build:verify      # Build success
# Plus: complexity, duplication, hallucination checks
```

**Never bypass quality gates**. If gates fail:
- Fix the issue within scope
- If fix exceeds appetite: Escalate to Navigator
- If architectural change needed: Escalate to Navigator

## 70/30 Decision Routing

### Implement Autonomously (70%)
- Code structure using established patterns
- CRUD operations and database interactions
- UI component implementation
- Testing and documentation
- Error handling patterns
- Performance optimizations within scope

### Escalate to Human (30%)
- Business rule definitions
- Security policy decisions
- User experience flows
- Data validation rules (business logic)
- Integration strategies
- Authentication/authorization logic

## Appetite-Constrained Development

### Scope Boundaries
- Execute within defined appetite boundaries absolutely
- Respect circuit breakers and scope limitations
- Stop at boundaries and escalate rather than expand
- Never compromise functionality to fit appetite

### Escalation Triggers
- Approaching appetite boundaries
- Stuck in implementation loops (>3 attempts)
- Business logic or security decisions required
- Requirements ambiguity affecting scope
- Quality gates repeatedly failing

## Mode Handback Protocol

**MANDATORY**: All non-Navigator modes must end work with:
```markdown
- [ ] [Mode name] handback to Navigator for next phase coordination
```

**Upon marking handback complete**:
- Present results using attempt_completion
- Automatically switch to Navigator mode
- Include evidence of quality gate passage

## Git Standards

### Conventional Commits
```
feat(scope): description
fix(scope): description  
refactor(scope): description
test(scope): description
docs(scope): description
```

### Commit Message Structure
```
type(scope): brief description

Patterns applied: [list from .docs/patterns/index.md]
Investigations referenced: [list from .docs/investigations/]

Closes #issue-number (if applicable)
```

## Anti-Patterns to Avoid

### Development Anti-Patterns
- ❌ Scope creep: Implementing beyond appetite boundaries
- ❌ Pattern amnesia: Not checking patterns before implementation
- ❌ Decision overreach: Making 30% decisions without escalation
- ❌ Quality gate bypass: Skipping mandatory pre-commit checks
- ❌ Hallucination blindness: Not verifying APIs exist

### Technical Anti-Patterns
- ❌ Over-engineering: Abstraction without 2+ use cases
- ❌ Copy-paste coding: Not consolidating duplication
- ❌ Magic numbers: Hard-coded values without constants
- ❌ Error swallowing: Catching without proper handling
- ❌ Any types: Using `any` instead of proper typing

## Technology Stack Context

**Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS

**Key Constraints**:
- Zero `any` types (TypeScript strict mode)
- All inputs validated (Zod schemas at API boundaries)
- API response time <500ms
- Parameterized queries only (SQL injection prevention)
- JWT for authentication, bcrypt for passwords

## Success Metrics

- 95%+ appetite compliance
- 100% critical quality gate passage
- 90%+ pattern reuse from institutional memory
- Zero quality gate bypasses
- 100% handback protocol compliance
```

### File: `.roo/rules/01-coding-style.md` (Keep as-is)

*No changes - existing TypeScript/React standards are good*

### File: `.roo/rules/02-anti-patterns.md` (New)

```markdown
# Anti-Patterns

## Pre-commit Enforced (Will Block Commits)

### Complexity Limits
- **Function >50 lines** → BLOCKED by `complexity-check.js`
- **File >300 lines** → BLOCKED by `complexity-check.js`
- **Parameters >3** → BLOCKED by `complexity-check.js`

**Fix**: Break into smaller functions, use object parameters, split files by responsibility.

### Code Duplication
- **>3% duplication** → BLOCKED by `jscpd`

**Fix**: Run `npm run refactor` to consolidate duplication.

### Package Hallucinations
- **Uninstalled packages** → BLOCKED by `check-npm-packages.js`

**Fix**: Install package (`pnpm add package-name`) or fix typo.

### Quality Issues
- **Linting failures** → BLOCKED by `npm run lint`
- **Type errors** → BLOCKED by `npm run type-check`
- **Test failures** → BLOCKED by `npm run test:critical`
- **Security vulnerabilities** → BLOCKED by `npm run security:scan`
- **Build failures** → BLOCKED by `npm run build:verify`

**Fix**: Resolve issues before committing.

---

## Conceptual Anti-Patterns (Not Enforced, But Critical)

### Pattern Amnesia
**Problem**: Implementing without checking `.docs/patterns/index.md`

**Result**: Duplicating existing solutions, missing proven approaches

**Fix**: ALWAYS check patterns before starting work

### Context Blindness  
**Problem**: Implementing without reading `.roo/context.md`

**Result**: Missing project context, violating architectural decisions

**Fix**: Read context file at start of every session

### Decision Overreach
**Problem**: Making 30% decisions (business logic, security, UX) without escalation

**Result**: Misaligned implementation, rework required

**Fix**: Escalate strategic decisions to Navigator/Human

### YAGNI Violations
**Problem**: Creating abstractions before 2nd use

**Examples**:
- Interface with 1 implementation
- Factory for 1 type
- Abstract class with no inheritance

**Fix**: Inline the abstraction, create only when 2nd use appears

### Over-Engineering Spiral
**Problem**: AI wrapping simple problems in complex abstraction layers

**Example**:
```typescript
// ❌ Over-engineered
interface IUserService { }
class UserServiceFactory { }
class UserServiceProvider { }
// For a simple CRUD operation!

// ✅ Simple
export async function getUser(id: string) { }
```

**Fix**: Use simplest solution, add abstraction only when needed

### Hallucination Trust
**Problem**: Not verifying AI-generated APIs/packages exist

**Result**: Runtime errors, package installation failures

**Fix**: Use browser to verify APIs in official docs

### Quality Gate Bypass
**Problem**: Committing without running gates, or using `--no-verify`

**Result**: Technical debt accumulation, production bugs

**Fix**: Let pre-commit hook run, fix issues properly

### Test After Development
**Problem**: Writing tests after implementation (not TDG)

**Result**: Tests mirror implementation flaws, poor coverage

**Fix**: Use Test mode BEFORE Implement mode

---

## Detection and Prevention

| Anti-Pattern | Detected By | Prevented By |
|--------------|-------------|--------------|
| Function >50 lines | Pre-commit | complexity-check.js |
| File >300 lines | Pre-commit | complexity-check.js |
| Params >3 | Pre-commit | complexity-check.js |
| Duplication >3% | Pre-commit | jscpd |
| Missing packages | Pre-commit | check-npm-packages.js |
| Type errors | Pre-commit | npm run type-check |
| Pattern amnesia | Code review | Mode customInstructions |
| YAGNI violations | Code review | Mode customInstructions |
| Over-engineering | Code review | Verify mode |
| Decision overreach | Process | Navigator routing |

---

## Quick Reference

**Before coding**: Check patterns, check context, check investigations
**During coding**: Stay within complexity limits, avoid duplication
**After coding**: Run quality gates, capture new patterns
**Before commit**: Pre-commit hook validates everything
```

---

## 7. Documentation Consolidation

### File: `.roo/context.md` (New)

```markdown
# MoodOverMuscle Project Context

**Last Updated**: [DATE] | **Update Weekly**

## What We're Building

Next.js 14 booking platform for personal training and wellness services.
Focus: Real-time availability, conflict prevention, admin dashboard.

## Why These Technologies

| Technology | Decision | Rationale |
|-----------|----------|-----------|
| **Next.js 14** | App Router | Server components, better data fetching, streaming |
| **TypeScript** | Strict mode | Type safety, better IDE support, fewer runtime errors |
| **Prisma ORM** | PostgreSQL | Type-safe queries, migrations, excellent DX |
| **PostgreSQL** | Relational DB | ACID for bookings, complex queries, data integrity |
| **Zod** | Validation | Runtime type validation at API boundaries |
| **Tailwind CSS** | Styling | Utility-first, no CSS file bloat, mobile-first |
| **JWT** | Auth | Stateless, scalable, refresh token support |
| **bcrypt** | Password hashing | Industry standard, configurable rounds |

## Current Architecture

```
app/
  api/              # API routes (Next.js)
    bookings/       # Booking CRUD + availability
    auth/           # Authentication (JWT)
    admin/          # Admin operations
  (routes)/         # Pages
    booking/        # Public booking flow
    admin/          # Admin dashboard (protected)
    
lib/
  db/               # Prisma client + queries
  validation/       # Zod schemas
  auth/             # JWT utilities
  
components/
  booking/          # Booking UI components
  admin/            # Admin UI components
  ui/               # Shared UI primitives
  
prisma/
  schema.prisma     # Database schema
  migrations/       # Database migrations
```

## Recent Changes (Last 30 Days)

- **2025-01-10**: Added JWT refresh token rotation (ADR-009)
- **2025-01-05**: Fixed calendar DST boundary issue (Investigation-2025-10-04)
- **2024-12-20**: Decomposed booking form into steps (ADR-005)

## Known Gotchas

### Booking System
- **Minimum gap**: Bookings <15min apart cause conflicts (check overlap logic)
- **UTC conversion**: DST boundaries break timezone conversion (use date-fns-tz)
- **Conflict detection**: Must check BOTH start/end time overlaps

### Database
- **Prisma relations**: Must use explicit `include` for nested data
- **Transaction isolation**: Use `$transaction` for booking creation + availability update
- **Connection pooling**: Max 10 connections in dev, 20 in prod (DATABASE_URL)

### Authentication
- **JWT refresh**: Implemented in `/api/auth/refresh` (24h access, 7d refresh)
- **Session storage**: HTTP-only cookies for security
- **Admin routes**: All require `middleware.ts` auth check

### Testing
- **Prisma mocking**: Use `jest-mock-extended` for Prisma client
- **Time mocking**: Use `jest.useFakeTimers()` for date-dependent tests
- **E2E**: Playwright requires separate test database

## Performance Requirements

| Metric | Target | Measured By |
|--------|--------|-------------|
| API response | <500ms | Lighthouse CI |
| Page load (LCP) | <2.5s | Lighthouse CI |
| Time to Interactive | <3.8s | Lighthouse CI |
| Bundle size | <200KB (initial) | Next.js build output |

## Security Requirements

- All inputs validated with Zod schemas at API boundaries
- Parameterized queries only (Prisma handles this)
- JWT tokens in HTTP-only cookies
- Password min 8 chars, bcrypt 10 rounds
- Rate limiting: 100 req/15min per IP (API routes)
- CSRF protection via SameSite cookies

## Pattern Library Reference

See `.docs/patterns/index.md` for:
- Authentication patterns (JWT, session management)
- Form handling patterns (multi-step, validation)
- Database query patterns (availability checks, conflict detection)
- Testing patterns (mocking, integration, E2E)
- Component decomposition patterns

## Investigation Reference

See `.docs/investigations/index.md` for known issues:
- Transaction test failures
- Time format mismatches
- Jest mock hoisting
- Next.js build cache corruption

## Active Technical Debt

See `.docs/debt.md` for current debt items requiring attention.

---

**For More Details**:
- Architecture: `.docs/architecture.md`
- Full specification: `.docs/spec.md`
- Workflows: `.docs/workflows.md`
- ADRs: `.docs/decisions/index.md`
```

### File: `.docs/patterns/index.md` (Consolidated from 32 files)

```markdown
# Pattern Library

**Single source of truth for proven implementation approaches.**
**ALWAYS check this before implementing anything.**

---

## Quick Index

- [Authentication](#authentication)
- [Forms & Validation](#forms--validation)
- [Database & Queries](#database--queries)
- [Testing](#testing)
- [Components](#components)
- [API Design](#api-design)
- [Real-time Features](#real-time-features)
- [Performance](#performance)

---

## Authentication

### JWT Token Management
**File**: `lib/auth/jwt-service.ts`

```typescript
// Token generation with refresh
export async function generateTokenPair(userId: string) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    SECRET,
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}
```

**Pattern**: Separate access (24h) and refresh (7d) tokens with rotation.
**Investigation**: See `debugging-jwt-configuration-pattern.md` for common issues.

### Admin Authentication
**File**: `middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  try {
    jwt.verify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*'
};
```

**Pattern**: Middleware-based route protection for admin areas.

---

## Forms & Validation

### Multi-Step Form State
**File**: `components/booking/BookingWizard.tsx`

```typescript
const [step, setStep] = useState(1);
const [formData, setFormData] = useState<FormData>({});

function updateField(field: keyof FormData, value: any) {
  setFormData(prev => ({ ...prev, [field]: value }));
}

function nextStep() {
  if (validateStep(step)) {
    setStep(prev => prev + 1);
  }
}
```

**Pattern**: Centralized state, step-by-step validation.
**Investigation**: See `form-state-management-separation-pattern.md` for state issues.

### Zod Validation
**File**: `lib/validation/booking-schema.ts`

```typescript
export const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  datetime: z.coerce.date().refine(
    (date) => date > new Date(),
    'Date must be in future'
  ),
  clientEmail: z.string().email(),
  clientName: z.string().min(2)
});

// Use in API route
export async function POST(req: Request) {
  const body = await req.json();
  const validated = bookingSchema.parse(body); // Throws if invalid
  // ...
}
```

**Pattern**: Centralized schemas, validation at API boundary.

---

## Database & Queries

### Availability Check
**File**: `lib/db/availability-queries.ts`

```typescript
export async function checkAvailability(
  datetime: Date,
  duration: number
) {
  const endTime = new Date(datetime.getTime() + duration * 60000);
  
  const conflicts = await prisma.booking.findMany({
    where: {
      OR: [
        // New booking starts during existing booking
        {
          datetime: { lte: datetime },
          endTime: { gt: datetime }
        },
        // New booking ends during existing booking
        {
          datetime: { lt: endTime },
          endTime: { gte: endTime }
        },
        // New booking completely contains existing booking
        {
          datetime: { gte: datetime },
          endTime: { lte: endTime }
        }
      ]
    }
  });
  
  return conflicts.length === 0;
}
```

**Pattern**: Check BOTH start and end time overlaps (3 conditions).
**Gotcha**: Missing any condition allows double bookings.

### Prisma Transactions
**File**: `app/api/bookings/route.ts`

```typescript
export async function POST(req: Request) {
  const data = await req.json();
  
  const result = await prisma.$transaction(async (tx) => {
    // Check availability
    const available = await checkAvailability(data.datetime, data.duration);
    if (!available) throw new Error('Time slot unavailable');
    
    // Create booking
    const booking = await tx.booking.create({ data });
    
    // Update availability cache
    await tx.availability.update({
      where: { datetime: data.datetime },
      data: { isBooked: true }
    });
    
    return booking;
  });
  
  return Response.json(result);
}
```

**Pattern**: Use transactions for multi-operation consistency.

---

## Testing

### Prisma Mock Setup
**File**: `tests/mocks/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
```

**Pattern**: Single mock instance, reset between tests.
**Investigation**: See `jest-mock-hoisting-solution.md` for hoisting issues.

### Test-Driven Generation
**File**: `tests/integration/booking.test.ts`

```typescript
describe('Booking creation', () => {
  it('should create booking with valid data', async () => {
    // ARRANGE
    const validData = {
      serviceId: 'uuid',
      datetime: new Date(),
      clientEmail: 'test@example.com'
    };
    
    // ACT
    const result = await createBooking(validData);
    
    // ASSERT
    expect(result).toMatchObject({
      id: expect.any(String),
      status: 'confirmed'
    });
  });
  
  it('should reject past dates', async () => {
    const pastDate = new Date('2020-01-01');
    
    await expect(
      createBooking({ ...validData, datetime: pastDate })
    ).rejects.toThrow('Date must be in future');
  });
});
```

**Pattern**: Write tests FIRST, implement AFTER (TDG).

---

## Components

### Component Decomposition
Break large components at 300 lines or 5+ responsibilities.

```typescript
// ❌ Before: 500-line BookingForm component

// ✅ After: Decomposed
<BookingWizard>
  <ServiceSelection />
  <DateTimeSelection />
  <ClientDetails />
  <BookingSummary />
</BookingWizard>
```

**Pattern**: One responsibility per component, composition over complexity.
**Investigation**: See `component-decomposition-pattern.md` for approach.

---

## API Design

### Standard Response Format
**File**: `lib/api/response.ts`

```typescript
export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// Usage
export async function GET(req: Request) {
  try {
    const bookings = await getBookings();
    return successResponse(bookings);
  } catch (error) {
    return errorResponse('Failed to fetch bookings', 500);
  }
}
```

**Pattern**: Consistent response shape across all API routes.

---

## Real-time Features

### WebSocket Connection Pattern
**File**: `lib/websocket/client.ts`

```typescript
export function useRealtimeBookings() {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setBookings(prev => updateBookings(prev, update));
    };
    
    return () => ws.close();
  }, []);
  
  return bookings;
}
```

**Pattern**: React hook wrapping WebSocket with automatic cleanup.

---

## Performance

### Image Optimization
**File**: `components/ui/OptimizedImage.tsx`

```typescript
import Image from 'next/image';

export function OptimizedImage({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, 50vw"
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
    />
  );
}
```

**Pattern**: Always use Next.js Image component with sizes.

---

## Pattern Usage Protocol

### Before Implementation
1. **Search this file** for similar feature
2. **Check investigations** for known issues with pattern
3. **Apply existing pattern** rather than creating new approach

### During Implementation
- Follow pattern structure exactly
- Note any deviations in commit message
- If pattern doesn't fit: Escalate to Navigator

### After Implementation
- If new reusable pattern emerges: Document here
- Update this file with lessons learned
- Cross-reference with investigations if debugging occurred

---

## Related Documentation

- **Context**: `.roo/context.md` - Project overview
- **Investigations**: `.docs/investigations/index.md` - Known issues
- **ADRs**: `.docs/decisions/index.md` - Architecture decisions
- **Debt**: `.docs/debt.md` - Active technical debt
```

### Files to Delete

```bash
# Delete these (replaced by consolidated index)
.docs/patterns/accessibility-testing-pattern.md
.docs/patterns/admin-authentication-pattern.md
.docs/patterns/admin-component-testing-pattern.md
.docs/patterns/analytics-integration-pattern.md
# ... (all 30 other pattern files)

# Keep only:
.docs/patterns/index.md  # Consolidated patterns
```

### Files to Keep Unchanged

```bash
# Keep as-is (reference only, not in AI context)
.docs/decisions/           # ADRs (36 files)
.docs/investigations/      # 10 files (minimal, good)
.docs/debt.md              # Active debt register
.docs/architecture.md      # System architecture
.docs/spec.md              # Project specification
```

---

## 8. Implementation Roadmap

### Phase 1: Pre-commit Enforcement (30 minutes)

**Dependencies**:
```bash
pnpm add -D jscpd @typescript-eslint/typescript-estree
```

**Scripts**:
1. Create `scripts/complexity-check.js` (AST-based)
2. Create `scripts/check-npm-packages.js`  
3. Create `.jscpd.json`

**Hook**:
4. Update `.husky/pre-commit` with all checks

**Validation**:
```bash
# Test each check independently
npm run complexity-check
npm run hallucination-check
npx jscpd --threshold 3

# Test full pre-commit
git add -A
git commit -m "test: validate pre-commit hooks"
```

### Phase 2: Mode Structure (45 minutes)

**Baseline Check**:
```bash
# Check current duplication level
npx jscpd --threshold 100 --reporters console
# Note: Set threshold to current - 1% in .jscpd.json
```

**Mode Configuration**:
1. Convert `.roomodes` from JSON to YAML
2. Replace 5 specialist modes with 5 lean modes
3. Ensure each mode has:
   - Clear whenToUse
   - Constraint-based customInstructions
   - Pattern/context references

**Validation**:
```bash
# Test mode switching
# Switch to each mode and verify instructions load
```

### Phase 3: Rules Consolidation (30 minutes)

**Consolidation**:
1. Merge `00-user-instructions.txt` into `00-general.md`
2. Create `02-anti-patterns.md` (enforced + conceptual)
3. Delete `03-automatic-handback.md` (in mode YAML)
4. Delete `04-terminal-cleanup.md` (not needed)
5. Delete `05-specialist-common.md` (merged)

**Specialist Cleanup**:
```bash
rm -rf .roo/rules-implementation-specialist/
rm -rf .roo/rules-investigation-specialist/
rm -rf .roo/rules-quality-specialist/
rm -rf .roo/rules-deployment-specialist/
rm -rf .roo/rules-navigator/
```

**Validation**:
- Verify 3 rule files remain
- Check each contains consolidated content

### Phase 4: Documentation Consolidation (60 minutes)

**Context File**:
1. Create `.roo/context.md` from enhanced template
2. Populate with current MoodOverMuscle specifics
3. Include recent changes, known gotchas, tech decisions

**Pattern Consolidation**:
1. Review all 32 pattern files
2. Extract key code examples into single `index.md`
3. Organize by category (Auth, Forms, DB, Testing, Components, API)
4. Cross-reference with investigations

```bash
# Backup before deletion
mkdir -p .docs/backups/patterns-archive-$(date +%Y%m%d)
cp -r .docs/patterns/*.md .docs/backups/patterns-archive-$(date +%Y%m%d)/

# Delete individual pattern files
rm .docs/patterns/accessibility-testing-pattern.md
rm .docs/patterns/admin-authentication-pattern.md
# ... (all 30 others)

# Keep only consolidated index
# .docs/patterns/index.md
```

**Handoff Cleanup**:
```bash
# These are replaced by mode transitions
rm -rf .docs/handoffs/
```

**Memory Consolidation**:
```bash
# Keep only essential memory files
.docs/memory/complexity-estimation-framework-and-historical-calibration.md
.docs/memory/technical-debt-resolution-achievements.md

# Consider consolidating others into patterns/index.md
```

### Phase 5: Validation (30 minutes)

**Pre-commit Test**:
```bash
# Introduce violations to test each check

# 1. Test complexity check
# Create function >50 lines
git add -A
git commit -m "test: complexity violation"
# Should fail

# 2. Test duplication check  
# Copy-paste code block
git add -A
git commit -m "test: duplication violation"
# Should fail

# 3. Test hallucination check
# Import fake package
git add -A
git commit -m "test: hallucination violation"
# Should fail

# 4. Test type check
# Add any type
git add -A
git commit -m "test: type violation"
# Should fail
```

**Mode Workflow Test**:
```bash
# Test TDG workflow
# 1. Switch to test mode
# 2. Write failing test
# 3. Switch to implement mode
# 4. Implement passing code
# 5. Run pre-commit (should pass)
```

**Pattern Discovery Test**:
```bash
# Verify pattern index is usable
# Search for "authentication" pattern
# Apply pattern in new code
# Verify it works
```

### Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | 30 min | Pre-commit enforcement working |
| Phase 2 | 45 min | 5 lean modes configured |
| Phase 3 | 30 min | 3 rule files consolidated |
| Phase 4 | 60 min | Documentation consolidated |
| Phase 5 | 30 min | Full validation complete |
| **Total** | **3h 15min** | Complete overhaul validated |

---

## 9. Validation & Success Metrics

### Immediate Validation (Day 1)

**Pre-commit Gates**:
- [ ] Complexity check blocks >50 line functions
- [ ] Duplication check blocks >3% duplication
- [ ] Hallucination check blocks uninstalled packages
- [ ] Type check blocks `any` types and errors
- [ ] All existing quality gates still working

**Mode Configuration**:
- [ ] Can switch between all 5 modes successfully
- [ ] Each mode loads appropriate customInstructions
- [ ] Pattern references in instructions are correct
- [ ] Handback protocol works (automatic Navigator switch)

**Documentation**:
- [ ] `.roo/context.md` provides project overview
- [ ] `.docs/patterns/index.md` covers key patterns
- [ ] Can find patterns quickly (< 1 minute search)
- [ ] Rules consolidated to 3 files

### 30-Day Success Metrics

**Quality Metrics**:
- Duplication rate: <3% (enforced)
- Function complexity: 0 violations >50 lines
- File complexity: 0 violations >300 lines
- Package hallucinations: 0 uninstalled packages
- Quality gate bypass: 0 incidents

**Workflow Metrics**:
- TDG adoption: >80% features start with tests
- Pattern reuse: >70% implementations use existing patterns
- Refactor frequency: Weekly consolidation sprints
- Context usage: Pattern index checked before implementation

**Productivity Metrics**:
- Pre-commit time: <30 seconds average
- Mode transition time: <5 seconds
- Pattern discovery time: <2 minutes
- Appetite compliance: >90% within scope

### Research Finding Validation

| Finding | Metric | Target | Validation |
|---------|--------|--------|------------|
| 8x duplication | Duplication % | <3% | jscpd reports |
| 65% missing context | Context checks | >80% | Git commit messages |
| 21.7% hallucinations | Package errors | 0 | Pre-commit logs |
| Over-engineering | Complexity violations | 0 | Pre-commit logs |
| 7.2% stability decrease | Quality gate failures | <5% | Git logs |
| Refactor decline | Refactor commits | >Weekly | Git history |
| YAGNI violations | Interface/factory count | Minimal | Code review |
| Pattern amnesia | Pattern references | >70% | Commit messages |

### Continuous Monitoring

**Weekly Review**:
```bash
# Check duplication trend
npx jscpd --threshold 100 --reporters console

# Check complexity violations (should be 0)
npm run complexity-check

# Review commit messages for pattern references
git log --since="1 week ago" --oneline | grep "Pattern:"
```

**Monthly Review**:
- Review `.docs/debt.md` for debt reduction
- Update `.roo/context.md` with recent changes
- Add new patterns to `.docs/patterns/index.md`
- Calibrate appetite estimates based on outcomes

**Quarterly Review**:
- Assess all research findings vs actual metrics
- Adjust thresholds if consistently passing
- Update mode instructions based on learnings
- Review ADR decisions for changes needed

---

## Appendix: Quick Reference

### Daily Workflow

```bash
# Start of day
1. Read .roo/context.md for project state
2. Check .docs/debt.md for priority items
3. Check .docs/patterns/index.md for relevant patterns

# Before implementing
1. Switch to test mode
2. Write tests defining requirements
3. Switch to implement mode with tests

# Before committing
1. Let pre-commit run (automatic)
2. Fix any violations
3. Commit with conventional format

# End of day
1. Update .roo/context.md if architectural changes
2. Update .docs/patterns/index.md if new patterns
3. Update .docs/debt.md if new debt identified
```

### Emergency Bypass

**ONLY IF ABSOLUTELY NECESSARY**:
```bash
# If pre-commit blocking emergency fix
git commit --no-verify -m "fix(critical): [description]"

# Immediately after emergency
# 1. Create debt item in .docs/debt.md
# 2. Schedule fix within 24 hours
# 3. Run quality gates manually and fix violations
```

### Complexity Limits Cheat Sheet

| Metric | Limit | Enforced By |
|--------|-------|-------------|
| Function lines | 50 | complexity-check.js |
| File lines | 300 | complexity-check.js |
| Parameters | 3 | complexity-check.js |
| Duplication | 3% | jscpd |
| any types | 0 | TypeScript |
| Test coverage | >80% | Jest (critical paths) |

### Pattern Discovery Shortcut

```bash
# Search patterns file
grep -i "authentication" .docs/patterns/index.md
grep -i "form" .docs/patterns/index.md
grep -i "database" .docs/patterns/index.md
```

### Mode Selection Guide

| Task | Mode | Why |
|------|------|-----|
| New feature | test → implement | TDG workflow |
| Bug fix | investigate | Check known issues first |
| Code quality | refactor | Consolidate duplication |
| Pre-deploy | verify | All quality gates |
| Coordination | navigator | Route work, enforce appetite |

---

**END OF OVERHAUL PLAN**