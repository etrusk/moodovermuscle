#!/usr/bin/env node

/**
 * Performance Validation & Metrics Tracking Framework
 * Phase 4: Custom Role Implementation - Migration & Validation
 * 
 * Tracks appetite accuracy, token usage optimization, and quality consistency
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceValidator {
  constructor() {
    this.metricsPath = path.join(process.cwd(), '.performance-metrics.json');
    this.currentTaskPath = path.join(process.cwd(), '.docs', 'current-task.md');
    this.metrics = this.loadMetrics();
    this.targets = {
      appetiteAccuracy: 0.85, // 85% target vs 45% baseline
      tokenReduction: 0.77,   // 77% reduction target
      qualityCompliance: 1.0, // 100% critical gate compliance
      patternReuse: 0.80      // 80% pattern application rate
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📊',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      metrics: '📈'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        const data = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
        this.log('Loaded existing performance metrics', 'info');
        return data;
      }
    } catch (error) {
      this.log(`Warning: Could not load metrics: ${error.message}`, 'warning');
    }

    // Initialize default metrics structure
    return {
      appetiteTracking: {
        tasks: [],
        currentAccuracy: 0.45, // baseline
        target: 0.85,
        trend: []
      },
      tokenUsage: {
        sessions: [],
        baseline: 1000, // placeholder baseline tokens
        currentReduction: 0,
        target: 0.77,
        weeklyUsage: []
      },
      qualityGates: {
        executions: [],
        passRate: 0,
        target: 1.0,
        gatePerformance: {
          lint: { passes: 0, failures: 0 },
          typeCheck: { passes: 0, failures: 0 },
          testCritical: { passes: 0, failures: 0 },
          securityScan: { passes: 0, failures: 0 },
          buildVerify: { passes: 0, failures: 0 }
        }
      },
      institutionalMemory: {
        patternApplications: [],
        patternReuseRate: 0,
        target: 0.80,
        newPatternsCreated: 0,
        memoryUpdates: []
      },
      lastUpdated: new Date().toISOString()
    };
  }

  saveMetrics() {
    try {
      this.metrics.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.metricsPath, JSON.stringify(this.metrics, null, 2));
      this.log('Performance metrics saved', 'success');
    } catch (error) {
      this.log(`Error saving metrics: ${error.message}`, 'error');
    }
  }

  measureAppetiteAccuracy(taskData) {
    this.log('📏 Measuring appetite accuracy...', 'metrics');
    
    const {
      estimatedHours,
      actualHours,
      taskComplexity,
      circuitBreakerHit = false,
      scopeChanges = false
    } = taskData;

    if (!estimatedHours || !actualHours) {
      this.log('Missing appetite data - skipping measurement', 'warning');
      return;
    }

    const accuracy = Math.min(1.0, estimatedHours / actualHours);
    const task = {
      timestamp: new Date().toISOString(),
      estimated: estimatedHours,
      actual: actualHours,
      accuracy,
      complexity: taskComplexity,
      circuitBreakerHit,
      scopeChanges
    };

    this.metrics.appetiteTracking.tasks.push(task);

    // Calculate rolling accuracy (last 10 tasks)
    const recentTasks = this.metrics.appetiteTracking.tasks.slice(-10);
    const avgAccuracy = recentTasks.reduce((sum, t) => sum + t.accuracy, 0) / recentTasks.length;
    
    this.metrics.appetiteTracking.currentAccuracy = avgAccuracy;
    this.metrics.appetiteTracking.trend.push({
      timestamp: new Date().toISOString(),
      accuracy: avgAccuracy
    });

    this.log(`Appetite accuracy: ${(accuracy * 100).toFixed(1)}% (Rolling avg: ${(avgAccuracy * 100).toFixed(1)}%)`, 'metrics');
    
    if (avgAccuracy >= this.targets.appetiteAccuracy) {
      this.log('🎯 Appetite accuracy target achieved!', 'success');
    }
  }

  measureTokenUsage(sessionData) {
    this.log('🪙 Measuring token usage optimization...', 'metrics');
    
    const {
      totalTokens,
      roleBreakdown = {},
      institutionalMemoryHits = 0,
      patternApplications = 0,
      sessionDuration
    } = sessionData;

    if (!totalTokens) {
      this.log('No token data provided - skipping measurement', 'warning');
      return;
    }

    const session = {
      timestamp: new Date().toISOString(),
      totalTokens,
      roleBreakdown,
      institutionalMemoryHits,
      patternApplications,
      duration: sessionDuration,
      efficiency: institutionalMemoryHits > 0 ? patternApplications / totalTokens : 0
    };

    this.metrics.tokenUsage.sessions.push(session);

    // Calculate weekly usage trend
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTokens = this.metrics.tokenUsage.sessions
      .filter(s => new Date(s.timestamp) > weekAgo)
      .reduce((sum, s) => sum + s.totalTokens, 0);

    this.metrics.tokenUsage.weeklyUsage.push({
      timestamp: new Date().toISOString(),
      tokens: weeklyTokens
    });

    // Calculate reduction vs baseline
    if (this.metrics.tokenUsage.baseline > 0) {
      const currentReduction = Math.max(0, 1 - (weeklyTokens / this.metrics.tokenUsage.baseline));
      this.metrics.tokenUsage.currentReduction = currentReduction;
      
      this.log(`Token usage: ${totalTokens} (Weekly: ${weeklyTokens}, Reduction: ${(currentReduction * 100).toFixed(1)}%)`, 'metrics');
      
      if (currentReduction >= this.targets.tokenReduction) {
        this.log('🎯 Token reduction target achieved!', 'success');
      }
    }
  }

  measureQualityGatePerformance(gateResults) {
    this.log('🛡️ Measuring quality gate performance...', 'metrics');
    
    if (!gateResults || !gateResults.gates) {
      this.log('No quality gate data provided - skipping measurement', 'warning');
      return;
    }

    const execution = {
      timestamp: new Date().toISOString(),
      results: gateResults.gates,
      totalTime: gateResults.summary?.totalTime || 0,
      passed: gateResults.summary?.passed || 0,
      failed: gateResults.summary?.failed || 0
    };

    this.metrics.qualityGates.executions.push(execution);

    // Update gate-specific performance
    Object.entries(gateResults.gates).forEach(([gateName, result]) => {
      const gateKey = gateName.replace(/-/g, '').toLowerCase();
      if (this.metrics.qualityGates.gatePerformance[gateKey]) {
        if (result.status === 'passed') {
          this.metrics.qualityGates.gatePerformance[gateKey].passes++;
        } else {
          this.metrics.qualityGates.gatePerformance[gateKey].failures++;
        }
      }
    });

    // Calculate overall pass rate
    const recentExecutions = this.metrics.qualityGates.executions.slice(-20);
    const totalGates = recentExecutions.reduce((sum, e) => sum + e.passed + e.failed, 0);
    const totalPassed = recentExecutions.reduce((sum, e) => sum + e.passed, 0);
    
    this.metrics.qualityGates.passRate = totalGates > 0 ? totalPassed / totalGates : 0;

    this.log(`Quality gates: ${execution.passed}/${execution.passed + execution.failed} passed (Overall: ${(this.metrics.qualityGates.passRate * 100).toFixed(1)}%)`, 'metrics');
    
    if (this.metrics.qualityGates.passRate >= this.targets.qualityCompliance) {
      this.log('🎯 Quality compliance target achieved!', 'success');
    }
  }

  measureInstitutionalMemoryUsage(memoryData) {
    this.log('🧠 Measuring institutional memory effectiveness...', 'metrics');
    
    const {
      patternsApplied = [],
      newPatternsCreated = 0,
      memoryHits = 0,
      totalDecisions = 1
    } = memoryData;

    const application = {
      timestamp: new Date().toISOString(),
      patternsApplied,
      newPatternsCreated,
      memoryHits,
      totalDecisions,
      reuseRate: patternsApplied.length / totalDecisions
    };

    this.metrics.institutionalMemory.patternApplications.push(application);
    this.metrics.institutionalMemory.newPatternsCreated += newPatternsCreated;

    // Calculate pattern reuse rate
    const recentApplications = this.metrics.institutionalMemory.patternApplications.slice(-10);
    const totalDecisions_recent = recentApplications.reduce((sum, a) => sum + a.totalDecisions, 0);
    const totalPatterns = recentApplications.reduce((sum, a) => sum + a.patternsApplied.length, 0);
    
    this.metrics.institutionalMemory.patternReuseRate = totalDecisions_recent > 0 ? totalPatterns / totalDecisions_recent : 0;

    this.log(`Pattern reuse: ${patternsApplied.length}/${totalDecisions} decisions (Rate: ${(this.metrics.institutionalMemory.patternReuseRate * 100).toFixed(1)}%)`, 'metrics');
    
    if (this.metrics.institutionalMemory.patternReuseRate >= this.targets.patternReuse) {
      this.log('🎯 Pattern reuse target achieved!', 'success');
    }
  }

  generatePerformanceReport() {
    this.log('📊 Generating comprehensive performance report...', 'metrics');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        appetiteAccuracy: {
          current: this.metrics.appetiteTracking.currentAccuracy,
          target: this.targets.appetiteAccuracy,
          achieved: this.metrics.appetiteTracking.currentAccuracy >= this.targets.appetiteAccuracy,
          improvement: this.metrics.appetiteTracking.currentAccuracy - 0.45 // vs baseline
        },
        tokenOptimization: {
          current: this.metrics.tokenUsage.currentReduction,
          target: this.targets.tokenReduction,
          achieved: this.metrics.tokenUsage.currentReduction >= this.targets.tokenReduction
        },
        qualityCompliance: {
          current: this.metrics.qualityGates.passRate,
          target: this.targets.qualityCompliance,
          achieved: this.metrics.qualityGates.passRate >= this.targets.qualityCompliance
        },
        institutionalMemory: {
          current: this.metrics.institutionalMemory.patternReuseRate,
          target: this.targets.patternReuse,
          achieved: this.metrics.institutionalMemory.patternReuseRate >= this.targets.patternReuse
        }
      },
      recommendations: this.generateRecommendations(),
      trends: this.analyzeTrends()
    };

    const reportPath = path.join(process.cwd(), '.performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.displayReport(report);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Appetite accuracy recommendations
    if (this.metrics.appetiteTracking.currentAccuracy < this.targets.appetiteAccuracy) {
      recommendations.push({
        category: 'appetite_accuracy',
        priority: 'high',
        issue: `Appetite accuracy at ${(this.metrics.appetiteTracking.currentAccuracy * 100).toFixed(1)}% (target: 85%)`,
        recommendation: 'Increase usage of complexity estimation patterns from .docs/memory/index.md',
        actions: [
          'Review historical complexity factors before estimation',
          'Apply circuit breakers more consistently',
          'Use institutional memory for similar task calibration'
        ]
      });
    }

    // Token usage recommendations  
    if (this.metrics.tokenUsage.currentReduction < this.targets.tokenReduction) {
      recommendations.push({
        category: 'token_optimization',
        priority: 'medium',
        issue: `Token reduction at ${(this.metrics.tokenUsage.currentReduction * 100).toFixed(1)}% (target: 77%)`,
        recommendation: 'Increase institutional memory integration and pattern reuse',
        actions: [
          'Check .docs/patterns/index.md before starting new work',
          'Use model tiering more effectively',
          'Apply context curation in handoffs'
        ]
      });
    }

    // Quality compliance recommendations
    if (this.metrics.qualityGates.passRate < this.targets.qualityCompliance) {
      recommendations.push({
        category: 'quality_compliance',
        priority: 'high',
        issue: `Quality pass rate at ${(this.metrics.qualityGates.passRate * 100).toFixed(1)}% (target: 100%)`,
        recommendation: 'Address systematic quality gate failures',
        actions: [
          'Review failing gate patterns',
          'Implement pre-commit automation',
          'Update quality gate thresholds if needed'
        ]
      });
    }

    // Pattern reuse recommendations
    if (this.metrics.institutionalMemory.patternReuseRate < this.targets.patternReuse) {
      recommendations.push({
        category: 'pattern_reuse',
        priority: 'medium',
        issue: `Pattern reuse at ${(this.metrics.institutionalMemory.patternReuseRate * 100).toFixed(1)}% (target: 80%)`,
        recommendation: 'Improve institutional memory integration in workflows',
        actions: [
          'Mandate pattern checks before implementation',
          'Update pattern documentation and discovery',
          'Train team on pattern application'
        ]
      });
    }

    return recommendations;
  }

  analyzeTrends() {
    return {
      appetiteAccuracy: this.calculateTrend(this.metrics.appetiteTracking.trend.map(t => t.accuracy)),
      tokenUsage: this.calculateTrend(this.metrics.tokenUsage.weeklyUsage.map(w => w.tokens)),
      qualityCompliance: this.calculateTrend(this.metrics.qualityGates.executions.slice(-10).map(e => e.passed / (e.passed + e.failed))),
      patternReuse: this.calculateTrend(this.metrics.institutionalMemory.patternApplications.slice(-10).map(a => a.reuseRate))
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  displayReport(report) {
    this.log('\n🎯 PERFORMANCE VALIDATION REPORT', 'metrics');
    this.log('═══════════════════════════════════════', 'info');
    
    // Summary
    this.log('\n📊 SUCCESS METRICS SUMMARY:', 'metrics');
    Object.entries(report.summary).forEach(([metric, data]) => {
      const status = data.achieved ? '✅' : '❌';
      const percentage = (data.current * 100).toFixed(1);
      const target = (data.target * 100).toFixed(1);
      this.log(`   ${status} ${metric}: ${percentage}% (target: ${target}%)`, data.achieved ? 'success' : 'warning');
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      this.log('\n💡 RECOMMENDATIONS:', 'metrics');
      report.recommendations.forEach((rec, i) => {
        this.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`, 'warning');
        this.log(`      → ${rec.recommendation}`, 'info');
      });
    }

    // Trends
    this.log('\n📈 PERFORMANCE TRENDS:', 'metrics');
    Object.entries(report.trends).forEach(([metric, trend]) => {
      const trendIcon = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️';
      this.log(`   ${trendIcon} ${metric}: ${trend}`, 'info');
    });

    this.log('\n═══════════════════════════════════════', 'info');
  }

  validateSystemReadiness() {
    this.log('🔍 Validating system readiness for production...', 'metrics');
    
    const requirements = {
      appetiteAccuracy: this.metrics.appetiteTracking.currentAccuracy >= this.targets.appetiteAccuracy,
      tokenOptimization: this.metrics.tokenUsage.currentReduction >= this.targets.tokenReduction,
      qualityCompliance: this.metrics.qualityGates.passRate >= this.targets.qualityCompliance,
      patternReuse: this.metrics.institutionalMemory.patternReuseRate >= this.targets.patternReuse
    };

    const passed = Object.values(requirements).filter(Boolean).length;
    const total = Object.keys(requirements).length;
    
    this.log(`System readiness: ${passed}/${total} requirements met`, passed === total ? 'success' : 'warning');
    
    if (passed === total) {
      this.log('🎉 System ready for production deployment!', 'success');
      return true;
    } else {
      this.log('⚠️ System requires optimization before full production deployment', 'warning');
      return false;
    }
  }
}

async function main() {
  const command = process.argv[2];
  const validator = new PerformanceValidator();
  
  try {
    switch (command) {
      case 'appetite':
        const appetiteData = JSON.parse(process.argv[3] || '{}');
        validator.measureAppetiteAccuracy(appetiteData);
        validator.saveMetrics();
        break;
        
      case 'tokens':
        const tokenData = JSON.parse(process.argv[3] || '{}');
        validator.measureTokenUsage(tokenData);
        validator.saveMetrics();
        break;
        
      case 'quality':
        const qualityData = JSON.parse(process.argv[3] || '{}');
        validator.measureQualityGatePerformance(qualityData);
        validator.saveMetrics();
        break;
        
      case 'memory':
        const memoryData = JSON.parse(process.argv[3] || '{}');
        validator.measureInstitutionalMemoryUsage(memoryData);
        validator.saveMetrics();
        break;
        
      case 'report':
        validator.generatePerformanceReport();
        break;
        
      case 'validate':
        const isReady = validator.validateSystemReadiness();
        process.exit(isReady ? 0 : 1);
        break;
        
      default:
        console.log(`
Usage: node scripts/performance-validation.js <command> [data]

Commands:
  appetite <json>  - Measure appetite accuracy
  tokens <json>    - Measure token usage optimization
  quality <json>   - Measure quality gate performance  
  memory <json>    - Measure institutional memory usage
  report           - Generate comprehensive performance report
  validate         - Validate system readiness for production
        `);
        process.exit(1);
    }
  } catch (error) {
    validator.log(`💥 Performance validation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PerformanceValidator };