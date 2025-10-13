const fs = require('fs');
const path = require('path');
const parser = require('@typescript-eslint/typescript-estree');

const MAX_FUNCTION_LINES = 50;
const MAX_FILE_LINES = 300;
const MAX_PARAMS = 3;

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Check file size (allow test files to be larger)
    // - Unit tests: 600 lines (2x normal limit)
    // - Integration tests: 800 lines (may include extensive mocks and multi-step scenarios)
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');
    const isIntegrationTest = filePath.includes('integration') || filePath.includes('e2e');
    const maxLines = isTestFile
      ? (isIntegrationTest ? MAX_FILE_LINES * 2.67 : MAX_FILE_LINES * 2)
      : MAX_FILE_LINES;
    
    if (lines.length > maxLines) {
      console.error(`❌ ${filePath}: ${lines.length} lines (max ${maxLines})`);
      return false;
    }
    
    // Parse AST
    const ast = parser.parse(content, {
      loc: true,
      range: true,
      jsx: true,
      ecmaVersion: 'latest',
      sourceType: 'module'
    });
    
    let violations = [];
    const parentMap = new WeakMap();
    
    function visit(node, parent = null) {
      if (!node || typeof node !== 'object') return;
      
      // Track parent relationship without creating circular references
      if (parent) {
        parentMap.set(node, parent);
      }
      
      // Check all function types
      if (['FunctionDeclaration', 'ArrowFunctionExpression',
           'FunctionExpression', 'MethodDefinition'].includes(node.type)) {
        
        // Skip test framework callbacks (describe, it, test, etc.) and jest.mock() callbacks
        // Check if this function is inside a jest.mock() or test framework callback by walking up the tree
        let isTestCallback = false;
        let currentParent = parentMap.get(node);
        let depth = 0;
        const maxDepth = 20; // Allow deeper nesting for complex mocks
        
        while (currentParent && depth < maxDepth) {
          if (currentParent.type === 'CallExpression' && currentParent.callee) {
            // Check for test framework callbacks (Jest)
            if (currentParent.callee.name &&
                ['describe', 'it', 'test', 'beforeEach', 'beforeAll', 'afterEach', 'afterAll'].includes(currentParent.callee.name)) {
              isTestCallback = true;
              break;
            }
            // Check for Playwright test framework callbacks
            if (currentParent.callee.type === 'MemberExpression' &&
                currentParent.callee.object && currentParent.callee.object.name === 'test' &&
                currentParent.callee.property &&
                ['describe', 'beforeEach', 'beforeAll', 'afterEach', 'afterAll'].includes(currentParent.callee.property.name)) {
              isTestCallback = true;
              break;
            }
            // Check for jest.mock()
            if (currentParent.callee.type === 'MemberExpression' &&
                currentParent.callee.object && currentParent.callee.object.name === 'jest' &&
                currentParent.callee.property && currentParent.callee.property.name === 'mock') {
              isTestCallback = true;
              break;
            }
          }
          // Move up to the next parent
          currentParent = parentMap.get(currentParent);
          depth++;
        }
        
        if (!isTestCallback) {
          const params = node.params?.length || 0;
          const lines = node.loc ? node.loc.end.line - node.loc.start.line : 0;
          
          if (params > MAX_PARAMS) {
            violations.push(`Line ${node.loc.start.line}: ${params} params (max ${MAX_PARAMS})`);
          }
          
          if (lines > MAX_FUNCTION_LINES) {
            violations.push(`Line ${node.loc.start.line}: ${lines} lines (max ${MAX_FUNCTION_LINES})`);
          }
        }
      }
      
      // Recurse through AST
      for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(child => visit(child, node));
          } else {
            visit(node[key], node);
          }
        }
      }
    }
    
    visit(ast);
    
    if (violations.length > 0) {
      console.error(`❌ ${filePath}:`);
      violations.forEach(v => console.error(`   ${v}`));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: Parse error - ${error.message}`);
    return false;
  }
}

// Process files from arguments
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(analyzeFile);

if (allPassed) {
  console.log('✅ All complexity checks passed');
}

process.exit(allPassed ? 0 : 1);