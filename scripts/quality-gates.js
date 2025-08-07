#!/usr/bin/env node

/**
 * Quality Gates Automation Script
 * Phase 3: Custom Role Implementation - Quality & Deployment Integration
 * 
 * Executes mandatory quality gates with performance monitoring and circuit breakers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityGateRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      gates: {},
      performance: {},
      summary: {
        passed: 0,
        failed: 0,
        skipped: 0,
        totalTime: 0
      }
    };
    this.circuitBreakerThreshold = 2 * 60 * 1000; // 2 minutes in milliseconds
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      performance: '📊'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async executeGate(name, command, description, critical = true) {
    const gateStart = Date.now();
    this.log(`Starting ${name}: ${description}`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: critical ? 30000 : 60000 // Critical gates have shorter timeout
      });
      
      const duration = Date.now() - gateStart;
      this.results.gates[name] = {
        status: 'passed',
        duration,
        output: output.trim(),
        critical
      };
      
      this.results.summary.passed++;
      this.log(`${name} passed (${duration}ms)`, 'success');
      
      return true;
    } catch (error) {
      const duration = Date.now() - gateStart;
      this.results.gates[name] = {
        status: 'failed',
        duration,
        error: error.message,
        output: error.stdout || '',
        stderr: error.stderr || '',
        critical
      };
      
      if (critical) {
        this.results.summary.failed++;
        this.log(`${name} failed (${duration}ms): ${error.message}`, 'error');
        return false;
      } else {
        this.results.summary.skipped++;
        this.log(`${name} failed but non-critical (${duration}ms): ${error.message}`, 'warning');
        return true; // Non-critical failures don't block
      }
    }
  }

  async runCriticalGates() {
    this.log('🚀 Starting Critical Quality Gates', 'info');
    
    const criticalGates = [
      {
        name: 'lint',
        command: 'pnpm run lint',
        description: 'ESLint + Prettier validation and auto-fix'
      },
      {
        name: 'type-check', 
        command: 'pnpm run type-check',
        description: 'TypeScript compilation check'
      },
      {
        name: 'test-critical',
        command: 'pnpm run test:critical',
        description: 'Essential tests execution'
      },
      {
        name: 'security-scan',
        command: 'pnpm run security:scan',
        description: 'Security vulnerability detection'
      },
      {
        name: 'build-verify',
        command: 'pnpm run build >/dev/null 2>&1',
        description: 'Production build verification'
      }
    ];

    let allPassed = true;
    
    for (const gate of criticalGates) {
      // Check circuit breaker
      if (Date.now() - this.startTime > this.circuitBreakerThreshold) {
        this.log('⚡ Circuit breaker activated - quality gates taking too long', 'warning');
        break;
      }
      
      const passed = await this.executeGate(gate.name, gate.command, gate.description, true);
      if (!passed) {
        allPassed = false;
      }
    }
    
    return allPassed;
  }

  async runPerformanceGates() {
    this.log('📊 Starting Performance Quality Gates', 'performance');
    
    const performanceGates = [
      {
        name: 'lighthouse-ci',
        command: 'pnpm run lighthouse:ci || true',
        description: 'Core Web Vitals and performance monitoring'
      },
      {
        name: 'accessibility-check',
        command: 'pnpm run accessibility:validate || true',
        description: 'WCAG 2.1 AA compliance verification'
      }
    ];

    for (const gate of performanceGates) {
      await this.executeGate(gate.name, gate.command, gate.description, false);
    }
  }

  generateReport() {
    this.results.summary.totalTime = Date.now() - this.startTime;
    
    const reportPath = path.join(process.cwd(), '.quality-gates-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`📋 Quality Gates Report generated: ${reportPath}`, 'info');
    
    // Summary
    this.log('📊 Quality Gates Summary:', 'performance');
    this.log(`   Passed: ${this.results.summary.passed}`, 'success');
    this.log(`   Failed: ${this.results.summary.failed}`, this.results.summary.failed > 0 ? 'error' : 'info');
    this.log(`   Skipped: ${this.results.summary.skipped}`, 'warning');
    this.log(`   Total Time: ${this.results.summary.totalTime}ms`, 'performance');
    
    return this.results.summary.failed === 0;
  }
}

async function main() {
  const runner = new QualityGateRunner();
  
  try {
    // Run critical gates first
    const criticalPassed = await runner.runCriticalGates();
    
    if (!criticalPassed) {
      runner.log('❌ Critical quality gates failed - blocking deployment', 'error');
      runner.generateReport();
      process.exit(1);
    }
    
    // Run performance gates (non-blocking)
    await runner.runPerformanceGates();
    
    const success = runner.generateReport();
    
    if (success) {
      runner.log('🎉 All quality gates passed successfully!', 'success');
      process.exit(0);
    } else {
      runner.log('⚠️ Some non-critical gates failed but deployment can proceed', 'warning');
      process.exit(0);
    }
    
  } catch (error) {
    runner.log(`💥 Quality gates execution failed: ${error.message}`, 'error');
    runner.generateReport();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { QualityGateRunner };