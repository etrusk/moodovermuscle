#!/usr/bin/env node

/**
 * Preview Branch Setup Verification Script
 * Verifies that the preview environment is properly configured
 */

const https = require('https');
const dns = require('dns').promises;

const PREVIEW_URL = 'preview.moodovermuscle.com.au';
const VERCEL_DNS_PATTERNS = [
  'cname.vercel-dns.com',
  /^[a-f0-9]+\.vercel-dns-\d+\.com$/,
  'alias.vercel.app',
  'alias.zeit.co'
];

function isValidVercelEndpoint(endpoint) {
  return VERCEL_DNS_PATTERNS.some(pattern => {
    if (typeof pattern === 'string') {
      return endpoint === pattern;
    } else {
      return pattern.test(endpoint);
    }
  });
}

async function checkDNS() {
  console.log('🔍 Checking DNS configuration...');
  
  try {
    const records = await dns.resolveCname(PREVIEW_URL);
    console.log(`✅ CNAME record found: ${records[0]}`);
    
    if (isValidVercelEndpoint(records[0])) {
      console.log('✅ CNAME points to valid Vercel endpoint');
      return true;
    } else {
      console.log(`❌ CNAME should point to a Vercel endpoint, but points to ${records[0]}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ DNS lookup failed: ${error.message}`);
    console.log('💡 This is expected if DNS hasn\'t propagated yet or CNAME isn\'t added');
    return false;
  }
}

async function checkHTTPS() {
  console.log('\n🔍 Checking HTTPS response...');
  
  return new Promise((resolve) => {
    const req = https.request(`https://${PREVIEW_URL}`, { timeout: 5000 }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log(`✅ HTTPS response: ${res.statusCode}`);
        if (res.statusCode === 401) {
          console.log('💡 401 response is normal - indicates Vercel is serving the site');
        }
        console.log(`✅ SSL certificate working`);
        
        // Consume response data to prevent hanging
        res.on('data', () => {});
        res.on('end', () => {
          req.destroy();
          resolve(true);
        });
      } else {
        console.log(`⚠️  Unexpected response: ${res.statusCode}`);
        req.destroy();
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ HTTPS request failed: ${error.message}`);
      console.log('💡 This is expected if domain isn\'t configured in Vercel yet');
      req.destroy();
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ Request timed out');
      req.destroy();
      resolve(false);
    });
    
    req.setTimeout(5000);
    req.end();
  });
}

async function checkBranchDeployment() {
  console.log('\n🔍 Checking branch deployment status...');
  console.log('💡 You can verify this manually in your Vercel dashboard');
  console.log(`   - Go to vercel.com/dashboard`);
  console.log(`   - Check if preview branch deployments are listed`);
  console.log(`   - Verify ${PREVIEW_URL} is configured as custom domain`);
}

async function main() {
  console.log('🚀 Preview Branch Setup Verification\n');
  
  const dnsWorking = await checkDNS();
  const httpsWorking = await checkHTTPS();
  await checkBranchDeployment();
  
  console.log('\n📋 Summary:');
  console.log(`DNS Configuration: ${dnsWorking ? '✅' : '❌'}`);
  console.log(`HTTPS Response: ${httpsWorking ? '✅' : '❌'}`);
  
  if (dnsWorking && httpsWorking) {
    console.log('\n🎉 Preview environment is fully configured!');
    console.log(`🔗 Preview URL: https://${PREVIEW_URL}`);
    console.log('\n📝 Next steps:');
    console.log('1. Test the workflow by merging a feature branch to preview');
    console.log('2. Verify changes appear on the preview URL');
    console.log('3. Merge preview to main when ready for production');
  } else {
    console.log('\n⏳ Setup still in progress...');
    console.log('\n📝 Remaining tasks:');
    if (!dnsWorking) {
      console.log('- Add CNAME record: preview → [vercel-dns-endpoint]');
    }
    if (!httpsWorking) {
      console.log('- Configure preview.moodovermuscle.com.au in Vercel dashboard');
    }
    console.log('\n💡 DNS changes can take up to 48 hours to propagate globally');
  }
}

main().catch(console.error);