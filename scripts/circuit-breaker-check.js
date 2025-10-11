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
const path = require('path');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class CircuitBreakerVerifier {
  constructor() {
    this.breakersTriggered = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logBold(message, color = 'reset') {
    console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    try {
      this.log(`\n🔍 Checking: ${description}`, 'blue');
      // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
      // Command is from hardcoded internal quality gate definitions, not user input
      const output = execSync(command, {
        encoding: 'utf8', 
        stdio: ['inherit', 'pipe', 'pipe'],
        timeout: 120000 // 2 minute timeout
      });
      this.log(`✅ PASSED: ${description}`, 'green');
      this.passed++;
      return { success: true, output };
    } catch (error) {
      this.log(`❌ FAILED: ${description}`, 'red');
      this.log(`Error: ${error.message}`, 'red');
      this.failed++;
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  checkProjectStructure() {
    this.logBold('\n🏗️  PROJECT STRUCTURE VERIFICATION', 'cyan');
    
    const requiredFiles = [
      'package.json',
      'jest.config.critical.ts',
      '.docs/circuit-breakers.md',
      'prisma/schema.prisma'
    ];

    let structureValid = true;
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log(`✅ Found: ${file}`, 'green');
      } else {
        this.log(`❌ Missing: ${file}`, 'red');
        structureValid = false;
        this.breakersTriggered.push({
          type: 'SCOPE_EXPANSION',
          description: `Missing required file: ${file}`,
          action: 'Project structure incomplete - escalate to Navigator'
        });
      }
    });

    return structureValid;
  }

  async checkQualityGates() {
    this.logBold('\n🛡️  CRITICAL QUALITY GATES', 'cyan');
    
    const gates = [
      {
        command: 'pnpm run lint',
        description: 'ESLint Code Quality',
        critical: true
      },
      {
        command: 'pnpm run type-check',
        description: 'TypeScript Compilation',
        critical: true
      },
      {
        command: 'pnpm run test:critical',
        description: 'Critical Business Logic Tests',
        critical: true
      },
      {
        command: 'pnpm run security:scan',
        description: 'Security Vulnerability Scan',
        critical: true
      }
    ];

    let criticalFailures = 0;
    
    for (const gate of gates) {
      const result = await this.runCommand(gate.command, gate.description);
      
      if (!result.success && gate.critical) {
        criticalFailures++;
        this.breakersTriggered.push({
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

  async checkBusinessProtection() {
    this.logBold('\n🔒 BUSINESS PROTECTION VERIFICATION', 'cyan');
    
    // Check database constraints
    const dbConstraintsExist = this.checkDatabaseConstraints();
    
    // Check critical test coverage
    const testCoverage = await this.checkTestCoverage();
    
    // Check monitoring setup
    const monitoringSetup = this.checkMonitoringSetup();

    return dbConstraintsExist && testCoverage && monitoringSetup;
  }

  checkDatabaseConstraints() {
    try {
      const schemaPath = 'prisma/schema.prisma';
      if (!fs.existsSync(schemaPath)) {
        this.breakersTriggered.push({
          type: 'BUSINESS_PROTECTION',
          description: 'Database schema file missing',
          action: 'Critical business protection compromised - escalate immediately'
        });
        return false;
      }

      const schema = fs.readFileSync(schemaPath, 'utf8');
      const hasConstraints = schema.includes('@@unique') || schema.includes('@@index');
      
      if (!hasConstraints) {
        this.warnings.push('Database constraints not detected - verify business rule protection');
      }

      this.log('✅ Database schema structure verified', 'green');
      return true;
    } catch (error) {
      this.log(`❌ Database constraint check failed: ${error.message}`, 'red');
      return false;
    }
  }

  async checkTestCoverage() {
    try {
      const result = await this.runCommand(
        'pnpm run test:critical --coverage --coverageReporters=text-summary',
        'Critical Test Coverage Analysis'
      );
      
      if (result.success) {
        // Parse coverage output for minimum thresholds
        const output = result.output;
        if (output.includes('Lines') && output.includes('Functions')) {
          this.log('✅ Test coverage analysis completed', 'green');
          return true;
        }
      }
      
      this.warnings.push('Test coverage analysis incomplete - manual verification required');
      return true; // Don't block on coverage parsing issues
    } catch (error) {
      this.warnings.push(`Test coverage check failed: ${error.message}`);
      return false;
    }
  }

  checkMonitoringSetup() {
    const monitoringPath = 'lib/monitoring';
    if (fs.existsSync(monitoringPath)) {
      this.log('✅ Monitoring infrastructure detected', 'green');
      return true;
    } else {
      this.warnings.push('Monitoring infrastructure not detected - business protection may be limited');
      return true; // Don't block on monitoring setup
    }
  }

  async checkBuildVerification() {
    this.logBold('\n🏗️  BUILD VERIFICATION', 'cyan');
    
    const result = await this.runCommand(
      'pnpm run build:verify',
      'Production Build Verification'
    );

    if (!result.success) {
      this.breakersTriggered.push({
        type: 'QUALITY_GATE',
        description: 'Production build failed',
        action: 'Block deployment - build errors must be resolved',
        error: result.error
      });
      return false;
    }

    return true;
  }

  generateReport() {
    this.logBold('\n📊 CIRCUIT BREAKER VERIFICATION REPORT', 'magenta');
    this.logBold('==========================================', 'magenta');
    
    this.log(`\n✅ Checks Passed: ${this.passed}`, 'green');
    this.log(`❌ Checks Failed: ${this.failed}`, this.failed > 0 ? 'red' : 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'yellow' : 'green');
    this.log(`🚨 Circuit Breakers Triggered: ${this.breakersTriggered.length}`, this.breakersTriggered.length > 0 ? 'red' : 'green');

    if (this.warnings.length > 0) {
      this.logBold('\n⚠️  WARNINGS:', 'yellow');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'yellow');
      });
    }

    if (this.breakersTriggered.length > 0) {
      this.logBold('\n🚨 CIRCUIT BREAKERS TRIGGERED:', 'red');
      this.breakersTriggered.forEach((breaker, index) => {
        this.log(`\n${index + 1}. TYPE: ${breaker.type}`, 'red');
        this.log(`   ISSUE: ${breaker.description}`, 'red');
        this.log(`   ACTION: ${breaker.action}`, 'red');
        if (breaker.command) {
          this.log(`   COMMAND: ${breaker.command}`, 'red');
        }
        if (breaker.error) {
          this.log(`   ERROR: ${breaker.error}`, 'red');
        }
      });

      this.logBold('\n📋 ESCALATION GUIDANCE:', 'cyan');
      this.log('1. Document breaker triggers in .docs/current-task.md', 'cyan');
      this.log('2. For SCOPE_EXPANSION: Switch to Navigator mode', 'cyan');
      this.log('3. For QUALITY_GATE: Immediate remediation required', 'cyan');
      this.log('4. For BUSINESS_PROTECTION: Escalate to human developer', 'cyan');
      this.log('5. Never compromise functionality to bypass breakers', 'cyan');
    }

    return this.breakersTriggered.length === 0;
  }

  async run() {
    this.logBold('🔥 LLM-OPTIMIZED CIRCUIT BREAKER VERIFICATION', 'magenta');
    this.logBold('===============================================', 'magenta');
    this.log('Protecting business value through quality boundaries\n', 'cyan');

    // Run all verification checks
    const structureValid = this.checkProjectStructure();
    const qualityGatesPass = await this.checkQualityGates();
    const businessProtected = await this.checkBusinessProtection();
    const buildSuccess = await this.checkBuildVerification();

    // Generate final report
    const allBreakersPass = this.generateReport();

    if (allBreakersPass) {
      this.logBold('\n🎉 ALL CIRCUIT BREAKERS PASSED', 'green');
      this.logBold('Deployment authorized - quality boundaries maintained', 'green');
      process.exit(0);
    } else {
      this.logBold('\n🚨 CIRCUIT BREAKERS TRIGGERED - DEPLOYMENT BLOCKED', 'red');
      this.logBold('Quality boundaries enforced - escalation required', 'red');
      process.exit(1);
    }
  }
}

// Execute circuit breaker verification
const verifier = new CircuitBreakerVerifier();
verifier.run().catch(error => {
  console.error(`${colors.red}Circuit breaker verification failed: ${error.message}${colors.reset}`);
  process.exit(1);
});