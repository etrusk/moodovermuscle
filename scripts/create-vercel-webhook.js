#!/usr/bin/env node

/**
 * Manual Vercel Webhook Creation Script
 * 
 * This script helps create a Vercel webhook manually if the automatic
 * GitHub integration isn't working properly.
 * 
 * Prerequisites:
 * - GitHub Personal Access Token with repo permissions
 * - Vercel project URL or webhook endpoint
 */

const https = require('https');

// Configuration - Replace with your actual values
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set this environment variable
const REPO_OWNER = 'jovial-banana-9934';
const REPO_NAME = 'moodovermuscle-website';
const VERCEL_WEBHOOK_URL = process.env.VERCEL_WEBHOOK_URL; // Get this from Vercel dashboard

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.log('Create a token at: https://github.com/settings/tokens');
  console.log('Required permissions: repo, admin:repo_hook');
  process.exit(1);
}

if (!VERCEL_WEBHOOK_URL) {
  console.error('❌ VERCEL_WEBHOOK_URL environment variable is required');
  console.log('Get this from your Vercel project settings > Git > Webhooks');
  process.exit(1);
}

const webhookData = {
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
  path: `/repos/${REPO_OWNER}/${REPO_NAME}/hooks`,
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'Vercel-Webhook-Creator',
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
  }
};

console.log('🔧 Creating Vercel webhook...');
console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
console.log(`Webhook URL: ${VERCEL_WEBHOOK_URL}`);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (res.statusCode === 201) {
      console.log('✅ Webhook created successfully!');
      console.log(`Webhook ID: ${response.id}`);
      console.log(`Webhook URL: ${response.config.url}`);
      console.log(`Events: ${response.events.join(', ')}`);
    } else {
      console.error('❌ Failed to create webhook');
      console.error(`Status: ${res.statusCode}`);
      console.error('Response:', response);
      
      if (response.errors) {
        response.errors.forEach(error => {
          console.error(`Error: ${error.message}`);
        });
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(JSON.stringify(webhookData));
req.end();