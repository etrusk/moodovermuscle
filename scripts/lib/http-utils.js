/**
 * HTTP Utilities Library
 * 
 * Shared HTTP request functions for scripts
 */

const https = require('https');
const http = require('http');

/**
 * Build request headers
 */
function buildRequestHeaders(headers, body) {
  const defaultHeaders = { 'User-Agent': 'MoodOverMuscle-Script', ...headers };
  if (body && !defaultHeaders['Content-Length']) {
    defaultHeaders['Content-Length'] = Buffer.byteLength(body);
  }
  return defaultHeaders;
}

/**
 * Handle response streaming
 */
function handleResponse(res, resolve) {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    resolve({
      status: res.statusCode,
      headers: res.headers,
      body: data,
      accessible: true
    });
  });
}

/**
 * Attach error handlers to request
 */
function attachRequestHandlers(req, resolve, body) {
  req.on('error', (error) => {
    resolve({ accessible: false, error: error.message });
  });

  req.on('timeout', () => {
    req.destroy();
    resolve({ accessible: false, timeout: true });
  });

  if (body) req.write(body);
  req.end();
}

/**
 * Make HTTP/HTTPS request with timeout
 */
function makeRequest(options) {
  const { hostname, path = '/', method = 'GET', timeout = 10000, headers = {}, protocol = 'https', body } = options;

  return new Promise((resolve) => {
    const reqHeaders = buildRequestHeaders(headers, body);
    const client = protocol === 'https' ? https : http;
    const req = client.request({ hostname, path, method, timeout, headers: reqHeaders }, (res) => handleResponse(res, resolve));
    attachRequestHandlers(req, resolve, body);
  });
}

/**
 * Make GitHub API request
 * @param {string} path - API path (e.g., '/repos/owner/repo')
 * @param {string} [token] - GitHub API token (optional)
 * @returns {Promise<Object>} Response with status and parsed data
 */
function makeGitHubRequest(path, token) {
  const headers = {
    'User-Agent': 'MoodOverMuscle-Script',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method: 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Check if response indicates successful HTTP status
 * @param {number} status - HTTP status code
 * @returns {boolean} True if 2xx status
 */
function isSuccessStatus(status) {
  return status >= 200 && status < 300;
}

/**
 * Check if response indicates redirect
 * @param {number} status - HTTP status code
 * @returns {boolean} True if 3xx status
 */
function isRedirectStatus(status) {
  return status >= 300 && status < 400;
}

/**
 * Check if response indicates client error
 * @param {number} status - HTTP status code
 * @returns {boolean} True if 4xx status
 */
function isClientError(status) {
  return status >= 400 && status < 500;
}

/**
 * Check if response indicates server error
 * @param {number} status - HTTP status code
 * @returns {boolean} True if 5xx status
 */
function isServerError(status) {
  return status >= 500;
}

/**
 * Format response time for display
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time with status indicator
 */
function formatResponseTime(ms) {
  if (ms < 1000) {
    return `${ms}ms (excellent)`;
  } else if (ms < 3000) {
    return `${ms}ms (acceptable)`;
  } else {
    return `${ms}ms (slow)`;
  }
}

module.exports = {
  makeRequest,
  makeGitHubRequest,
  isSuccessStatus,
  isRedirectStatus,
  isClientError,
  isServerError,
  formatResponseTime
};