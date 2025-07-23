#!/usr/bin/env node

/**
 * Vercel CLI Integration Setup
 * 
 * Uses Vercel CLI to set up GitHub integration with webhooks
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log(`Running: ${command}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI not found');
    console.log('Install with: npm i -g vercel');
    return false;
  }
}

async function main() {
  console.log('🚀 Vercel CLI Integration Setup');
  console.log('================================');

  // Check if Vercel CLI is installed
  if (!checkVercelCLI()) {
    console.log('\n📦 Installing Vercel CLI...');
    if (!runCommand('npm install -g vercel', 'Installing Vercel CLI globally')) {
      process.exit(1);
    }
  }

  console.log('\n✅ Vercel CLI is available');

  // Login to Vercel (if not already logged in)
  console.log('\n🔐 Checking Vercel authentication...');
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Already logged in to Vercel');
  } catch (error) {
    console.log('🔐 Please log in to Vercel...');
    if (!runCommand('vercel login', 'Logging in to Vercel')) {
      process.exit(1);
    }
  }

  // Link project to existing Vercel project
  console.log('\n🔗 Linking to existing Vercel project...');
  if (!runCommand('vercel link --yes', 'Linking to moodovermuscle project')) {
    console.log('💡 If linking failed, the project might need to be created first');
    console.log('Try: vercel --prod');
    process.exit(1);
  }

  // Set up GitHub integration
  console.log('\n🐙 Setting up GitHub integration...');
  console.log('This will:');
  console.log('- Connect your GitHub repository');
  console.log('- Create the necessary webhook');
  console.log('- Enable automatic deployments');
  
  if (!runCommand('vercel git connect', 'Connecting GitHub repository')) {
    console.log('💡 Alternative: Use Vercel dashboard to connect GitHub');
    console.log('Go to: https://vercel.com/dashboard → Project → Settings → Git');
  }

  console.log('\n✅ Setup complete!');
  console.log('\n🧪 Test the integration:');
  console.log('1. Make a small change to any file');
  console.log('2. Commit and push to main branch');
  console.log('3. Check Vercel dashboard for automatic deployment');
  
  console.log('\n🔍 Verify webhook creation:');
  console.log('- GitHub repo → Settings → Webhooks');
  console.log('- Should see Vercel webhook with push/pull_request events');
}

main().catch(console.error);