// Simple script to test if the Perplexity API endpoint is reachable
// Run with: node perplexity_ping.js

const https = require('https');

console.log('Checking if Perplexity API endpoint is reachable...');

// Try to connect to the API endpoint without sending an authenticated request
const req = https.request({
  hostname: 'api.perplexity.ai',
  path: '/chat/completions',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log(`Response Status Code: ${res.statusCode}`);
  console.log('Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    
    // Even if we get a 401 Unauthorized, that means the endpoint is reachable
    if (res.statusCode === 401) {
      console.log('\nPERPLEXITY API ENDPOINT IS REACHABLE (401 Unauthorized is expected without a valid token)');
    } else {
      console.log('\nReceived unexpected status code');
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR: Could not reach Perplexity API endpoint');
  console.error('Error details:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.error('\nDNS lookup failed. Check your internet connection or if the domain is correct.');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\nConnection refused. The server may be down or blocking requests.');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('\nConnection timed out. The server might be slow or blocking requests.');
  }
});

req.on('timeout', () => {
  req.destroy();
  console.error('Request timed out after 5 seconds.');
});

req.end();

console.log('Request sent. Waiting for response...');