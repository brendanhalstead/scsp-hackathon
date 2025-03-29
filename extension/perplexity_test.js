// Simple script to test Perplexity API
// Run with: node perplexity_test.js YOUR_API_KEY

const https = require('https');

// Get API key from command line
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Please provide an API key as a command line argument.');
  console.error('Example: node perplexity_test.js YOUR_API_KEY');
  process.exit(1);
}

// Create request data
const requestData = {
  model: 'sonar-small-chat',
  messages: [
    { role: 'user', content: 'Hello, this is a test message. Please respond with a very short message.' }
  ],
  max_tokens: 50
};

// Configure request options
const options = {
  hostname: 'api.perplexity.ai',
  path: '/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
};

// Send request
console.log('Sending request to Perplexity API...');
const req = https.request(options, (res) => {
  let data = '';
  
  // Log status code
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  // Collect response data
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Process complete response
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
      
      // Extract and display the message content if available
      if (parsedData.choices && parsedData.choices[0] && parsedData.choices[0].message) {
        console.log('\nMessage Content:');
        console.log(parsedData.choices[0].message.content);
      }
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('Error:', error.message);
});

// Send the request data
req.write(JSON.stringify(requestData));
req.end();

console.log('Request sent. Waiting for response...');