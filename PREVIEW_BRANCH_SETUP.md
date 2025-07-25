# Preview Branch Setup Guide

## Overview
This guide covers setting up the preview branch environment with a static URL at `preview.moodovermuscle.com.au`.

## Current Status
✅ Preview branch created and pushed to GitHub
⏳ Vercel configuration needed
⏳ DNS configuration needed
⏳ Domain verification needed

## Steps to Complete

### 1. Vercel Dashboard Configuration
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the `moodovermuscle` project
3. Go to Settings → Git
4. Under "Production Branch", ensure `main` is selected
5. Under "Preview Deployments", ensure preview branch deployments are enabled
6. Go to Settings → Domains
7. Add custom domain: `preview.moodovermuscle.com.au`
8. Configure it to deploy from the `preview` branch

### 2. DNS Configuration
Add a CNAME record to your DNS provider:
```
Type: CNAME
Name: preview
Value: cname.vercel-dns.com
TTL: 300 (or default)
```

### 3. Branch Workflow
```
feature/new-feature → preview → main
                   ↓         ↓
            preview.domain  production.domain
```

**Development Process:**
1. Create feature branch from `main`
2. Develop and test locally
3. Merge feature branch to `preview`
4. Test on `preview.moodovermuscle.com.au`
5. When approved, merge `preview` to `main`

### 4. Verification Steps
- [ ] Preview branch deploys automatically to Vercel
- [ ] Custom domain `preview.moodovermuscle.com.au` resolves
- [ ] SSL certificate is provisioned
- [ ] Site functions identically to production

## Commands for Branch Management

### Switch to preview branch
```bash
git checkout preview
```

### Merge feature to preview
```bash
git checkout preview
git merge feature/branch-name
git push origin preview
```

### Merge preview to main (after approval)
```bash
git checkout main
git merge preview
git push origin main
```

### Keep preview in sync with main
```bash
git checkout preview
git merge main
git push origin preview
```

## Troubleshooting

### Preview branch not deploying
- Check Vercel project settings
- Ensure preview branch is pushed to GitHub
- Verify GitHub integration is working

### Domain not resolving
- Check DNS propagation (can take up to 48 hours)
- Verify CNAME record is correct
- Check Vercel domain configuration

### SSL certificate issues
- Wait for automatic provisioning (usually 5-10 minutes)
- Check domain verification in Vercel dashboard
- Ensure DNS records are correct