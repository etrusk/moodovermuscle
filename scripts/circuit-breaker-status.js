#!/usr/bin/env node

/**
 * Circuit Breaker Status Script
 * 
 * Provides real-time status of circuit breaker framework
 * Shows quality gate health and escalation guidance
 */

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

class CircuitBreakerStatus {
  constructor() {
    this.frameworkVersion = '1.0.0';
    this.lastCheck = new Date().toISOString();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logBold(message, color = 'reset') {
    console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
  }

  showFrameworkStatus() {
    this.logBold('🔥 CIRCUIT BREAKER FRAMEWORK STATUS', 'magenta');
    this.logBold('====================================', 'magenta');
    
    this.log(`Framework Version: ${this.frameworkVersion}`, 'cyan');
    this.log(`Status Check Time: ${this.lastCheck}`, 'cyan');
    this.log('LLM-Optimized Quality Boundaries: ACTIVE\n', 'green');
  }

  checkFrameworkFiles() {
    this.logBold('📁 FRAMEWORK COMPONENT STATUS', 'blue');
    
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
      
      this.log(`${status} ${component.name}`, color);
      
      if (!exists) {
        if (component.critical) {
          criticalMissing++;
        } else {
          optionalMissing++;
        }
      }
    });

    this.log(`\nCritical Components Missing: ${criticalMissing}`, criticalMissing > 0 ? 'red' : 'green');
    this.log(`Optional Components Missing: ${optionalMissing}`, optionalMissing > 0 ? 'yellow' : 'green');

    return criticalMissing === 0;
  }

  showQualityGateStatus() {
    this.logBold('\n🛡️  QUALITY GATE CONFIGURATION', 'blue');
    
    const gates = [
      { name: 'ESLint Code Quality', script: 'lint', critical: true },
      { name: 'TypeScript Compilation', script: 'type-check', critical: true },
      { name: 'Critical Tests', script: 'test:critical', critical: true },
      { name: 'Security Scan', script: 'security:scan', critical: true },
      { name: 'Build Verification', script: 'build:verify', critical: true },
      { name: 'E2E Tests', script: 'test:e2e', critical: false },
      { name: 'Accessibility Tests', script: 'test:accessibility:unit', critical: false }
    ];

    // Check if package.json has the required scripts
    let packageJson = {};
    try {
      packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    } catch (error) {
      this.log('❌ Unable to read package.json', 'red');
      return false;
    }

    let criticalGatesMissing = 0;

    gates.forEach(gate => {
      const hasScript = packageJson.scripts && packageJson.scripts[gate.script];
      const status = hasScript ? '✅' : '❌';
      const color = hasScript ? 'green' : (gate.critical ? 'red' : 'yellow');
      const criticalLabel = gate.critical ? ' [CRITICAL]' : ' [OPTIONAL]';
      
      this.log(`${status} ${gate.name}${criticalLabel}`, color);
      
      if (!hasScript && gate.critical) {
        criticalGatesMissing++;
      }
    });

    this.log(`\nCritical Gates Missing: ${criticalGatesMissing}`, criticalGatesMissing > 0 ? 'red' : 'green');
    return criticalGatesMissing === 0;
  }

  showEscalationPaths() {
    this.logBold('\n📋 ESCALATION PATHWAY STATUS', 'blue');
    
    const paths = [
      {
        level: 'Level 1: Implementation → Navigator',
        trigger: 'Scope expansion, appetite boundaries',
        action: 'Switch to Navigator mode',
        timeline: '< 15 minutes'
      },
      {
        level: 'Level 2: Navigator → Human Developer',
        trigger: 'Business logic, security policies, UX flows',
        action: 'Document requirements, schedule intervention',
        timeline: '< 1 business day'
      },
      {
        level: 'Level 3: Human → Business Stakeholder',
        trigger: 'Appetite expansion, business rule changes',
        action: 'Formal appetite adjustment process',
        timeline: '< 2 business days'
      }
    ];

    paths.forEach((path, index) => {
      this.log(`\n${index + 1}. ${path.level}`, 'cyan');
      this.log(`   Trigger: ${path.trigger}`, 'white');
      this.log(`   Action: ${path.action}`, 'white');
      this.log(`   Timeline: ${path.timeline}`, 'green');
    });
  }

  showUsageGuidance() {
    this.logBold('\n🚀 USAGE GUIDANCE', 'blue');
    
    this.log('\nDEVELOPMENT WORKFLOW:', 'cyan');
    this.log('1. pnpm run circuit-breakers:status    # Check framework health', 'white');
    this.log('2. pnpm run circuit-breakers:verify    # Verify before commit', 'white');
    this.log('3. pnpm run deploy:verify             # Full pre-deployment check', 'white');
    this.log('4. pnpm run quality:gates             # Manual quality gate run', 'white');

    this.log('\nCIRCUIT BREAKER TYPES:', 'cyan');
    this.log('• SCOPE_EXPANSION: Escalate to Navigator', 'yellow');
    this.log('• QUALITY_GATE: Block deployment, fix immediately', 'red');
    this.log('• BUSINESS_PROTECTION: Escalate to human developer', 'magenta');

    this.log('\nREMEMBER:', 'cyan');
    this.log('• Circuit breakers protect business value', 'green');
    this.log('• Never compromise functionality for appetite', 'green');
    this.log('• Escalate scope needs before quality compromise', 'green');
    this.log('• Quality gates are non-negotiable boundaries', 'green');
  }

  showMetrics() {
    this.logBold('\n📊 TARGET METRICS', 'blue');
    
    const metrics = [
      { name: 'Production Deployment Success Rate', target: '99.5%+', status: '🎯' },
      { name: 'Post-Deployment Critical Issues', target: '<1%', status: '🎯' },
      { name: 'Security Vulnerability Prevention', target: '100%', status: '🎯' },
      { name: 'Appetite Boundary Compliance', target: '95%', status: '🎯' },
      { name: 'Escalation Response Time', target: '<15 minutes', status: '🎯' },
      { name: 'Quality Gate Pass Rate', target: '95%', status: '🎯' }
    ];

    metrics.forEach(metric => {
      this.log(`${metric.status} ${metric.name}: ${metric.target}`, 'green');
    });
  }

  run() {
    this.showFrameworkStatus();
    const frameworkComplete = this.checkFrameworkFiles();
    const qualityGatesReady = this.showQualityGateStatus();
    this.showEscalationPaths();
    this.showUsageGuidance();
    this.showMetrics();

    // Overall health assessment
    this.logBold('\n🏥 FRAMEWORK HEALTH ASSESSMENT', 'magenta');
    const health = frameworkComplete && qualityGatesReady ? 'HEALTHY' : 'NEEDS ATTENTION';
    const healthColor = health === 'HEALTHY' ? 'green' : 'yellow';
    
    this.logBold(`Overall Status: ${health}`, healthColor);
    
    if (health === 'NEEDS ATTENTION') {
      this.log('\nRecommendations:', 'yellow');
      if (!frameworkComplete) {
        this.log('• Install missing critical framework components', 'yellow');
      }
      if (!qualityGatesReady) {
        this.log('• Configure missing critical quality gate scripts', 'yellow');
      }
      this.log('• Run "pnpm run circuit-breakers:verify" to test', 'yellow');
    } else {
      this.log('\n🎉 Circuit breaker framework is fully operational!', 'green');
      this.log('Ready to protect business value through quality boundaries.', 'green');
    }
  }
}

// Execute status check
const status = new CircuitBreakerStatus();
status.run();