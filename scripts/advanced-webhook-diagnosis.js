#!/usr/bin/env node

/**
 * Advanced Webhook Diagnosis
 * 
 * This script provides deeper troubleshooting for persistent webhook issues
 */

console.log('🔬 Advanced Webhook Diagnosis');
console.log('==============================');

console.log('\n🚨 PROBLEM: Reconnected twice, still no webhook');
console.log('This indicates a deeper integration issue, not just a simple connection problem.');

console.log('\n🔍 Root Cause Analysis:');

console.log('\n1️⃣ **GitHub App Permissions Issue**');
console.log('   Problem: Vercel GitHub App lacks proper repository access');
console.log('   Check: GitHub Settings → Applications → Installed GitHub Apps → Vercel');
console.log('   Fix: Grant "Contents" and "Metadata" permissions to your repository');

console.log('\n2️⃣ **Organization Restrictions**');
console.log('   Problem: GitHub organization blocks third-party applications');
console.log('   Check: GitHub Org Settings → Third-party application access policy');
console.log('   Fix: Allow Vercel app or change policy to "No restrictions"');

console.log('\n3️⃣ **Account Mismatch**');
console.log('   Problem: Vercel connected to different GitHub account');
console.log('   Check: Vercel Settings → Git → Connected accounts');
console.log('   Fix: Disconnect and reconnect with correct GitHub account');

console.log('\n4️⃣ **Repository Visibility**');
console.log('   Problem: Repository is private but Vercel lacks access');
console.log('   Check: Repository settings → Manage access');
console.log('   Fix: Ensure Vercel has access to private repository');

console.log('\n🛠️  IMMEDIATE ACTION PLAN:');

console.log('\n**Step A: Verify GitHub App Installation**');
console.log('1. Go to: https://github.com/settings/installations');
console.log('2. Find "Vercel" in installed GitHub Apps');
console.log('3. Click "Configure"');
console.log('4. Ensure "jovial-banana-9934/moodovermuscle-website" is selected');
console.log('5. Grant these permissions:');
console.log('   - Repository contents: Read & write');
console.log('   - Repository metadata: Read');
console.log('   - Pull requests: Read & write');
console.log('   - Repository webhooks: Read & write');

console.log('\n**Step B: Check Organization Settings**');
console.log('1. Go to: https://github.com/organizations/jovial-banana-9934/settings/oauth_application_policy');
console.log('2. Check third-party application access policy');
console.log('3. If restricted, add Vercel to approved applications');

console.log('\n**Step C: Nuclear Option - Complete Reset**');
console.log('1. Uninstall Vercel GitHub App completely');
console.log('2. Delete Vercel project');
console.log('3. Recreate project and reconnect from scratch');

console.log('\n**Step D: Manual Webhook Creation**');
console.log('If all else fails, we can create the webhook manually:');
console.log('1. Get Vercel webhook URL from project settings');
console.log('2. Create webhook manually in GitHub repository settings');
console.log('3. Configure events: push, pull_request');

console.log('\n🎯 **Expected Webhook Configuration:**');
console.log('- URL: https://api.vercel.com/v1/integrations/deploy/...');
console.log('- Content type: application/json');
console.log('- Events: push, pull_request');
console.log('- Active: ✓');

console.log('\n📞 **If Still Failing:**');
console.log('1. Contact Vercel Support with these details:');
console.log('   - Project: moodovermuscle');
console.log('   - Repository: jovial-banana-9934/moodovermuscle-website');
console.log('   - Issue: Webhook not created after multiple reconnections');
console.log('2. Provide screenshots of Vercel Git settings page');
console.log('3. Include GitHub App permissions screenshot');

console.log('\n⚡ **Quick Test Commands:**');
console.log('pnpm run check-github-app    # Check GitHub App status');
console.log('pnpm run manual-webhook      # Create webhook manually');