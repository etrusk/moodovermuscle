#!/usr/bin/env node

const { DocsStalenessAnalyzer } = require('./lib/docs-staleness-analyzer')
const { DocsStalenessDisplay } = require('./lib/docs-staleness-display')

/**
 * CLI Interface for Documentation Staleness Checker
 */
async function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose') || args.includes('-v')
  const jsonOutput = args.includes('--json')
  const help = args.includes('--help') || args.includes('-h')

  if (help) {
    displayHelp()
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
      const display = new DocsStalenessDisplay()
      display.displayResults(results, verbose)
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

/**
 * Display help message
 */
function displayHelp() {
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
}

// Export for testing
module.exports = { DocsStalenessAnalyzer, DocsStalenessDisplay }

// Run if called directly
if (require.main === module) {
  main()
}
