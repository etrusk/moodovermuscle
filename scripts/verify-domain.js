#!/usr/bin/env node

/**
 * Domain Verification Script
 * 
 * Verifies that the domain is properly configured and pointing to Vercel
 */

const https = require('https');
const dns = require('dns').promises;
const { makeRequest } = require('./lib/http-utils');

const DOMAIN = 'moodovermuscle.com.au';

/**
 * Check DNS resolution
 */
async function checkDNS() {
  console.log('🔍 Checking domain resolution for', DOMAIN + '...');
  
  try {
    const addresses = await dns.resolve4(DOMAIN);
    console.log('✅ DNS Resolution:', addresses[0]);
    
    const isVercel = addresses.some(ip => 
      ip.startsWith('76.76.') || 
      ip.startsWith('216.198.') || 
      ip.startsWith('64.13.')
    );
    
    console.log(isVercel ? '✅ Domain appears to be pointing to Vercel' : '⚠️  Domain may not be pointing to Vercel');
    if (!isVercel) console.log('   Current IP:', addresses[0]);
    
    return { success: true, addresses };
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check SSL certificate
 */
async function checkSSL() {
  console.log('🔒 Checking SSL certificate for', DOMAIN + '...');
  
  return new Promise((resolve) => {
    const req = https.request({ hostname: DOMAIN, port: 443, method: 'GET', timeout: 10000 }, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (cert && cert.subject) {
        console.log('✅ SSL Certificate valid');
        console.log('Subject:', cert.subject.CN);
        console.log('Issuer:', cert.issuer.O);
        console.log('Valid until:', cert.valid_to);
        
        const expiryDate = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 30) {
          console.log('⚠️  Certificate expires in', daysUntilExpiry, 'days');
        } else {
          console.log('✅ Certificate valid for', daysUntilExpiry, 'days');
        }
        
        resolve({ success: true, cert, daysUntilExpiry });
      } else {
        console.log('❌ No SSL certificate found');
        resolve({ success: false, error: 'No certificate' });
      }
    });

    req.on('error', (error) => {
      console.log('❌ SSL check failed:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      console.log('❌ SSL check timed out');
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

/**
 * Check website response
 */
async function checkWebsite() {
  console.log('🌐 Checking website response for https://' + DOMAIN + '/...');
  
  const startTime = Date.now();
  const response = await makeRequest({ hostname: DOMAIN, path: '/' });
  const responseTime = Date.now() - startTime;
  
  if (!response.accessible) {
    console.log('❌ Website check failed:', response.error || 'Timeout');
    return { success: false, error: response.error || 'Timeout' };
  }
  
  console.log('✅ HTTP Status:', response.status);
  console.log('✅ Response time:', responseTime + 'ms');
  
  const headers = response.headers;
  if (headers['x-vercel-id']) console.log('✅ Vercel deployment ID:', headers['x-vercel-id']);
  if (headers['strict-transport-security']) console.log('✅ HSTS:', headers['strict-transport-security']);
  if (headers['x-content-type-options']) console.log('✅ Content Type Options:', headers['x-content-type-options']);
  if (headers['x-frame-options']) console.log('✅ Frame Options:', headers['x-frame-options']);
  if (!headers['content-security-policy']) console.log('⚠️  CSP header missing');
  
  const hasTitle = response.body.includes('<title>');
  const hasContent = response.body.toLowerCase().includes('moodovermuscle');
  
  console.log(hasTitle ? '✅ Page title found' : '❌ Page title missing');
  console.log(hasContent ? '✅ Essential content found' : '❌ Essential content missing');
  
  return { 
    success: response.status >= 200 && response.status < 300,
    status: response.status,
    responseTime,
    hasTitle,
    hasContent
  };
}

/**
 * Check redirects
 */
async function checkRedirects() {
  console.log('🔄 Checking redirects...');
  
  const redirectTests = [
    { from: 'http://' + DOMAIN, to: 'https://' + DOMAIN, description: 'HTTP to HTTPS' },
    { from: 'https://www.' + DOMAIN, to: 'https://' + DOMAIN, description: 'WWW to non-WWW' }
  ];
  
  const results = [];
  
  for (const test of redirectTests) {
    console.log(`Testing ${test.description}: ${test.from} → ${test.to}`);
    
    try {
      const url = new URL(test.from);
      const protocol = url.protocol === 'https:' ? 'https' : 'http';
      const response = await makeRequest({ 
        hostname: url.hostname, 
        path: url.pathname, 
        protocol 
      });
      
      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        console.log(`✅ Redirect working: ${response.status} → ${response.headers.location}`);
        results.push({ test, result: { success: true, status: response.status, location: response.headers.location } });
      } else {
        console.log(`❌ Unexpected response: ${response.status}`);
        results.push({ test, result: { success: false, status: response.status } });
      }
    } catch (error) {
      console.log(`❌ Error testing ${test.description}: ${error.message}`);
      results.push({ test, result: { success: false, error: error.message } });
    }
  }
  
  return results;
}

/**
 * Main verification function
 */
async function main() {
  console.log('🔍 Domain Verification for', DOMAIN);
  console.log('='.repeat(50));
  
  const results = {
    dns: await checkDNS(),
    ssl: await checkSSL(),
    website: await checkWebsite(),
    redirects: await checkRedirects()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  
  const checks = [
    { name: 'DNS Resolution', result: results.dns.success },
    { name: 'SSL Certificate', result: results.ssl.success },
    { name: 'Website Response', result: results.website.success },
    { name: 'Redirects', result: results.redirects.every(r => r.result.success) }
  ];
  
  const passedChecks = checks.filter(c => c.result).length;
  const totalChecks = checks.length;
  
  console.log(`\n🎯 Domain Health: ${passedChecks}/${totalChecks} checks passed`);
  
  checks.forEach(check => {
    console.log(`${check.result ? '✅' : '❌'} ${check.name}`);
  });
  
  if (passedChecks === totalChecks) {
    console.log('\n✅ Domain is properly configured and ready!');
    process.exit(0);
  } else {
    console.log('\n❌ Domain configuration issues detected');
    console.log('Please review the failed checks above');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});