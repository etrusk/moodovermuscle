#!/usr/bin/env node
/**
 * Script to add vitest imports to test files that use vi.* methods
 * but don't have the necessary import statement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all test files
const testFiles = execSync('find __tests__ -type f \\( -name "*.test.ts" -o -name "*.test.tsx" \\)', { 
  encoding: 'utf-8' 
}).trim().split('\n').filter(Boolean);

console.log(`Found ${testFiles.length} test files to check`);

let filesModified = 0;
let filesSkipped = 0;

testFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if file uses vi.* methods
    const usesVi = /\bvi\./m.test(content);
    
    // Check if file already has vitest import
    const hasVitestImport = /from ['"]vitest['"]/m.test(content);
    
    if (usesVi && !hasVitestImport) {
      console.log(`Adding vitest import to: ${filePath}`);
      
      // Find the first import statement or the beginning of the file
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Find first non-comment, non-empty line or first import
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import ') || line.startsWith('/**') || line === '') {
          insertIndex = i;
          if (line.startsWith('import ')) break;
        }
      }
      
      // Determine what to import based on usage
      const imports = ['vi'];
      if (/\bdescribe\(/m.test(content)) imports.push('describe');
      if (/\bit\(/m.test(content)) imports.push('it');
      if (/\bexpect\(/m.test(content)) imports.push('expect');
      if (/\bbeforeEach\(/m.test(content)) imports.push('beforeEach');
      if (/\bafterEach\(/m.test(content)) imports.push('afterEach');
      if (/\bbeforeAll\(/m.test(content)) imports.push('beforeAll');
      if (/\bafterAll\(/m.test(content)) imports.push('afterAll');
      
      const vitestImport = `import { ${imports.join(', ')} } from 'vitest'\n`;
      
      // Insert the import
      lines.splice(insertIndex, 0, vitestImport);
      
      fs.writeFileSync(filePath, lines.join('\n'));
      filesModified++;
    } else {
      filesSkipped++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nComplete!`);
console.log(`Files modified: ${filesModified}`);
console.log(`Files skipped: ${filesSkipped}`);