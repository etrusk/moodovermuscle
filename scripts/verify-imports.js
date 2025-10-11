const fs = require('fs');
const https = require('https');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Node.js built-in modules that don't need to be in package.json
const builtInModules = [
  'child_process', 'fs', 'path', 'http', 'https', 'crypto', 'util',
  'stream', 'events', 'url', 'querystring', 'os', 'process', 'buffer',
  'assert', 'zlib', 'net', 'tls', 'readline', 'dns', 'timers'
];

const installed = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

// Cache for verified packages
const verifiedCache = new Set();

function verifyPackageExists(pkgName) {
  return new Promise((resolve) => {
    if (verifiedCache.has(pkgName)) {
      resolve(true);
      return;
    }

    const url = `https://registry.npmjs.org/${pkgName}`;
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        verifiedCache.add(pkgName);
        resolve(true);
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

function extractPackages(content) {
  const importRegex = /from ['"]([@\w][@\w\-\/]*)['"]/g;
  const requireRegex = /require\(['"]([@\w][@\w\-\/]*)['"]\)/g;
  
  const matches = new Set();
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const fullPath = match[1];
    const basePkg = fullPath.startsWith('@')
      ? fullPath.split('/').slice(0, 2).join('/')
      : fullPath.split('/')[0];
    matches.add(basePkg);
  }
  
  while ((match = requireRegex.exec(content)) !== null) {
    const fullPath = match[1];
    const basePkg = fullPath.startsWith('@')
      ? fullPath.split('/').slice(0, 2).join('/')
      : fullPath.split('/')[0];
    matches.add(basePkg);
  }
  
  return matches;
}

async function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = extractPackages(content);
    
    let allValid = true;
    
    for (const pkg of matches) {
      // Skip built-in Node.js modules
      if (builtInModules.includes(pkg)) {
        continue;
      }
      
      if (!installed[pkg]) {
        const exists = await verifyPackageExists(pkg);
        
        if (!exists) {
          console.error(`❌ ${filePath}: Package '${pkg}' does not exist in npm registry`);
          console.error(`   This may be a hallucinated package`);
          allValid = false;
        } else {
          console.error(`❌ ${filePath}: Package '${pkg}' exists but not installed`);
          console.error(`   Run: pnpm add ${pkg}`);
          allValid = false;
        }
      }
    }
    
    return allValid;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  const files = process.argv.slice(2);
  
  if (files.length === 0) {
    console.log('✅ No files to verify');
    process.exit(0);
  }
  
  const results = await Promise.all(files.map(checkFile));
  const allPassed = results.every(r => r);
  
  if (allPassed) {
    console.log('✅ All imports verified');
  }
  
  process.exit(allPassed ? 0 : 1);
}

main();