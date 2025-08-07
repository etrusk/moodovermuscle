#!/usr/bin/env node

/**
 * Institutional Memory Update Automation
 * Phase 3: Custom Role Implementation - Quality & Deployment Integration
 * 
 * Automatically captures patterns, investigations, and lessons learned during implementation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MemoryUpdater {
  constructor() {
    this.docsPath = path.join(process.cwd(), '.docs');
    this.patternsIndexPath = path.join(this.docsPath, 'patterns', 'index.md');
    this.investigationsIndexPath = path.join(this.docsPath, 'investigations', 'index.md');
    this.memoryIndexPath = path.join(this.docsPath, 'memory', 'index.md');
    this.currentTaskPath = path.join(this.docsPath, 'current-task.md');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      memory: '🧠'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  getCurrentTaskContent() {
    try {
      if (fs.existsSync(this.currentTaskPath)) {
        return fs.readFileSync(this.currentTaskPath, 'utf8');
      }
    } catch (error) {
      this.log(`Warning: Could not read current task: ${error.message}`, 'warning');
    }
    return null;
  }

  extractPatternsFromTask(taskContent) {
    this.log('🔍 Extracting patterns from current task...', 'memory');
    
    const patterns = [];
    
    // Look for pattern applications
    const patternApplicationRegex = /applied\s+(.+?)\s+pattern/gi;
    const patternMatches = taskContent.match(patternApplicationRegex) || [];
    
    patternMatches.forEach(match => {
      const patternName = match.replace(/applied\s+(.+?)\s+pattern/i, '$1').trim();
      patterns.push({
        type: 'applied',
        name: patternName,
        context: this.extractContext(taskContent, match)
      });
    });

    // Look for new patterns developed
    const newPatternRegex = /new\s+pattern[s]?\s+developed:?\s*(.+?)$/gmi;
    const newPatternMatches = taskContent.match(newPatternRegex) || [];
    
    newPatternMatches.forEach(match => {
      const patternDescription = match.replace(/new\s+pattern[s]?\s+developed:?\s*/i, '').trim();
      patterns.push({
        type: 'developed',
        name: patternDescription,
        context: this.extractContext(taskContent, match)
      });
    });

    return patterns;
  }

  extractInvestigationsFromTask(taskContent) {
    this.log('🔍 Extracting investigations from current task...', 'memory');
    
    const investigations = [];
    
    // Look for debugging insights
    const debuggingRegex = /debugging\s+insights?\s*:?\s*(.+?)$/gmi;
    const debugMatches = taskContent.match(debuggingRegex) || [];
    
    debugMatches.forEach(match => {
      const insight = match.replace(/debugging\s+insights?\s*:?\s*/i, '').trim();
      investigations.push({
        type: 'debugging',
        insight,
        context: this.extractContext(taskContent, match)
      });
    });

    // Look for error resolutions
    const errorRegex = /(resolved|fixed)\s+(.+?)\s+(error|issue|problem)/gi;
    const errorMatches = taskContent.match(errorRegex) || [];
    
    errorMatches.forEach(match => {
      investigations.push({
        type: 'error_resolution',
        description: match.trim(),
        context: this.extractContext(taskContent, match)
      });
    });

    return investigations;
  }

  extractComplexityLessons(taskContent) {
    this.log('🔍 Extracting complexity lessons...', 'memory');
    
    const lessons = [];
    
    // Look for appetite boundary encounters
    const appetiteRegex = /appetite\s+boundary|circuit\s+breaker|scope\s+expansion/gi;
    const appetiteMatches = taskContent.match(appetiteRegex) || [];
    
    if (appetiteMatches.length > 0) {
      lessons.push({
        type: 'appetite_management',
        lesson: 'Encountered appetite boundary constraints during implementation',
        context: this.extractContext(taskContent, appetiteMatches[0])
      });
    }

    // Look for 70/30 decision routing
    const decisionRegex = /escalated.*30%|business\s+logic|security\s+decision/gi;
    const decisionMatches = taskContent.match(decisionRegex) || [];
    
    decisionMatches.forEach(match => {
      lessons.push({
        type: '70_30_routing',
        lesson: 'Properly escalated critical decisions to human',
        context: this.extractContext(taskContent, match)
      });
    });

    return lessons;
  }

  extractContext(content, match, contextLines = 2) {
    const lines = content.split('\n');
    const matchIndex = lines.findIndex(line => line.includes(match));
    
    if (matchIndex === -1) return '';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n').trim();
  }

  updatePatternsIndex(patterns) {
    if (patterns.length === 0) return;
    
    this.log(`📝 Updating patterns index with ${patterns.length} items...`, 'memory');
    
    let indexContent = '';
    try {
      if (fs.existsSync(this.patternsIndexPath)) {
        indexContent = fs.readFileSync(this.patternsIndexPath, 'utf8');
      }
    } catch (error) {
      this.log(`Warning: Could not read patterns index: ${error.message}`, 'warning');
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const newEntries = patterns.map(pattern => {
      const entry = pattern.type === 'applied' 
        ? `- [${pattern.name} Pattern](./applied-patterns.md#${pattern.name.toLowerCase().replace(/\s+/g, '-')}) - successfully applied ${timestamp}`
        : `- [${pattern.name} Pattern](./new-patterns.md#${pattern.name.toLowerCase().replace(/\s+/g, '-')}) - developed ${timestamp}`;
      return entry;
    }).join('\n');

    // Add to appropriate section or create new section
    if (indexContent.includes('## Recently Updated')) {
      indexContent = indexContent.replace(
        '## Recently Updated',
        `## Recently Updated\n\n${newEntries}\n`
      );
    } else {
      indexContent += `\n\n## Recently Updated\n\n${newEntries}\n`;
    }

    try {
      fs.writeFileSync(this.patternsIndexPath, indexContent);
      this.log('✅ Patterns index updated', 'success');
    } catch (error) {
      this.log(`Error updating patterns index: ${error.message}`, 'error');
    }
  }

  updateInvestigationsIndex(investigations) {
    if (investigations.length === 0) return;
    
    this.log(`📝 Updating investigations index with ${investigations.length} items...`, 'memory');
    
    let indexContent = '';
    try {
      if (fs.existsSync(this.investigationsIndexPath)) {
        indexContent = fs.readFileSync(this.investigationsIndexPath, 'utf8');
      }
    } catch (error) {
      this.log(`Warning: Could not read investigations index: ${error.message}`, 'warning');
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const newEntries = investigations.map(investigation => {
      return `- **${investigation.type}**: ${investigation.description || investigation.insight} (${timestamp})`;
    }).join('\n');

    // Add to recent investigations section
    if (indexContent.includes('## Recent Investigations')) {
      indexContent = indexContent.replace(
        '## Recent Investigations',
        `## Recent Investigations\n\n${newEntries}\n`
      );
    } else {
      indexContent += `\n\n## Recent Investigations\n\n${newEntries}\n`;
    }

    try {
      fs.writeFileSync(this.investigationsIndexPath, indexContent);
      this.log('✅ Investigations index updated', 'success');
    } catch (error) {
      this.log(`Error updating investigations index: ${error.message}`, 'error');
    }
  }

  updateMemoryIndex(lessons) {
    if (lessons.length === 0) return;
    
    this.log(`📝 Updating memory index with ${lessons.length} lessons...`, 'memory');
    
    let indexContent = '';
    try {
      if (fs.existsSync(this.memoryIndexPath)) {
        indexContent = fs.readFileSync(this.memoryIndexPath, 'utf8');
      }
    } catch (error) {
      this.log(`Warning: Could not read memory index: ${error.message}`, 'warning');
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const newEntries = lessons.map(lesson => {
      return `- **${lesson.type}**: ${lesson.lesson} (${timestamp})`;
    }).join('\n');

    // Add to recent lessons section  
    if (indexContent.includes('## Recent Lessons')) {
      indexContent = indexContent.replace(
        '## Recent Lessons',
        `## Recent Lessons\n\n${newEntries}\n`
      );
    } else {
      indexContent += `\n\n## Recent Lessons\n\n${newEntries}\n`;
    }

    try {
      fs.writeFileSync(this.memoryIndexPath, indexContent);
      this.log('✅ Memory index updated', 'success');
    } catch (error) {
      this.log(`Error updating memory index: ${error.message}`, 'error');
    }
  }

  generateMemoryReport() {
    const taskContent = this.getCurrentTaskContent();
    if (!taskContent) {
      this.log('No current task found - skipping memory update', 'warning');
      return;
    }

    const patterns = this.extractPatternsFromTask(taskContent);
    const investigations = this.extractInvestigationsFromTask(taskContent);
    const lessons = this.extractComplexityLessons(taskContent);

    this.log('🧠 Memory Update Summary:', 'memory');
    this.log(`   Patterns: ${patterns.length}`, 'info');
    this.log(`   Investigations: ${investigations.length}`, 'info');
    this.log(`   Lessons: ${lessons.length}`, 'info');

    this.updatePatternsIndex(patterns);
    this.updateInvestigationsIndex(investigations);
    this.updateMemoryIndex(lessons);

    this.log('🎉 Institutional memory updated successfully!', 'success');
  }
}

async function main() {
  const command = process.argv[2];
  const updater = new MemoryUpdater();
  
  try {
    switch (command) {
      case 'update':
        updater.generateMemoryReport();
        break;
        
      default:
        console.log(`\nUsage: node scripts/memory-updater.js <command>\n\nCommands:\n  update    - Update institutional memory from current task\n        `);
        process.exit(1);
    }
  } catch (error) {
    updater.log(`💥 Memory update failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MemoryUpdater };