#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running test quality checks...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Weak Assertions
console.log('📊 Check 1: Weak Assertion Detection');
try {
  const weakAssertions = execSync(
    'grep -r "toBeDefined\\|toBeTruthy\\|toBeGreaterThan(0)" __tests__/ --include="*.test.ts" --include="*.test.tsx" || true',
    { encoding: 'utf8' }
  );
  
  if (weakAssertions.trim()) {
    const count = weakAssertions.split('\n').filter(line => line.trim()).length;
    console.log(`❌ FAIL: Found ${count} weak assertions`);
    console.log('Weak assertions found:');
    console.log(weakAssertions.split('\n').slice(0, 10).join('\n'));
    if (count > 10) console.log(`... and ${count - 10} more`);
    console.log('\nRequired: Replace with specific value assertions');
    console.log('Example: toBeDefined() → toEqual({ id: 123, status: "active" })');
    hasErrors = true;
  } else {
    console.log('✅ PASS: No weak assertions found');
  }
} catch (e) {
  console.log('✅ PASS: No weak assertions found');
}

// Check 2: AAA Pattern Comments
console.log('\n📊 Check 2: AAA Pattern Structure');
try {
  const testFiles = execSync(
    'find __tests__/ -name "*.test.ts" -o -name "*.test.tsx"',
    { encoding: 'utf8' }
  ).trim().split('\n');
  
  let filesWithoutAAA = 0;
  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const hasIt = content.includes('it(') || content.includes('test(');
    const hasArrange = content.includes('// Arrange') || content.includes('// ARRANGE');
    const hasAct = content.includes('// Act') || content.includes('// ACT');
    const hasAssert = content.includes('// Assert') || content.includes('// ASSERT');
    
    if (hasIt && (!hasArrange || !hasAct || !hasAssert)) {
      filesWithoutAAA++;
    }
  }
  
  if (filesWithoutAAA > 0) {
    console.log(`⚠️  WARN: ${filesWithoutAAA} test files missing AAA comments`);
    console.log('Best practice: Add // Arrange, // Act, // Assert comments');
    hasWarnings = true;
  } else {
    console.log('✅ PASS: All test files use AAA pattern');
  }
} catch (e) {
  console.log('⚠️  WARN: Could not verify AAA pattern');
}

// Check 3: Error Case Coverage
console.log('\n📊 Check 3: Error Case Coverage');
try {
  const testFiles = execSync(
    'find __tests__/ -name "*.test.ts" -o -name "*.test.tsx"',
    { encoding: 'utf8' }
  ).trim().split('\n');
  
  let filesWithoutErrors = [];
  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const hasTests = content.includes('it(') || content.includes('test(');
    const hasErrorTests = content.includes('toThrow') || 
                         content.includes('rejects.toThrow') ||
                         content.includes('error') ||
                         content.includes('invalid');
    
    if (hasTests && !hasErrorTests) {
      filesWithoutErrors.push(file);
    }
  }
  
  if (filesWithoutErrors.length > 0) {
    console.log(`⚠️  WARN: ${filesWithoutErrors.length} test files without error cases`);
    console.log('Sample files missing error tests:');
    console.log(filesWithoutErrors.slice(0, 5).join('\n'));
    hasWarnings = true;
  } else {
    console.log('✅ PASS: All test files include error cases');
  }
} catch (e) {
  console.log('⚠️  WARN: Could not verify error coverage');
}

// Check 4: Integration Test Mocking
console.log('\n📊 Check 4: Integration Test Mocking Ratio');
try {
  const integrationTests = execSync(
    'find __tests__/integration/ -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null || true',
    { encoding: 'utf8' }
  ).trim();
  
  if (integrationTests) {
    const files = integrationTests.split('\n').filter(f => f);
    let overMockedFiles = [];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const mockCount = (content.match(/jest\.mock|vi\.mock/g) || []).length;
      const testCount = (content.match(/it\(|test\(/g) || []).length;
      
      if (mockCount > testCount * 0.3) { // More than 30% mocking
        overMockedFiles.push(`${file} (${mockCount} mocks for ${testCount} tests)`);
      }
    }
    
    if (overMockedFiles.length > 0) {
      console.log(`⚠️  WARN: ${overMockedFiles.length} integration tests heavily mocked`);
      console.log('Integration tests should minimize mocking:');
      console.log(overMockedFiles.slice(0, 3).join('\n'));
      console.log('Only mock: network (MSW), time, external services');
      hasWarnings = true;
    } else {
      console.log('✅ PASS: Integration tests use minimal mocking');
    }
  }
} catch (e) {
  console.log('ℹ️  INFO: No integration tests found');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ TEST QUALITY GATE FAILED');
  console.log('Fix errors above before committing');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  TEST QUALITY GATE PASSED WITH WARNINGS');
  console.log('Consider addressing warnings for best practices');
  process.exit(0);
} else {
  console.log('✅ TEST QUALITY GATE PASSED');
  process.exit(0);
}