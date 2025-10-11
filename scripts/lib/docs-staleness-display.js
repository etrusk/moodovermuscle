/**
 * Display and formatting utilities for documentation staleness results
 */
class DocsStalenessDisplay {
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
      this.displaySummaryStatistics(files, summary)
    }

    // Recommendations
    if (recommendations.length > 0) {
      this.displayRecommendations(recommendations)
    }

    // Verbose file listing
    if (verbose && files.length > 0) {
      this.displayDetailedFileAnalysis(files)
    }

    // Footer with action summary
    this.displayFooter(recommendations, files, summary)

    console.log('\n' + '═'.repeat(50))
  }

  /**
   * Display summary statistics
   * @param {Array} files - Analyzed files
   * @param {object} summary - Summary statistics
   */
  displaySummaryStatistics(files, summary) {
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

  /**
   * Display maintenance recommendations
   * @param {Array} recommendations - Prioritized recommendations
   */
  displayRecommendations(recommendations) {
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

  /**
   * Display detailed file analysis
   * @param {Array} files - Analyzed files
   */
  displayDetailedFileAnalysis(files) {
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

  /**
   * Display footer with action summary
   * @param {Array} recommendations - Recommendations
   * @param {Array} files - Analyzed files
   * @param {object} summary - Summary statistics
   */
  displayFooter(recommendations, files, summary) {
    const hasStaleFiles = files.some(f => f.staleness.score < 70)
    if (recommendations.length > 0 || hasStaleFiles) {
      console.log(
        '💡 TIP: Focus on files marked with 🔴 and 🟠 for maximum health improvement'
      )
    } else if (summary.healthScore < 90) {
      console.log(
        '💡 TIP: Focus on files marked with 🔴 and 🟠 for maximum health improvement'
      )
    } else {
      console.log('🎉 Excellent! Your documentation is well-maintained')
    }
  }
}

module.exports = { DocsStalenessDisplay }