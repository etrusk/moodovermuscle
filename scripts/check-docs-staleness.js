#!/usr/bin/env node

/**
 * Documentation Staleness Checker
 * 
 * Analyzes documentation files using git timestamps to identify stale content
 * and provide maintenance recommendations.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  stalenessThreshold: 30,
  includeExtensions: ['.md', '.mdx'],
  excludePatterns: ['node_modules', '.git', 'dist', 'build', '.next', '.docker'],
  rootDir: process.cwd()
};

// Traversal utility
function traverseDirectory(currentDir, files) {
  try {
    const items = fs.readdirSync(currentDir);
    const rootResolved = path.resolve(CONFIG.rootDir);

    for (const item of items) {
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      // Security: Input is sanitized - only using fs.readdirSync output, validated against root directory
      if (item.includes('..') || item.includes('/') || item.includes('\\')) {
        continue;
      }

      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      // Security: Path validated to be within root directory after construction
      const fullPath = path.resolve(currentDir, item);

      if (!fullPath.startsWith(rootResolved + path.sep) && fullPath !== rootResolved) {
        continue;
      }

      if (CONFIG.excludePatterns.some(pattern => item.includes(pattern))) {
        continue;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDirectory(fullPath, files);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (CONFIG.includeExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${currentDir}`);
  }
}

// Git timestamp utility
function getGitTimestamp(filePath) {
  try {
    const rootResolved = path.resolve(CONFIG.rootDir);
    // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
    // Security: Input comes from traverseDirectory which validates paths, validated again here
    const resolvedPath = path.resolve(filePath);
    
    if (!resolvedPath.startsWith(rootResolved + path.sep) && resolvedPath !== rootResolved) {
      return null;
    }

    const relativePath = path.relative(rootResolved, resolvedPath);
    
    // Security: Use spawnSync with array arguments to prevent command injection
    const result = spawnSync('git', ['log', '--format=%at', '-n', '1', '--', relativePath], {
      cwd: rootResolved,
      encoding: 'utf8'
    });

    if (result.status !== 0 || result.error) {
      return null;
    }

    const timestamp = result.stdout.trim();
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    return null;
  }
}

// Staleness calculation
function calculateStaleness(daysOld) {
  if (daysOld <= 7) {
    return { score: 100, indicator: '✅', priority: 'current', level: 'excellent' };
  } else if (daysOld <= 14) {
    return { score: 85, indicator: '✅', priority: 'good', level: 'good' };
  } else if (daysOld <= 30) {
    return { score: 70, indicator: '🟡', priority: 'monitor', level: 'acceptable' };
  } else if (daysOld <= 60) {
    return { score: 50, indicator: '🟠', priority: 'review', level: 'attention' };
  } else if (daysOld <= 90) {
    return { score: 30, indicator: '🔴', priority: 'update', level: 'stale' };
  } else {
    return { score: 10, indicator: '🔴', priority: 'critical', level: 'very-stale' };
  }
}

// Analyze files
function analyzeFiles(files) {
  const analyzedFiles = [];
  const currentTime = Math.floor(Date.now() / 1000);

  for (const filePath of files) {
    const timestamp = getGitTimestamp(filePath);

    if (timestamp) {
      const ageInSeconds = currentTime - timestamp;
      const ageInDays = Math.floor(ageInSeconds / (24 * 60 * 60));
      const staleness = calculateStaleness(ageInDays);

      analyzedFiles.push({
        path: path.relative(CONFIG.rootDir, filePath),
        lastModified: new Date(timestamp * 1000).toISOString().split('T')[0],
        ageInDays,
        staleness,
        size: fs.statSync(filePath).size
      });
    }
  }

  return analyzedFiles.sort((a, b) => a.staleness.score - b.staleness.score);
}

// Recommendation builders
const RECOMMENDATION_CONFIGS = [
  { priority: 'critical', level: 1, action: 'IMMEDIATE ATTENTION', desc: 'documentation files are critically stale (>90 days)', maxFiles: 5, icon: '🚨' },
  { priority: 'update', level: 2, action: 'SCHEDULE UPDATE', desc: 'files need content review and updates (60-90 days old)', maxFiles: 5, icon: '📝' },
  { priority: 'review', level: 3, action: 'REVIEW NEEDED', desc: 'files should be reviewed for accuracy (30-60 days old)', maxFiles: 3, icon: '👀' },
  { priority: 'monitor', level: 4, action: 'MONITOR', desc: 'files are approaching staleness (14-30 days old)', maxFiles: 3, icon: '📊' }
];

function buildRecommendation(files, config) {
  if (files.length === 0) return null;
  return {
    priority: config.level,
    action: config.action,
    description: `${files.length} ${config.desc}`,
    files: files.slice(0, config.maxFiles),
    icon: config.icon
  };
}

function generateRecommendations(staleFiles) {
  const filesByPriority = {
    critical: staleFiles.filter(f => f.staleness.priority === 'critical'),
    update: staleFiles.filter(f => f.staleness.priority === 'update'),
    review: staleFiles.filter(f => f.staleness.priority === 'review'),
    monitor: staleFiles.filter(f => f.staleness.priority === 'monitor')
  };

  return RECOMMENDATION_CONFIGS
    .map(config => buildRecommendation(filesByPriority[config.priority], config))
    .filter(rec => rec !== null);
}

// Display results
function displayResults(results, verbose = false) {
  const { summary, files, recommendations, performance } = results;

  const healthEmoji = summary.healthScore >= 90 ? '✅' :
                      summary.healthScore >= 75 ? '🟡' :
                      summary.healthScore >= 60 ? '🟠' : '🔴';

  console.log('\n📚 DOCUMENTATION STALENESS ANALYSIS');
  console.log(`${healthEmoji} Health Score: ${summary.healthScore}% | Files: ${summary.analyzed}/${summary.total} | ${performance.duration}ms\n`);

  if (summary.analyzed > 0) {
    const monitorCount = files.filter(f => f.staleness.priority === 'monitor').length;
    const reviewCount = files.filter(f => f.staleness.priority === 'review').length;
    const staleCount = files.filter(f => f.staleness.score < 50).length;
    
    console.log(`✅ Current: ${summary.currentCount} | 🟡 Monitor: ${monitorCount} | 🟠 Review: ${reviewCount} | 🔴 Stale: ${staleCount}\n`);
  }

  if (recommendations.length > 0) {
    console.log('🎯 RECOMMENDATIONS:\n');
    recommendations.forEach(rec => {
      console.log(`${rec.icon} ${rec.action}: ${rec.description}`);
      rec.files.slice(0, 3).forEach(file => {
        console.log(`   ${file.staleness.indicator} ${file.path} (${file.ageInDays}d)`);
      });
      console.log('');
    });
  }

  if (verbose && files.length > 0) {
    console.log('📋 DETAILED ANALYSIS:\n');
    files.forEach(file => {
      console.log(`${file.staleness.indicator} ${file.path} - ${file.lastModified} (${file.ageInDays}d, score: ${file.staleness.score})`);
    });
    console.log('');
  }

  const tip = summary.healthScore >= 90 ? '🎉 Excellent! Documentation is well-maintained' :
              '💡 Focus on 🔴 and 🟠 files for maximum improvement';
  console.log(tip + '\n');
}

// Main analysis function
async function analyze() {
  const startTime = Date.now();
  console.log('🔍 Analyzing documentation staleness...\n');

  const files = [];
  traverseDirectory(CONFIG.rootDir, files);
  console.log(`📋 Found ${files.length} documentation files\n`);

  if (files.length === 0) {
    return {
      summary: { total: 0, analyzed: 0, healthScore: 100 },
      files: [],
      recommendations: [],
      performance: { duration: Date.now() - startTime }
    };
  }

  const analyzedFiles = analyzeFiles(files);
  const totalScore = analyzedFiles.reduce((sum, file) => sum + file.staleness.score, 0);
  const healthScore = analyzedFiles.length > 0 ? Math.round(totalScore / analyzedFiles.length) : 100;

  const staleFiles = analyzedFiles.filter(f => f.staleness.score < 70);
  const recommendations = generateRecommendations(staleFiles);

  return {
    summary: {
      total: files.length,
      analyzed: analyzedFiles.length,
      healthScore,
      staleCount: staleFiles.length,
      currentCount: analyzedFiles.filter(f => f.staleness.score >= 85).length
    },
    files: analyzedFiles,
    recommendations,
    performance: { duration: Date.now() - startTime }
  };
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const jsonOutput = args.includes('--json');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log('\n📚 Documentation Staleness Checker\n');
    console.log('USAGE: node scripts/check-docs-staleness.js [options]\n');
    console.log('OPTIONS:');
    console.log('  --verbose, -v  Show detailed file analysis');
    console.log('  --json         Output results as JSON');
    console.log('  --help, -h     Show this help message\n');
    return;
  }

  try {
    const results = await analyze();

    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      displayResults(results, verbose);
    }

    if (results.performance.duration > 30000) {
      console.warn('⚠️  Analysis exceeded 30s target - consider optimizing');
    }
  } catch (error) {
    console.error('❌ Error during staleness analysis:', error.message);

    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
