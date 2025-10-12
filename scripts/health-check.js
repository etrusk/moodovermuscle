#!/usr/bin/env node

/**
 * Post-Transfer Health Check Script
 * 
 * This script performs a comprehensive health check of the repository,
 * website, and all integrations after the transfer is complete
 */

const dns = require('dns').promises;
const { makeRequest, makeGitHubRequest, formatResponseTime } = require('./lib/http-utils');

// Configuration
const TARGET_OWNER = 'etrusk';
const TARGET_REPO = 'moodovermuscle';
const DOMAIN = 'moodovermuscle.com.au';
const EXPECTED_PAGES = ['/', '/classes'];

/**
 * Check repository health
 */
async function checkRepositoryHealth() {
  console.log('📋 Repository Health Check');
  console.log('-'.repeat(40));

  try {
    const response = await makeGitHubRequest(`/repos/${TARGET_OWNER}/${TARGET_REPO}`);
    
    if (response.status === 200) {
      const repo = response.data;
      console.log('✅ Repository is accessible');
      console.log(`   - URL: https://github.com/${repo.full_name}`);
      console.log(`   - Default branch: ${repo.default_branch}`);
      console.log(`   - Last updated: ${repo.updated_at}`);
      console.log(`   - Size: ${repo.size} KB`);
      
      // Check recent commits
      const commitsResponse = await makeGitHubRequest(`/repos/${TARGET_OWNER}/${TARGET_REPO}/commits?per_page=1`);
      if (commitsResponse.status === 200 && commitsResponse.data.length > 0) {
        const lastCommit = commitsResponse.data[0];
        console.log(`   - Last commit: ${lastCommit.commit.message.split('\n')[0]}`);
        console.log(`   - Commit date: ${lastCommit.commit.author.date}`);
      }
      
      return { success: true, repository: repo };
    } else {
      console.log(`❌ Repository not accessible (Status: ${response.status})`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`❌ Error checking repository: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Check DNS and domain health
 */
async function checkDomainHealth() {
  console.log('\n📋 Domain Health Check');
  console.log('-'.repeat(40));

  try {
    const addresses = await dns.resolve4(DOMAIN);
    console.log(`✅ DNS resolution successful`);
    console.log(`   - Domain: ${DOMAIN}`);
    console.log(`   - IP addresses: ${addresses.join(', ')}`);
    
    const isVercel = addresses.some(ip => 
      ip.startsWith('76.76.') || 
      ip.startsWith('216.198.') || 
      ip.startsWith('64.13.')
    );
    
    console.log(`   - ${isVercel ? '✅' : '⚠️ '} ${isVercel ? 'Appears to be pointing to Vercel' : 'May not be pointing to Vercel'}`);
    
    return { success: true, addresses };
  } catch (error) {
    console.log(`❌ DNS resolution failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Analyze page content
 */
function analyzePageContent(response) {
  const hasTitle = response.body.includes('<title>');
  const hasMoodOverMuscle = response.body.toLowerCase().includes('moodovermuscle');
  const hasReact = response.body.includes('__NEXT_DATA__');
  
  console.log(`   - Has title tag: ${hasTitle ? '✅' : '❌'}`);
  console.log(`   - Contains brand name: ${hasMoodOverMuscle ? '✅' : '❌'}`);
  console.log(`   - Next.js app: ${hasReact ? '✅' : '❌'}`);
  
  return { hasTitle, hasBrand: hasMoodOverMuscle, isNextJs: hasReact };
}

/**
 * Check single page health
 */
async function checkPageHealth(page) {
  console.log(`\n🔍 Checking ${page}...`);
  const response = await makeRequest({ hostname: DOMAIN, path: page });
  
  if (response.accessible) {
    console.log(`✅ Page accessible (Status: ${response.status})`);
    if (response.headers['x-vercel-id']) {
      console.log(`   - Vercel deployment: ${response.headers['x-vercel-id']}`);
    }
    
    const analysis = response.body ? analyzePageContent(response) : {};
    return { page, accessible: true, status: response.status, ...analysis };
  }
  
  console.log(`❌ Page not accessible`);
  if (response.timeout) console.log('   - Request timed out');
  else if (response.error) console.log(`   - Error: ${response.error}`);
  
  return { page, accessible: false, error: response.error || 'Unknown error' };
}

/**
 * Check website health
 */
async function checkWebsiteHealth() {
  console.log('\n📋 Website Health Check');
  console.log('-'.repeat(40));

  const results = await Promise.all(EXPECTED_PAGES.map(checkPageHealth));
  return { success: results.every(r => r.accessible), results };
}

/**
 * Check GitHub Actions health
 */
async function checkGitHubActionsHealth() {
  console.log('\n📋 GitHub Actions Health Check');
  console.log('-'.repeat(40));

  try {
    const workflowsResponse = await makeGitHubRequest(`/repos/${TARGET_OWNER}/${TARGET_REPO}/actions/workflows`);
    
    if (workflowsResponse.status === 200) {
      const workflows = workflowsResponse.data.workflows;
      console.log(`✅ Found ${workflows.length} workflows`);
      
      for (const workflow of workflows) {
        console.log(`\n   📄 ${workflow.name}`);
        console.log(`      - State: ${workflow.state}`);
        console.log(`      - Path: ${workflow.path}`);
        
        const runsResponse = await makeGitHubRequest(
          `/repos/${TARGET_OWNER}/${TARGET_REPO}/actions/workflows/${workflow.id}/runs?per_page=1`
        );
        
        if (runsResponse.status === 200 && runsResponse.data.workflow_runs.length > 0) {
          const lastRun = runsResponse.data.workflow_runs[0];
          console.log(`      - Last run: ${lastRun.status} (${lastRun.conclusion || 'in progress'})`);
          console.log(`      - Run date: ${lastRun.created_at}`);
        } else {
          console.log(`      - No recent runs found`);
        }
      }
      
      return { success: true, workflows };
    } else {
      console.log(`❌ Could not retrieve workflows (Status: ${workflowsResponse.status})`);
      return { success: false, status: workflowsResponse.status };
    }
  } catch (error) {
    console.log(`❌ Error checking GitHub Actions: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Performance check
 */
async function checkPerformance() {
  console.log('\n📋 Performance Check');
  console.log('-'.repeat(40));

  const startTime = Date.now();
  const response = await makeRequest({ hostname: DOMAIN, path: '/' });
  const responseTime = Date.now() - startTime;
  
  if (response.accessible) {
    console.log(`✅ Response time: ${formatResponseTime(responseTime)}`);
    
    const contentLength = response.headers['content-length'];
    if (contentLength) {
      const sizeKB = Math.round(parseInt(contentLength) / 1024);
      console.log(`   - Content size: ${sizeKB} KB`);
    }
    
    return { success: true, responseTime };
  } else {
    console.log('❌ Could not measure performance - site not accessible');
    return { success: false };
  }
}

/**
 * Main health check function
 */
async function main() {
  console.log('🏥 Post-Transfer Health Check');
  console.log('='.repeat(50));
  console.log(`Repository: ${TARGET_OWNER}/${TARGET_REPO}`);
  console.log(`Website: https://${DOMAIN}`);
  console.log('='.repeat(50));

  const results = {
    repository: await checkRepositoryHealth(),
    domain: await checkDomainHealth(),
    website: await checkWebsiteHealth(),
    actions: await checkGitHubActionsHealth(),
    performance: await checkPerformance()
  };

  console.log('\n' + '='.repeat(50));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(50));

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalChecks = Object.keys(results).length;
  const healthScore = Math.round((successCount / totalChecks) * 100);

  console.log(`\n🎯 Overall Health Score: ${healthScore}% (${successCount}/${totalChecks} checks passed)`);

  if (healthScore >= 80) {
    console.log('✅ System is healthy and ready for production use!');
  } else if (healthScore >= 60) {
    console.log('⚠️  System is mostly functional but has some issues to address');
  } else {
    console.log('❌ System has significant issues that need immediate attention');
  }

  console.log('\n📝 Next steps:');
  if (results.repository.success && results.website.success) {
    console.log('   ✅ Repository transfer completed successfully');
    console.log('   ✅ Website is operational');
    console.log('   📋 Proceed to Task 3: Update code references');
  } else {
    console.log('   ❌ Address the failed health checks above');
    console.log('   🔄 Re-run this health check after fixes');
  }

  console.log('\n🔗 Quick Links:');
  console.log(`   - Repository: https://github.com/${TARGET_OWNER}/${TARGET_REPO}`);
  console.log(`   - Website: https://${DOMAIN}`);
  console.log(`   - Actions: https://github.com/${TARGET_OWNER}/${TARGET_REPO}/actions`);
}

main().catch(console.error);