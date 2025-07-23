#!/usr/bin/env node

/**
 * Nuclear Reset Guide
 * 
 * Complete Vercel-GitHub integration reset when permissions are correct
 * but webhook still won't create
 */

console.log('💥 Nuclear Reset Guide');
console.log('======================');

console.log('\n🎯 SITUATION: Permissions are correct, but webhook still missing');
console.log('This indicates a Vercel-side integration bug or cached connection issue.');

console.log('\n🚨 NUCLEAR RESET STEPS:');

console.log('\n1️⃣ **Backup Current Setup**');
console.log('   - Note your domain: moodovermuscle.com.au');
console.log('   - Note environment variables (if any)');
console.log('   - Screenshot current Vercel project settings');

console.log('\n2️⃣ **Complete Vercel Cleanup**');
console.log('   - Go to Vercel Dashboard');
console.log('   - Delete "moodovermuscle" project completely');
console.log('   - Go to Settings → Git → Disconnect all GitHub connections');

console.log('\n3️⃣ **GitHub App Cleanup**');
console.log('   - Go to: https://github.com/settings/installations');
console.log('   - Find Vercel app → Configure');
console.log('   - Temporarily revoke access to your repository');
console.log('   - Or uninstall Vercel app completely (will need to reinstall)');

console.log('\n4️⃣ **Fresh Installation**');
console.log('   - Wait 5 minutes for caches to clear');
console.log('   - Go to Vercel → New Project');
console.log('   - Import from GitHub (will reinstall app if needed)');
console.log('   - Select: jovial-banana-9934/moodovermuscle-website');
console.log('   - Configure:');
console.log('     * Project name: moodovermuscle');
console.log('     * Framework: Next.js');
console.log('     * Build command: pnpm build');
console.log('     * Install command: pnpm install');
console.log('     * Output directory: .next');

console.log('\n5️⃣ **Domain Setup**');
console.log('   - After project creation, go to Settings → Domains');
console.log('   - Add: moodovermuscle.com.au');
console.log('   - Configure DNS as instructed');

console.log('\n6️⃣ **Verify Webhook Creation**');
console.log('   - Check GitHub repo → Settings → Webhooks');
console.log('   - Should see new Vercel webhook');
console.log('   - Test with: pnpm run test-deployment');

console.log('\n⚠️  **Alternative: Manual Webhook Creation**');
console.log('If nuclear reset fails, we can create webhook manually:');
console.log('1. Get Vercel webhook URL from project settings');
console.log('2. Create GitHub personal access token');
console.log('3. Run: pnpm run manual-webhook');

console.log('\n🎯 **Expected Result After Reset:**');
console.log('- Fresh Vercel project with clean GitHub integration');
console.log('- Webhook automatically created during import process');
console.log('- All deployments (prod/preview/dev) working correctly');
console.log('- Domain properly configured');

console.log('\n📞 **If Still Failing:**');
console.log('Contact Vercel Support with:');
console.log('- Account email');
console.log('- Repository: jovial-banana-9934/moodovermuscle-website');
console.log('- Issue: Webhook not created despite correct GitHub App permissions');
console.log('- Screenshots of GitHub App permissions');
console.log('- Mention you\'ve tried nuclear reset');

console.log('\n✅ **Success Indicators:**');
console.log('- Webhook appears in GitHub immediately after project creation');
console.log('- Test push triggers automatic deployment');
console.log('- All three environments work correctly');