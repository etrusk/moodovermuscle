const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { traverseDirectory } = require('./docs-staleness-utils')

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
      '.docker',
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
    const filesByPriority = this.categorizeFilesByPriority(staleFiles)
    return this.buildRecommendations(filesByPriority)
  }

  /**
   * Categorize files by priority level
   * @param {Array} staleFiles - Array of stale file objects
   * @returns {object} - Files categorized by priority
   */
  categorizeFilesByPriority(staleFiles) {
    return {
      critical: staleFiles.filter(f => f.staleness.priority === 'critical'),
      update: staleFiles.filter(f => f.staleness.priority === 'update'),
      review: staleFiles.filter(f => f.staleness.priority === 'review'),
      monitor: staleFiles.filter(f => f.staleness.priority === 'monitor'),
    }
  }

  /**
   * Build recommendations from categorized files
   * @param {object} filesByPriority - Categorized files
   * @returns {Array} - Recommendations
   */
  buildRecommendations(filesByPriority) {
    const recommendations = []

    if (filesByPriority.critical.length > 0) {
      recommendations.push({
        priority: 1,
        action: 'IMMEDIATE ATTENTION',
        description: `${filesByPriority.critical.length} documentation files are critically stale (>90 days)`,
        files: filesByPriority.critical.slice(0, 5),
        icon: '🚨',
      })
    }

    if (filesByPriority.update.length > 0) {
      recommendations.push({
        priority: 2,
        action: 'SCHEDULE UPDATE',
        description: `${filesByPriority.update.length} files need content review and updates (60-90 days old)`,
        files: filesByPriority.update.slice(0, 5),
        icon: '📝',
      })
    }

    if (filesByPriority.review.length > 0) {
      recommendations.push({
        priority: 3,
        action: 'REVIEW NEEDED',
        description: `${filesByPriority.review.length} files should be reviewed for accuracy (30-60 days old)`,
        files: filesByPriority.review.slice(0, 3),
        icon: '👀',
      })
    }

    if (filesByPriority.monitor.length > 0) {
      recommendations.push({
        priority: 4,
        action: 'MONITOR',
        description: `${filesByPriority.monitor.length} files are approaching staleness (14-30 days old)`,
        files: filesByPriority.monitor.slice(0, 3),
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
    const options = {
      excludePatterns: this.excludePatterns,
      includeExtensions: this.includeExtensions,
    }
    traverseDirectory(dir, options, files)
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
      return this.buildEmptyResults(startTime)
    }

    const analyzedFiles = this.analyzeFiles(files)
    const results = this.buildResults(files, analyzedFiles, startTime)

    return results
  }

  /**
   * Build empty results for when no files are found
   * @param {number} startTime - Analysis start time
   * @returns {object} - Empty results
   */
  buildEmptyResults(startTime) {
    return {
      summary: { total: 0, analyzed: 0, healthScore: 100 },
      files: [],
      recommendations: [],
      performance: { duration: Date.now() - startTime },
    }
  }

  /**
   * Analyze individual files for staleness
   * @param {Array} files - File paths to analyze
   * @returns {Array} - Analyzed file objects
   */
  analyzeFiles(files) {
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

    return analyzedFiles.sort((a, b) => a.staleness.score - b.staleness.score)
  }

  /**
   * Build final analysis results
   * @param {Array} files - All found files
   * @param {Array} analyzedFiles - Analyzed files
   * @param {number} startTime - Analysis start time
   * @returns {object} - Complete results
   */
  buildResults(files, analyzedFiles, startTime) {
    const totalScore = analyzedFiles.reduce(
      (sum, file) => sum + file.staleness.score,
      0
    )
    const healthScore =
      analyzedFiles.length > 0
        ? Math.round(totalScore / analyzedFiles.length)
        : 100

    const staleFiles = analyzedFiles.filter(f => f.staleness.score < 70)
    const recommendations = this.generateRecommendations(staleFiles)

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
      performance: { duration: Date.now() - startTime },
    }
  }
}

module.exports = { DocsStalenessAnalyzer }