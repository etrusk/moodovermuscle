#!/usr/bin/env node

/**
 * Domain Verification Script for moodovermuscle.com.au
 * 
 * This script helps verify that the custom domain is properly configured
 * and working with Vercel deployment.
 */

const https = require('https');
const dns = require('dns').promises;

const DOMAIN = 'moodovermuscle.com.au';
const WWW_DOMAIN = 'www.moodovermuscle.com.au';
const VERCEL_IPS = ['216.198.79.1'];

async function checkDNS(domain) {
  console.log(`\n🔍 Checking DNS for ${domain}...`);
  
  try {
    // Check A records
    const aRecords = await dns.resolve4(domain);
    console.log(`✅ A Records: ${aRecords.join(', ')}`);
    
    // Verify if pointing to Vercel IPs
    const pointsToVercel = aRecords.some(ip => VERCEL_IPS.includes(ip));
    if (pointsToVercel) {
      console.log('✅ Domain points to Vercel servers');
    } else {
      console.log('⚠️  Domain may not be pointing to Vercel servers');
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.log('❌ DNS not found - domain may not be configured yet');
    } else {
      console.log(`❌ DNS Error: ${error.message}`);
    }
    return false;
  }
}

async function checkCNAME(domain) {
  console.log(`\n🔍 Checking CNAME for ${domain}...`);
  
  try {
    const cnameRecords = await dns.resolveCname(domain);
    console.log(`✅ CNAME Records: ${cnameRecords.join(', ')}`);
    
    // Check if pointing to Vercel
    const pointsToVercel = cnameRecords.some(cname => 
      cname.includes('vercel-dns.com') || cname.includes('vercel.app') || cname.includes('vercel-dns-017.com')
    );
    
    if (pointsToVercel) {
      console.log('✅ CNAME points to Vercel');
    } else {
      console.log('⚠️  CNAME may not be pointing to Vercel');
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ENODATA') {
      console.log('ℹ️  No CNAME records found (may be using A records)');
    } else {
      console.log(`❌ CNAME Error: ${error.message}`);
    }
    return false;
  }
}

async function checkHTTPS(domain) {
  console.log(`\n🔍 Checking HTTPS for ${domain}...`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ HTTPS Status: ${res.statusCode}`);
      console.log(`✅ SSL Certificate: Valid`);
      
      // Check security headers
      const securityHeaders = [
        'strict-transport-security',
        'x-content-type-options',
        'x-frame-options'
      ];
      
      securityHeaders.forEach(header => {
        if (res.headers[header]) {
          console.log(`✅ ${header}: ${res.headers[header]}`);
        }
      });
      
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log(`❌ HTTPS Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ HTTPS request timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function checkRedirect(fromDomain, toDomain) {
  console.log(`\n🔍 Checking redirect from ${fromDomain} to ${toDomain}...`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: fromDomain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        const location = res.headers.location;
        if (location && location.includes(toDomain)) {
          console.log(`✅ Redirect working: ${res.statusCode} → ${location}`);
          resolve(true);
        } else {
          console.log(`⚠️  Unexpected redirect: ${res.statusCode} → ${location}`);
          resolve(false);
        }
      } else {
        console.log(`⚠️  No redirect found (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Redirect check error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ Redirect check timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log('🚀 Domain Verification for MoodOverMuscle');
  console.log('==========================================');
  
  // Check main domain DNS
  const mainDNS = await checkDNS(DOMAIN);
  await checkCNAME(DOMAIN);
  
  // Check www subdomain DNS
  const wwwDNS = await checkDNS(WWW_DOMAIN);
  await checkCNAME(WWW_DOMAIN);
  
  // Only check HTTPS if DNS is working
  if (mainDNS) {
    await checkHTTPS(DOMAIN);
  }
  
  // Check www to non-www domain redirect
  if (wwwDNS) {
    await checkRedirect(WWW_DOMAIN, DOMAIN);
  }
  
  console.log('\n📋 Summary:');
  console.log('===========');
  console.log('1. Configure DNS records at your domain registrar');
  console.log('2. Add custom domain in Vercel project settings');
  console.log('3. Wait for DNS propagation (can take up to 48 hours)');
  console.log('4. Verify SSL certificate is automatically provisioned');
  console.log('5. Test domain resolution and redirects');
  
  console.log('\n💡 Next Steps:');
  console.log('- Run this script periodically to monitor domain status');
  console.log('- Check Vercel dashboard for domain configuration status');
  console.log('- Test the site from different locations/networks');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkDNS, checkCNAME, checkHTTPS, checkRedirect };