#!/usr/bin/env node

/**
 * Build Validation Script for MoodOverMuscle
 * 
 * This script validates the build environment and configuration
 * to ensure consistency between development and production.
 */

const fs = require('fs');
const path = require('path');

// Configuration validation
const REQUIRED_FILES = [
  'package.json',
  'next.config.mjs',
  'tailwind.config.ts',
  'tsconfig.json',
  '.env.example'
];

const REQUIRED_DIRECTORIES = [
  'app',
  'components',
  'lib',
  'public',
  'scripts'
];

const REQUIRED_ENV_VARS = [
  // Add required environment variables here as they're needed
  // 'NEXT_PUBLIC_SITE_URL',
  // 'NEXT_PUBLIC_CONTACT_EMAIL'
];

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function validateRequiredFiles() {
  console.log('\n🔍 Validating required files...');
  let allFilesExist = true;
  
  REQUIRED_FILES.forEach(file => {
    if (checkFileExists(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ Missing: ${file}`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function validateRequiredDirectories() {
  console.log('\n🔍 Validating required directories...');
  let allDirsExist = true;
  
  REQUIRED_DIRECTORIES.forEach(dir => {
    if (checkFileExists(dir) && fs.statSync(dir).isDirectory()) {
      console.log(`✅ ${dir}/`);
    } else {
      console.log(`❌ Missing directory: ${dir}/`);
      allDirsExist = false;
    }
  });
  
  return allDirsExist;
}

function validatePackageJson() {
  console.log('\n🔍 Validating package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required scripts
    const requiredScripts = ['build', 'dev', 'start', 'type-check'];
    let scriptsValid = true;
    
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ Script: ${script}`);
      } else {
        console.log(`❌ Missing script: ${script}`);
        scriptsValid = false;
      }
    });
    
    // Check for Next.js dependency
    if (packageJson.dependencies && packageJson.dependencies.next) {
      console.log(`✅ Next.js version: ${packageJson.dependencies.next}`);
    } else {
      console.log('❌ Next.js dependency missing');
      scriptsValid = false;
    }
    
    // Check for React dependencies
    if (packageJson.dependencies && packageJson.dependencies.react) {
      console.log(`✅ React version: ${packageJson.dependencies.react}`);
    } else {
      console.log('❌ React dependency missing');
      scriptsValid = false;
    }
    
    // Check for TypeScript
    if (packageJson.devDependencies && packageJson.devDependencies.typescript) {
      console.log(`✅ TypeScript version: ${packageJson.devDependencies.typescript}`);
    } else {
      console.log('❌ TypeScript dependency missing');
      scriptsValid = false;
    }
    
    return scriptsValid;
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
    return false;
  }
}

function validateNextConfig() {
  console.log('\n🔍 Validating Next.js configuration...');
  
  try {
    // Check if next.config.mjs exists and is readable
    const configPath = 'next.config.mjs';
    if (!checkFileExists(configPath)) {
      console.log('❌ next.config.mjs not found');
      return false;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Basic validation checks
    if (configContent.includes('nextConfig')) {
      console.log('✅ Next.js config structure valid');
    } else {
      console.log('⚠️  Next.js config structure may be invalid');
    }
    
    // Check for production optimizations
    if (configContent.includes('images')) {
      console.log('✅ Image optimization configured');
    } else {
      console.log('ℹ️  Image optimization not explicitly configured');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error validating Next.js config: ${error.message}`);
    return false;
  }
}

function validateTailwindConfig() {
  console.log('\n🔍 Validating Tailwind CSS configuration...');
  
  try {
    const configPath = 'tailwind.config.ts';
    if (!checkFileExists(configPath)) {
      console.log('❌ tailwind.config.ts not found');
      return false;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for essential Tailwind configuration
    if (configContent.includes('content:')) {
      console.log('✅ Tailwind content paths configured');
    } else {
      console.log('❌ Tailwind content paths missing');
      return false;
    }
    
    if (configContent.includes('theme:')) {
      console.log('✅ Tailwind theme configuration found');
    } else {
      console.log('ℹ️  Custom theme configuration not found (using defaults)');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error validating Tailwind config: ${error.message}`);
    return false;
  }
}

function validateTypeScriptConfig() {
  console.log('\n🔍 Validating TypeScript configuration...');
  
  try {
    const configPath = 'tsconfig.json';
    if (!checkFileExists(configPath)) {
      console.log('❌ tsconfig.json not found');
      return false;
    }
    
    const configContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Check for Next.js TypeScript configuration
    if (configContent.extends && configContent.extends.includes('next')) {
      console.log('✅ Next.js TypeScript configuration');
    } else {
      console.log('⚠️  May not be using Next.js TypeScript configuration');
    }
    
    // Check for strict mode
    if (configContent.compilerOptions && configContent.compilerOptions.strict) {
      console.log('✅ TypeScript strict mode enabled');
    } else {
      console.log('⚠️  TypeScript strict mode not enabled');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error validating TypeScript config: ${error.message}`);
    return false;
  }
}

function validateEnvironmentVariables() {
  console.log('\n🔍 Validating environment variables...');
  
  if (REQUIRED_ENV_VARS.length === 0) {
    console.log('ℹ️  No required environment variables defined yet');
    return true;
  }
  
  let allEnvVarsValid = true;
  
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}`);
    } else {
      console.log(`❌ Missing environment variable: ${envVar}`);
      allEnvVarsValid = false;
    }
  });
  
  return allEnvVarsValid;
}

function validateBuildOutput() {
  console.log('\n🔍 Validating build output structure...');
  
  const buildDir = '.next';
  if (!checkFileExists(buildDir)) {
    console.log('ℹ️  No build output found (run `pnpm build` first)');
    return true; // Not an error, just informational
  }
  
  // Check for essential build files
  const buildFiles = [
    '.next/static',
    '.next/server'
  ];
  
  let buildValid = true;
  buildFiles.forEach(file => {
    if (checkFileExists(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`⚠️  Build artifact missing: ${file}`);
      buildValid = false;
    }
  });
  
  return buildValid;
}

async function main() {
  console.log('🔧 Build Validation for MoodOverMuscle');
  console.log('=====================================');
  
  const validations = [
    validateRequiredFiles(),
    validateRequiredDirectories(),
    validatePackageJson(),
    validateNextConfig(),
    validateTailwindConfig(),
    validateTypeScriptConfig(),
    validateEnvironmentVariables(),
    validateBuildOutput()
  ];
  
  const allValid = validations.every(result => result === true);
  
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
    console.log('- Set up required environment variables');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  validateRequiredFiles,
  validateRequiredDirectories,
  validatePackageJson,
  validateNextConfig,
  validateTailwindConfig,
  validateTypeScriptConfig,
  validateEnvironmentVariables,
  validateBuildOutput
};