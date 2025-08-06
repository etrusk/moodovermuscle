# Design: Automated Documentation Staleness Detection System

**Date**: 2025-08-06  
**Status**: Proposed  
**Deciders**: Architect Role  
**Complexity**: 4-5  
**Appetite**: 6-8 hours implementation  

## Context

### Problem Statement

Current manual PULSE tracking system requires maintenance overhead and doesn't align with documentation cleanup goals:

- Manual `<!-- PULSE: [YYYY-MM-DD] [role] - [context] -->` entries across 16+ files
- Role instruction files contain PULSE tracking requirements adding complexity
- Manual detection commands exist but require automation
- Documentation cleanup initiative targets 90% size reduction
- Token efficiency is priority for LLM collaboration

### Current State Analysis

**Manual PULSE System**:
- Format: `<!-- PULSE: [YYYY-MM-DD] [role] - [brief context] -->`
- Found in: 5 role instruction files, multiple handoff templates
- Detection: Manual bash commands for monthly reviews
- Maintenance: Role responsibilities for adding PULSE entries

**Integration Points**:
- npm test workflow (must stay < 30 seconds for critical tests)
- Quality gates: lint, type-check, security:scan, build:verify
- Pre-commit hooks with husky
- Documentation cleanup initiative (90% reduction target)

## Proposed Solution

### Architecture Overview

**Git Timestamp-Based Staleness Detection**:
- Replace manual PULSE with automated git modification tracking
- 30-day staleness threshold with visual indicators
- Non-blocking informational output (doesn't fail builds)
- Integration with existing npm test workflow
- Clear maintenance recommendations for stale documentation

### Core Components

#### 1. Staleness Detection Script (`scripts/check-docs-staleness.js`)

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Automated Documentation Staleness Detection
 * Replaces manual PULSE tracking with git timestamp analysis
 */

const STALENESS_THRESHOLD_DAYS = 30;
const DOCS_PATH = '.docs';

class DocsStalenessAnalyzer {
  constructor() {
    this.staleFiles = [];
    this.recentFiles = [];
    this.totalFiles = 0;
  }

  /**
   * Get last modification timestamp for file using git
   */
  getLastModified(filePath) {
    try {
      const gitCommand = `git log -1 --format="%ci" -- "${filePath}"`;
      const timestamp = execSync(gitCommand, { encoding: 'utf8' }).trim();
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      // Fallback to filesystem timestamp for untracked files
      try {
        const stats = fs.statSync(filePath);
        return stats.mtime;
      } catch (fsError) {
        return null;
      }
    }
  }

  /**
   * Check if file is stale based on threshold
   */
  isStale(lastModified) {
    if (!lastModified) return true;
    
    const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceModified > STALENESS_THRESHOLD_DAYS;
  }

  /**
   * Get all markdown files in .docs directory
   */
  getDocumentationFiles() {
    const findCommand = `find ${DOCS_PATH} -name "*.md" -type f`;
    try {
      const output = execSync(findCommand, { encoding: 'utf8' });
      return output.trim().split('\n').filter(f => f.length > 0);
    } catch (error) {
      console.warn('Warning: Could not find documentation files');
      return [];
    }
  }

  /**
   * Analyze staleness for all documentation files
   */
  analyze() {
    const files = this.getDocumentationFiles();
    this.totalFiles = files.length;

    files.forEach(filePath => {
      const lastModified = this.getLastModified(filePath);
      const relativeFile = path.relative(process.cwd(), filePath);
      
      if (this.isStale(lastModified)) {
        this.staleFiles.push({
          path: relativeFile,
          lastModified,
          daysSinceModified: lastModified ? 
            Math.floor((Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)) : 
            null
        });
      } else {
        this.recentFiles.push({
          path: relativeFile,
          lastModified,
          daysSinceModified: Math.floor((Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // Sort by staleness (most stale first)
    this.staleFiles.sort((a, b) => {
      if (!a.daysSinceModified) return 1;
      if (!b.daysSinceModified) return -1;
      return b.daysSinceModified - a.daysSinceModified;
    });
  }

  /**
   * Generate maintenance recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Critical staleness (>90 days)
    const criticalStale = this.staleFiles.filter(f => f.daysSinceModified > 90);
    if (criticalStale.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Review for archival or major updates',
        files: criticalStale.length,
        examples: criticalStale.slice(0, 3).map(f => f.path)
      });
    }

    // Moderate staleness (30-90 days)
    const moderateStale = this.staleFiles.filter(f => f.daysSinceModified <= 90 && f.daysSinceModified > 30);
    if (moderateStale.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review for relevance and accuracy',
        files: moderateStale.length,
        examples: moderateStale.slice(0, 3).map(f => f.path)
      });
    }

    return recommendations;
  }

  /**
   * Format output for npm test integration
   */
  formatOutput() {
    const staleness_percentage = ((this.staleFiles.length / this.totalFiles) * 100).toFixed(1);
    
    console.log('\n📚 Documentation Staleness Report');
    console.log('=====================================');
    console.log(`📊 Overview: ${this.totalFiles} total files, ${this.staleFiles.length} stale (${staleness_percentage}%)`);
    console.log(`📅 Threshold: ${STALENESS_THRESHOLD_DAYS} days\n`);

    if (this.staleFiles.length === 0) {
      console.log('✅ All documentation is current (modified within 30 days)');
      return;
    }

    // Visual indicators for stale files
    console.log('⚠️  Stale Documentation (>30 days):');
    this.staleFiles.forEach(file => {
      const indicator = file.daysSinceModified > 90 ? '🔴' : 
                       file.daysSinceModified > 60 ? '🟡' : '🟠';
      const daysText = file.daysSinceModified ? `${file.daysSinceModified}d` : 'unknown';
      console.log(`   ${indicator} ${file.path} (${daysText} ago)`);
    });

    // Maintenance recommendations
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n💡 Maintenance Recommendations:');
      recommendations.forEach(rec => {
        console.log(`   ${rec.priority === 'HIGH' ? '🔴' : '🟡'} ${rec.priority}: ${rec.action}`);
        console.log(`      Files: ${rec.files}, Examples: ${rec.examples.join(', ')}`);
      });
    }

    console.log(`\n📈 Health Score: ${(100 - parseFloat(staleness_percentage)).toFixed(1)}% current`);
    console.log('   (Target: >90% of documentation current within 30 days)\n');
  }

  /**
   * Run complete staleness analysis
   */
  run() {
    this.analyze();
    this.formatOutput();
    
    // Exit with success (non-blocking)
    return 0;
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new DocsStalenessAnalyzer();
  process.exit(analyzer.run());
}

module.exports = DocsStalenessAnalyzer;
```

#### 2. npm Workflow Integration

**Package.json Script Addition**:
```json
{
  "scripts": {
    "docs:staleness": "node scripts/check-docs-staleness.js",
    "test:critical": "jest --config=jest.config.critical.ts && npm run docs:staleness"
  }
}
```

**Integration Points**:
- Append to existing `test:critical` command (maintains <30s requirement)
- Non-blocking informational output
- Available as standalone `npm run docs:staleness`

#### 3. PULSE System Migration Strategy

**Phase 1: Script Implementation** (2-3 hours)
- Implement `scripts/check-docs-staleness.js`
- Add npm script integration
- Test with existing documentation

**Phase 2: PULSE Removal** (2-3 hours)
- Remove PULSE tracking from 5 role instruction files:
  - `.docs/roo/role-instructions/architect.md`
  - `.docs/roo/role-instructions/ask.md`
  - `.docs/roo/role-instructions/code.md`
  - `.docs/roo/role-instructions/debug.md`
  - `.docs/roo/role-instructions/orchestrator.md`

**Phase 3: Template Cleanup** (1-2 hours)
- Remove PULSE requirements from handoff templates
- Update `.docs/documentation-usage-tracking.md`
- Archive manual detection commands

### Technical Implementation Details

#### Git Integration Strategy

**Primary Detection Method**:
```bash
git log -1 --format="%ci" -- "filepath"
```

**Fallback Method** (for untracked files):
```bash
stat -c %Y "filepath"  # Filesystem modification time
```

#### Performance Optimization

**File Discovery**:
- Use `find .docs -name "*.md" -type f` for efficient file enumeration
- Single git command per file (acceptable for <100 docs)
- Parallel processing not needed for current scale

**Caching Strategy**:
- No caching required - git operations are fast enough
- Results are informational and don't need persistence

#### Output Format Design

**Visual Indicators**:
- 🔴 Critical stale (>90 days)
- 🟡 High stale (60-90 days) 
- 🟠 Medium stale (30-60 days)
- ✅ Current (<30 days)

**Metrics Provided**:
- Total file count
- Stale file count and percentage
- Health score (target: >90% current)
- Specific recommendations with priority levels

### Quality Gates Integration

#### npm Workflow Enhancement

**Current Critical Test Flow**:
```bash
npm run test:critical  # <30 seconds requirement
```

**Enhanced Flow**:
```bash
npm run test:critical && npm run docs:staleness  # Still <30 seconds
```

**Non-Blocking Design**:
- Staleness detection never fails builds
- Informational output only
- Separate script available for detailed analysis

### Migration Benefits

#### Token Efficiency Gains

**Before** (Manual PULSE System):
- 16+ files with PULSE tracking requirements
- Role instruction complexity for PULSE maintenance
- Manual detection commands in documentation

**After** (Automated Git-Based System):
- Zero manual tracking overhead
- Simplified role instructions (supports 90% reduction goal)
- Automated detection integrated with workflow

#### Maintenance Reduction

**Eliminated Overhead**:
- No manual PULSE entry requirements
- No role-specific tracking responsibilities
- No manual monthly review commands

**Automated Benefits**:
- Real-time staleness detection
- Clear maintenance recommendations
- Integration with existing quality gates

## Implementation Plan

### Delivery Schedule

**Week 1 (6-8 hours total)**:

1. **Script Development** (3-4 hours):
   - Implement `DocsStalenessAnalyzer` class
   - Add git timestamp detection
   - Create visual output formatting
   - Test with current .docs structure

2. **Workflow Integration** (1-2 hours):
   - Update package.json scripts
   - Test npm workflow integration
   - Verify <30 second performance requirement

3. **PULSE Removal** (2-3 hours):
   - Remove PULSE tracking from role instructions
   - Clean up handoff templates
   - Update documentation-usage-tracking.md

### Success Criteria

**Functional Requirements**:
- [ ] Script detects file modification timestamps via git
- [ ] 30-day staleness threshold correctly applied
- [ ] Visual indicators show appropriate priority levels
- [ ] Integration with npm test maintains <30s performance
- [ ] Non-blocking operation (never fails builds)

**Quality Requirements**:
- [ ] Zero false positives for recently modified files
- [ ] Clear maintenance recommendations for stale content
- [ ] Health score calculation accurate
- [ ] All PULSE tracking removed from role instructions
- [ ] Documentation cleanup goals supported

**Performance Requirements**:
- [ ] Complete analysis in <5 seconds for current doc set
- [ ] npm test:critical remains <30 seconds total
- [ ] Scales to 200+ documentation files

## Circuit Breakers

### Scope Boundaries

**In Scope**:
- Automated staleness detection for .docs/*.md files
- npm workflow integration
- PULSE system removal
- Visual output formatting

**Out of Scope**:
- File content analysis (only modification timestamps)
- Auto-archival or modification of stale files
- Integration with external documentation systems
- Advanced analytics or trend analysis

### Appetite Protection

**Time Boundaries**:
- Total implementation: 6-8 hours
- If git integration complexity >4 hours: Simplify to filesystem only
- If performance doesn't meet <30s: Make optional in test:critical

**Complexity Boundaries**:
- No external dependencies beyond Node.js built-ins
- No configuration files or persistent state
- Single script approach with class-based organization

## Risk Analysis & Mitigations

### Technical Risks

**Git Integration Complexity**:
- **Risk**: git commands may fail in CI environments
- **Mitigation**: Fallback to filesystem timestamps
- **Detection**: Test in CI environment early

**Performance Impact**:
- **Risk**: Staleness check might slow down test:critical
- **Mitigation**: Keep as separate optional script if >5s execution
- **Detection**: Benchmark with current doc set

### Operational Risks

**PULSE Removal Disruption**:
- **Risk**: Role instructions become unclear without PULSE tracking
- **Mitigation**: Ensure core functionality maintained in simplified instructions
- **Detection**: Review simplified role instructions for completeness

## Success Metrics

**Implementation Success**:
- 100% PULSE tracking requirements removed
- npm test:critical maintains <30 second execution
- Zero false positives in staleness detection
- Clear visual output with actionable recommendations

**Documentation Health Improvement**:
- Target: >90% of files current within 30 days
- Automated recommendations reduce manual review overhead
- Integration supports ongoing documentation cleanup initiative

---

**Design Status**: Ready for Implementation  
**Next Steps**: Begin Phase 1 - Script Development  
**Estimated Completion**: 1 week (6-8 hours effort)  
**Quality Gates**: All existing gates maintained + new staleness detection