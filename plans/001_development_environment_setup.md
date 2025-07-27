# Development Environment Setup Guide & CI/CD Pipeline Design

## Executive Summary

This comprehensive guide provides a complete development environment setup and CI/CD pipeline design for the MoodOverMuscle fitness website project. The solution is optimized for Next.js 15.2.4 with TypeScript, Vercel deployment, and supports the 3-phase implementation approach identified in project requirements.

## Current State Analysis

### Project Stack Overview
- **Frontend**: Next.js 15.2.4 with TypeScript
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **UI Components**: Radix UI with shadcn/ui components
- **Package Manager**: pnpm
- **Deployment**: Vercel with GitHub integration
- **Analytics**: Vercel Analytics & Speed Insights

### Existing Infrastructure
- ✅ Basic Next.js configuration
- ✅ Vercel deployment configuration
- ✅ Security headers configuration
- ✅ Basic build scripts
- ❌ Missing CI/CD pipeline
- ❌ Missing testing infrastructure
- ❌ Missing quality gates
- ❌ Missing environment management

## Development Environment Setup Guide

### 1. System Requirements & Prerequisites

#### Required Software
- **Node.js**: 20.x LTS (recommended: 20.15.1)
- **pnpm**: 9.x (latest stable)
- **Git**: 2.x or higher
- **VS Code**: Latest stable with recommended extensions

#### System Dependencies
```bash
# macOS
brew install node pnpm git

# Windows (via winget)
winget install OpenJS.NodeJS
npm install -g pnpm

# Ubuntu/Debian
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 2. Local Development Setup

#### Step 1: Repository Setup
```bash
# Clone repository
git clone https://github.com/etrusk/moodovermuscle.git
cd moodovermuscle

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

#### Step 2: Environment Configuration
Create `.env.local` with:
```bash
# Development
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (optional for local)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=

# Contact form (if using external service)
CONTACT_FORM_ENDPOINT=

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

#### Step 3: Development Server
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### 3. IDE Configuration (VS Code)

#### Required Extensions
Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Debugging Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

## CI/CD Pipeline Architecture

### GitHub Actions Workflow Design

#### 1. Main CI/CD Pipeline (`.github/workflows/ci.yml`)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      with:
        version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:ci
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    name: Build & Deploy
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### 2. PR Quality Gates (`.github/workflows/pr-quality.yml`)
```yaml
name: PR Quality Gates

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  size-check:
    name: Bundle Size Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: preactjs/compressed-size-action@v2
        with:
          pattern: '.next/**/*.{js,css}'
          exclude: '{.next/cache/**}'

  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      with:
        version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm lighthouse:ci
```

## Quality Assurance Gates

### 1. Pre-commit Hooks Setup

#### Install Husky & lint-staged
```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

#### Configure `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

#### Configure `lint-staged.config.js`
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
    'git add'
  ]
}
```

### 2. ESLint Configuration

#### Install ESLint packages
```bash
pnpm add -D eslint @next/eslint-plugin-next @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-next eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
```

#### Create `.eslintrc.json`
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react", "jsx-a11y"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off",
    "jsx-a11y/anchor-is-valid": "off"
  }
}
```

### 3. Prettier Configuration

#### Create `.prettierrc`
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

## Environment Management Strategy

### 1. Environment Configuration

#### Environment Files Structure
```
.env.local          # Local development (gitignored)
.env.development    # Development environment
.env.staging        # Staging environment
.env.production     # Production environment
```

#### Environment Variables Validation
Create `lib/env.ts`:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID: z.string().optional(),
  CONTACT_FORM_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

### 2. Feature Flag System

#### Create `lib/feature-flags.ts`
```typescript
export const featureFlags = {
  enableNewBookingFlow: process.env.NEXT_PUBLIC_ENABLE_NEW_BOOKING === 'true',
  enableAnalytics: process.env.NODE_ENV === 'production',
  enableDebugMode: process.env.NODE_ENV === 'development',
} as const
```

## Testing Infrastructure

### 1. Unit Testing Setup

#### Install Testing Dependencies
```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

#### Create `jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### 2. E2E Testing Setup

#### Install Playwright
```bash
pnpm add -D @playwright/test
```

#### Create `playwright.config.ts`
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
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up development environment
- [ ] Configure ESLint, Prettier, and TypeScript
- [ ] Install and configure testing frameworks
- [ ] Set up pre-commit hooks

### Phase 2: CI/CD Pipeline (Week 2)
- [ ] Create GitHub Actions workflows
- [ ] Configure Vercel deployment
- [ ] Set up environment variables
- [ ] Test deployment pipeline

### Phase 3: Quality Gates (Week 3)
- [ ] Implement bundle size monitoring
- [ ] Set up Lighthouse CI
- [ ] Configure security scanning
- [ ] Add performance monitoring

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Node.js version conflicts | Medium | Low | Use .nvmrc and document versions |
| Environment variable exposure | High | Low | Use GitHub secrets and .env validation |
| Build failures | Medium | Medium | Comprehensive testing and rollback strategy |
| Performance regressions | Medium | Medium | Bundle size monitoring and Lighthouse CI |

## Success Criteria

- [ ] Local development environment setup < 15 minutes
- [ ] Zero-downtime deployments
- [ ] 100% automated testing coverage
- [ ] Performance scores > 90 on Lighthouse
- [ ] Security headers compliance
- [ ] Bundle size monitoring alerts
- [ ] Developer onboarding < 30 minutes

## Next Steps

1. Implement the development environment setup
2. Create the CI/CD pipeline
3. Set up quality assurance gates
4. Test the complete workflow
5. Create developer onboarding documentation