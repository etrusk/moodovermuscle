#!/usr/bin/env node

/**
 * Preview-First Workflow Integration Script
 * 
 * Manages functionality change detection, branch creation, and client approval workflows
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let workflowState = loadWorkflowState();

function log(message, type = 'info') {
  const emoji = { info: '🔵', success: '✅', warning: '⚠️', error: '❌', workflow: '🔄' }[type] || 'ℹ️';
  console.log(`${emoji} ${message}`);
}

function loadWorkflowState() {
  const statePath = path.join(process.cwd(), '.preview-workflow-state.json');
  try {
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }
  } catch (error) {
    log(`Warning: Could not load workflow state: ${error.message}`, 'warning');
  }
  
  return {
    currentBranch: null,
    previewUrl: null,
    approvalStatus: 'pending',
    lastFunctionalityCheck: null,
    functionalityChanges: []
  };
}

function saveWorkflowState() {
  const statePath = path.join(process.cwd(), '.preview-workflow-state.json');
  try {
    fs.writeFileSync(statePath, JSON.stringify(workflowState, null, 2));
    log('Workflow state saved', 'info');
  } catch (error) {
    log(`Error saving workflow state: ${error.message}`, 'error');
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    log(`Error getting current branch: ${error.message}`, 'error');
    return null;
  }
}

function detectFunctionalityChanges() {
  log('🔍 Detecting functionality changes...', 'workflow');
  
  const functionalityPatterns = [
    'app/api/**/*.ts',
    'components/**/*.tsx',
    'prisma/schema.prisma',
    'lib/auth/**/*',
    'lib/**/*.ts'
  ];

  try {
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim());

    const functionalityChanges = changedFiles.filter(file =>
      functionalityPatterns.some(pattern => {
        return file.match(pattern.replace('**/*', '.*').replace('*', '[^/]*'));
      })
    );

    workflowState.functionalityChanges = functionalityChanges;
    workflowState.lastFunctionalityCheck = new Date().toISOString();

    if (functionalityChanges.length > 0) {
      log(`🔧 Detected ${functionalityChanges.length} functionality changes:`, 'workflow');
      functionalityChanges.forEach(file => log(`   - ${file}`, 'info'));
      return true;
    } else {
      log('✨ No functionality changes detected', 'success');
      return false;
    }
  } catch (error) {
    log(`Error detecting changes: ${error.message}`, 'error');
    return false;
  }
}

async function createPreviewBranch() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `preview/functionality-changes-${timestamp}`;
  
  try {
    log(`🌿 Creating preview branch: ${branchName}`, 'workflow');
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    
    workflowState.currentBranch = branchName;
    workflowState.approvalStatus = 'pending';
    
    log(`✅ Preview branch created: ${branchName}`, 'success');
    return branchName;
  } catch (error) {
    log(`Error creating preview branch: ${error.message}`, 'error');
    throw error;
  }
}

async function deployToVercelPreview() {
  log('🚀 Deploying to Vercel Preview...', 'workflow');
  
  try {
    const currentBranch = getCurrentBranch();
    execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
    
    const previewUrl = `https://${currentBranch.replace(/[^a-z0-9]/g, '-')}-moodovermuscle.vercel.app`;
    workflowState.previewUrl = previewUrl;
    
    log(`🌐 Preview deployed: ${previewUrl}`, 'success');
    return previewUrl;
  } catch (error) {
    log(`Error deploying to Vercel: ${error.message}`, 'error');
    throw error;
  }
}

function generateClientApprovalPrompt() {
  const { previewUrl, functionalityChanges } = workflowState;
  
  const promptText = `
🔄 FUNCTIONALITY CHANGES DETECTED - CLIENT APPROVAL REQUIRED

Preview URL: ${previewUrl || 'Pending deployment...'}

Changes detected in:
${functionalityChanges.map(file => `  • ${file}`).join('\n')}

Please review the preview and confirm:
1. All functionality works as expected
2. No regressions in existing features  
3. User experience is satisfactory
4. Ready for production deployment

To approve: Run 'pnpm run workflow:approve'
To reject: Run 'pnpm run workflow:reject'
  `;

  log(promptText, 'workflow');
  
  const promptPath = path.join(process.cwd(), '.client-approval-prompt.txt');
  fs.writeFileSync(promptPath, promptText);
  
  log(`📋 Client approval prompt saved to: .client-approval-prompt.txt`, 'info');
}

async function handleApproval() {
  log('✅ Client approval received - proceeding with production deployment', 'success');
  
  try {
    execSync('git checkout main', { stdio: 'inherit' });
    execSync(`git merge ${workflowState.currentBranch}`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    
    workflowState.approvalStatus = 'approved';
    log('🚀 Changes merged to main and deployed to production', 'success');
    
    execSync(`git branch -d ${workflowState.currentBranch}`, { stdio: 'inherit' });
    execSync(`git push origin --delete ${workflowState.currentBranch}`, { stdio: 'inherit' });
    
    workflowState = {
      currentBranch: null,
      previewUrl: null,
      approvalStatus: 'pending',
      lastFunctionalityCheck: null,
      functionalityChanges: []
    };
  } catch (error) {
    log(`Error handling approval: ${error.message}`, 'error');
    throw error;
  }
}

async function handleRejection() {
  log('❌ Client approval rejected - reverting changes', 'warning');
  
  try {
    execSync('git checkout main', { stdio: 'inherit' });
    workflowState.approvalStatus = 'rejected';
    log('🔄 Reverted to main branch', 'info');
    log(`🛠️  Preview branch ${workflowState.currentBranch} preserved for rework`, 'info');
  } catch (error) {
    log(`Error handling rejection: ${error.message}`, 'error');
    throw error;
  }
}

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'detect':
        const hasChanges = detectFunctionalityChanges();
        saveWorkflowState();
        process.exit(hasChanges ? 1 : 0);
        break;
        
      case 'create-preview':
        await createPreviewBranch();
        await deployToVercelPreview();
        generateClientApprovalPrompt();
        saveWorkflowState();
        break;
        
      case 'approve':
        await handleApproval();
        saveWorkflowState();
        break;
        
      case 'reject':
        await handleRejection();  
        saveWorkflowState();
        break;
        
      default:
        console.log(`
Usage: pnpm run preview-workflow <command>

Commands:
  detect          - Detect functionality changes
  create-preview  - Create preview branch and deploy
  approve         - Approve changes and deploy to production
  reject          - Reject changes and revert
        `);
        process.exit(1);
    }
  } catch (error) {
    log(`💥 Preview workflow failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { detectFunctionalityChanges };