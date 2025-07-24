# Vercel Project Configuration Summary

This document summarizes the Vercel project configuration for MoodOverMuscle.

## Configuration Files

### vercel.json

The `vercel.json` file has been configured with the following settings:

- **Build Commands**: Using `pnpm` for installation and building
- **Region**: Sydney (syd1) for optimal performance in Australia
- **Function Configuration**: 30-second timeout and 1GB memory allocation
- **Security Headers**: Comprehensive security headers including CSP
- **Caching Strategy**: Optimized caching for static assets and images
- **GitHub Integration**: Configured for automatic deployments with notifications

### Environment Variables

Environment variables are managed through:

- `.env.example`: Template documenting required variables
- `.env.local`: Local development variables (not committed to version control)
- Vercel Dashboard: Production and preview environment variables

## Manual Configuration Steps

The following steps need to be performed manually in the Vercel dashboard:

1. **Project Setup**: Connect GitHub repository and configure build settings
2. **Environment Variables**: Set up environment-specific variables
3. **Domain Configuration**: Add custom domain and configure DNS
4. **GitHub Integration**: Set up branch deployments and notifications
5. **Analytics and Monitoring**: Enable performance and error monitoring

Detailed instructions for these steps are provided in the [Vercel Dashboard Setup Guide](.kiro/specs/dev-prod-environment-setup/vercel-dashboard-setup.md).

## Development to Production Workflow

1. **Local Development**: Use `pnpm dev` with hot-reload
2. **Feature Branches**: Automatically create preview deployments
3. **Main Branch**: Automatically deploy to production
4. **Environment Consistency**: Same dependencies and configuration across environments

## Testing Deployment

To verify the configuration:

1. Make a small change to the codebase
2. Push to the main branch
3. Verify automatic deployment in the Vercel dashboard
4. Check that the site is accessible at moodovermuscle.com.au

## Troubleshooting

If deployment issues occur:

1. Check build logs in the Vercel dashboard
2. Verify environment variables are correctly set
3. Ensure GitHub permissions are properly configured
4. Check that the vercel.json configuration is valid