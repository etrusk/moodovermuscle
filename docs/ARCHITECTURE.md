# Technical Architecture

## Overview

This document outlines the technical architecture for the Mood Over Muscle fitness website, a Next.js 14 application designed for pre and postnatal fitness services.

## Technology Stack

### Core Framework

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and enhanced developer experience
- **React 18**: Modern React features including Server Components

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Accessible component library built on Radix UI
- **Lucide React**: Icon library

### State Management

- **React Context**: Global state management
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Data & APIs

- **Next.js API Routes**: Backend API endpoints
- **Prisma** (future): Database ORM for PostgreSQL
- **React Query** (future): Data fetching and caching

### Performance & Monitoring

- **Next.js Analytics**: Performance monitoring
- **Vercel**: Hosting and deployment
- **Sentry**: Error tracking and monitoring

## Architecture Patterns

### 1. App Router Structure

```
app/
├── page.tsx                 # Home page
├── classes/
│   └── page.tsx            # Classes listing
├── api/
│   └── booking/
│       └── route.ts        # Booking API endpoint
├── globals.css             # Global styles
├── layout.tsx              # Root layout
├── error.tsx               # Error boundary
├── not-found.tsx           # 404 page
└── 500.tsx                 # 500 error page
```

### 2. Component Architecture

- **Atomic Design**: Components organized by complexity
- **Server Components**: Leveraging Next.js 14 server components
- **Client Components**: Interactive components with 'use client' directive

### 3. Data Flow

- **Server-Side Rendering (SSR)**: Initial page loads
- **Static Site Generation (SSG)**: Marketing pages
- **Client-Side Rendering (CSR)**: Interactive features
- **API Routes**: Backend functionality

## Security Architecture

### Authentication & Authorization

- **NextAuth.js** (future): Authentication system
- **Role-based Access Control**: Different user permissions
- **JWT Tokens**: Secure session management

### Data Protection

- **HTTPS**: All communications encrypted
- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: API endpoint protection
- **CSP Headers**: Content Security Policy

## Performance Architecture

### Optimization Strategies

- **Code Splitting**: Automatic and manual chunking
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js font system
- **Bundle Analysis**: Regular bundle size monitoring

### Caching Strategy

- **Static Generation**: Pre-rendered pages
- **ISR**: Incremental Static Regeneration
- **CDN**: Vercel Edge Network
- **Browser Caching**: Optimal cache headers

## Scalability Design

### Horizontal Scaling

- **Serverless Functions**: Vercel Functions
- **Edge Runtime**: Global edge deployment
- **Database Scaling**: Connection pooling

### Vertical Scaling

- **Code Optimization**: Performance-focused development
- **Asset Optimization**: Image compression, lazy loading
- **Database Optimization**: Query optimization, indexing

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Deployment Pipeline

1. **Development**: Local development with hot reload
2. **Staging**: Preview deployments for testing
3. **Production**: Automated deployment to Vercel

## Monitoring & Observability

### Performance Monitoring

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Real User Monitoring**: Performance metrics
- **Error Tracking**: Sentry integration

### Health Checks

- **API Health**: Endpoint monitoring
- **Database Health**: Connection monitoring
- **External Services**: Third-party service monitoring

## Future Considerations

### Phase 2 Enhancements

- **Database Integration**: PostgreSQL with Prisma
- **User Authentication**: NextAuth.js implementation
- **Payment Processing**: Stripe integration
- **Content Management**: Headless CMS integration

### Phase 3 Scaling

- **Microservices**: Service decomposition
- **Containerization**: Docker deployment
- **Kubernetes**: Container orchestration
- **Multi-region**: Global deployment

## Development Guidelines

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control

### Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User journey testing
- **Performance Tests**: Load and stress testing

## Environment Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_SITE_URL=https://moodovermuscle.com.au
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional
SENTRY_DSN=https://xxx@sentry.io/xxx
DATABASE_URL=postgresql://...
```

### Feature Flags

- **Development**: All features enabled
- **Staging**: Production-like environment
- **Production**: Stable features only
