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
        'color-contrast': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        label: ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'heading-order': ['error', { minScore: 1 }],
        'landmark-one-main': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}