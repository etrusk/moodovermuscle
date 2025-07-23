#!/usr/bin/env node

/**
 * Deployment Test Script
 * 
 * This script helps test if your Vercel deployment is working properly
 * by making a small change and checking the deployment status.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Vercel deployment trigger...');

// Create a test file with timestamp
const testFilePath = path.join(__dirname, '..', 'deployment-test.txt');
const timestamp = new Date().toISOString();
const testContent = `Deployment test - ${timestamp}

This file was created to test if Vercel deployments are working properly.
If you see this file in your repository, the deployment trigger test was successful.

Test details:
- Timestamp: ${timestamp}
- Purpose: Webhook functionality test
- Expected: Automatic Vercel deployment should trigger

You can safely delete this file after confirming deployment works.
`;

try {
  fs.writeFileSync(testFilePath, testContent);
  console.log('✅ Test file created:', testFilePath);
  console.log('📝 Content preview:');
  console.log(testContent.split('\n').slice(0, 5).join('\n') + '...');
  
  console.log('\n📋 Next steps:');
  console.log('1. Commit and push this test file to your repository');
  console.log('2. Check your Vercel dashboard for automatic deployment');
  console.log('3. If deployment triggers, your webhook is working');
  console.log('4. If no deployment occurs, the webhook needs to be fixed');
  
  console.log('\n🔧 Commands to run:');
  console.log('git add deployment-test.txt');
  console.log('git commit -m "test: trigger deployment webhook test"');
  console.log('git push origin main');
  
} catch (error) {
  console.error('❌ Failed to create test file:', error.message);
  process.exit(1);
}