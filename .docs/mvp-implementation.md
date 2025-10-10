# Minimum Viable Roo Code Overhaul

## Index

1. [Research Recommendations → Plan Mapping](#research-recommendations--plan-mapping)
2. [Core Problem](#-core-problem)
3. [Minimum Viable Changes](#-minimum-viable-changes)
4. [Lean Mode Structure](#-lean-mode-structure-yaml)
5. [Lean Rules](#-lean-rules-4-files-only)
6. [Implementation Steps](#-implementation-30-minutes)
7. [What This Achieves](#-what-this-achieves)
8. [Reality Check](#-reality-check)

---

## Research Recommendations → Plan Mapping

| Research Finding | Deliverable(s) That Fulfill It |
|-----------------|--------------------------------|
| **8x more code duplication** | Pre-commit hook with jscpd (blocks >3% duplication) |
| **65% missing context issue** | `.roo/context.md` (project overview for every AI session) |
| **21.7% JS hallucinations** | Review mode with browser verification capability |
| **Over-engineering spiral** | `complexity-check.js` enforces 50 line/function, 300 line/file, 3 param limits |
| **Test-Driven Generation (TDG)** | Test mode (tests-first workflow before implementation) |
| **YAGNI violations** | Implement mode customInstructions enforce "no abstraction until 2nd use" |
| **Constraint-based prompting** | All modes have hard limits in customInstructions |
| **Context priming** | `.roo/context.md` + mode customInstructions provide standard context |
| **Refactoring decline (25%→10%)** | Dedicated Refactor mode for consolidation sprints |
| **Hallucination detection protocol** | Review mode with browser tools for API verification |
| **Progressive refinement workflow** | Navigator mode for task decomposition and routing |
| **70/30 decision routing** | Navigator mode explicitly routes human vs AI decisions |
| **Modular architecture emphasis** | `.roo/rules/00-general.md` enforces module boundaries |
| **Quality gate enforcement** | Quality mode runs all gates before deployment |

---

## 🎯 Core Problem

Research shows AI code has:
- 8x more duplication
- 65% missing context issues
- 21.7% hallucinated APIs
- Over-engineering spiral

**Solution**: Enforce constraints at commit time.

---

## ✂️ Minimum Viable Changes

### 1. Pre-Commit Hook (The ONLY Enforcement Needed)

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Existing gates
npm run lint || exit 1
npm run type-check || exit 1
npm run test:critical || exit 1

# NEW: Complexity check (ONE script)
node scripts/complexity-check.js || exit 1

# NEW: Duplication check (ONE command)
npx jscpd --threshold 3 --min-lines 5 --min-tokens 50 || exit 1
```

**That's it. Blocks bad commits. No GitHub Actions needed.**

### 2. ONE Complexity Script

**File**: `scripts/complexity-check.js`

```javascript
const fs = require('fs');
const path = require('path');

const MAX_FUNCTION_LINES = 50;
const MAX_FILE_LINES = 300;
const MAX_PARAMS = 3;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  if (lines.length > MAX_FILE_LINES) {
    console.error(`❌ ${filePath}: ${lines.length} lines (max ${MAX_FILE_LINES})`);
    return false;
  }
  
  // Simple function detection (good enough)
  const functionRegex = /function\s+\w+\s*\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g;
  let match;
  let passed = true;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const params = match[0].match(/\([^)]*\)/)[0].split(',').length;
    if (params > MAX_PARAMS) {
      console.error(`❌ ${filePath}: Function has ${params} params (max ${MAX_PARAMS})`);
      passed = false;
    }
    
    // Estimate function length (until next function or end)
    const startLine = content.substring(0, match.index).split('\n').length;
    const remaining = content.substring(match.index);
    const nextFunc = remaining.substring(1).search(functionRegex);
    const funcLines = remaining.substring(0, nextFunc > 0 ? nextFunc : remaining.length).split('\n').length;
    
    if (funcLines > MAX_FUNCTION_LINES) {
      console.error(`❌ ${filePath}:${startLine}: Function ${funcLines} lines (max ${MAX_FUNCTION_LINES})`);
      passed = false;
    }
  }
  
  return passed;
}

// Check all TS/JS files
const files = process.argv.slice(2);
const allPassed = files.every(checkFile);

process.exit(allPassed ? 0 : 1);
```

**Run on changed files only**:
```json
// package.json
{
  "scripts": {
    "complexity-check": "git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx|js|jsx)$' | xargs -r node scripts/complexity-check.js"
  }
}
```

### 3. Duplication Config

**File**: `.jscpd.json`

```json
{
  "threshold": 3,
  "reporters": ["console"],
  "ignore": ["**/*.test.ts", "**/*.spec.ts", "node_modules"],
  "format": ["typescript", "javascript"],
  "minLines": 5,
  "minTokens": 50,
  "exitCode": 1
}
```

**Install**: `pnpm add -D jscpd` (one dependency)

---

## 📝 Lean Mode Structure (YAML)

**File**: `.roomodes` (convert to YAML, keep it SHORT)

```yaml
customModes:
  - slug: test
    name: "🧪 Test"
    roleDefinition: "Write tests BEFORE implementation. Tests define requirements."
    whenToUse: "Before any new feature"
    groups:
      - read
      - edit:
          fileRegex: '\.(test|spec)\.(ts|tsx|js|jsx)$'
    customInstructions: |
      1. Write happy path, edge cases, errors
      2. AAA pattern (Arrange/Act/Assert)
      3. Tests MUST pass after implementation
      
      BEFORE handback: npm run test:critical
  
  - slug: implement
    name: "💻 Implement"
    roleDefinition: "Simplest code passing tests. Max 50 lines/function, 300/file, 3 params."
    whenToUse: "With existing tests"
    groups: [read, edit, command]
    customInstructions: |
      ## Hard Limits (pre-commit enforced)
      - Function ≤ 50 lines
      - File ≤ 300 lines
      - Params ≤ 3
      
      ## YAGNI
      - NO interfaces unless 2+ implementations exist
      - NO abstraction until 2nd use
      - Search codebase BEFORE creating similar code
      
      BEFORE handback: npm run lint && npm run type-check && npm run test:critical
  
  - slug: review
    name: "👁️ Review"
    roleDefinition: "Find errors AI misses: logic, security, hallucinations."
    whenToUse: "After implementation"
    groups: [read, browser]
    customInstructions: |
      Check:
      1. Edge cases, errors handled
      2. SQL injection, XSS prevented
      3. APIs exist (browser verify)
      4. No over-engineering
      
      Output: Severity + Fix + Pattern reference
  
  - slug: refactor
    name: "♻️ Refactor"
    roleDefinition: "Consolidate duplication. NEVER change behavior."
    whenToUse: "When duplication detected"
    groups: [read, edit, command]
    customInstructions: |
      1. Find duplicates (>5 lines)
      2. Extract to shared utility
      3. Test after EVERY change
      4. If tests fail: REVERT
  
  - slug: investigate
    name: "🐛 Debug"
    roleDefinition: "Systematic debugging using .docs/investigations/index.md"
    whenToUse: "When issues arise"
    groups: [read, edit, command, browser]
    customInstructions: |
      1. Check .docs/investigations/index.md for similar
      2. Apply proven patterns
      3. Document resolution
      
      BEFORE handback: npm run test:critical
  
  - slug: quality
    name: "🔍 Quality"
    roleDefinition: "Run all gates. NO compromises."
    whenToUse: "Pre-deployment"
    groups: [read, command]
    customInstructions: |
      Execute in order:
      npm run lint
      npm run type-check
      npm run test:critical
      npm run test:integration
      npm run test:e2e
      npm run security:scan
      npm run build:verify
  
  - slug: navigator
    name: "🧭 Navigator"
    roleDefinition: "Route work, enforce appetite, validate handbacks."
    whenToUse: "Coordination"
    groups: [read, browser]
    customInstructions: |
      ## Handback Validation
      - [ ] All todos complete
      - [ ] Quality gates passed
      - [ ] Git clean
      
      ## 70/30 Routing
      70% to AI: implementation, tests, docs
      30% to Human: business logic, security, UX
```

---

## 📋 Lean Rules (4 Files Only)

### Keep These, Merge Content

1. **`.roo/rules/00-general.md`** 
   - Merge 00-user-instructions.txt into this
   - Core principles (YAGNI, DRY, SOLID)
   - Appetite constraints
   - 70/30 decision routing
   - Handback protocol

2. **`.roo/rules/01-coding-style.md`**
   - Keep as-is (TypeScript/React standards)

3. **`.roo/rules/02-anti-patterns.md`** (NEW)
   ```markdown
   # Anti-Patterns (Pre-commit Enforced)
   
   ## Complexity
   - Function > 50 lines → BLOCKED
   - File > 300 lines → BLOCKED
   - Params > 3 → BLOCKED
   
   ## Duplication
   - > 3% duplication → BLOCKED
   - Check before: `npx jscpd`
   
   ## YAGNI
   - Interface with 1 impl → Don't create
   - Factory for 1 type → Use direct instantiation
   - Abstraction unused 2x → Inline it
   ```

4. **`.roo/context.md`** (NEW, simple)
   ```markdown
   # Project Context
   
   Next.js 14 booking platform. TypeScript, Prisma, PostgreSQL.
   
   ## Modules
   - Auth: JWT, bcrypt
   - Booking: Real-time availability
   - Database: Prisma ORM
   - UI: React, Tailwind
   
   ## Constraints
   - API response < 500ms
   - No `any` types
   - All inputs validated (Zod)
   ```

### Delete These

- `.roo/rules/03-automatic-handback.md` → merged into mode customInstructions
- `.roo/rules/04-terminal-cleanup.md` → not needed with proper tooling
- `.roo/rules/05-specialist-common.md` → merged into 00-general.md
- All `.roo/rules-{specialist}/` directories → everything in mode YAML

---

## 🚀 Implementation (30 Minutes)

### Step 1: Install jscpd (1 min)
```bash
pnpm add -D jscpd
```

### Step 2: Create complexity check (5 min)
- Create `scripts/complexity-check.js` (copy from above)
- Add to package.json scripts

### Step 3: Update pre-commit hook (2 min)
```bash
# .husky/pre-commit - add two lines
node scripts/complexity-check.js || exit 1
npx jscpd --threshold 3 --min-lines 5 --min-tokens 50 || exit 1
```

### Step 4: Convert .roomodes to YAML (10 min)
- Copy YAML from above
- Keep it SHORT (no bloat)

### Step 5: Consolidate rules (10 min)
- Merge user-instructions into 00-general.md
- Create 02-anti-patterns.md (brief)
- Create .roo/context.md (1-page max)
- Delete redundant files

### Step 6: Delete mode-specific rule directories (2 min)
```bash
rm -rf .roo/rules-*/
```

---

## ✅ What This Achieves

### Pre-Commit Enforcement
- **Complexity**: Blocked at commit time (max 50 lines/function)
- **Duplication**: Blocked if >3%
- **Quality**: lint, type-check, tests must pass

### Lean Config
- **7 modes** (focused, no overlap)
- **4 rule files** (merged, no duplication)
- **1 context file** (simple reference)

### Research-Backed
- **8x duplication** → Pre-commit blocks >3%
- **65% missing context** → `.roo/context.md` provides it
- **Over-engineering** → Hard limits enforced
- **Hallucinations** → Review mode checks with browser

---

## 🎯 Reality Check

**Before**: Complex automation requiring maintenance, over-engineered while preaching debloat

**After**:
- ONE script (`complexity-check.js`)
- ONE tool (`jscpd`)
- ONE hook (pre-commit)
- 7 modes, 4 rules

The research says enforce constraints. Pre-commit hook enforces constraints.