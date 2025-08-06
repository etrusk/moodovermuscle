# Tool Configuration Reference

This file contains the complete configuration examples referenced in workflows.md for easy lookup and copy-paste usage.

## Package.json Pre-commit Configuration

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:critical && npm run security:scan",
      "pre-push": "npm run test:full && npm run build:verify"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

## ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'plugin:accessibility/recommended',
    'plugin:security/recommended',
  ],
  rules: {
    // Enforce code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',

    // Accessibility enforcement
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-labels': 'error',

    // Security rules
    'security/detect-object-injection': 'error',
    'security/detect-sql-injection': 'error',
  },
}
```

## Prettier Configuration (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Vercel Configuration (vercel.json)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## GitHub Actions CI/CD Workflow (.github/workflows/ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint and format check
        run: |
          npm run lint
          npm run prettier:check

      - name: Type checking
        run: npm run type-check

      - name: Security scan
        run: npm run security:scan

      - name: Critical tests
        run: npm run test:critical

      - name: Build verification
        run: npm run build

      - name: Accessibility audit
        run: npm run a11y:ci

      - name: Performance budget
        run: npm run lighthouse:ci

  full-test-suite:
    runs-on: ubuntu-latest
    needs: quality-gates
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run full test suite
        run: npm run test:coverage

      - name: E2E tests
        run: npm run test:e2e:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: quality-gates
    steps:
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Complete Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",

    "lint": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "lint:check": "eslint . --ext .js,.jsx,.ts,.tsx",
    "prettier": "prettier --write .",
    "prettier:check": "prettier --check .",
    "type-check": "tsc --noEmit",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:critical": "jest --testPathPattern=critical --passWithNoTests",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ci": "playwright test --reporter=github",
    "test:coverage": "jest --coverage",
    "test:full": "npm run test && npm run test:e2e",

    "a11y:test": "jest --testPathPattern=accessibility",
    "a11y:audit": "lighthouse --only-categories=accessibility",
    "a11y:ci": "jest --testPathPattern=accessibility --passWithNoTests",

    "security:scan": "audit-ci --config audit-ci.json",
    "security:test": "jest --testPathPattern=security",

    "lighthouse:ci": "lhci autorun",
    "perf:budget": "bundlesize",
    "bundle:analyze": "ANALYZE=true npm run build",

    "quality:all": "npm run lint && npm run type-check && npm run test:critical && npm run security:scan",
    "ci:verify": "npm run quality:all && npm run build"
  }
}
```

## Lighthouse CI Configuration (.lighthouserc.js)

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000', 'http://localhost:3000/booking'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
  },
}
```

## Jest Configuration (jest.config.js)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

## Jest Accessibility Configuration

```javascript
// jest.accessibility.config.js
module.exports = {
  testMatch: ['**/__tests__/**/*.a11y.test.{js,ts}'],
  setupFilesAfterEnv: ['<rootDir>/jest.a11y.setup.js'],
}

// jest.a11y.setup.js
import { configureAxe } from 'jest-axe'
import 'jest-axe/extend-expect'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },
  },
})
```

## Playwright Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>
    }
    return this.props.children
  }
}

export default ErrorBoundary
```

---

**Last Updated**: 2025-08-06  
**Purpose**: Configuration reference for workflows.md optimization  
**Usage**: Reference these configurations instead of including full blocks in main workflow documentation
