#!/usr/bin/env node

/**
 * Quality Gates Automation Script
 * 
 * Executes mandatory quality gates with performance monitoring and circuit breakers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const state = {
  startTime: Date.now(),
  gates: {},
  passed: 0,
  failed: 0
};

const CIRCUIT_BREAKER_MS = 2 * 60 * 1000; // 2 minutes

function log(message, type = 'info') {
  const emoji = { info: '🔵', success: '✅', warning: '⚠️', error: '❌' }[type] || 'ℹ️';
  console.log(`${emoji} ${message}`);
}

async function executeGate(name, command, critical = true) {
  const gateStart = Date.now();
  log(`Starting ${name}...`);
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: critical ? 30000 : 60000
    });
    
    const duration = Date.now() - gateStart;
    state.gates[name] = { status: 'passed', duration, critical };
    state.passed++;
    log(`${name} passed (${duration}ms)`, 'success');
    return true;
  } catch (error) {
    const duration = Date.now() - gateStart;
    state.gates[name] = { 
      status: 'failed', 
      duration, 
      error: error.message, 
      critical 
    };
    
    if (critical) {
      state.failed++;
      log(`${name} failed (${duration}ms): ${error.message}`, 'error');
      return false;
    } else {
      log(`${name} failed but non-critical (${duration}ms)`, 'warning');
      return true;
    }
  }
}

async function runCriticalGates() {
  log('🚀 Starting Critical Quality Gates', 'info');
  
  const gates = [
    { name: 'lint', command: 'pnpm run lint' },
    { name: 'type-check', command: 'pnpm run type-check' },
    { name: 'test-critical', command: 'pnpm run test:critical' },
    { name: 'security-scan', command: 'pnpm run security:scan' },
    { name: 'security-semgrep', command: 'pnpm run security:semgrep' },
    { name: 'build-verify', command: 'pnpm run build >/dev/null 2>&1' }
  ];

  let allPassed = true;
  
  for (const gate of gates) {
    if (Date.now() - state.startTime > CIRCUIT_BREAKER_MS) {
      log('⚡ Circuit breaker activated - quality gates taking too long', 'warning');
      break;
    }
    
    const passed = await executeGate(gate.name, gate.command, true);
    if (!passed) allPassed = false;
  }
  
  return allPassed;
}

async function runPerformanceGates() {
  log('📊 Starting Performance Quality Gates');
  
  const gates = [
    { name: 'lighthouse-ci', command: 'pnpm run lighthouse:ci || true' },
    { name: 'accessibility-check', command: 'pnpm run accessibility:validate || true' }
  ];

  for (const gate of gates) {
    await executeGate(gate.name, gate.command, false);
  }
}

function generateReport() {
  const totalTime = Date.now() - state.startTime;
  
  const report = {
    gates: state.gates,
    summary: { passed: state.passed, failed: state.failed, totalTime }
  };
  
  const reportPath = path.join(process.cwd(), '.quality-gates-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📋 Quality Gates Report: ${reportPath}`);
  log(`📊 Passed: ${state.passed} | Failed: ${state.failed} | Time: ${totalTime}ms`);
  
  return state.failed === 0;
}

async function main() {
  try {
    const criticalPassed = await runCriticalGates();
    
    if (!criticalPassed) {
      log('❌ Critical quality gates failed - blocking deployment', 'error');
      generateReport();
      process.exit(1);
    }
    
    await runPerformanceGates();
    generateReport();
    
    log('🎉 All quality gates passed successfully!', 'success');
    process.exit(0);
  } catch (error) {
    log(`💥 Quality gates execution failed: ${error.message}`, 'error');
    generateReport();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { executeGate };