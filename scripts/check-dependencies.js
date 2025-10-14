#!/usr/bin/env node

/**
 * Dependency Check Script for MoodOverMuscle
 * Provides structured output for Roo Code dependency mode
 */

const { execSync } = require('child_process');

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return error.stdout || error.message;
  }
}

function checkOutdated() {
  console.log('🔍 Checking for outdated packages...\n');
  
  try {
    const output = runCommand('pnpm outdated --format json');
    const outdated = JSON.parse(output);
    
    if (Object.keys(outdated).length === 0) {
      console.log('✅ All packages are up to date!\n');
      return { patch: [], minor: [], major: [] };
    }
    
    const categorized = { patch: [], minor: [], major: [] };
    
    Object.entries(outdated).forEach(([pkg, info]) => {
      const current = info.current;
      const latest = info.latest;
      const type = info.type || 'dependencies';
      
      const [currMajor, currMinor, currPatch] = current.split('.').map(Number);
      const [latestMajor, latestMinor, latestPatch] = latest.split('.').map(Number);
      
      const update = { pkg, current, latest, type };
      
      if (latestMajor > currMajor) {
        categorized.major.push(update);
      } else if (latestMinor > currMinor) {
        categorized.minor.push(update);
      } else if (latestPatch > currPatch) {
        categorized.patch.push(update);
      }
    });
    
    if (categorized.patch.length > 0) {
      console.log('🔧 Patch Updates (auto-apply):');
      categorized.patch.forEach(u => {
        console.log(`   ${u.pkg}: ${u.current} → ${u.latest}`);
      });
      console.log();
    }
    
    if (categorized.minor.length > 0) {
      console.log('✨ Minor Updates (auto-apply):');
      categorized.minor.forEach(u => {
        console.log(`   ${u.pkg}: ${u.current} → ${u.latest}`);
      });
      console.log();
    }
    
    if (categorized.major.length > 0) {
      console.log('⚠️  Major Updates (requires review):');
      categorized.major.forEach(u => {
        console.log(`   ${u.pkg}: ${u.current} → ${u.latest}`);
      });
      console.log();
    }
    
    return categorized;
  } catch (error) {
    console.error('❌ Error checking outdated:', error.message);
    return { patch: [], minor: [], major: [] };
  }
}

function checkSecurity() {
  console.log('🔒 Checking for security vulnerabilities...\n');
  
  try {
    const output = runCommand('pnpm audit --json');
    const audit = JSON.parse(output);
    
    const vulns = audit.metadata?.vulnerabilities || {};
    const total = Object.values(vulns).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      console.log('✅ No security vulnerabilities found!\n');
      return [];
    }
    
    console.log(`⚠️  Found ${total} vulnerabilities:`);
    if (vulns.critical) console.log(`   🔴 Critical: ${vulns.critical}`);
    if (vulns.high) console.log(`   🟠 High: ${vulns.high}`);
    if (vulns.moderate) console.log(`   🟡 Moderate: ${vulns.moderate}`);
    if (vulns.low) console.log(`   🟢 Low: ${vulns.low}`);
    console.log();
    
    return audit.advisories || [];
  } catch (error) {
    console.error('❌ Error checking security:', error.message);
    return [];
  }
}

function generateReport() {
  console.log('═══════════════════════════════════════════════════');
  console.log('📦 DEPENDENCY STATUS REPORT');
  console.log('═══════════════════════════════════════════════════\n');
  
  const outdated = checkOutdated();
  const vulnerabilities = checkSecurity();
  
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════\n');
  
  const totalNonBreaking = outdated.patch.length + outdated.minor.length;
  const totalMajor = outdated.major.length;
  const totalVulns = vulnerabilities.length;
  
  if (totalVulns > 0) {
    console.log('🔴 PRIORITY: Security vulnerabilities detected');
    console.log('   Action: Run in dependency mode: "Fix security vulnerabilities"\n');
  }
  
  if (totalNonBreaking > 0) {
    console.log('✅ Safe to auto-apply:');
    console.log(`   ${totalNonBreaking} patch/minor updates`);
    console.log('   Action: Run in dependency mode: "Apply patch and minor updates"\n');
  }
  
  if (totalMajor > 0) {
    console.log('⚠️  Requires review:');
    console.log(`   ${totalMajor} major updates`);
    console.log('   Action: Create feature branches per major update\n');
  }
  
  if (totalVulns === 0 && totalNonBreaking === 0 && totalMajor === 0) {
    console.log('🎉 Everything is up to date and secure!\n');
  }
  
  console.log('═══════════════════════════════════════════════════');
}

if (require.main === module) {
  generateReport();
}

module.exports = { checkOutdated, checkSecurity };