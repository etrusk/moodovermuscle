#!/usr/bin/env node

/**
 * Circuit Breaker Verification Script
 * 
 * Enforces LLM-optimized quality framework boundaries
 * Blocks deployments on critical quality failures
 * Provides clear escalation paths when breakers triggered
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Color codes for terminal output
const c = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const state = {
  breakersTriggered: [],
  warnings: [],
  passed: 0,
  failed: 0
};

function log(message, color = 'reset') {
  console.log(`${c[color]}${message}${c.reset}`);
}

function logBold(message, color = 'reset') {
  console.log(`${c.bold}${c[color]}${message}${c.reset}`);
}

async function runCommand(command, description) {
  try {
    log(`\n🔍 Checking: ${description}`, 'blue');
    const output = execSync(command, {
      encoding: 'utf8', 
      stdio: ['inherit', 'pipe', 'pipe'],
      timeout: 120000
    });
    log(`✅ PASSED: ${description}`, 'green');
    state.passed++;
    return { success: true, output };
  } catch (error) {
    log(`❌ FAILED: ${description}`, 'red');
    log(`Error: ${error.message}`, 'red');
    state.failed++;
    return { success: false, error: error.message, output: error.stdout };
  }
}

function checkProjectStructure() {
  logBold('\n🏗️  PROJECT STRUCTURE VERIFICATION', 'cyan');
  
  const requiredFiles = [
    'package.json',
    'jest.config.critical.ts',
    '.docs/circuit-breakers.md',
    'prisma/schema.prisma'
  ];

  let structureValid = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ Found: ${file}`, 'green');
    } else {
      log(`❌ Missing: ${file}`, 'red');
      structureValid = false;
      state.breakersTriggered.push({
        type: 'SCOPE_EXPANSION',
        description: `Missing required file: ${file}`,
        action: 'Project structure incomplete - escalate to Navigator'
      });
    }
  });

  return structureValid;
}

async function checkQualityGates() {
  logBold('\n🛡️  CRITICAL QUALITY GATES', 'cyan');
  
  const gates = [
    { command: 'pnpm run lint', description: 'ESLint Code Quality', critical: true },
    { command: 'pnpm run type-check', description: 'TypeScript Compilation', critical: true },
    { command: 'pnpm run test:critical', description: 'Critical Business Logic Tests', critical: true },
    { command: 'pnpm run security:scan', description: 'Security Vulnerability Scan', critical: true }
  ];

  let criticalFailures = 0;
  
  for (const gate of gates) {
    const result = await runCommand(gate.command, gate.description);
    
    if (!result.success && gate.critical) {
      criticalFailures++;
      state.breakersTriggered.push({
        type: 'QUALITY_GATE',
        description: `Critical quality gate failure: ${gate.description}`,
        action: 'Block deployment - immediate remediation required',
        command: gate.command,
        error: result.error
      });
    }
  }

  return criticalFailures === 0;
}

function checkDatabaseConstraints() {
  try {
    const schemaPath = 'prisma/schema.prisma';
    if (!fs.existsSync(schemaPath)) {
      state.breakersTriggered.push({
        type: 'BUSINESS_PROTECTION',
        description: 'Database schema file missing',
        action: 'Critical business protection compromised - escalate immediately'
      });
      return false;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    const hasConstraints = schema.includes('@@unique') || schema.includes('@@index');
    
    if (!hasConstraints) {
      state.warnings.push('Database constraints not detected - verify business rule protection');
    }

    log('✅ Database schema structure verified', 'green');
    return true;
  } catch (error) {
    log(`❌ Database constraint check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkBusinessProtection() {
  logBold('\n🔒 BUSINESS PROTECTION VERIFICATION', 'cyan');
  
  const dbConstraintsExist = checkDatabaseConstraints();
  
  const monitoringPath = 'lib/monitoring';
  const monitoringSetup = fs.existsSync(monitoringPath);
  if (monitoringSetup) {
    log('✅ Monitoring infrastructure detected', 'green');
  } else {
    state.warnings.push('Monitoring infrastructure not detected - business protection may be limited');
  }

  return dbConstraintsExist;
}

async function checkBuildVerification() {
  logBold('\n🏗️  BUILD VERIFICATION', 'cyan');
  
  const result = await runCommand('pnpm run build:verify', 'Production Build Verification');

  if (!result.success) {
    state.breakersTriggered.push({
      type: 'QUALITY_GATE',
      description: 'Production build failed',
      action: 'Block deployment - build errors must be resolved',
      error: result.error
    });
    return false;
  }

  return true;
}

function generateReport() {
  logBold('\n📊 CIRCUIT BREAKER VERIFICATION REPORT', 'magenta');
  logBold('==========================================', 'magenta');
  
  log(`\n✅ Checks Passed: ${state.passed}`, 'green');
  log(`❌ Checks Failed: ${state.failed}`, state.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${state.warnings.length}`, state.warnings.length > 0 ? 'yellow' : 'green');
  log(`🚨 Circuit Breakers Triggered: ${state.breakersTriggered.length}`, state.breakersTriggered.length > 0 ? 'red' : 'green');

  if (state.warnings.length > 0) {
    logBold('\n⚠️  WARNINGS:', 'yellow');
    state.warnings.forEach((warning, index) => {
      log(`${index + 1}. ${warning}`, 'yellow');
    });
  }

  if (state.breakersTriggered.length > 0) {
    logBold('\n🚨 CIRCUIT BREAKERS TRIGGERED:', 'red');
    state.breakersTriggered.forEach((breaker, index) => {
      log(`\n${index + 1}. TYPE: ${breaker.type}`, 'red');
      log(`   ISSUE: ${breaker.description}`, 'red');
      log(`   ACTION: ${breaker.action}`, 'red');
      if (breaker.command) log(`   COMMAND: ${breaker.command}`, 'red');
      if (breaker.error) log(`   ERROR: ${breaker.error}`, 'red');
    });

    logBold('\n📋 ESCALATION GUIDANCE:', 'cyan');
    log('1. Document breaker triggers in .docs/current-task.md', 'cyan');
    log('2. For SCOPE_EXPANSION: Switch to Navigator mode', 'cyan');
    log('3. For QUALITY_GATE: Immediate remediation required', 'cyan');
    log('4. For BUSINESS_PROTECTION: Escalate to human developer', 'cyan');
    log('5. Never compromise functionality to bypass breakers', 'cyan');
  }

  return state.breakersTriggered.length === 0;
}

function showStatus() {
  logBold('🔥 CIRCUIT BREAKER FRAMEWORK STATUS', 'magenta');
  logBold('====================================', 'magenta');
  
  log('Framework Version: 1.0.0', 'cyan');
  log(`Status Check Time: ${new Date().toISOString()}`, 'cyan');
  log('LLM-Optimized Quality Boundaries: ACTIVE\n', 'green');

  logBold('📁 FRAMEWORK COMPONENT STATUS', 'blue');
  
  const components = [
    { file: '.docs/circuit-breakers.md', name: 'Circuit Breaker Definitions', critical: true },
    { file: 'scripts/circuit-breaker-check.js', name: 'Verification Script', critical: true },
    { file: 'jest.config.critical.ts', name: 'Critical Test Configuration', critical: true },
    { file: '.docs/testing-approach-llm-optimized.md', name: 'LLM Testing Strategy', critical: false },
    { file: 'lib/monitoring/', name: 'Monitoring Infrastructure', critical: false },
    { file: '.husky/pre-commit', name: 'Pre-commit Hooks', critical: false }
  ];

  let criticalMissing = 0;
  let optionalMissing = 0;

  components.forEach(component => {
    const exists = fs.existsSync(component.file);
    const status = exists ? '✅' : '❌';
    const color = exists ? 'green' : (component.critical ? 'red' : 'yellow');
    
    log(`${status} ${component.name}`, color);
    
    if (!exists) {
      if (component.critical) criticalMissing++;
      else optionalMissing++;
    }
  });

  log(`\nCritical Components Missing: ${criticalMissing}`, criticalMissing > 0 ? 'red' : 'green');
  log(`Optional Components Missing: ${optionalMissing}`, optionalMissing > 0 ? 'yellow' : 'green');

  logBold('\n🚀 USAGE GUIDANCE', 'blue');
  log('\nDEVELOPMENT WORKFLOW:', 'cyan');
  log('1. pnpm run circuit-breakers:verify --status    # Check framework health', 'white');
  log('2. pnpm run circuit-breakers:verify            # Verify before commit', 'white');
  log('3. pnpm run deploy:verify                      # Full pre-deployment check', 'white');

  logBold('\n🏥 FRAMEWORK HEALTH ASSESSMENT', 'magenta');
  const health = criticalMissing === 0 ? 'HEALTHY' : 'NEEDS ATTENTION';
  logBold(`Overall Status: ${health}`, health === 'HEALTHY' ? 'green' : 'yellow');
}

async function runVerification() {
  logBold('🔥 LLM-OPTIMIZED CIRCUIT BREAKER VERIFICATION', 'magenta');
  logBold('===============================================', 'magenta');
  log('Protecting business value through quality boundaries\n', 'cyan');

  checkProjectStructure();
  await checkQualityGates();
  await checkBusinessProtection();
  await checkBuildVerification();

  const allBreakersPass = generateReport();

  if (allBreakersPass) {
    logBold('\n🎉 ALL CIRCUIT BREAKERS PASSED', 'green');
    logBold('Deployment authorized - quality boundaries maintained', 'green');
    process.exit(0);
  } else {
    logBold('\n🚨 CIRCUIT BREAKERS TRIGGERED - DEPLOYMENT BLOCKED', 'red');
    logBold('Quality boundaries enforced - escalation required', 'red');
    process.exit(1);
  }
}

// Execute based on CLI argument
const args = process.argv.slice(2);
if (args.includes('--status')) {
  showStatus();
} else {
  runVerification().catch(error => {
    console.error(`${c.red}Circuit breaker verification failed: ${error.message}${c.reset}`);
    process.exit(1);
  });
}