#!/usr/bin/env node

/**
 * Domain Verification Script
 * 
 * Verifies that the domain is properly configured and pointing to Vercel
 */

const https = require('https');
const dns = require('dns').promises;

const DOMAIN = 'moodovermuscle.com.au';

/**
 * Check DNS resolution
 */
async function checkDNS() {
  console.log('🔍 Checking domain resolution for', DOMAIN + '...');
  
  try {
    const addresses = await dns.resolve4(DOMAIN);
    console.log('✅ DNS Resolution:', addresses[0]);
    
    // Check if pointing to Vercel (common Vercel IP ranges)
    const isVercel = addresses.some(ip => 
      ip.startsWith('76.76.') || 
      ip.startsWith('216.198.') || 
      ip.startsWith('64.13.')
    );
    
    if (isVercel) {
      console.log('✅ Domain appears to be pointing to Vercel');
    } else {
      console.log('⚠️  Domain may not be pointing to Vercel');
      console.log('   Current IP:', addresses[0]);
    }
    
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
    const options = {
      hostname: DOMAIN,
      port: 443,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (cert && cert.subject) {
        console.log('✅ SSL Certificate valid');
        console.log('Subject:', cert.subject.CN);
        console.log('Issuer:', cert.issuer.O);
        console.log('Valid until:', cert.valid_to);
        
        // Check if certificate is expiring soon (within 30 days)
        const expiryDate = new Date(cert.valid_to);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
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
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: DOMAIN,
      path: '/',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'MoodOverMuscle-Domain-Verification'
      }
    };

    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      
      console.log('✅ HTTP Status:', res.statusCode);
      console.log('✅ Response time:', responseTime + 'ms');
      
      // Check for important headers
      if (res.headers['x-vercel-id']) {
        console.log('✅ Vercel deployment ID:', res.headers['x-vercel-id']);
      }
      
      if (res.headers['strict-transport-security']) {
        console.log('✅ HSTS:', res.headers['strict-transport-security']);
      }
      
      if (res.headers['x-content-type-options']) {
        console.log('✅ Content Type Options:', res.headers['x-content-type-options']);
      }
      
      if (res.headers['x-frame-options']) {
        console.log('✅ Frame Options:', res.headers['x-frame-options']);
      }
      
      if (!res.headers['content-security-policy']) {
        console.log('⚠️  CSP header missing');
      }
      
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        // Check for essential content
        const hasTitle = body.includes('<title>');
        const hasContent = body.toLowerCase().includes('moodovermuscle');
        
        if (hasTitle) {
          console.log('✅ Page title found');
        } else {
          console.log('❌ Page title missing');
        }
        
        if (hasContent) {
          console.log('✅ Essential content found');
        } else {
          console.log('❌ Essential content missing');
        }
        
        resolve({ 
          success: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          responseTime,
          hasTitle,
          hasContent
        });
      });
    });

    req.on('error', (error) => {
      console.log('❌ Website check failed:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      console.log('❌ Website check timed out');
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
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
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'GET',
        timeout: 5000,
        headers: {
          'User-Agent': 'MoodOverMuscle-Domain-Verification'
        }
      };
      
      const protocol = url.protocol === 'https:' ? https : require('http');
      
      const result = await new Promise((resolve) => {
        const req = protocol.request(options, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log(`✅ Redirect working: ${res.statusCode} → ${res.headers.location}`);
            resolve({ success: true, status: res.statusCode, location: res.headers.location });
          } else {
            console.log(`❌ Unexpected response: ${res.statusCode}`);
            resolve({ success: false, status: res.statusCode });
          }
        });
        
        req.on('error', (error) => {
          console.log(`❌ Redirect test failed: ${error.message}`);
          resolve({ success: false, error: error.message });
        });
        
        req.on('timeout', () => {
          console.log(`❌ Redirect test timed out`);
          resolve({ success: false, error: 'Timeout' });
        });
        
        req.end();
      });
      
      results.push({ test, result });
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
  console.log('=' .repeat(50));
  
  const results = {
    dns: await checkDNS(),
    ssl: await checkSSL(),
    website: await checkWebsite(),
    redirects: await checkRedirects()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(50));
  
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

// Run verification
main().catch((error) => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});