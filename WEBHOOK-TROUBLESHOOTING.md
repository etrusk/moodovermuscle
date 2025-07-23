# Vercel Webhook Troubleshooting Guide

## Problem: Vercel Webhook Not Created

When your GitHub repository is connected to Vercel but automatic deployments aren't triggering, it usually means the webhook wasn't properly created during the integration process.

## Understanding Vercel Webhooks

**What they are**: HTTP callbacks that GitHub sends to Vercel when code changes occur
**How they work**: Vercel automatically creates these webhooks when you connect your repository through their dashboard
**Why they fail**: Connection issues, permission problems, or incomplete setup process

## Systematic Troubleshooting

### Step 1: Verify GitHub App Permissions

1. Go to: https://github.com/settings/installations
2. Find "Vercel" in installed GitHub Apps
3. Click "Configure"
4. Ensure your repository is selected
5. Verify these permissions are granted:
   - ✅ Repository contents: Read & write
   - ✅ Repository metadata: Read
   - ✅ Pull requests: Read & write
   - ✅ **Repository webhooks: Read & write** ← Critical for webhook creation
   - ✅ Commit statuses: Read & write

### Step 2: Check Vercel Connection Status

1. Go to Vercel Dashboard → Your project
2. Navigate to Settings → Git
3. Verify it shows "Connected to Git"
4. Confirm repository URL matches your GitHub repo
5. Check that production branch is set to `main`

### Step 3: Reconnect Integration

If permissions are correct but webhook is missing:

1. **Disconnect**: In Vercel Settings → Git, click "Disconnect"
2. **Wait**: Allow 2-3 minutes for caches to clear
3. **Reconnect**: Click "Connect Git Repository"
4. **Select**: Choose your GitHub repository
5. **Configure**: Ensure correct build settings:
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next`

### Step 4: Nuclear Reset (If Reconnection Fails)

If webhook still won't create after multiple reconnection attempts:

1. **Backup**: Note your domain and environment variables
2. **Delete Project**: Completely delete the Vercel project
3. **Clear GitHub Access**: Temporarily revoke Vercel app access to your repo
4. **Wait**: 5 minutes for all caches to clear
5. **Fresh Start**: Create new Vercel project by importing from GitHub
6. **Verify**: Webhook should auto-create during fresh import

### Step 5: Manual Webhook Creation

If automatic creation continues to fail, create webhook manually:

1. **Get Vercel Webhook URL**:
   - Go to Vercel project → Settings → Git → Deploy Hooks
   - Create new deploy hook for `main` branch
   - Copy the generated webhook URL

2. **Create GitHub Token**:
   - Go to: https://github.com/settings/tokens
   - Create token with `repo` and `admin:repo_hook` scopes

3. **Use Functional Script**:
   ```bash
   export GITHUB_TOKEN="your_token_here"
   export VERCEL_WEBHOOK_URL="your_webhook_url_here"
   pnpm run manual-webhook
   ```

## Verification Steps

After implementing any fix:

1. **Check GitHub**: Go to your repo → Settings → Webhooks
2. **Verify Webhook**: Should see Vercel webhook with `push` and `pull_request` events
3. **Test Deployment**: Make small change, commit, and push to `main`
4. **Confirm Trigger**: Check Vercel dashboard for automatic deployment

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No webhook after reconnection | Missing webhook permissions | Grant "Repository webhooks: Read & write" to Vercel app |
| Webhook exists but no deployments | Incorrect webhook URL | Delete webhook, reconnect through Vercel dashboard |
| Multiple failed reconnections | Cached connection issues | Use nuclear reset approach |
| "Not Found" API errors | Private repo access issues | Ensure Vercel app has repository access |

## Available Tools

- `pnpm run check-webhooks` - Check current webhook status via GitHub API
- `pnpm run manual-webhook` - Create webhook manually when auto-creation fails
- `deployment-test.txt` - Test file for verifying webhook functionality

## When to Contact Support

Contact Vercel Support if:
- GitHub App permissions are correct but webhook won't create
- Nuclear reset doesn't resolve the issue
- Manual webhook creation fails with valid credentials

Include in your support request:
- Project name and repository URL
- Screenshots of GitHub App permissions
- Description of troubleshooting steps already attempted