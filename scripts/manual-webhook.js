#!/usr/bin/env node

/**
 * Manual Webhook Creator
 * 
 * Creates Vercel webhook manually when automatic creation fails
 */

const https = require('https');

console.log('🔧 Manual Webhook Creation');
console.log('===========================');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const VERCEL_WEBHOOK_URL = process.env.VERCEL_WEBHOOK_URL;

if (!GITHUB_TOKEN) {
  console.log('\n❌ Missing GITHUB_TOKEN');
  console.log('1. Create token at: https://github.com/settings/tokens');
  console.log('2. Required scopes: repo, admin:repo_hook');
  console.log('3. Export token: export GITHUB_TOKEN="your_token_here"');
  console.log('4. Run script again');
  process.exit(1);
}

if (!VERCEL_WEBHOOK_URL) {
  console.log('\n❌ Missing VERCEL_WEBHOOK_URL');
  console.log('To get your Vercel webhook URL:');
  console.log('1. Go to Vercel Dashboard → moodovermuscle project');
  console.log('2. Settings → Git');
  console.log('3. Look for webhook URL (usually starts with https://api.vercel.com/v1/integrations/deploy/)');
  console.log('4. Export URL: export VERCEL_WEBHOOK_URL="your_webhook_url_here"');
  console.log('5. Run script again');
  
  console.log('\n💡 Alternative: Contact Vercel Support');
  console.log('If you can\'t find the webhook URL, contact Vercel support with:');
  console.log('- Project name: moodovermuscle');
  console.log('- Repository: jovial-banana-9934/moodovermuscle-website');
  console.log('- Issue: Need webhook URL for manual creation');
  process.exit(1);
}

console.log('\n🎯 Creating webhook with:');
console.log(`Repository: jovial-banana-9934/moodovermuscle-website`);
console.log(`Webhook URL: ${VERCEL_WEBHOOK_URL}`);

const webhookConfig = {
  name: 'web',
  active: true,
  events: ['push', 'pull_request'],
  config: {
    url: VERCEL_WEBHOOK_URL,
    content_type: 'json',
    insecure_ssl: '0'
  }
};

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/repos/jovial-banana-9934/moodovermuscle-website/hooks',
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'Manual-Webhook-Creator',
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
  }
};

console.log('\n🚀 Creating webhook...');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 201) {
        console.log('\n✅ Webhook created successfully!');
        console.log(`Webhook ID: ${response.id}`);
        console.log(`URL: ${response.config.url}`);
        console.log(`Events: ${response.events.join(', ')}`);
        console.log(`Active: ${response.active}`);
        
        console.log('\n🧪 Test the webhook:');
        console.log('1. Make a small change to any file');
        console.log('2. Commit and push to main branch');
        console.log('3. Check Vercel dashboard for deployment');
        
      } else {
        console.log('\n❌ Failed to create webhook');
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (response.message === 'Validation Failed') {
          console.log('\n💡 Common validation errors:');
          console.log('- Webhook URL is invalid or unreachable');
          console.log('- Duplicate webhook already exists');
          console.log('- Insufficient permissions');
        }
      }
    } catch (error) {
      console.log('\n❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('\n❌ Request failed:', error.message);
});

req.write(JSON.stringify(webhookConfig));
req.end();