#!/usr/bin/env node

/**
 * Check Vercel DNS endpoints and alternatives
 */

const dns = require('dns').promises;

const VERCEL_ENDPOINTS = [
  'cname.vercel-dns.com',
  'alias.zeit.co',
  'alias.vercel.app'
];

async function checkEndpoint(endpoint) {
  try {
    const addresses = await dns.resolve4(endpoint);
    console.log(`✅ ${endpoint} resolves to: ${addresses.join(', ')}`);
    return true;
  } catch (error) {
    console.log(`❌ ${endpoint} failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking Vercel DNS endpoints...\n');
  
  for (const endpoint of VERCEL_ENDPOINTS) {
    await checkEndpoint(endpoint);
  }
  
  console.log('\n💡 Any of the working endpoints above can be used as CNAME value');
  console.log('💡 Most DNS providers prefer: cname.vercel-dns.com');
}

main().catch(console.error);