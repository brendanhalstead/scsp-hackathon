// Options page functionality for TweetFact Checker

// DOM elements
const openaiKeyInput = document.getElementById('openai-key');
const perplexityKeyInput = document.getElementById('perplexity-key');
const demoToggle = document.getElementById('demo-toggle');
const saveButton = document.getElementById('save-button');
const testButton = document.getElementById('test-button');
const statusDiv = document.getElementById('status');

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get({
    openaiKey: '',
    perplexityKey: '',
    demoMode: true
  }, (items) => {
    openaiKeyInput.value = items.openaiKey;
    perplexityKeyInput.value = items.perplexityKey;
    demoToggle.checked = items.demoMode;
  });
}

// Save settings
function saveSettings() {
  const openaiKey = openaiKeyInput.value.trim();
  const perplexityKey = perplexityKeyInput.value.trim();
  const demoMode = demoToggle.checked;
  
  chrome.storage.sync.set({
    openaiKey: openaiKey,
    perplexityKey: perplexityKey,
    demoMode: demoMode
  }, () => {
    showStatus('Settings saved successfully!', 'success');
    
    // If both keys are provided, disable demo mode
    if (openaiKey && perplexityKey && demoMode) {
      chrome.storage.sync.set({ demoMode: false });
      demoToggle.checked = false;
    }
  });
}

// Test API connections
async function testConnections() {
  const openaiKey = openaiKeyInput.value.trim();
  const perplexityKey = perplexityKeyInput.value.trim();
  
  statusDiv.textContent = 'Testing connections...';
  statusDiv.className = 'status';
  statusDiv.style.display = 'block';
  
  let allSuccess = true;
  let statusMessage = '';
  
  // Test OpenAI connection if key is provided
  if (openaiKey) {
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openaiKey}`
        }
      });
      
      if (openaiResponse.ok) {
        statusMessage += '✅ OpenAI API connection successful!\n';
      } else {
        statusMessage += '❌ OpenAI API connection failed. Please check your API key.\n';
        allSuccess = false;
      }
    } catch (error) {
      statusMessage += `❌ OpenAI API error: ${error.message}\n`;
      allSuccess = false;
    }
  } else {
    statusMessage += '⚠️ OpenAI API key not provided. Using demo mode for claim extraction.\n';
  }
  
  // Test Perplexity connection if key is provided
  if (perplexityKey) {
    try {
      // Simple test request to Perplexity
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-small-chat',
          messages: [
            { role: 'user', content: 'Hello, this is a test message. Please respond with "API connection successful".' }
          ],
          max_tokens: 20
        })
      });
      
      if (perplexityResponse.ok) {
        statusMessage += '✅ Perplexity API connection successful!\n';
      } else {
        statusMessage += '❌ Perplexity API connection failed. Please check your API key.\n';
        allSuccess = false;
      }
    } catch (error) {
      statusMessage += `❌ Perplexity API error: ${error.message}\n`;
      allSuccess = false;
    }
  } else {
    statusMessage += '⚠️ Perplexity API key not provided. Using demo mode for fact checking.\n';
  }
  
  // If both API keys are missing, show demo mode message
  if (!openaiKey && !perplexityKey) {
    statusMessage += '\nℹ️ Running in full demo mode. For real fact-checking, please add API keys.';
  }
  
  showStatus(statusMessage, allSuccess ? 'success' : 'error');
}

// Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  // Hide status after 5 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', saveSettings);
testButton.addEventListener('click', testConnections);

// Toggle demo mode
demoToggle.addEventListener('change', () => {
  // If turning off demo mode, make sure API keys are set
  if (!demoToggle.checked) {
    const openaiKey = openaiKeyInput.value.trim();
    const perplexityKey = perplexityKeyInput.value.trim();
    
    if (!openaiKey || !perplexityKey) {
      showStatus('⚠️ Both API keys are required to disable demo mode.', 'error');
      demoToggle.checked = true;
    }
  }
});