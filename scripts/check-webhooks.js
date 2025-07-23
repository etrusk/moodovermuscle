#!/usr/bin/env node

/**
 * GitHub Webhook Status Checker
 * 
 * This script checks the current webhook configuration for your repository
 * and identifies any Vercel-related webhooks.
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'jovial-banana-9934';
const REPO_NAME = 'moodovermuscle-website';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.log('Create a token at: https://github.com/settings/tokens');
  console.log('Required permissions: repo');
  process.exit(1);
}

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${REPO_OWNER}/${REPO_NAME}/hooks`,
  method: 'GET',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'Webhook-Checker',
    'Accept': 'application/vnd.github.v3+json'
  }
};

console.log('🔍 Checking webhook status...');
console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const webhooks = JSON.parse(data);
      
      console.log(`\n📊 Found ${webhooks.length} webhook(s):`);
      
      if (webhooks.length === 0) {
        console.log('❌ No webhooks configured');
        console.log('\n💡 This explains why Vercel deployments aren\'t triggering automatically');
        console.log('   You need to connect your repository to Vercel through their dashboard');
      } else {
        webhooks.forEach((webhook, index) => {
          console.log(`\n${index + 1}. Webhook ID: ${webhook.id}`);
          console.log(`   URL: ${webhook.config.url}`);
          console.log(`   Events: ${webhook.events.join(', ')}`);
          console.log(`   Active: ${webhook.active}`);
          console.log(`   Created: ${webhook.created_at}`);
          
          // Check if this looks like a Vercel webhook
          if (webhook.config.url.includes('vercel') || webhook.config.url.includes('zeit')) {
            console.log('   🎯 This appears to be a Vercel webhook');
          }
        });
      }
    } else {
      const response = JSON.parse(data);
      console.error(`❌ Failed to fetch webhooks (Status: ${res.statusCode})`);
      console.error('Response:', response);
      
      if (res.statusCode === 404) {
        console.log('\n💡 This could mean:');
        console.log('   - Repository doesn\'t exist');
        console.log('   - Token doesn\'t have proper permissions');
        console.log('   - Repository is private and token lacks access');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();