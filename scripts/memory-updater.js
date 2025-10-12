#!/usr/bin/env node

/**
 * Institutional Memory Update Automation
 * 
 * Automatically captures patterns, investigations, and lessons learned during implementation
 */

const fs = require('fs');
const path = require('path');

const docsPath = path.join(process.cwd(), '.docs');
const currentTaskPath = path.join(docsPath, 'current-task.md');

function log(message, type = 'info') {
  const emoji = { info: '🔵', success: '✅', warning: '⚠️', error: '❌', memory: '🧠' }[type] || 'ℹ️';
  console.log(`${emoji} ${message}`);
}

function getCurrentTaskContent() {
  try {
    if (fs.existsSync(currentTaskPath)) {
      return fs.readFileSync(currentTaskPath, 'utf8');
    }
  } catch (error) {
    log(`Warning: Could not read current task: ${error.message}`, 'warning');
  }
  return null;
}

function extractPatterns(taskContent) {
  log('🔍 Extracting patterns from current task...', 'memory');
  
  const patterns = [];
  
  // Applied patterns
  const appliedMatches = taskContent.match(/applied\s+(.+?)\s+pattern/gi) || [];
  appliedMatches.forEach(match => {
    const name = match.replace(/applied\s+(.+?)\s+pattern/i, '$1').trim();
    patterns.push({ type: 'applied', name });
  });

  // New patterns
  const newMatches = taskContent.match(/new\s+pattern[s]?\s+developed:?\s*(.+?)$/gmi) || [];
  newMatches.forEach(match => {
    const name = match.replace(/new\s+pattern[s]?\s+developed:?\s*/i, '').trim();
    patterns.push({ type: 'developed', name });
  });

  return patterns;
}

function extractInvestigations(taskContent) {
  log('🔍 Extracting investigations from current task...', 'memory');
  
  const investigations = [];
  
  // Debugging insights
  const debugMatches = taskContent.match(/debugging\s+insights?\s*:?\s*(.+?)$/gmi) || [];
  debugMatches.forEach(match => {
    const insight = match.replace(/debugging\s+insights?\s*:?\s*/i, '').trim();
    investigations.push({ type: 'debugging', insight });
  });

  // Error resolutions
  const errorMatches = taskContent.match(/(resolved|fixed)\s+(.+?)\s+(error|issue|problem)/gi) || [];
  errorMatches.forEach(match => {
    investigations.push({ type: 'error_resolution', description: match.trim() });
  });

  return investigations;
}

function extractComplexityLessons(taskContent) {
  log('🔍 Extracting complexity lessons...', 'memory');
  
  const lessons = [];
  
  // Appetite boundaries
  const appetiteMatches = taskContent.match(/appetite\s+boundary|circuit\s+breaker|scope\s+expansion/gi) || [];
  if (appetiteMatches.length > 0) {
    lessons.push({
      type: 'appetite_management',
      lesson: 'Encountered appetite boundary constraints during implementation'
    });
  }

  // 70/30 decisions
  const decisionMatches = taskContent.match(/escalated.*30%|business\s+logic|security\s+decision/gi) || [];
  decisionMatches.forEach(() => {
    lessons.push({
      type: '70_30_routing',
      lesson: 'Properly escalated critical decisions to human'
    });
  });

  return lessons;
}

function updateIndex({ indexPath, items, sectionName, formatter }) {
  if (items.length === 0) return;
  
  log(`📝 Updating ${path.basename(indexPath)} with ${items.length} items...`, 'memory');
  
  let indexContent = '';
  try {
    if (fs.existsSync(indexPath)) {
      indexContent = fs.readFileSync(indexPath, 'utf8');
    }
  } catch (error) {
    log(`Warning: Could not read ${path.basename(indexPath)}: ${error.message}`, 'warning');
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const newEntries = items.map(item => formatter(item, timestamp)).join('\n');

  if (indexContent.includes(`## ${sectionName}`)) {
    indexContent = indexContent.replace(
      `## ${sectionName}`,
      `## ${sectionName}\n\n${newEntries}\n`
    );
  } else {
    indexContent += `\n\n## ${sectionName}\n\n${newEntries}\n`;
  }

  try {
    fs.writeFileSync(indexPath, indexContent);
    log(`✅ ${path.basename(indexPath)} updated`, 'success');
  } catch (error) {
    log(`Error updating ${path.basename(indexPath)}: ${error.message}`, 'error');
  }
}

function generateMemoryReport() {
  const taskContent = getCurrentTaskContent();
  if (!taskContent) {
    log('No current task found - skipping memory update', 'warning');
    return;
  }

  const patterns = extractPatterns(taskContent);
  const investigations = extractInvestigations(taskContent);
  const lessons = extractComplexityLessons(taskContent);

  log('🧠 Memory Update Summary:', 'memory');
  log(`   Patterns: ${patterns.length}`, 'info');
  log(`   Investigations: ${investigations.length}`, 'info');
  log(`   Lessons: ${lessons.length}`, 'info');

  updateIndex({
    indexPath: path.join(docsPath, 'patterns', 'index.md'),
    items: patterns,
    sectionName: 'Recently Updated',
    formatter: (p, ts) => p.type === 'applied'
      ? `- [${p.name} Pattern](./applied-patterns.md#${p.name.toLowerCase().replace(/\s+/g, '-')}) - successfully applied ${ts}`
      : `- [${p.name} Pattern](./new-patterns.md#${p.name.toLowerCase().replace(/\s+/g, '-')}) - developed ${ts}`
  });

  updateIndex({
    indexPath: path.join(docsPath, 'investigations', 'index.md'),
    items: investigations,
    sectionName: 'Recent Investigations',
    formatter: (i, ts) => `- **${i.type}**: ${i.description || i.insight} (${ts})`
  });

  updateIndex({
    indexPath: path.join(docsPath, 'memory', 'index.md'),
    items: lessons,
    sectionName: 'Recent Lessons',
    formatter: (l, ts) => `- **${l.type}**: ${l.lesson} (${ts})`
  });

  log('🎉 Institutional memory updated successfully!', 'success');
}

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'update':
        generateMemoryReport();
        break;
        
      default:
        console.log(`\nUsage: node scripts/memory-updater.js <command>\n\nCommands:\n  update    - Update institutional memory from current task\n        `);
        process.exit(1);
    }
  } catch (error) {
    log(`💥 Memory update failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateMemoryReport };