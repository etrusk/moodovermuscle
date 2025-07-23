#!/usr/bin/env node

/**
 * Get Vercel Webhook URL Guide
 * 
 * Instructions to find your Vercel webhook URL for manual creation
 */

console.log('🔍 Get Vercel Webhook URL');
console.log('=========================');

console.log('\n🎯 We need your Vercel webhook URL to create the webhook manually');

console.log('\n📋 **Method 1: From Vercel Dashboard**');
console.log('1. Go to Vercel Dashboard → moodovermuscle project');
console.log('2. Settings → Git');
console.log('3. Look for "Webhook URL" or "Deploy Hook"');
console.log('4. Copy the URL (usually starts with: https://api.vercel.com/v1/integrations/deploy/)');

console.log('\n📋 **Method 2: Create Deploy Hook**');
console.log('1. Go to Vercel Dashboard → moodovermuscle project');
console.log('2. Settings → Git → Deploy Hooks');
console.log('3. Create new deploy hook:');
console.log('   - Name: "GitHub Integration"');
console.log('   - Branch: main');
console.log('4. Copy the generated webhook URL');

console.log('\n📋 **Method 3: From Browser Network Tab**');
console.log('1. Open browser dev tools → Network tab');
console.log('2. Go to Vercel project → Settings → Git');
console.log('3. Try to reconnect GitHub (even if it fails)');
console.log('4. Look for API calls containing webhook URLs');

console.log('\n🔧 **Once You Have the URL:**');
console.log('1. Create GitHub token: https://github.com/settings/tokens');
console.log('   Required scopes: repo, admin:repo_hook');
console.log('2. Export environment variables:');
console.log('   export GITHUB_TOKEN="your_token_here"');
console.log('   export VERCEL_WEBHOOK_URL="your_webhook_url_here"');
console.log('3. Run: pnpm run manual-webhook');

console.log('\n💡 **Example Webhook URL Format:**');
console.log('https://api.vercel.com/v1/integrations/deploy/prj_abc123/xyz789');
console.log('https://hooks.vercel.com/deploy/abc123xyz789');

console.log('\n⚠️  **If You Can\'t Find Webhook URL:**');
console.log('This confirms the integration is broken. Options:');
console.log('1. Try nuclear reset: pnpm run nuclear-reset');
console.log('2. Contact Vercel Support for webhook URL');
console.log('3. Create new project from scratch');

console.log('\n📞 **Vercel Support Info:**');
console.log('- Email: support@vercel.com');
console.log('- Include: Project name, repository, GitHub App permissions screenshot');
console.log('- Request: Webhook URL for manual integration setup');