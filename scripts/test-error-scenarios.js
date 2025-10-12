#!/usr/bin/env node

/**
 * Error Scenarios Testing Script
 * 
 * Tests various error conditions to ensure proper error handling
 */

const { makeRequest, isClientError, isServerError } = require('./lib/http-utils');

const DOMAIN = 'moodovermuscle.com.au';

/**
 * Test 404 error handling
 */
async function test404Handling() {
  console.log('🧪 Testing 404 error handling...');
  
  const testPaths = ['/nonexistent-page', '/random-path-123', '/admin', '/wp-admin'];
  
  for (const path of testPaths) {
    try {
      const response = await makeRequest({ hostname: DOMAIN, path });
      
      if (response.status === 404) {
        console.log(`✅ ${path} correctly returns 404`);
        if (response.body && response.body.includes('404')) {
          console.log('   - Custom 404 page detected');
        }
      } else {
        console.log(`⚠️  ${path} returns ${response.status} instead of 404`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${path}: ${error.message}`);
    }
  }
}

/**
 * Test 500 error handling
 */
async function test500Handling() {
  console.log('\n🧪 Testing 500 error handling...');
  
  const testPaths = ['/api/nonexistent', '/.env', '/server-error-test'];
  
  for (const path of testPaths) {
    try {
      const response = await makeRequest({ hostname: DOMAIN, path });
      
      if (isServerError(response.status)) {
        console.log(`⚠️  ${path} returns ${response.status} (server error)`);
        if (response.body && response.body.includes('500')) {
          console.log('   - Custom 500 page detected');
        }
      } else if (response.status === 404) {
        console.log(`✅ ${path} correctly returns 404 (not server error)`);
      } else {
        console.log(`✅ ${path} returns ${response.status} (handled gracefully)`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${path}: ${error.message}`);
    }
  }
}

/**
 * Test security headers
 */
async function testSecurityHeaders() {
  console.log('\n🧪 Testing security headers...');
  
  try {
    const response = await makeRequest({ hostname: DOMAIN, path: '/' });
    
    const securityHeaders = {
      'strict-transport-security': 'HSTS',
      'x-content-type-options': 'Content Type Options',
      'x-frame-options': 'Frame Options',
      'content-security-policy': 'CSP',
      'x-xss-protection': 'XSS Protection'
    };
    
    for (const [header, name] of Object.entries(securityHeaders)) {
      if (response.headers[header]) {
        console.log(`✅ ${name}: ${response.headers[header]}`);
      } else {
        console.log(`⚠️  ${name}: Missing`);
      }
    }
  } catch (error) {
    console.log(`❌ Error testing security headers: ${error.message}`);
  }
}

/**
 * Test form submission errors
 */
async function testFormErrors() {
  console.log('\n🧪 Testing form error handling...');
  
  const testData = [
    { name: 'empty-email', data: 'name=Test&email=&phone=123' },
    { name: 'invalid-email', data: 'name=Test&email=invalid-email&phone=123' },
    { name: 'missing-fields', data: 'email=test@example.com' },
    { name: 'oversized-data', data: 'name=' + 'A'.repeat(10000) + '&email=test@example.com' }
  ];
  
  for (const test of testData) {
    try {
      const response = await makeRequest({
        hostname: DOMAIN,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: test.data
      });
      
      if (isClientError(response.status)) {
        console.log(`✅ ${test.name}: Correctly rejected with ${response.status}`);
      } else if (response.status === 404) {
        console.log(`ℹ️  ${test.name}: No contact API endpoint (expected for static site)`);
      } else {
        console.log(`⚠️  ${test.name}: Unexpected response ${response.status}`);
      }
    } catch (error) {
      console.log(`ℹ️  ${test.name}: ${error.message} (expected for static site)`);
    }
  }
}

/**
 * Test rate limiting
 */
async function testRateLimiting() {
  console.log('\n🧪 Testing rate limiting...');
  
  const requests = [];
  const startTime = Date.now();
  
  for (let i = 0; i < 10; i++) {
    requests.push(makeRequest({ hostname: DOMAIN, path: '/' }));
  }
  
  try {
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;
    
    const rateLimited = responses.some(r => r.status === 429);
    const allSuccessful = responses.every(r => r.status === 200);
    
    console.log(`📊 Made 10 requests in ${duration}ms`);
    
    if (rateLimited) {
      console.log('✅ Rate limiting detected (429 responses)');
    } else if (allSuccessful) {
      console.log('ℹ️  All requests successful (no rate limiting detected)');
    } else {
      console.log('⚠️  Mixed responses - check rate limiting configuration');
    }
  } catch (error) {
    console.log(`❌ Error testing rate limiting: ${error.message}`);
  }
}

/**
 * Main testing function
 */
async function main() {
  console.log('🧪 Error Scenarios Testing for', DOMAIN);
  console.log('='.repeat(50));
  
  await test404Handling();
  await test500Handling();
  await testSecurityHeaders();
  await testFormErrors();
  await testRateLimiting();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 ERROR TESTING COMPLETE');
  console.log('='.repeat(50));
  console.log('\n✅ Error scenario testing completed');
  console.log('Review the results above to ensure proper error handling');
}

main().catch((error) => {
  console.error('❌ Error testing failed:', error.message);
  process.exit(1);
});