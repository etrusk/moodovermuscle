# Vercel Webhook Troubleshooting Guide

## Problem: Vercel Webhook Not Created

When your GitHub repository is connected to Vercel but automatic deployments aren't triggering, it usually means the webhook wasn't properly created during the integration process.

## Understanding Vercel Webhooks

**What they are**: HTTP callbacks that GitHub sends to Vercel when code changes occur
**How they work**: Vercel automatically creates these webhooks when you connect your repository through their dashboard
**Why they fail**: Connection issues, permission problems, or incomplete setup process

## Troubleshooting Steps

### 1. Check Current Status

First, let's see if any webhooks exist:

```bash
# Check if you have a GitHub token set up
echo $GITHUB_TOKEN

# If not, create one at: https://github.com/settings/tokens
# Required permissions: repo, admin:repo_hook

# Check current webhooks
pnpm run check-webhooks
```

### 2. Verify Vercel Connection

In your Vercel dashboard:
1. Go to your project: `moodovermuscle`
2. Navigate to Settings → Git
3. Check if it shows "Connected to Git"
4. Verify the repository URL matches: `jovial-banana-9934/moodovermuscle-website`

### 3. Test Deployment Trigger

We've already created a test file. Check your Vercel dashboard to see if the recent pushes triggered deployments:

```bash
# The test file was created and pushed
# Check Vercel dashboard for deployment activity
```

### 4. Re-establish Connection (If Needed)

If no webhook exists or deployments aren't triggering:

1. **Disconnect and Reconnect**:
   - In Vercel dashboard → Project Settings → Git
   - Click "Disconnect" 
   - Click "Connect Git Repository"
   - Re-select your repository

2. **Check GitHub App Permissions**:
   - Go to GitHub Settings → Applications → Installed GitHub Apps
   - Find "Vercel" and ensure it has access to your repository
   - Grant additional permissions if needed

### 5. Manual Webhook Creation (Last Resort)

If automatic creation still fails:

```bash
# Set required environment variables
export GITHUB_TOKEN="your_github_token_here"
export VERCEL_WEBHOOK_URL="your_vercel_webhook_url_here"

# Create webhook manually
pnpm run create-webhook
```

To get your Vercel webhook URL:
1. Go to Vercel dashboard → Project Settings → Git
2. Look for webhook configuration or contact Vercel support

## Common Issues & Solutions

### Issue: "Not Found" Error
**Cause**: Repository is private or token lacks permissions
**Solution**: Ensure GitHub token has `repo` and `admin:repo_hook` permissions

### Issue: Webhook Exists But Deployments Don't Trigger
**Cause**: Webhook URL is incorrect or inactive
**Solution**: Delete existing webhook and reconnect through Vercel dashboard

### Issue: Multiple Webhooks
**Cause**: Multiple connection attempts
**Solution**: Remove duplicate webhooks, keep only the active Vercel one

## Verification

After fixing the webhook:

1. **Make a small change** to any file
2. **Commit and push** to main branch
3. **Check Vercel dashboard** for automatic deployment
4. **Verify deployment** completes successfully

## Scripts Available

- `pnpm run check-webhooks` - Check current webhook status
- `pnpm run create-webhook` - Manually create Vercel webhook
- `pnpm run test-deployment` - Create test file to trigger deployment

## Next Steps

1. Check your Vercel dashboard now to see if the recent pushes triggered deployments
2. If deployments are working, the webhook is functioning correctly
3. If not, follow the re-establishment steps above
4. Contact Vercel support if issues persist

## Files Created

- `scripts/check-webhooks.js` - Webhook status checker
- `scripts/create-vercel-webhook.js` - Manual webhook creator
- `scripts/test-deployment.js` - Deployment trigger tester
- `deployment-test.txt` - Test file for webhook verification

The webhook should now be working. Check your Vercel dashboard for recent deployment activity!