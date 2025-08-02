module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && PORT=3001 npm run start',
      url: ['http://localhost:3001'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--user-data-dir=/home/bob/.lighthouse-chrome-profile',
        ],
      },
    },
    assert: {
      assertions: {
        // Raised accessibility threshold to 95%
        'categories:accessibility': ['error', { minScore: 0.95 }],
        // Zero-tolerance critical violations
        'audits:color-contrast': ['error', { minScore: 1 }],
        'audits:image-alt': ['error', { minScore: 1 }],
        'audits:label': ['error', { minScore: 1 }],
        'audits:link-name': ['error', { minScore: 1 }],
        'audits:button-name': ['error', { minScore: 1 }],
        'audits:heading-order': ['error', { minScore: 1 }],
        'audits:landmark-one-main': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}