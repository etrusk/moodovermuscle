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
    
    // Check file size
    if (lines.length > MAX_FILE_LINES) {
      console.error(`❌ ${filePath}: ${lines.length} lines (max ${MAX_FILE_LINES})`);
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
    
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      
      // Check all function types
      if (['FunctionDeclaration', 'ArrowFunctionExpression', 
           'FunctionExpression', 'MethodDefinition'].includes(node.type)) {
        
        const params = node.params?.length || 0;
        const lines = node.loc ? node.loc.end.line - node.loc.start.line : 0;
        
        if (params > MAX_PARAMS) {
          violations.push(`Line ${node.loc.start.line}: ${params} params (max ${MAX_PARAMS})`);
        }
        
        if (lines > MAX_FUNCTION_LINES) {
          violations.push(`Line ${node.loc.start.line}: ${lines} lines (max ${MAX_FUNCTION_LINES})`);
        }
      }
      
      // Recurse through AST
      for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(visit);
          } else {
            visit(node[key]);
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