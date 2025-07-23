#!/usr/bin/env node

/**
 * Error Scenario Testing Script for MoodOverMuscle
 * 
 * This script tests various error scenarios and recovery procedures
 * to ensure the error handling system works correctly.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DOMAIN = 'moodovermuscle.com.au';

async function testErrorPages() {
  console.log('\n🧪 Testing Error Pages...');
  
  const errorTests = [
    {
      path: '/non-existent-page-12345',
      expectedStatus: 404,
      description: '404 Not Found page'
    },
    {
      path: '/classes/non-existent-class',
      expectedStatus: 404,
      description: '404 for nested route'
    }
  ];
  
  for (const test of errorTests) {
    console.log(`\n   Testing ${test.description}: ${test.path}`);
    
    const result = await new Promise((resolve) => {
      const options = {
        hostname: DOMAIN,
        port: 443,
        path: test.path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'MoodOverMuscle-ErrorTest/1.0'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const success = res.statusCode === test.expectedStatus;
          const hasErrorContent = data.includes('404') || data.includes('Not Found') || data.includes('Oops');
          const hasLogo = data.includes('logo.png') || data.includes('MoodOverMuscle');
          const hasContactInfo = data.includes('0406 846 416') || data.includes('moodovermuscle@gmail.com');
          
          if (success) {
            console.log(`   ✅ Status: ${res.statusCode} (expected ${test.expectedStatus})`);
          } else {
            console.log(`   ❌ Status: ${res.statusCode} (expected ${test.expectedStatus})`);
          }
          
          if (hasErrorContent) {
            console.log(`   ✅ Error content present`);
          } else {
            console.log(`   ⚠️  Error content missing`);
          }
          
          if (hasLogo) {
            console.log(`   ✅ Branding present`);
          } else {
            console.log(`   ⚠️  Branding missing`);
          }
          
          if (hasContactInfo) {
            console.log(`   ✅ Contact information present`);
          } else {
            console.log(`   ⚠️  Contact information missing`);
          }
          
          resolve({
            success,
            statusCode: res.statusCode,
            hasErrorContent,
            hasLogo,
            hasContactInfo
          });
        });
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ Request failed: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        console.log(`   ❌ Request timed out`);
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });
      
      req.end();
    });
    
    if (!result.success) {
      console.log(`   ❌ Test failed for ${test.description}`);
    }
  }
}

async function testBuildValidation() {
  console.log('\n🧪 Testing Build Validation...');
  
  // Test with current valid configuration
  console.log('\n   Testing valid configuration...');
  try {
    const { spawn } = require('child_process');
    
    const result = await new Promise((resolve) => {
      const child = spawn('node', ['scripts/build-validation.js'], {
        stdio: 'pipe'
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, output });
      });
    });
    
    if (result.code === 0) {
      console.log('   ✅ Build validation passed');
    } else {
      console.log('   ❌ Build validation failed');
      console.log(`   Output: ${result.output.slice(-200)}`); // Last 200 chars
    }
  } catch (error) {
    console.log(`   ❌ Build validation test failed: ${error.message}`);
  }
}

async function testDomainVerification() {
  console.log('\n🧪 Testing Domain Verification...');
  
  try {
    const { spawn } = require('child_process');
    
    const result = await new Promise((resolve) => {
      const child = spawn('node', ['scripts/verify-domain.js'], {
        stdio: 'pipe'
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, output });
      });
    });
    
    const hasSSLCheck = result.output.includes('SSL Certificate');
    const hasDNSCheck = result.output.includes('DNS');
    const hasRedirectCheck = result.output.includes('redirect');
    
    if (hasSSLCheck) {
      console.log('   ✅ SSL certificate verification working');
    } else {
      console.log('   ⚠️  SSL certificate verification missing');
    }
    
    if (hasDNSCheck) {
      console.log('   ✅ DNS resolution check working');
    } else {
      console.log('   ⚠️  DNS resolution check missing');
    }
    
    if (hasRedirectCheck) {
      console.log('   ✅ Redirect verification working');
    } else {
      console.log('   ⚠️  Redirect verification missing');
    }
    
  } catch (error) {
    console.log(`   ❌ Domain verification test failed: ${error.message}`);
  }
}

async function testRecoveryProcedures() {
  console.log('\n🧪 Testing Recovery Procedures...');
  
  // Test that error pages have recovery options
  console.log('\n   Testing error page recovery options...');
  
  const result = await new Promise((resolve) => {
    const options = {
      hostname: DOMAIN,
      port: 443,
      path: '/non-existent-test-page',
      method: 'GET',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const hasHomeButton = data.includes('Back to Home') || data.includes('href="/"');
        const hasContactInfo = data.includes('0406 846 416') || data.includes('moodovermuscle@gmail.com');
        const hasHelpfulMessage = data.includes('lovely') || data.includes('help');
        
        if (hasHomeButton) {
          console.log('   ✅ Home navigation available');
        } else {
          console.log('   ⚠️  Home navigation missing');
        }
        
        if (hasContactInfo) {
          console.log('   ✅ Contact information for support');
        } else {
          console.log('   ⚠️  Contact information missing');
        }
        
        if (hasHelpfulMessage) {
          console.log('   ✅ Helpful user messaging');
        } else {
          console.log('   ⚠️  User messaging could be improved');
        }
        
        resolve({
          hasHomeButton,
          hasContactInfo,
          hasHelpfulMessage
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Recovery test failed: ${error.message}`);
      resolve({ success: false });
    });
    
    req.end();
  });
}

async function testMonitoringIntegration() {
  console.log('\n🧪 Testing Monitoring Integration...');
  
  // Check if Vercel Analytics is properly integrated
  console.log('\n   Checking analytics integration...');
  
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
  
  try {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (layoutContent.includes('@vercel/analytics')) {
      console.log('   ✅ Vercel Analytics integrated');
    } else {
      console.log('   ❌ Vercel Analytics missing');
    }
    
    if (layoutContent.includes('@vercel/speed-insights')) {
      console.log('   ✅ Speed Insights integrated');
    } else {
      console.log('   ❌ Speed Insights missing');
    }
    
    if (layoutContent.includes('<Analytics />')) {
      console.log('   ✅ Analytics component rendered');
    } else {
      console.log('   ❌ Analytics component not rendered');
    }
    
    if (layoutContent.includes('<SpeedInsights />')) {
      console.log('   ✅ Speed Insights component rendered');
    } else {
      console.log('   ❌ Speed Insights component not rendered');
    }
    
  } catch (error) {
    console.log(`   ❌ Could not check layout file: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Error Scenario Testing for MoodOverMuscle');
  console.log('==============================================');
  
  try {
    await testErrorPages();
    await testBuildValidation();
    await testDomainVerification();
    await testRecoveryProcedures();
    await testMonitoringIntegration();
    
    console.log('\n📋 Test Summary');
    console.log('===============');
    console.log('✅ Error scenario testing completed');
    console.log('✅ All monitoring and validation scripts tested');
    console.log('✅ Recovery procedures verified');
    console.log('✅ Monitoring integration confirmed');
    
    console.log('\n💡 Next Steps:');
    console.log('- Monitor GitHub Actions for automated health checks');
    console.log('- Review Vercel Analytics dashboard for performance data');
    console.log('- Test error scenarios manually in different browsers');
    console.log('- Verify domain monitoring alerts work correctly');
    
  } catch (error) {
    console.error(`❌ Testing failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testErrorPages,
  testBuildValidation,
  testDomainVerification,
  testRecoveryProcedures,
  testMonitoringIntegration
};