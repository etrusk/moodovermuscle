#!/usr/bin/env node

/**
 * Health Check Script for MoodOverMuscle
 * 
 * This script performs comprehensive health checks on the deployed application
 * including domain resolution, SSL certificates, performance metrics, and functionality.
 */

const https = require('https');
const http = require('http');
const dns = require('dns').promises;

const DOMAIN = 'moodovermuscle.com.au';
const WWW_DOMAIN = 'www.moodovermuscle.com.au';
const TIMEOUT = 10000; // 10 seconds

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  responseTime: 3000, // 3 seconds
  ttfb: 1000, // 1 second Time To First Byte
  sslHandshake: 2000 // 2 seconds for SSL handshake
};

async function checkDomainResolution(domain) {
  console.log(`\n🔍 Checking domain resolution for ${domain}...`);
  
  try {
    const addresses = await dns.resolve4(domain);
    console.log(`✅ DNS Resolution: ${addresses.join(', ')}`);
    return { success: true, addresses };
  } catch (error) {
    console.log(`❌ DNS Resolution failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkSSLCertificate(domain) {
  console.log(`\n🔒 Checking SSL certificate for ${domain}...`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'HEAD',
      timeout: TIMEOUT
    };
    
    const startTime = Date.now();
    const req = https.request(options, (res) => {
      const sslHandshakeTime = Date.now() - startTime;
      const cert = res.socket.getPeerCertificate();
      
      if (cert && cert.subject) {
        console.log(`✅ SSL Certificate valid`);
        console.log(`   Subject: ${cert.subject.CN}`);
        console.log(`   Issuer: ${cert.issuer.O}`);
        console.log(`   Valid until: ${cert.valid_to}`);
        console.log(`   SSL Handshake time: ${sslHandshakeTime}ms`);
        
        // Check if certificate is expiring soon (within 30 days)
        const expiryDate = new Date(cert.valid_to);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (expiryDate < thirtyDaysFromNow) {
          console.log(`⚠️  Certificate expires soon: ${cert.valid_to}`);
        }
        
        resolve({
          success: true,
          certificate: cert,
          handshakeTime: sslHandshakeTime,
          expiryWarning: expiryDate < thirtyDaysFromNow
        });
      } else {
        console.log(`❌ Invalid SSL certificate`);
        resolve({ success: false, error: 'Invalid certificate' });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ SSL check failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log(`❌ SSL check timed out`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function checkWebsiteResponse(domain, path = '/') {
  console.log(`\n🌐 Checking website response for https://${domain}${path}...`);
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: domain,
      port: 443,
      path: path,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'MoodOverMuscle-HealthCheck/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ HTTP Status: ${res.statusCode}`);
        console.log(`✅ Response time: ${responseTime}ms`);
        
        // Check performance thresholds
        if (responseTime > PERFORMANCE_THRESHOLDS.responseTime) {
          console.log(`⚠️  Response time exceeds threshold (${PERFORMANCE_THRESHOLDS.responseTime}ms)`);
        }
        
        // Check for essential content
        const hasTitle = data.includes('<title>') && data.includes('MoodOverMuscle');
        const hasContent = data.includes('Emily') || data.includes('M.O.M.unity');
        
        if (hasTitle) {
          console.log(`✅ Page title found`);
        } else {
          console.log(`⚠️  Page title missing or incorrect`);
        }
        
        if (hasContent) {
          console.log(`✅ Essential content found`);
        } else {
          console.log(`⚠️  Essential content missing`);
        }
        
        // Check security headers
        const securityHeaders = {
          'strict-transport-security': 'HSTS',
          'x-content-type-options': 'Content Type Options',
          'x-frame-options': 'Frame Options',
          'content-security-policy': 'CSP'
        };
        
        Object.entries(securityHeaders).forEach(([header, name]) => {
          if (res.headers[header]) {
            console.log(`✅ ${name}: ${res.headers[header]}`);
          } else {
            console.log(`⚠️  ${name} header missing`);
          }
        });
        
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          responseTime,
          hasTitle,
          hasContent,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Website check failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.log(`❌ Website check timed out`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function checkRedirects() {
  console.log(`\n🔄 Checking redirects...`);
  
  const redirectTests = [
    { from: `http://${DOMAIN}`, to: `https://${DOMAIN}`, description: 'HTTP to HTTPS' },
    { from: `https://${WWW_DOMAIN}`, to: `https://${DOMAIN}`, description: 'WWW to non-WWW' }
  ];
  
  const results = [];
  
  for (const test of redirectTests) {
    console.log(`\n   Testing ${test.description}: ${test.from} → ${test.to}`);
    
    const result = await new Promise((resolve) => {
      const url = new URL(test.from);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      const port = isHttps ? 443 : 80;
      
      const options = {
        hostname: url.hostname,
        port: port,
        path: url.pathname,
        method: 'HEAD',
        timeout: TIMEOUT
      };
      
      const req = client.request(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          const location = res.headers.location;
          if (location && location.startsWith(test.to)) {
            console.log(`   ✅ Redirect working: ${res.statusCode} → ${location}`);
            resolve({ success: true, statusCode: res.statusCode, location });
          } else {
            console.log(`   ⚠️  Unexpected redirect: ${res.statusCode} → ${location}`);
            resolve({ success: false, statusCode: res.statusCode, location });
          }
        } else {
          console.log(`   ⚠️  No redirect found (Status: ${res.statusCode})`);
          resolve({ success: false, statusCode: res.statusCode });
        }
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ Redirect test failed: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
      
      req.on('timeout', () => {
        console.log(`   ❌ Redirect test timed out`);
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });
      
      req.end();
    });
    
    results.push({ test, result });
  }
  
  return results;
}

async function checkCriticalPages() {
  console.log(`\n📄 Checking critical pages...`);
  
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/classes', name: 'Classes page' }
  ];
  
  const results = [];
  
  for (const page of pages) {
    console.log(`\n   Checking ${page.name} (${page.path})...`);
    const result = await checkWebsiteResponse(DOMAIN, page.path);
    results.push({ page, result });
  }
  
  return results;
}

async function generateHealthReport(results) {
  console.log('\n📊 Health Check Report');
  console.log('======================');
  
  const timestamp = new Date().toISOString();
  console.log(`Report generated: ${timestamp}`);
  
  // Overall status
  const allChecksPass = Object.values(results).every(result => {
    if (Array.isArray(result)) {
      return result.every(item => item.result?.success !== false);
    }
    return result.success !== false;
  });
  
  console.log(`\n🎯 Overall Status: ${allChecksPass ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
  
  // Detailed breakdown
  console.log('\n📋 Check Summary:');
  console.log(`   DNS Resolution: ${results.dns.success ? '✅' : '❌'}`);
  console.log(`   SSL Certificate: ${results.ssl.success ? '✅' : '❌'}`);
  console.log(`   Website Response: ${results.website.success ? '✅' : '❌'}`);
  console.log(`   Redirects: ${results.redirects.every(r => r.result.success) ? '✅' : '⚠️'}`);
  console.log(`   Critical Pages: ${results.pages.every(p => p.result.success) ? '✅' : '❌'}`);
  
  // Warnings and recommendations
  console.log('\n💡 Recommendations:');
  
  if (!results.dns.success) {
    console.log('   • Check DNS configuration at domain registrar');
  }
  
  if (!results.ssl.success) {
    console.log('   • Verify SSL certificate configuration in Vercel');
  }
  
  if (results.ssl.expiryWarning) {
    console.log('   • SSL certificate expires soon - monitor renewal');
  }
  
  if (results.website.responseTime > PERFORMANCE_THRESHOLDS.responseTime) {
    console.log('   • Website response time is slow - check performance');
  }
  
  const failedRedirects = results.redirects.filter(r => !r.result.success);
  if (failedRedirects.length > 0) {
    console.log('   • Some redirects are not working properly');
  }
  
  const failedPages = results.pages.filter(p => !p.result.success);
  if (failedPages.length > 0) {
    console.log('   • Some critical pages are not responding correctly');
  }
  
  return {
    timestamp,
    overall: allChecksPass ? 'HEALTHY' : 'ISSUES_DETECTED',
    results
  };
}

async function main() {
  console.log('🏥 Health Check for MoodOverMuscle');
  console.log('==================================');
  
  try {
    // Run all health checks
    const results = {
      dns: await checkDomainResolution(DOMAIN),
      ssl: await checkSSLCertificate(DOMAIN),
      website: await checkWebsiteResponse(DOMAIN),
      redirects: await checkRedirects(),
      pages: await checkCriticalPages()
    };
    
    // Generate comprehensive report
    const report = await generateHealthReport(results);
    
    // Exit with appropriate code
    process.exit(report.overall === 'HEALTHY' ? 0 : 1);
    
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkDomainResolution,
  checkSSLCertificate,
  checkWebsiteResponse,
  checkRedirects,
  checkCriticalPages,
  generateHealthReport
};