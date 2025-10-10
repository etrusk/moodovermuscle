const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const installed = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Match npm package imports (not relative paths)
    const importRegex = /from ['"]([^'".\\/][^'"]*)['"]|require\(['"]([^'".\\/][^'"]*)['"]\)/g;
    let match;
    let allValid = true;
    
    while ((match = importRegex.exec(content)) !== null) {
      const fullPath = match[1] || match[2];
      
      // Extract base package name
      const basePkg = fullPath.startsWith('@') 
        ? fullPath.split('/').slice(0, 2).join('/')
        : fullPath.split('/')[0];
      
      if (!installed[basePkg]) {
        console.error(`❌ ${filePath}: Package '${basePkg}' not in package.json`);
        console.error(`   Run: pnpm add ${basePkg}`);
        allValid = false;
      }
    }
    
    return allValid;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('✅ No files to check');
  process.exit(0);
}

const allPassed = files.every(checkFile);

if (allPassed) {
  console.log('✅ All package imports valid');
}

process.exit(allPassed ? 0 : 1);