module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && PORT=3001 npm run start',
      url: ['http://localhost:3001'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: [
          // Privacy and Security Hardening
          '--no-default-browser-check',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-sync',
          '--disable-translate',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-component-extensions-with-background-pages',
          '--disable-background-networking',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-datasaver-prompt',
          '--disable-desktop-notifications',
          '--disable-device-discovery-notifications',
          '--disable-domain-reliability',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--disable-field-trial-config',
          '--disable-gaia-services',
          '--disable-google-now-integration',
          '--disable-infobars',
          '--disable-logging',
          '--disable-login-animations',
          '--disable-notifications',
          '--disable-password-generation',
          '--disable-permissions-api',
          '--disable-plugins-discovery',
          '--disable-popup-blocking',
          '--disable-print-preview',
          '--disable-save-password-bubble',
          '--disable-search-engine-choice-screen',
          '--disable-session-crashed-bubble',
          '--disable-signin-promo',
          '--disable-speech-api',
          '--disable-suggestions-service',
          '--disable-web-security',
          '--disable-webgl',
          '--disable-webrtc-multiple-routes',
          '--disable-webrtc-hw-decoding',
          '--disable-webrtc-hw-encoding',

          // Network Privacy
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-sync',
          '--disable-translate',
          '--no-pings',
          '--no-referrers',
          '--disable-fetching-hints-at-navigation-start',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=VizDisplayCompositor',

          // Isolated Profile
          '--user-data-dir=/home/bob/.lighthouse-chrome-profile',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless',
          '--remote-debugging-port=9222',
          '--disable-web-security',
          '--disable-features=site-per-process',
          '--allow-running-insecure-content',
          '--disable-blink-features=AutomationControlled',
          '--disable-ipc-flooding-protection',

          // Performance flags for testing
          '--memory-pressure-off',
          '--max_old_space_size=4096',
        ],
      },
    },
    assert: {
      assertions: {
        // Critical Quality Gates (will fail build)
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],

        // Performance Gates (warnings but tracked)
        'categories:performance': ['warn', { minScore: 0.85 }],

        // Core Web Vitals (automated performance budgets)
        'audits:first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'audits:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'audits:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'audits:total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Resource Budgets (prevent bloat)
        'audits:total-byte-weight': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'audits:dom-size': ['warn', { maxNumericValue: 1500 }],

        // Critical Accessibility Checks
        'audits:color-contrast': ['error', { minScore: 1 }],
        'audits:image-alt': ['error', { minScore: 1 }],
        'audits:label': ['error', { minScore: 1 }],

        // SEO Essentials
        'audits:meta-description': ['error', { minScore: 1 }],
        'audits:document-title': ['error', { minScore: 1 }],

        // Security
        'audits:is-on-https': ['error', { minScore: 1 }],
        'audits:external-anchors-use-rel-noopener': ['warn', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
