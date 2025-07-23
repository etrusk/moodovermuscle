#!/usr/bin/env node

/**
 * GitHub App Status Checker
 * 
 * Checks if Vercel GitHub App has proper permissions
 */

console.log('🔍 GitHub App Status Check');
console.log('==========================');

console.log('\n📋 Manual Verification Steps:');

console.log('\n1️⃣ **Check Installed GitHub Apps**');
console.log('   URL: https://github.com/settings/installations');
console.log('   Look for: "Vercel" app');
console.log('   Status: Should be "Installed"');

console.log('\n2️⃣ **Verify Repository Access**');
console.log('   Click "Configure" on Vercel app');
console.log('   Repository access: Should include "jovial-banana-9934/moodovermuscle-website"');
console.log('   If not listed: Grant access to this repository');

console.log('\n3️⃣ **Check Required Permissions**');
console.log('   The Vercel app should have these permissions:');
console.log('   ✓ Repository contents: Read & write');
console.log('   ✓ Repository metadata: Read');
console.log('   ✓ Pull requests: Read & write');
console.log('   ✓ Repository webhooks: Read & write');
console.log('   ✓ Commit statuses: Read & write');

console.log('\n4️⃣ **Organization Settings Check**');
console.log('   If repository is in an organization:');
console.log('   URL: https://github.com/organizations/jovial-banana-9934/settings/oauth_application_policy');
console.log('   Policy: Should allow third-party applications');
console.log('   Vercel: Should be in approved applications list');

console.log('\n🚨 **Common Issues:**');

console.log('\n❌ **App Not Installed**');
console.log('   Solution: Install Vercel GitHub App');
console.log('   URL: https://github.com/apps/vercel');

console.log('\n❌ **Repository Not Selected**');
console.log('   Solution: Configure app to include your repository');
console.log('   Go to app settings → Repository access → Select repositories');

console.log('\n❌ **Insufficient Permissions**');
console.log('   Solution: Grant webhook permissions to Vercel app');
console.log('   This is the most common cause of missing webhooks');

console.log('\n❌ **Organization Restrictions**');
console.log('   Solution: Update organization third-party app policy');
console.log('   Or add Vercel to approved applications');

console.log('\n✅ **Success Indicators:**');
console.log('- Vercel app shows in GitHub installations');
console.log('- Repository is selected in app configuration');
console.log('- All required permissions are granted');
console.log('- Organization allows third-party apps (if applicable)');

console.log('\n🔄 **After Fixing Permissions:**');
console.log('1. Go back to Vercel dashboard');
console.log('2. Disconnect and reconnect repository');
console.log('3. Webhook should auto-create this time');
console.log('4. Verify with: pnpm run check-webhooks');