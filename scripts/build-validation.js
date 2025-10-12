#!/usr/bin/env node

/**
 * Build Validation Script for MoodOverMuscle
 * 
 * Validates the build environment and configuration
 */

const fs = require('fs');

const VALIDATIONS = {
  files: ['package.json', 'next.config.mjs', 'tailwind.config.ts', 'tsconfig.json', '.env.example'],
  directories: ['app', 'components', 'lib', 'public', 'scripts'],
  scripts: ['build', 'dev', 'start', 'type-check'],
  dependencies: [
    { name: 'next', key: 'dependencies' },
    { name: 'react', key: 'dependencies' },
    { name: 'typescript', key: 'devDependencies' }
  ],
  configs: [
    { file: 'next.config.mjs', check: 'nextConfig', name: 'Next.js config' },
    { file: 'tailwind.config.ts', check: 'content:', name: 'Tailwind content paths' },
    { file: 'tsconfig.json', check: null, name: 'TypeScript config', json: true }
  ]
};

function exists(path) {
  try {
    return fs.existsSync(path);
  } catch {
    return false;
  }
}

function validate(category, items, checker) {
  console.log(`\n🔍 Validating ${category}...`);
  const results = items.map(item => {
    const result = checker(item);
    console.log(`${result ? '✅' : '❌'} ${typeof item === 'string' ? item : item.name}`);
    return result;
  });
  return results.every(r => r);
}

function checkFile(file) {
  return exists(file);
}

function checkDirectory(dir) {
  return exists(dir) && fs.statSync(dir).isDirectory();
}

function checkPackageJson(dep) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg[dep.key] && pkg[dep.key][dep.name];
  } catch {
    return false;
  }
}

function checkScript(script) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg.scripts && pkg.scripts[script];
  } catch {
    return false;
  }
}

function checkConfig(config) {
  try {
    if (!exists(config.file)) return false;
    const content = fs.readFileSync(config.file, 'utf8');
    if (config.json) {
      JSON.parse(content);
      return true;
    }
    return !config.check || content.includes(config.check);
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔧 Build Validation for MoodOverMuscle');
  console.log('=====================================');
  
  const results = [
    validate('required files', VALIDATIONS.files, checkFile),
    validate('required directories', VALIDATIONS.directories, checkDirectory),
    validate('package.json scripts', VALIDATIONS.scripts, checkScript),
    validate('dependencies', VALIDATIONS.dependencies, checkPackageJson),
    validate('configuration files', VALIDATIONS.configs, checkConfig)
  ];
  
  const allValid = results.every(r => r);
  
  console.log('\n📋 Validation Summary:');
  console.log('======================');
  
  if (allValid) {
    console.log('✅ All validations passed! Build environment is ready.');
    process.exit(0);
  } else {
    console.log('❌ Some validations failed. Please fix the issues above.');
    console.log('\n💡 Common fixes:');
    console.log('- Run `pnpm install` to install missing dependencies');
    console.log('- Check configuration files for syntax errors');
    console.log('- Ensure all required files are present');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validate, checkFile, checkDirectory };