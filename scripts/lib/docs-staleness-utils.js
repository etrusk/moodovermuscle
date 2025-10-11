const fs = require('fs')
const path = require('path')

/**
 * Utility functions for documentation staleness analysis
 */

/**
 * Traverse directory recursively to find documentation files
 * @param {string} currentDir - Current directory to traverse
 * @param {object} options - Configuration options
 * @param {Array} files - Accumulator for found files
 */
function traverseDirectory(currentDir, options, files) {
  const { excludePatterns, includeExtensions } = options

  try {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      // Path constructed from fs.readdirSync results within project directory, not user input
      const fullPath = path.join(currentDir, item)

      // Skip excluded patterns
      if (excludePatterns.some(pattern => item.includes(pattern))) {
        continue
      }

      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        traverseDirectory(fullPath, options, files)
      } else if (stat.isFile()) {
        const ext = path.extname(item)
        if (includeExtensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
    console.warn(`Warning: Could not read directory ${currentDir}`)
  }
}

module.exports = { traverseDirectory }