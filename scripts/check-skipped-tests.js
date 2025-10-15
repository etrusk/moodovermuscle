#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for skipped tests...\n');

let hasSkippedTests = false;
const skippedTests = [];

// Get test files from __tests__ and e2e directories
try {
  const testDirs = ['__tests__', 'e2e'];
  
  for (const dir of testDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = execSync(
      `find ${dir} \\( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \\)`,
      { encoding: 'utf8' }
    ).trim().split('\n').filter(f => f);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Check for .skip on describe/it/test
        if (line.match(/\b(describe|it|test)\.skip\s*\(/)) {
          hasSkippedTests = true;
          skippedTests.push(`${file}:${lineNum} - ${line.trim()}`);
        }
        
        // Check for xit
        if (line.match(/\bxit\s*\(/)) {
          hasSkippedTests = true;
          skippedTests.push(`${file}:${lineNum} - ${line.trim()}`);
        }
        
        // Check for xdescribe
        if (line.match(/\bxdescribe\s*\(/)) {
          hasSkippedTests = true;
          skippedTests.push(`${file}:${lineNum} - ${line.trim()}`);
        }
        
        // Check for xtest
        if (line.match(/\bxtest\s*\(/)) {
          hasSkippedTests = true;
          skippedTests.push(`${file}:${lineNum} - ${line.trim()}`);
        }
      });
    }
  }
  
  if (hasSkippedTests) {
    console.log('❌ SKIPPED TESTS DETECTED\n');
    console.log('The following tests are skipped and must be fixed or removed:\n');
    skippedTests.forEach(test => {
      console.log(`  ${test}`);
    });
    console.log('\nSkipped tests found:');
    console.log('  - describe.skip() / it.skip() / test.skip()');
    console.log('  - xit() / xdescribe() / xtest()');
    console.log('\n⚠️  All tests must be active before committing.');
    console.log('Fix the tests or remove them if no longer needed.\n');
    process.exit(1);
  } else {
    console.log('✅ No skipped tests found - all tests are active\n');
    process.exit(0);
  }
  
} catch (error) {
  console.error('❌ Error checking for skipped tests:', error.message);
  process.exit(1);
}