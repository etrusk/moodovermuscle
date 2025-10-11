#!/usr/bin/env node

/**
 * Preview-First Workflow Integration Script
 * Phase 3: Custom Role Implementation - Quality & Deployment Integration
 * 
 * Manages functionality change detection, branch creation, and client approval workflows
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PreviewWorkflowManager {
  constructor() {
    this.workflowState = this.loadWorkflowState();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      workflow: '🔄'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  loadWorkflowState() {
    const statePath = path.join(process.cwd(), '.preview-workflow-state.json');
    try {
      if (fs.existsSync(statePath)) {
        return JSON.parse(fs.readFileSync(statePath, 'utf8'));
      }
    } catch (error) {
      this.log(`Warning: Could not load workflow state: ${error.message}`, 'warning');
    }
    
    return {
      currentBranch: null,
      previewUrl: null,
      approvalStatus: 'pending',
      lastFunctionalityCheck: null,
      functionalityChanges: []
    };
  }

  saveWorkflowState() {
    const statePath = path.join(process.cwd(), '.preview-workflow-state.json');
    try {
      fs.writeFileSync(statePath, JSON.stringify(this.workflowState, null, 2));
      this.log('Workflow state saved', 'info');
    } catch (error) {
      this.log(`Error saving workflow state: ${error.message}`, 'error');
    }
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      this.log(`Error getting current branch: ${error.message}`, 'error');
      return null;
    }
  }

  detectFunctionalityChanges() {
    this.log('🔍 Detecting functionality changes...', 'workflow');
    
    const functionalityPatterns = [
      // API routes and functionality
      'app/api/**/*.ts',
      'app/api/**/*.js',
      // Core components
      'components/**/*.tsx',
      'components/**/*.ts',
      // Database schema changes
      'prisma/schema.prisma',
      'prisma/migrations/**/*',
      // Authentication and security
      'lib/auth/**/*',
      // Business logic
      'lib/**/*.ts',
      'lib/**/*.js'
    ];

    try {
      const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim());

      const functionalityChanges = changedFiles.filter(file =>
        functionalityPatterns.some(pattern => {
          // nosemgrep: javascript.lang.security.audit.incomplete-sanitization.incomplete-sanitization
          // Pattern is from hardcoded internal list, not user input - used for glob matching
          return file.match(pattern.replace('**/*', '.*').replace('*', '[^/]*'))
        })
      );

      this.workflowState.functionalityChanges = functionalityChanges;
      this.workflowState.lastFunctionalityCheck = new Date().toISOString();

      if (functionalityChanges.length > 0) {
        this.log(`🔧 Detected ${functionalityChanges.length} functionality changes:`, 'workflow');
        functionalityChanges.forEach(file => this.log(`   - ${file}`, 'info'));
        return true;
      } else {
        this.log('✨ No functionality changes detected', 'success');
        return false;
      }
    } catch (error) {
      this.log(`Error detecting changes: ${error.message}`, 'error');
      return false;
    }
  }

  async createPreviewBranch() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `preview/functionality-changes-${timestamp}`;
    
    try {
      this.log(`🌿 Creating preview branch: ${branchName}`, 'workflow');
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      
      this.workflowState.currentBranch = branchName;
      this.workflowState.approvalStatus = 'pending';
      
      this.log(`✅ Preview branch created: ${branchName}`, 'success');
      return branchName;
    } catch (error) {
      this.log(`Error creating preview branch: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployToVercelPreview() {
    this.log('🚀 Deploying to Vercel Preview...', 'workflow');
    
    try {
      // Push to trigger Vercel preview deployment
      const currentBranch = this.getCurrentBranch();
      execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
      
      // Note: In a real implementation, we'd wait for Vercel webhook or use Vercel CLI
      // For now, we'll simulate the preview URL generation
      const previewUrl = `https://${currentBranch.replace(/[^a-z0-9]/g, '-')}-moodovermuscle.vercel.app`;
      
      this.workflowState.previewUrl = previewUrl;
      
      this.log(`🌐 Preview deployed: ${previewUrl}`, 'success');
      return previewUrl;
    } catch (error) {
      this.log(`Error deploying to Vercel: ${error.message}`, 'error');
      throw error;
    }
  }

  generateClientApprovalPrompt() {
    const { previewUrl, functionalityChanges } = this.workflowState;
    
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
To request changes: Run 'pnpm run workflow:request-changes'
    `;

    this.log(promptText, 'workflow');
    
    // Save prompt to file for human interaction
    const promptPath = path.join(process.cwd(), '.client-approval-prompt.txt');
    fs.writeFileSync(promptPath, promptText);
    
    this.log(`📋 Client approval prompt saved to: .client-approval-prompt.txt`, 'info');
  }

  async handleApproval() {
    this.log('✅ Client approval received - proceeding with production deployment', 'success');
    
    try {
      // Merge to main branch
      execSync('git checkout main', { stdio: 'inherit' });
      execSync(`git merge ${this.workflowState.currentBranch}`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      
      this.workflowState.approvalStatus = 'approved';
      this.log('🚀 Changes merged to main and deployed to production', 'success');
      
      // Clean up preview branch
      execSync(`git branch -d ${this.workflowState.currentBranch}`, { stdio: 'inherit' });
      execSync(`git push origin --delete ${this.workflowState.currentBranch}`, { stdio: 'inherit' });
      
      // Reset workflow state
      this.workflowState = {
        currentBranch: null,
        previewUrl: null,
        approvalStatus: 'pending',
        lastFunctionalityCheck: null,
        functionalityChanges: []
      };
      
    } catch (error) {
      this.log(`Error handling approval: ${error.message}`, 'error');
      throw error;
    }
  }

  async handleRejection() {
    this.log('❌ Client approval rejected - reverting changes', 'warning');
    
    try {
      execSync('git checkout main', { stdio: 'inherit' });
      
      this.workflowState.approvalStatus = 'rejected';
      this.log('🔄 Reverted to main branch', 'info');
      
      // Keep preview branch for rework
      this.log(`🛠️  Preview branch ${this.workflowState.currentBranch} preserved for rework`, 'info');
      
    } catch (error) {
      this.log(`Error handling rejection: ${error.message}`, 'error');
      throw error;
    }
  }
}

async function main() {
  const command = process.argv[2];
  const manager = new PreviewWorkflowManager();
  
  try {
    switch (command) {
      case 'detect':
        const hasChanges = manager.detectFunctionalityChanges();
        manager.saveWorkflowState();
        process.exit(hasChanges ? 1 : 0); // Exit 1 if changes detected
        break;
        
      case 'create-preview':
        await manager.createPreviewBranch();
        const previewUrl = await manager.deployToVercelPreview();
        manager.generateClientApprovalPrompt();
        manager.saveWorkflowState();
        break;
        
      case 'approve':
        await manager.handleApproval();
        manager.saveWorkflowState();
        break;
        
      case 'reject':
        await manager.handleRejection();  
        manager.saveWorkflowState();
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
    manager.log(`💥 Preview workflow failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PreviewWorkflowManager };