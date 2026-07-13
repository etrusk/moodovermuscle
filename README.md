# MoodOverMuscle - Fitness for Mums Website

A modern, accessible fitness website built with Next.js and deployed on Vercel.

<!-- Verifying GitHub-Vercel integration - updated test -->
<!-- Simplified GitHub Flow Test -->

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/redundant-koalas-projects-c165d4a1/moodovermuscle)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/etrusk/moodovermuscle)

## About MoodOverMuscle

MoodOverMuscle is a fitness website for mothers on the Sunshine Coast, Queensland. The platform focuses on postnatal fitness, mental wellbeing, and building a supportive community for mums. Created by Emilia, a certified Safe Return to Exercise trainer and mother herself.

### Key Features

- **Free first session** - No payment or commitment required
- **Multi-step booking form** - Streamlined user experience
- **Responsive design** - Mobile-first approach
- **Accessibility focused** - WCAG compliant design
- **Community gallery** - Showcasing the M.O.M.unity in action
- **Error handling** - Custom 404/500 pages with recovery options
- **Performance monitoring** - Vercel Analytics and Speed Insights
- **Health monitoring** - Automated domain and SSL monitoring

## Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui built on Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Quality & testing scripts
pnpm run pre-deploy         # Full validation pipeline before deployment
pnpm test                  # Run Vitest unit & integration tests
pnpm test:e2e             # Run Playwright end-to-end tests
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Analytics integration
│   ├── page.tsx           # Homepage
│   ├── error.tsx          # Error boundary component
│   ├── not-found.tsx      # Custom 404 page
│   ├── 500.tsx            # Custom 500 error page
│   ├── globals.css        # Global styles
│   └── classes/           # Additional pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── booking-form.tsx  # Multi-step booking form
│   └── theme-provider.tsx
├── scripts/              # Development and testing utilities
├── .github/workflows/    # GitHub Actions
│   ├── ci.yml                      # CI/CD pipeline with quality gates
│   └── auto-merge-dependabot.yml  # Automated dependency updates
├── lib/                  # Utility functions
├── public/               # Static assets
│   └── images/          # Image assets
└── .kiro/               # Kiro IDE configuration
    └── steering/        # LLM guidance files
```

## Monitoring & Error Handling

### Error Pages

- **404 Not Found** (`app/not-found.tsx`): Custom branded 404 page with helpful navigation and contact information
- **500 Server Error** (`app/500.tsx`): Server error page with retry functionality and support contact
- **Error Boundary** (`app/error.tsx`): Client-side error boundary with development error details and recovery options

### Performance Monitoring

- **Vercel Analytics**: Integrated in `app/layout.tsx` for visitor tracking and page views
- **Speed Insights**: Core Web Vitals monitoring for performance optimization
- **Real-time Metrics**: Available in Vercel dashboard after deployment

### Quality Gates

Essential quality validation maintained through:
- **Pre-deployment pipeline**: Automated validation before production deploys
- **Test suites**: Comprehensive unit, integration, and e2e test coverage
- **Build verification**: TypeScript compilation and build process validation
- **CI/CD integration**: Automated quality checks via GitHub Actions

### CI/CD Pipeline

- **Continuous Integration** (`.github/workflows/ci.yml`):
  - Runs on every push and pull request
  - Automated quality gates: lint, type-check, security scan
  - Full test suite execution (unit, integration, e2e)
  - Build verification before deployment
  - Automated dependency updates via Renovate (`.github/renovate.json`)

### Dependency Management

- **Renovate Bot** (`.github/renovate.json`):
  - Weekly automated dependency updates (Mondays at 9am Australia/Sydney)
  - Auto-merge enabled for patch and minor updates
  - Major updates require manual review with `requires-attention` label
  - Separate handling for npm/pnpm dependencies and GitHub Actions
  - Email notifications via GitHub for PRs requiring manual intervention

## Development Guidelines

### Code Style

- Use TypeScript with strict mode
- Follow Tailwind CSS utility-first approach
- Implement responsive design (mobile-first)
- Use semantic HTML and ARIA labels for accessibility

### Component Patterns

- Functional components with hooks
- Use `"use client"` directive for interactive components
- Props interfaces for type safety
- Consistent naming: kebab-case files, PascalCase components

### Styling Conventions

- Primary colors: Rose/Pink gradients (`from-rose-500 to-pink-500`)
- Text colors: Stone variants (`text-stone-600`, `text-stone-900`)
- Success/Free elements: Green gradients (`from-green-500 to-emerald-500`)
- Rounded corners: `rounded-2xl`, `rounded-3xl`, `rounded-full`
- Shadows: Layered system (`shadow-lg`, `shadow-xl`, `shadow-2xl`)

## Key Components

### BookingForm

Multi-step form component with:

- Step 1: Personal information
- Step 2: Service selection
- Step 3: Scheduling and final details
- Progress indicator and validation
- Mobile-optimized UX

### Homepage Sections

- **Hero**: Emotional hook with FREE session emphasis
- **About**: Emily's story and credentials
- **How It Works**: 4-step process explanation
- **Gallery**: Community photos and social proof
- **Contact**: Location and contact information

## Deployment

### Environment Structure

- **Development**: `localhost:3000` - Local development with hot-reload
- **Preview**: `preview.moodovermuscle.com.au` - Static staging environment
- **Production**: `moodovermuscle.com.au` - Live production site

### Branch Workflow

```
feature/new-feature → preview → main
                   ↓         ↓
            preview.domain  production.domain
```

### Vercel Integration

- **Auto-deployment**: Automatic deployments from GitHub branches
- **Preview environment**: `preview` branch deploys to preview.moodovermuscle.com.au
- **Production deployment**: `main` branch deploys to moodovermuscle.com.au
- **Environment variables**: Managed through Vercel dashboard
- **Static export ready**: Optimized for static hosting

### Development Workflow

1. **Develop**: Create feature branches from `main`
2. **Stage**: Merge features to `preview` branch for testing
3. **Test**: Review changes on `preview.moodovermuscle.com.au`
4. **Deploy**: Merge `preview` to `main` for production deployment

### Branch Management

Vercel's GitHub integration creates a preview deployment for every PR automatically; production deploys on merge to `main`. Branch etiquette is in `CLAUDE.md`.

```bash
# Deploy to production after approval
git checkout main
git merge preview
git push origin main
```

## Content & Brand Guidelines

### Voice & Tone

- Conversational and supportive ("Hi mama", "lovely")
- Emphasizes community ("M.O.M.unity", "stronger together")
- No-pressure approach ("no bouncing back", "just come as you are")
- Mental health focus ("MoodOverMuscle")

### Target Audience

- New mothers seeking postnatal fitness recovery
- Mums looking for supportive fitness community
- Women wanting to balance physical and mental wellbeing
- Busy mothers needing flexible fitness options

## Recent Updates

### Tech Stack Cleanup (2025-10-15)

- ✅ Removed 15 unused dependencies (shadcn/ui components, Radix UI packages)
- ✅ Deleted 21 unused UI component files (-47% reduction)
- ✅ Removed 8 over-engineered monitoring scripts (1,200+ LOC)
- ✅ Cleaned 11 redundant package.json script entries
- ✅ Fixed dependency pinning (286 packages updated from "latest")
- ✅ All quality gates passing (lint, type-check, build, security)
- ✅ Simplified to essential tooling (rely on pnpm, ESLint, Next.js native capabilities)

### Performance Monitoring

- Vercel Analytics and Speed Insights integrated for production monitoring
- Automated Lighthouse audits via GitHub Actions
- Critical quality gates enforced in CI/CD pipeline

## Contributing

When making changes:

1. Follow the established code patterns
2. Test on mobile devices
3. Ensure accessibility compliance
4. Update documentation as needed
5. Test the booking form flow thoroughly

## Support

For technical issues or questions about the codebase, refer to:

- project root .md files for development guidance
- Next.js documentation for framework questions
- Tailwind CSS docs for styling
- shadcn/ui docs for component usage
  // Test comment for pre-commit timing
