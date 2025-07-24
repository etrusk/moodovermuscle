# Vercel Dashboard Configuration Guide

This document outlines the manual steps required to configure the MoodOverMuscle project in the Vercel dashboard.

## Project Setup

1. **Create/Import Project**
   - Log in to the [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Select the GitHub repository for MoodOverMuscle
   - Vercel will automatically detect Next.js as the framework

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (already set in vercel.json)
   - Install Command: `pnpm install` (already set in vercel.json)
   - Output Directory: `.next` (default for Next.js)
   - Node.js Version: 18.x (LTS)

## Environment Variables

Set up the following environment variables in the Vercel dashboard:

| Name | Value | Description | Environment |
|------|-------|-------------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://moodovermuscle.com.au` | Site URL for canonical links | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://{branch}-moodovermuscle.vercel.app` | Preview URL format | Preview |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `moodovermuscle@gmail.com` | Contact email for the site | All |

> **Note**: Add any additional environment variables as needed for third-party integrations.

## Domain Configuration

1. **Add Custom Domain**
   - Go to Project Settings > Domains
   - Add domain: `moodovermuscle.com.au`
   - Follow Vercel's instructions for DNS configuration

2. **DNS Configuration**
   - Add an A record pointing to Vercel's IP addresses
   - Add CNAME records for www subdomain if needed
   - Verify DNS propagation

3. **SSL Configuration**
   - Vercel will automatically provision SSL certificates
   - Ensure HTTPS is enforced (default setting)

## GitHub Integration

1. **Connect GitHub Repository**
   - Ensure the GitHub repository is connected to Vercel
   - Configure branch deployments:
     - Production Branch: `main`
     - Preview Branches: All other branches

2. **Deployment Settings**
   - Enable "Auto-Deploy when pushing to default branch"
   - Configure build cache settings (default is fine)
   - Set up deployment notifications (optional)

3. **Preview Deployments**
   - Verify preview deployments are created for feature branches
   - Test the automatic cleanup of preview deployments when branches are deleted

## Analytics and Monitoring

1. **Enable Vercel Analytics**
   - Go to Project Settings > Analytics
   - Enable Web Vitals monitoring
   - Set up Speed Insights

2. **Configure Error Monitoring**
   - Enable Error tracking
   - Set up alert thresholds and notifications

## Testing Deployment

1. **Initial Deployment**
   - Trigger a manual deployment from the main branch
   - Verify the build completes successfully
   - Check that the site is accessible at the production URL

2. **Verify Automatic Deployment**
   - Make a small change to the repository
   - Push to the main branch
   - Verify that Vercel automatically deploys the changes

## Troubleshooting

If deployment issues occur:

1. Check build logs for errors
2. Verify environment variables are correctly set
3. Ensure GitHub permissions are properly configured
4. Check that the vercel.json configuration is valid