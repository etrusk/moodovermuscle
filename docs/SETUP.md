# MoodOverMuscle Development Environment Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the development environment for the MoodOverMuscle fitness website project.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Testing](#testing)
4. [Code Quality](#code-quality)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)
7. [Performance Monitoring](#performance-monitoring)
8. [Security](#security)
9. [Support](#support)
10. [Next Steps](#next-steps)
11. [Husky Setup](#husky-setup)

---

**Document Information**
- **Last Updated**: 2025-07-27
- **Version**: 1.0
- **Owner**: Development Team
- **Review Schedule**: Quarterly

---

## Quick Start

### Prerequisites
- Node.js 20.x LTS
- pnpm 9.x
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/etrusk/moodovermuscle.git
cd moodovermuscle
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Start development server**
```bash
pnpm dev
```

Visit `http://localhost:3000` to see your application.

## Detailed Setup

### System Requirements
- **Node.js**: 20.x LTS (recommended: 20.15.1)
- **pnpm**: 9.x (latest stable)
- **Git**: 2.x or higher
- **VS Code**: Latest stable with recommended extensions

### Development Tools

#### VS Code Extensions
Install these extensions for optimal development experience:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- Auto Rename Tag
- Path Intellisense

#### Workspace Settings
The project includes `.vscode/settings.json` with optimal configuration.

### Environment Configuration

#### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Development
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=

# Contact form
CONTACT_FORM_ENDPOINT=
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm lighthouse` | Run Lighthouse audit |

### Testing

#### Unit Tests
```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:ci       # CI mode with coverage
```

#### E2E Tests
```bash
pnpm test:e2e      # Run E2E tests
pnpm test:e2e:ui   # Run with UI
```

### Code Quality

#### Pre-commit Hooks
- ESLint for code quality
- Prettier for formatting
- TypeScript compilation check
- Commit message validation

#### Commit Convention
Follow conventional commits:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Deployment

#### Vercel Deployment
The project is configured for automatic deployment to Vercel:
- Production: `main` branch
- Preview: Pull requests

#### Manual Deployment
```bash
pnpm build
vercel --prod
```

### Troubleshooting

#### Common Issues

1. **Node.js version mismatch**
   ```bash
   nvm use 20
   ```

2. **pnpm not found**
   ```bash
   npm install -g pnpm
   ```

3. **Build failures**
   ```bash
   pnpm clean
   pnpm install
   ```

4. **TypeScript errors**
   ```bash
   pnpm type-check
   ```

### Performance Monitoring

#### Lighthouse CI
```bash
pnpm lighthouse
```

#### Bundle Analysis
```bash
pnpm build
pnpm analyze
```

### Security

#### Security Headers
The project includes security headers via Vercel configuration.

#### Environment Variables
Never commit sensitive environment variables to git.

### Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub issues
3. Contact the development team

## Next Steps

1. **Install dependencies**: `pnpm install`
2. **Setup environment**: Configure `.env.local`
3. **Start development**: `pnpm dev`
4. **Run tests**: `pnpm test`
5. **Deploy**: Push to main branch for automatic deployment
## Husky Setup

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks. The hooks are configured to automatically lint, format, and test your code before you commit and push.

To enable the hooks, you need to run the following command once after cloning the repository:

```bash
pnpm exec husky
```