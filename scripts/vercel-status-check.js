#!/usr/bin/env node

/**
 * Vercel Project Status Checker
 * 
 * This script helps diagnose Vercel project configuration and connection status
 */

console.log('🔍 Vercel Project Status Check');
console.log('================================');

console.log('\n📋 Project Information:');
console.log('- Project Name: moodovermuscle');
console.log('- Repository: jovial-banana-9934/moodovermuscle-website');
console.log('- Domain: moodovermuscle.com.au');
console.log('- Expected Environments: prod, preview, dev');

console.log('\n🔧 Manual Verification Steps:');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Find project: moodovermuscle');
console.log('3. Click on project → Settings → Git');

console.log('\n✅ What you should see:');
console.log('- "Connected to Git" status');
console.log('- Repository: jovial-banana-9934/moodovermuscle-website');
console.log('- Production Branch: main');
console.log('- Auto-deploy enabled');

console.log('\n❌ If you see instead:');
console.log('- "Not connected" or "Connect Git Repository" button');
console.log('- Wrong repository name');
console.log('- Missing webhook configuration');

console.log('\n🚨 Common Issues:');
console.log('1. **Incomplete Setup**: Project created but Git not properly connected');
console.log('2. **Permission Issues**: Vercel lacks GitHub repository access');
console.log('3. **Organization Settings**: GitHub org blocks third-party apps');
console.log('4. **Multiple Accounts**: Wrong Vercel/GitHub account combination');

console.log('\n🔄 Next Steps:');
console.log('After checking Vercel dashboard, run:');
console.log('- If connected but no webhook: pnpm run fix-webhook');
console.log('- If not connected: Follow reconnection steps below');

console.log('\n📞 Need Help?');
console.log('- Vercel Support: https://vercel.com/help');
console.log('- GitHub Integration Docs: https://vercel.com/docs/git/vercel-for-github');