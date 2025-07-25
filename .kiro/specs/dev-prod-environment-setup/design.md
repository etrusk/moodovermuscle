# Design Document

## Overview

This design establishes a professional development and production environment setup for MoodOverMuscle using Vercel's platform capabilities, GitHub integration, and proper domain configuration. The solution leverages existing project structure and follows Next.js best practices for deployment and development workflows.

## Architecture

### Environment Structure
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Development   │    │     Preview      │    │   Production    │
│   localhost     │    │ preview.mood     │    │ moodovermuscle  │
│   :3000         │    │ overmuscle       │    │    .com.au      │
│                 │    │ .com.au          │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                            ┌──────────┐
                            │  GitHub  │
                            │ preview  │
                            │  main    │
                            └──────────┘
```

### Deployment Pipeline
1. **Local Development**: Hot-reload with `pnpm dev`
2. **Feature Branches**: Merge to preview branch for testing
3. **Preview Branch**: Static URL at preview.moodovermuscle.com.au
4. **Main Branch**: Production deployment to moodovermuscle.com.au
5. **Domain Management**: DNS configuration for both domains

## Components and Interfaces

### Local Development Environment

**Development Server Configuration**
- **Port**: 3000 (Next.js default)
- **Hot Reload**: Enabled via Next.js built-in HMR
- **Package Manager**: pnpm (enforced via .npmrc)
- **Environment**: Development-specific variables in .env.local

**File Structure Additions**
```
├── .env.local              # Local environment variables
├── .env.example           # Template for required variables
├── .npmrc                 # Force pnpm usage
├── vercel.json           # Vercel deployment configuration
└── next.config.mjs       # Next.js configuration (existing)
```

### Vercel Production Environment

**Project Configuration**
- **Framework**: Next.js (auto-detected)
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Output Directory**: `.next` (default)
- **Node Version**: 18.x (LTS)

**Domain Configuration**
- **Production Domain**: moodovermuscle.com.au
- **Preview Domain**: preview.moodovermuscle.com.au
- **SSL**: Automatic via Vercel for both domains
- **DNS**: A/CNAME records pointing to Vercel for both subdomains

### GitHub Integration

**Repository Settings**
- **Main Branch**: `main` (production deployments)
- **Preview Branch**: `preview` (staging deployments to preview.moodovermuscle.com.au)
- **Feature Branches**: Merge to preview for testing, then preview to main
- **Branch Protection**: Optional (recommended for team workflows)

**Webhook Configuration**
- **Trigger**: Push events to any branch
- **Action**: Automatic deployment via Vercel GitHub integration

## Data Models

### Environment Variables Schema
```typescript
interface EnvironmentConfig {
  // Next.js built-in
  NODE_ENV: 'development' | 'production' | 'test'
  
  // Custom application variables (future use)
  NEXT_PUBLIC_SITE_URL: string
  NEXT_PUBLIC_CONTACT_EMAIL: string
  
  // Third-party integrations (when needed)
  // STRIPE_SECRET_KEY?: string
  // EMAILJS_SERVICE_ID?: string
}
```

### Vercel Configuration Schema
```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["syd1"],
  "functions": {
    "app/**/*.tsx": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## Error Handling

### Development Environment Errors
- **Port Conflicts**: Automatic port detection and fallback
- **Dependency Issues**: Clear error messages with pnpm-specific guidance
- **TypeScript Errors**: Real-time error overlay in browser
- **Build Failures**: Detailed error logs in terminal

### Production Deployment Errors
- **Build Failures**: Vercel build logs with specific error details
- **Domain Issues**: DNS propagation status and configuration validation
- **Runtime Errors**: Next.js error boundaries and custom error pages
- **Performance Issues**: Vercel analytics and Core Web Vitals monitoring

### Error Recovery Strategies
1. **Failed Deployments**: Automatic rollback to previous working version
2. **DNS Issues**: Fallback to Vercel-provided URLs during resolution
3. **Build Errors**: Clear documentation for common issues and solutions
4. **Environment Mismatches**: Validation scripts to check configuration consistency

## Testing Strategy

### Local Development Testing
- **Hot Reload Verification**: Confirm changes appear without manual refresh
- **Build Testing**: Regular `pnpm build` to catch production issues early
- **Cross-browser Testing**: Verify functionality across major browsers
- **Mobile Responsiveness**: Test responsive design on various screen sizes

### Deployment Testing
- **Preview Deployments**: Test feature branches before merging
- **Production Smoke Tests**: Verify core functionality after deployment
- **Performance Testing**: Lighthouse audits on production URL
- **Domain Resolution**: Verify moodovermuscle.com.au resolves correctly

### Monitoring and Validation
- **Uptime Monitoring**: Verify site availability
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Monitor for runtime errors in production
- **Analytics Setup**: Basic usage tracking (privacy-compliant)

## Implementation Phases

### Phase 1: Local Development Setup
1. Configure pnpm enforcement
2. Set up environment variables
3. Verify hot-reload functionality
4. Document development workflow

### Phase 2: Vercel Project Configuration
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set up environment variables in Vercel
4. Test automatic deployments

### Phase 3: Domain Configuration
1. Configure DNS records for moodovermuscle.com.au and preview.moodovermuscle.com.au
2. Set up custom domains in Vercel for both production and preview
3. Verify SSL certificate provisioning for both domains
4. Test domain resolution and HTTPS for both environments

### Phase 4: Workflow Optimization
1. Set up preview deployments for feature branches
2. Configure deployment notifications
3. Implement monitoring and analytics
4. Document deployment procedures

## Security Considerations

### Environment Variable Security
- Never commit sensitive data to version control
- Use Vercel's encrypted environment variable storage
- Separate development and production secrets
- Regular rotation of API keys and tokens

### Domain Security
- HTTPS enforcement (automatic via Vercel)
- Security headers configuration
- Content Security Policy implementation
- Regular SSL certificate monitoring

### Access Control
- GitHub repository access management
- Vercel project permissions
- Domain registrar security settings
- Two-factor authentication enforcement