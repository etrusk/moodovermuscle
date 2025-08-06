#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * Automated Documentation Staleness Detection System
 *
 * Analyzes documentation files using git timestamps to identify stale content
 * and provide maintenance recommendations with visual priority indicators.
 */
class DocsStalenessAnalyzer {
  constructor(options = {}) {
    this.stalenessThreshold = options.stalenessThreshold || 30 // days
    this.rootDir = options.rootDir || process.cwd()
    this.excludePatterns = options.excludePatterns || [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
    ]
    this.includeExtensions = options.includeExtensions || ['.md', '.mdx']
  }

  /**
   * Get git timestamp for a specific file
   * @param {string} filePath - Path to the file
   * @returns {number|null} - Unix timestamp or null if not in git
   */
  getGitTimestamp(filePath) {
    try {
      const relativePath = path.relative(this.rootDir, filePath)
      const command = `git log --format="%at" -n 1 -- "${relativePath}"`
      const output = execSync(command, {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      const timestamp = output.trim()
      return timestamp ? parseInt(timestamp, 10) : null
    } catch (error) {
      // File not in git or other git error
      return null
    }
  }

  /**
   * Calculate staleness score and visual indicator
   * @param {number} daysOld - Age of file in days
   * @returns {object} - Score, indicator, and priority
   */
  calculateStaleness(daysOld) {
    if (daysOld <= 7) {
      return {
        score: 100,
        indicator: '✅',
        priority: 'current',
        level: 'excellent',
      }
    } else if (daysOld <= 14) {
      return { score: 85, indicator: '✅', priority: 'good', level: 'good' }
    } else if (daysOld <= 30) {
      return {
        score: 70,
        indicator: '🟡',
        priority: 'monitor',
        level: 'acceptable',
      }
    } else if (daysOld <= 60) {
      return {
        score: 50,
        indicator: '🟠',
        priority: 'review',
        level: 'attention',
      }
    } else if (daysOld <= 90) {
      return { score: 30, indicator: '🔴', priority: 'update', level: 'stale' }
    } else {
      return {
        score: 10,
        indicator: '🔴',
        priority: 'critical',
        level: 'very-stale',
      }
    }
  }

  /**
   * Generate maintenance recommendations based on staleness analysis
   * @param {Array} staleFiles - Array of stale file objects
   * @returns {Array} - Prioritized recommendations
   */
  generateRecommendations(staleFiles) {
    const recommendations = []

    const criticalFiles = staleFiles.filter(
      f => f.staleness.priority === 'critical'
    )
    const updateFiles = staleFiles.filter(
      f => f.staleness.priority === 'update'
    )
    const reviewFiles = staleFiles.filter(
      f => f.staleness.priority === 'review'
    )
    const monitorFiles = staleFiles.filter(
      f => f.staleness.priority === 'monitor'
    )

    if (criticalFiles.length > 0) {
      recommendations.push({
        priority: 1,
        action: 'IMMEDIATE ATTENTION',
        description: `${criticalFiles.length} documentation files are critically stale (>90 days)`,
        files: criticalFiles.slice(0, 5), // Show top 5
        icon: '🚨',
      })
    }

    if (updateFiles.length > 0) {
      recommendations.push({
        priority: 2,
        action: 'SCHEDULE UPDATE',
        description: `${updateFiles.length} files need content review and updates (60-90 days old)`,
        files: updateFiles.slice(0, 5),
        icon: '📝',
      })
    }

    if (reviewFiles.length > 0) {
      recommendations.push({
        priority: 3,
        action: 'REVIEW NEEDED',
        description: `${reviewFiles.length} files should be reviewed for accuracy (30-60 days old)`,
        files: reviewFiles.slice(0, 3),
        icon: '👀',
      })
    }

    if (monitorFiles.length > 0) {
      recommendations.push({
        priority: 4,
        action: 'MONITOR',
        description: `${monitorFiles.length} files are approaching staleness (14-30 days old)`,
        files: monitorFiles.slice(0, 3),
        icon: '📊',
      })
    }

    return recommendations
  }

  /**
   * Find all documentation files recursively
   * @param {string} dir - Directory to search
   * @returns {Array} - Array of file paths
   */
  findDocumentationFiles(dir = this.rootDir) {
    const files = []

    const traverse = currentDir => {
      try {
        const items = fs.readdirSync(currentDir)

        for (const item of items) {
          const fullPath = path.join(currentDir, item)

          // Skip excluded patterns
          if (this.excludePatterns.some(pattern => item.includes(pattern))) {
            continue
          }

          const stat = fs.statSync(fullPath)

          if (stat.isDirectory()) {
            traverse(fullPath)
          } else if (stat.isFile()) {
            const ext = path.extname(item)
            if (this.includeExtensions.includes(ext)) {
              files.push(fullPath)
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
        console.warn(`Warning: Could not read directory ${currentDir}`)
      }
    }

    traverse(dir)
    return files
  }

  /**
   * Analyze all documentation files for staleness
   * @returns {object} - Complete analysis results
   */
  async analyze() {
    const startTime = Date.now()
    console.log('🔍 Analyzing documentation staleness...\n')

    const files = this.findDocumentationFiles()
    console.log(`📋 Found ${files.length} documentation files\n`)

    if (files.length === 0) {
      return {
        summary: { total: 0, analyzed: 0, healthScore: 100 },
        files: [],
        recommendations: [],
        performance: { duration: Date.now() - startTime },
      }
    }

    const analyzedFiles = []
    const currentTime = Math.floor(Date.now() / 1000)

    for (const filePath of files) {
      const timestamp = this.getGitTimestamp(filePath)

      if (timestamp) {
        const ageInSeconds = currentTime - timestamp
        const ageInDays = Math.floor(ageInSeconds / (24 * 60 * 60))
        const staleness = this.calculateStaleness(ageInDays)

        analyzedFiles.push({
          path: path.relative(this.rootDir, filePath),
          lastModified: new Date(timestamp * 1000).toISOString().split('T')[0],
          ageInDays,
          staleness,
          size: fs.statSync(filePath).size,
        })
      }
    }

    // Sort by staleness score (ascending - most stale first)
    analyzedFiles.sort((a, b) => a.staleness.score - b.staleness.score)

    // Calculate health score
    const totalScore = analyzedFiles.reduce(
      (sum, file) => sum + file.staleness.score,
      0
    )
    const healthScore =
      analyzedFiles.length > 0
        ? Math.round(totalScore / analyzedFiles.length)
        : 100

    // Generate recommendations
    const staleFiles = analyzedFiles.filter(f => f.staleness.score < 70)
    const recommendations = this.generateRecommendations(staleFiles)

    const duration = Date.now() - startTime

    return {
      summary: {
        total: files.length,
        analyzed: analyzedFiles.length,
        healthScore,
        staleCount: staleFiles.length,
        currentCount: analyzedFiles.filter(f => f.staleness.score >= 85).length,
      },
      files: analyzedFiles,
      recommendations,
      performance: { duration },
    }
  }

  /**
   * Format and display analysis results
   * @param {object} results - Analysis results
   * @param {boolean} verbose - Show detailed file list
   */
  displayResults(results, verbose = false) {
    const { summary, files, recommendations, performance } = results

    // Header with health score
    console.log('📚 DOCUMENTATION STALENESS ANALYSIS')
    console.log('═'.repeat(50))

    // Health indicator
    let healthEmoji = '🔴'
    if (summary.healthScore >= 90) healthEmoji = '✅'
    else if (summary.healthScore >= 75) healthEmoji = '🟡'
    else if (summary.healthScore >= 60) healthEmoji = '🟠'

    console.log(
      `\n${healthEmoji} Overall Health Score: ${summary.healthScore}%`
    )
    console.log(
      `📁 Files Tracked: ${summary.analyzed}/${summary.total} (${summary.total - summary.analyzed} excluded: no git history)`
    )
    console.log(`⚡ Performance: ${performance.duration}ms\n`)

    // Summary statistics
    if (summary.analyzed > 0) {
      console.log('📊 DOCUMENTATION STATUS')
      console.log('─'.repeat(25))
      console.log(`✅ Current (≤14 days): ${summary.currentCount}`)
      console.log(
        `🟡 Monitoring (15-30 days): ${files.filter(f => f.staleness.priority === 'monitor').length}`
      )
      console.log(
        `🟠 Needs Review (31-60 days): ${files.filter(f => f.staleness.priority === 'review').length}`
      )
      console.log(
        `🔴 Stale (>60 days): ${files.filter(f => f.staleness.score < 50).length}\n`
      )
    }

    // Recommendations
    if (recommendations.length > 0) {
      console.log('🎯 MAINTENANCE RECOMMENDATIONS')
      console.log('─'.repeat(32))

      recommendations.forEach((rec, index) => {
        console.log(`\n${rec.icon} ${rec.action}`)
        console.log(`   ${rec.description}`)

        if (rec.files.length > 0) {
          console.log('   Priority files:')
          rec.files.forEach(file => {
            console.log(
              `   ${file.staleness.indicator} ${file.path} (${file.ageInDays} days)`
            )
          })
        }
      })
      console.log('')
    }

    // Verbose file listing
    if (verbose && files.length > 0) {
      console.log('📋 DETAILED FILE ANALYSIS')
      console.log('─'.repeat(26))

      files.forEach(file => {
        console.log(`${file.staleness.indicator} ${file.path}`)
        console.log(
          `   Last modified: ${file.lastModified} (${file.ageInDays} days ago)`
        )
        console.log(
          `   Status: ${file.staleness.level} (score: ${file.staleness.score})`
        )
        console.log('')
      })
    }

    // Footer with action summary
    if (summary.healthScore < 90) {
      console.log(
        '💡 TIP: Focus on files marked with 🔴 and 🟠 for maximum health improvement'
      )
    } else {
      console.log('🎉 Excellent! Your documentation is well-maintained')
    }

    console.log('\n' + '═'.repeat(50))
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose') || args.includes('-v')
  const jsonOutput = args.includes('--json')
  const help = args.includes('--help') || args.includes('-h')

  if (help) {
    console.log(`
📚 Documentation Staleness Checker

USAGE:
  node scripts/check-docs-staleness.js [options]

OPTIONS:
  --verbose, -v    Show detailed file analysis
  --json          Output results as JSON
  --help, -h      Show this help message

EXAMPLES:
  node scripts/check-docs-staleness.js
  node scripts/check-docs-staleness.js --verbose
  node scripts/check-docs-staleness.js --json

The tool analyzes documentation files using git timestamps to identify
stale content and provides maintenance recommendations.

Health Score Target: >90% for optimal documentation freshness
Performance Target: <5 seconds for 200+ files
    `)
    return
  }

  try {
    const analyzer = new DocsStalenessAnalyzer({
      stalenessThreshold: 30,
      includeExtensions: ['.md', '.mdx'],
    })

    const results = await analyzer.analyze()

    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2))
    } else {
      analyzer.displayResults(results, verbose)
    }

    // Performance check (circuit breaker)
    if (results.performance.duration > 30000) {
      console.warn(
        '\n⚠️  WARNING: Analysis exceeded 30-second performance target'
      )
      console.warn('Consider optimizing for large repositories')
    }

    // Exit with non-zero for very poor health (informational only)
    if (results.summary.healthScore < 50) {
      console.log(
        '\n🔍 NOTE: Low health score detected - consider prioritizing documentation maintenance'
      )
    }
  } catch (error) {
    console.error('❌ Error during staleness analysis:', error.message)

    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack)
    }

    process.exit(1)
  }
}

// Export for testing
module.exports = { DocsStalenessAnalyzer }

// Run if called directly
if (require.main === module) {
  main()
}
