// Popup functionality for TweetFact Checker

// DOM elements
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const settingsButton = document.getElementById('settings-button');
const demoButton = document.getElementById('demo-button');

// Check extension status
function checkStatus() {
  chrome.storage.sync.get({
    openaiKey: '',
    perplexityKey: '',
    demoMode: true
  }, (items) => {
    const hasOpenAI = !!items.openaiKey;
    const hasPerplexity = !!items.perplexityKey;
    const demoMode = items.demoMode;
    
    if (hasOpenAI && hasPerplexity) {
      statusIcon.className = 'status-icon active';
      statusText.textContent = 'Extension active with API keys';
    } else if (demoMode) {
      statusIcon.className = 'status-icon demo';
      statusText.textContent = 'Running in demo mode (mock data)';
    } else {
      statusIcon.className = 'status-icon inactive';
      statusText.textContent = 'API keys missing. Set up in options.';
    }
  });
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Open demo page
function openDemo() {
  chrome.tabs.create({ url: chrome.runtime.getURL('demo.html') });
}

// Event listeners
document.addEventListener('DOMContentLoaded', checkStatus);
settingsButton.addEventListener('click', openOptions);
demoButton.addEventListener('click', openDemo);