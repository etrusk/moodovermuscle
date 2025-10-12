#!/usr/bin/env node

/**
 * Test Quality Gate Script
 * 
 * Validates test files for AI-specific quality standards:
 * - Explicit type assertions (toMatchObject, toEqual)
 * - Error condition coverage
 * - AAA pattern comments
 * - Mock call verification
 */

const fs = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const emoji = { 
    info: '📊', 
    success: '✅', 
    warning: '⚠️', 
    error: '❌' 
  }[type] || 'ℹ️';
  console.log(`${emoji} ${message}`);
}

function readTestFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`, 'error');
    return null;
  }
}

function checkTypeAssertions(content, filePath) {
  const strongAssertions = [
    'toMatchObject',
    'toEqual',
    'toStrictEqual',
    'toHaveBeenCalledWith'
  ];
  
  const weakOnlyPatterns = [
    /expect\([^)]+\)\.toBeDefined\(\)/g,
    /expect\([^)]+\)\.toBeTruthy\(\)/g,
    /expect\([^)]+\)\.not\.toBeNull\(\)/g
  ];
  
  const hasStrongAssertion = strongAssertions.some(
    assertion => content.includes(assertion)
  );
  
  const weakCount = weakOnlyPatterns.reduce(
    (count, pattern) => count + (content.match(pattern) || []).length,
    0
  );
  
  if (!hasStrongAssertion && weakCount > 0) {
    log(
      `${filePath}: Only weak assertions found (toBeDefined/toBeTruthy). ` +
      `Use toMatchObject() or toEqual() instead.`,
      'error'
    );
    return false;
  }
  
  if (!hasStrongAssertion) {
    log(
      `${filePath}: No type assertions found. ` +
      `Add toMatchObject() or toEqual() assertions.`,
      'warning'
    );
  }
  
  return hasStrongAssertion || weakCount === 0;
}

function checkErrorConditions(content, filePath) {
  const errorPatterns = [
    /toThrow\(/,
    /rejects\.toThrow\(/,
    /\.not\.toMatch\(/,
    /expect\([^)]+\)\.toBe\(false\)/
  ];
  
  const hasErrorTest = errorPatterns.some(
    pattern => pattern.test(content)
  );
  
  if (!hasErrorTest) {
    log(
      `${filePath}: No error condition tests found. ` +
      `Add at least one test using toThrow() or rejects.toThrow().`,
      'error'
    );
    return false;
  }
  
  return true;
}

function checkAAAPattern(content, filePath) {
  // Check if file has test blocks
  const hasTests = /it\(|test\(/i.test(content);
  
  if (!hasTests) {
    return true; // No tests, no AAA needed
  }
  
  // Check for AAA comments presence in file
  const hasArrange = /\/\/\s*Arrange/i.test(content);
  const hasAct = /\/\/\s*Act/i.test(content);
  const hasAssert = /\/\/\s*Assert/i.test(content);
  
  if (!hasArrange || !hasAct || !hasAssert) {
    log(
      `${filePath}: Missing AAA pattern comments. ` +
      `Tests must include // Arrange, // Act, // Assert comments.`,
      'error'
    );
    return false;
  }
  
  return true;
}

function checkMockVerification(content, filePath) {
  const hasMocks = /jest\.fn\(\)/.test(content);
  
  if (!hasMocks) {
    return true;
  }
  
  const mockVerifications = [
    /toHaveBeenCalledWith\(/,
    /toHaveBeenCalledTimes\(/
  ];
  
  const hasVerification = mockVerifications.some(
    pattern => pattern.test(content)
  );
  
  if (!hasVerification) {
    log(
      `${filePath}: Mocks used but not verified. ` +
      `Add toHaveBeenCalledWith() or toHaveBeenCalledTimes().`,
      'error'
    );
    return false;
  }
  
  return true;
}

function validateTestFile(filePath) {
  const content = readTestFile(filePath);
  
  if (!content) {
    return false;
  }
  
  const checks = [
    checkTypeAssertions(content, filePath),
    checkErrorConditions(content, filePath),
    checkAAAPattern(content, filePath),
    checkMockVerification(content, filePath)
  ];
  
  return checks.every(Boolean);
}

function findTestFiles(dir) {
  const testFiles = [];
  const baseDir = path.resolve(process.cwd(), dir);
  
  function traverse(currentDir) {
    const resolvedDir = path.resolve(currentDir);
    
    // Ensure we're still within the base directory
    if (!resolvedDir.startsWith(baseDir)) {
      return;
    }
    
    const entries = fs.readdirSync(resolvedDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      // Skip entries with path traversal attempts
      if (entry.name.includes('..') || entry.name.includes('/') || entry.name.includes('\\')) {
        return;
      }
      
      // Normalize entry name to prevent path traversal
      const safeName = path.basename(entry.name);
      const fullPath = path.join(resolvedDir, safeName);
      
      // Double-check the resolved path is within base directory
      if (!fullPath.startsWith(baseDir)) {
        return;
      }
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') &&
            entry.name !== 'node_modules') {
          traverse(fullPath);
        }
      } else if (
        entry.name.endsWith('.test.ts') ||
        entry.name.endsWith('.test.tsx') ||
        entry.name.endsWith('.spec.ts')
      ) {
        testFiles.push(fullPath);
      }
    });
  }
  
  traverse(baseDir);
  return testFiles;
}

async function main() {
  log('🧪 Running test quality checks...', 'info');
  
  const args = process.argv.slice(2);
  let testFiles = [];
  
  if (args.length > 0) {
    testFiles = args.filter(file => 
      file.endsWith('.test.ts') || 
      file.endsWith('.test.tsx') ||
      file.endsWith('.spec.ts')
    );
  } else {
    const testDir = path.join(process.cwd(), '__tests__');
    const e2eDir = path.join(process.cwd(), 'e2e');
    
    if (fs.existsSync(testDir)) {
      testFiles.push(...findTestFiles(testDir));
    }
    
    if (fs.existsSync(e2eDir)) {
      testFiles.push(...findTestFiles(e2eDir));
    }
  }
  
  if (testFiles.length === 0) {
    log('No test files found to validate', 'warning');
    process.exit(0);
  }
  
  log(`Found ${testFiles.length} test file(s) to validate`, 'info');
  
  let failedFiles = 0;
  
  testFiles.forEach(file => {
    const passed = validateTestFile(file);
    if (!passed) {
      failedFiles++;
    }
  });
  
  if (failedFiles > 0) {
    log(
      `\n❌ Test quality check failed: ${failedFiles}/${testFiles.length} files ` +
      `have quality issues`,
      'error'
    );
    log('Fix issues above and re-run tests', 'error');
    process.exit(1);
  }
  
  log(
    `\n✅ All test files passed quality checks (${testFiles.length} files)`,
    'success'
  );
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { 
  validateTestFile, 
  checkTypeAssertions, 
  checkErrorConditions,
  checkAAAPattern,
  checkMockVerification
};