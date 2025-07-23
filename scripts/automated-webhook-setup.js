#!/usr/bin/env node

/**
 * Automated Webhook Setup
 * 
 * Uses GitHub CLI and Vercel API to fully automate webhook creation
 */

const { execSync } = require('child_process');
const https = require('https');

const REPO_OWNER = 'jovial-banana-9934';
const REPO_NAME = 'moodovermuscle-website';

function runCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (!options.silent) {
      console.error(`❌ Command failed: ${command}`);
      console.error(error.message);
    }
    throw error;
  }
}

function checkCLITools() {
  const tools = [
    { name: 'GitHub CLI', command: 'gh --version', install: 'https://cli.github.com/' },
    { name: 'Vercel CLI', command: 'vercel --version', install: 'npm i -g vercel' }
  ];

  for (const tool of tools) {
    try {
      runCommand(tool.command, { silent: true });
      console.log(`✅ ${tool.name} is available`);
    } catch (error) {
      console.log(`❌ ${tool.name} not found`);
      console.log(`   Install: ${tool.install}`);
      return false;
    }
  }
  return true;
}

async function getVercelDeployHook() {
  console.log('\n🔗 Getting Vercel deploy hook URL...');
  
  try {
    // Get project info
    const projectInfo = runCommand('vercel project ls --format json', { silent: true });
    const projects = JSON.parse(projectInfo);
    const project = projects.find(p => p.name === 'moodovermuscle');
    
    if (!project) {
      throw new Error('Project moodovermuscle not found');
    }

    // Create deploy hook via Vercel API
    const deployHookData = {
      name: 'GitHub Integration',
      ref: 'main'
    };

    // This would require Vercel API token - showing the concept
    console.log('💡 Deploy hook creation requires Vercel API token');
    console.log('Alternative: Create manually in Vercel dashboard');
    console.log('Go to: Project Settings → Git → Deploy Hooks');
    
    return null; // Would return actual URL with API token
  } catch (error) {
    console.log('❌ Could not get deploy hook automatically');
    console.log('Please create manually in Vercel dashboard');
    return null;
  }
}

async function createGitHubWebhook(webhookUrl) {
  console.log('\n🐙 Creating GitHub webhook...');
  
  const webhookConfig = {
    url: webhookUrl,
    content_type: 'json',
    events: ['push', 'pull_request'],
    active: true
  };

  try {
    // Use GitHub CLI to create webhook
    const command = `gh api repos/${REPO_OWNER}/${REPO_NAME}/hooks -X POST -f name=web -f active=true -F 'config[url]=${webhookUrl}' -F 'config[content_type]=json' -F 'events[]=push' -F 'events[]=pull_request'`;
    
    const result = runCommand(command, { silent: true });
    const webhook = JSON.parse(result);
    
    console.log('✅ GitHub webhook created successfully!');
    console.log(`   Webhook ID: ${webhook.id}`);
    console.log(`   URL: ${webhook.config.url}`);
    console.log(`   Events: ${webhook.events.join(', ')}`);
    
    return webhook;
  } catch (error) {
    console.log('❌ Failed to create GitHub webhook');
    console.log('This might be due to:');
    console.log('- Duplicate webhook already exists');
    console.log('- Insufficient GitHub permissions');
    console.log('- Invalid webhook URL');
    throw error;
  }
}

async function main() {
  console.log('🤖 Automated Webhook Setup');
  console.log('===========================');

  // Check required CLI tools
  if (!checkCLITools()) {
    console.log('\n❌ Missing required CLI tools');
    process.exit(1);
  }

  // Check GitHub authentication
  try {
    runCommand('gh auth status', { silent: true });
    console.log('✅ GitHub CLI authenticated');
  } catch (error) {
    console.log('🔐 Please authenticate with GitHub CLI...');
    runCommand('gh auth login');
  }

  // Check Vercel authentication
  try {
    runCommand('vercel whoami', { silent: true });
    console.log('✅ Vercel CLI authenticated');
  } catch (error) {
    console.log('🔐 Please authenticate with Vercel CLI...');
    runCommand('vercel login');
  }

  console.log('\n📋 Manual Steps Required:');
  console.log('1. Go to Vercel Dashboard → moodovermuscle project');
  console.log('2. Settings → Git → Deploy Hooks');
  console.log('3. Create new deploy hook:');
  console.log('   - Name: "GitHub Integration"');
  console.log('   - Branch: main (or leave empty for all branches)');
  console.log('4. Copy the generated webhook URL');
  console.log('5. Set environment variable: export VERCEL_WEBHOOK_URL="your_url"');
  console.log('6. Run: pnpm run manual-webhook');

  console.log('\n💡 Fully automated setup requires Vercel API token');
  console.log('For now, use the manual steps above or the Vercel CLI integration');
}

main().catch(console.error);