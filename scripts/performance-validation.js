#!/usr/bin/env node

/**
 * Performance Validation & Metrics Tracking Framework
 * 
 * Tracks appetite accuracy, token usage optimization, and quality consistency
 */

const fs = require('fs');
const path = require('path');

const metricsPath = path.join(process.cwd(), '.performance-metrics.json');
const TARGETS = {
  appetiteAccuracy: 0.85,
  tokenReduction: 0.77,
  qualityCompliance: 1.0,
  patternReuse: 0.80
};

function log(message, type = 'info') {
  const emoji = { info: '📊', success: '✅', warning: '⚠️', error: '❌', metrics: '📈' }[type] || 'ℹ️';
  console.log(`${emoji} ${message}`);
}

function loadMetrics() {
  try {
    if (fs.existsSync(metricsPath)) {
      return JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    }
  } catch (error) {
    log(`Warning: Could not load metrics: ${error.message}`, 'warning');
  }

  return {
    appetiteTracking: { tasks: [], currentAccuracy: 0.45, target: 0.85, trend: [] },
    tokenUsage: { sessions: [], baseline: 1000, currentReduction: 0, target: 0.77, weeklyUsage: [] },
    qualityGates: { executions: [], passRate: 0, target: 1.0, gatePerformance: {} },
    institutionalMemory: { patternApplications: [], patternReuseRate: 0, target: 0.80, newPatternsCreated: 0 },
    lastUpdated: new Date().toISOString()
  };
}

function saveMetrics(metrics) {
  try {
    metrics.lastUpdated = new Date().toISOString();
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    log('Performance metrics saved', 'success');
  } catch (error) {
    log(`Error saving metrics: ${error.message}`, 'error');
  }
}

function measureAppetiteAccuracy(metrics, taskData) {
  log('📏 Measuring appetite accuracy...', 'metrics');
  
  const {
    estimatedTokens,
    actualTokens,
    humanReviewMinutes = 0,
    toolCalls = 0,
    taskComplexity,
    circuitBreakerHit = false,
    scopeChanges = false,
    qualityGatesPassed = true
  } = taskData;

  if (!estimatedTokens || !actualTokens) {
    log('Missing appetite data - skipping measurement', 'warning');
    return;
  }

  const accuracy = Math.min(1.0, estimatedTokens / actualTokens);
  metrics.appetiteTracking.tasks.push({
    timestamp: new Date().toISOString(),
    estimatedTokens,
    actualTokens,
    humanReviewMinutes,
    toolCalls,
    accuracy,
    complexity: taskComplexity,
    circuitBreakerHit,
    scopeChanges,
    qualityGatesPassed
  });

  const recentTasks = metrics.appetiteTracking.tasks.slice(-10);
  const avgAccuracy = recentTasks.reduce((sum, t) => sum + t.accuracy, 0) / recentTasks.length;
  
  metrics.appetiteTracking.currentAccuracy = avgAccuracy;
  metrics.appetiteTracking.trend.push({
    timestamp: new Date().toISOString(),
    accuracy: avgAccuracy
  });

  log(
    `Appetite accuracy: ${(accuracy * 100).toFixed(1)}% ` +
    `(Tokens: ${actualTokens}/${estimatedTokens}, Review: ${humanReviewMinutes}min, ` +
    `Tool calls: ${toolCalls}, Rolling avg: ${(avgAccuracy * 100).toFixed(1)}%)`,
    'metrics'
  );
  
  if (avgAccuracy >= TARGETS.appetiteAccuracy) {
    log('🎯 Appetite accuracy target achieved!', 'success');
  }
}

function measureTokenUsage(metrics, sessionData) {
  log('🪙 Measuring token usage optimization...', 'metrics');
  
  const { totalTokens, roleBreakdown = {}, institutionalMemoryHits = 0, patternApplications = 0, sessionDuration } = sessionData;

  if (!totalTokens) {
    log('No token data provided - skipping measurement', 'warning');
    return;
  }

  metrics.tokenUsage.sessions.push({
    timestamp: new Date().toISOString(),
    totalTokens,
    roleBreakdown,
    institutionalMemoryHits,
    patternApplications,
    duration: sessionDuration,
    efficiency: institutionalMemoryHits > 0 ? patternApplications / totalTokens : 0
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTokens = metrics.tokenUsage.sessions
    .filter(s => new Date(s.timestamp) > weekAgo)
    .reduce((sum, s) => sum + s.totalTokens, 0);

  metrics.tokenUsage.weeklyUsage.push({ timestamp: new Date().toISOString(), tokens: weeklyTokens });

  if (metrics.tokenUsage.baseline > 0) {
    const currentReduction = Math.max(0, 1 - (weeklyTokens / metrics.tokenUsage.baseline));
    metrics.tokenUsage.currentReduction = currentReduction;
    
    log(`Token usage: ${totalTokens} (Weekly: ${weeklyTokens}, Reduction: ${(currentReduction * 100).toFixed(1)}%)`, 'metrics');
    
    if (currentReduction >= TARGETS.tokenReduction) {
      log('🎯 Token reduction target achieved!', 'success');
    }
  }
}

function measureQualityGates(metrics, gateResults) {
  log('🛡️ Measuring quality gate performance...', 'metrics');
  
  if (!gateResults || !gateResults.gates) {
    log('No quality gate data provided - skipping measurement', 'warning');
    return;
  }

  const execution = {
    timestamp: new Date().toISOString(),
    results: gateResults.gates,
    totalTime: gateResults.summary?.totalTime || 0,
    passed: gateResults.summary?.passed || 0,
    failed: gateResults.summary?.failed || 0
  };

  metrics.qualityGates.executions.push(execution);

  const recentExecutions = metrics.qualityGates.executions.slice(-20);
  const totalGates = recentExecutions.reduce((sum, e) => sum + e.passed + e.failed, 0);
  const totalPassed = recentExecutions.reduce((sum, e) => sum + e.passed, 0);
  
  metrics.qualityGates.passRate = totalGates > 0 ? totalPassed / totalGates : 0;

  log(`Quality gates: ${execution.passed}/${execution.passed + execution.failed} passed (Overall: ${(metrics.qualityGates.passRate * 100).toFixed(1)}%)`, 'metrics');
  
  if (metrics.qualityGates.passRate >= TARGETS.qualityCompliance) {
    log('🎯 Quality compliance target achieved!', 'success');
  }
}

function measureMemory(metrics, memoryData) {
  log('🧠 Measuring institutional memory effectiveness...', 'metrics');
  
  const { patternsApplied = [], newPatternsCreated = 0, memoryHits = 0, totalDecisions = 1 } = memoryData;

  metrics.institutionalMemory.patternApplications.push({
    timestamp: new Date().toISOString(),
    patternsApplied,
    newPatternsCreated,
    memoryHits,
    totalDecisions,
    reuseRate: patternsApplied.length / totalDecisions
  });
  
  metrics.institutionalMemory.newPatternsCreated += newPatternsCreated;

  const recentApplications = metrics.institutionalMemory.patternApplications.slice(-10);
  const totalDecisions_recent = recentApplications.reduce((sum, a) => sum + a.totalDecisions, 0);
  const totalPatterns = recentApplications.reduce((sum, a) => sum + a.patternsApplied.length, 0);
  
  metrics.institutionalMemory.patternReuseRate = totalDecisions_recent > 0 ? totalPatterns / totalDecisions_recent : 0;

  log(`Pattern reuse: ${patternsApplied.length}/${totalDecisions} decisions (Rate: ${(metrics.institutionalMemory.patternReuseRate * 100).toFixed(1)}%)`, 'metrics');
  
  if (metrics.institutionalMemory.patternReuseRate >= TARGETS.patternReuse) {
    log('🎯 Pattern reuse target achieved!', 'success');
  }
}

function generateReport(metrics) {
  log('📊 Generating performance report...', 'metrics');
  
  const buildMetric = (current, target) => ({ current, target, achieved: current >= target });
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      appetiteAccuracy: buildMetric(metrics.appetiteTracking.currentAccuracy, TARGETS.appetiteAccuracy),
      tokenOptimization: buildMetric(metrics.tokenUsage.currentReduction, TARGETS.tokenReduction),
      qualityCompliance: buildMetric(metrics.qualityGates.passRate, TARGETS.qualityCompliance),
      institutionalMemory: buildMetric(metrics.institutionalMemory.patternReuseRate, TARGETS.patternReuse)
    }
  };

  fs.writeFileSync(path.join(process.cwd(), '.performance-report.json'), JSON.stringify(report, null, 2));
  displayReport(report);
  return report;
}

function displayReport(report) {
  log('\n🎯 PERFORMANCE REPORT', 'metrics');
  log('📊 SUCCESS METRICS:', 'metrics');
  Object.entries(report.summary).forEach(([metric, data]) => {
    const status = data.achieved ? '✅' : '❌';
    const pct = (data.current * 100).toFixed(1);
    const tgt = (data.target * 100).toFixed(1);
    log(`${status} ${metric}: ${pct}%/${tgt}%`, data.achieved ? 'success' : 'warning');
  });
}

function validateSystemReadiness(metrics) {
  log('🔍 Validating system readiness...', 'metrics');
  
  const checks = [
    metrics.appetiteTracking.currentAccuracy >= TARGETS.appetiteAccuracy,
    metrics.tokenUsage.currentReduction >= TARGETS.tokenReduction,
    metrics.qualityGates.passRate >= TARGETS.qualityCompliance,
    metrics.institutionalMemory.patternReuseRate >= TARGETS.patternReuse
  ];

  const passed = checks.filter(Boolean).length;
  log(`Readiness: ${passed}/${checks.length}`, passed === checks.length ? 'success' : 'warning');
  
  return passed === checks.length;
}

async function main() {
  const command = process.argv[2];
  const metrics = loadMetrics();
  
  try {
    switch (command) {
      case 'appetite':
        const appetiteData = JSON.parse(process.argv[3] || '{}');
        measureAppetiteAccuracy(metrics, appetiteData);
        saveMetrics(metrics);
        break;
        
      case 'tokens':
        const tokenData = JSON.parse(process.argv[3] || '{}');
        measureTokenUsage(metrics, tokenData);
        saveMetrics(metrics);
        break;
        
      case 'quality':
        const qualityData = JSON.parse(process.argv[3] || '{}');
        measureQualityGates(metrics, qualityData);
        saveMetrics(metrics);
        break;
        
      case 'memory':
        const memoryData = JSON.parse(process.argv[3] || '{}');
        measureMemory(metrics, memoryData);
        saveMetrics(metrics);
        break;
        
      case 'report':
        generateReport(metrics);
        break;
        
      case 'validate':
        const isReady = validateSystemReadiness(metrics);
        process.exit(isReady ? 0 : 1);
        break;
        
      default:
        console.log('\nUsage: node scripts/performance-validation.js <command> [data]\n');
        console.log('Commands: appetite, tokens, quality, memory, report, validate\n');
        process.exit(1);
    }
  } catch (error) {
    log(`💥 Performance validation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { measureAppetiteAccuracy, measureTokenUsage, measureQualityGates, measureMemory };