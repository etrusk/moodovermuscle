#!/usr/bin/env node

/**
 * Create Standard Vercel Webhook
 * 
 * Creates the standard Vercel webhook that mirrors what Vercel would create automatically
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'jovial-banana-9934';
const REPO_NAME = 'moodovermuscle-website';

// Read Vercel project configuration
function getVercelProjectId() {
  try {
    const projectPath = path.join(__dirname, '..', '.vercel', 'project.json');
    const projectData = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
    return projectData.projectId;
  } catch (error) {
    console.error('❌ Could not read Vercel project configuration');
    console.error('Make sure you have run: vercel link');
    return null;
  }
}

function createGitHubWebhook(webhookUrl) {
  return new Promise((resolve, reject) => {
    const webhookConfig = {
      name: 'web',
      active: true,
      events: ['push', 'pull_request'], // Standard Vercel events
      config: {
        url: webhookUrl,
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
        'User-Agent': 'Standard-Vercel-Webhook-Creator',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    console.log('🚀 Creating standard Vercel webhook...');
    console.log(`   Repository: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log(`   Events: ${webhookConfig.events.join(', ')}`);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 201) {
            console.log('\n✅ Standard Vercel webhook created successfully!');
            console.log(`   Webhook ID: ${response.id}`);
            console.log(`   URL: ${response.config.url}`);
            console.log(`   Events: ${response.events.join(', ')}`);
            console.log(`   Active: ${response.active}`);
            
            console.log('\n🎯 This webhook will now handle:');
            console.log('   - Production deployments (pushes to main)');
            console.log('   - Preview deployments (pull requests)');
            console.log('   - Feature branch deployments (pushes to other branches)');
            
            resolve(response);
          } else {
            console.log('\n❌ Failed to create webhook');
            console.log(`   Status: ${res.statusCode}`);
            
            if (response.message === 'Validation Failed') {
              console.log('   Error: Webhook URL invalid or duplicate webhook exists');
              if (response.errors) {
                response.errors.forEach(error => {
                  console.log(`   - ${error.message}`);
                });
              }
            } else {
              console.log(`   Error: ${response.message}`);
            }
            reject(new Error(response.message));
          }
        } catch (error) {
          console.log('\n❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('\n❌ Request failed:', error.message);
      reject(error);
    });

    req.write(JSON.stringify(webhookConfig));
    req.end();
  });
}

async function main() {
  console.log('🔧 Standard Vercel Webhook Creator');
  console.log('===================================');

  // Validate GitHub token
  if (!GITHUB_TOKEN) {
    console.error('❌ Missing GITHUB_TOKEN');
    console.log('1. Create token at: https://github.com/settings/tokens');
    console.log('2. Required scopes: repo, admin:repo_hook');
    console.log('3. Export token: export GITHUB_TOKEN="your_token_here"');
    console.log('4. Run script again');
    process.exit(1);
  }

  // Get Vercel project ID
  const projectId = getVercelProjectId();
  if (!projectId) {
    process.exit(1);
  }

  console.log(`📋 Project ID: ${projectId}`);

  // Generate standard Vercel webhook URL
  // This is the format Vercel uses for GitHub integration webhooks
  const webhookUrl = `https://api.vercel.com/v1/integrations/deploy/${projectId}/github`;
  
  console.log(`🎯 Generated webhook URL: ${webhookUrl}`);

  try {
    await createGitHubWebhook(webhookUrl);
    
    console.log('\n🧪 Test the webhook:');
    console.log('1. Make a small change to any file');
    console.log('2. Commit and push to main branch');
    console.log('3. Check Vercel dashboard for automatic deployment');
    
    console.log('\n🔍 Verification:');
    console.log('- GitHub repo → Settings → Webhooks (should show new Vercel webhook)');
    console.log('- Vercel dashboard → Project → Deployments (should show triggered deployments)');
    
  } catch (error) {
    console.error('\n❌ Failed to create webhook:', error.message);
    
    console.log('\n💡 Troubleshooting:');
    console.log('- Check if webhook already exists (duplicate error)');
    console.log('- Verify GitHub token has admin:repo_hook permission');
    console.log('- Ensure Vercel project is properly linked');
    
    process.exit(1);
  }
}

main().catch(console.error);