#!/usr/bin/env node

/**
 * Vercel Webhook Fix Script
 * 
 * This script provides step-by-step instructions to fix the missing webhook issue
 */

console.log('🔧 Vercel Webhook Fix Guide');
console.log('===========================');

console.log('\n🎯 Problem: No webhook created = No automatic deployments');
console.log('💡 Solution: Re-establish GitHub-Vercel connection');

console.log('\n📋 Step-by-Step Fix:');

console.log('\n1️⃣ **Disconnect Current Connection**');
console.log('   - Go to Vercel Dashboard → moodovermuscle project');
console.log('   - Settings → Git');
console.log('   - Click "Disconnect" (if connected)');

console.log('\n2️⃣ **Check GitHub Permissions**');
console.log('   - Go to GitHub Settings → Applications → Installed GitHub Apps');
console.log('   - Find "Vercel" app');
console.log('   - Ensure it has access to: jovial-banana-9934/moodovermuscle-website');
console.log('   - Grant permissions if needed');

console.log('\n3️⃣ **Reconnect Repository**');
console.log('   - Back in Vercel → Settings → Git');
console.log('   - Click "Connect Git Repository"');
console.log('   - Select GitHub');
console.log('   - Choose: jovial-banana-9934/moodovermuscle-website');
console.log('   - Configure:');
console.log('     * Production Branch: main');
console.log('     * Build Command: pnpm build');
console.log('     * Install Command: pnpm install');
console.log('     * Output Directory: .next');

console.log('\n4️⃣ **Verify Webhook Creation**');
console.log('   - After connection, webhook should auto-create');
console.log('   - Check: GitHub repo → Settings → Webhooks');
console.log('   - Should see Vercel webhook with events: push, pull_request');

console.log('\n5️⃣ **Test Deployment**');
console.log('   - Make small change to any file');
console.log('   - Commit and push to main branch');
console.log('   - Check Vercel dashboard for automatic deployment');

console.log('\n🔍 Verification Commands:');
console.log('   pnpm run check-webhooks    # Check if webhook exists');
console.log('   pnpm run test-deployment   # Create test file and push');

console.log('\n⚠️  If Reconnection Fails:');
console.log('1. Try different browser/incognito mode');
console.log('2. Check if GitHub organization has third-party restrictions');
console.log('3. Ensure you\'re logged into correct GitHub/Vercel accounts');
console.log('4. Contact Vercel support with project details');

console.log('\n🎯 Expected Result:');
console.log('- Webhook appears in GitHub repo settings');
console.log('- Pushes to main trigger production deployments');
console.log('- PRs trigger preview deployments');
console.log('- All three environments (prod/preview/dev) work correctly');

console.log('\n✅ Success Indicators:');
console.log('- Vercel dashboard shows "Connected to Git"');
console.log('- Recent deployments appear after pushes');
console.log('- Domain moodovermuscle.com.au updates automatically');