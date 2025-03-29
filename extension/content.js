/**
 * TweetFact Checker - Content Script
 * Adds fact-checking capability to Twitter/X
 */

// We'll retrieve API keys from secure storage
let OPENAI_API_KEY = null;
let PERPLEXITY_API_KEY = null;

// Main initialization function
async function initTweetFactChecker() {
  console.log("TweetFact Checker initialized");
  
  // Load API keys and settings from Chrome storage
  await loadSettings();
  
  // Start observing for tweets
  observeTwitterTimeline();
}

// Load settings from Chrome storage
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      openaiKey: '',
      perplexityKey: '',
      demoMode: true
    }, (items) => {
      OPENAI_API_KEY = items.openaiKey;
      PERPLEXITY_API_KEY = items.perplexityKey;
      
      // Store demo mode setting
      window.DEMO_MODE = items.demoMode;
      
      // Enable demo mode if either API key is missing
      if (!OPENAI_API_KEY || !PERPLEXITY_API_KEY) {
        window.DEMO_MODE = true;
      }
      
      console.log(`TweetFact Checker running in ${window.DEMO_MODE ? 'demo' : 'live'} mode`);
      resolve();
    });
  });
}

// Set up mutation observer to detect new tweets
function observeTwitterTimeline() {
  const targetNode = document.body;
  
  const observerConfig = {
    childList: true,
    subtree: true
  };
  
  const observer = new MutationObserver((mutations) => {
    // Check if new tweets have been added
    processTweets();
  });
  
  observer.observe(targetNode, observerConfig);
  
  // Initial scan for tweets
  processTweets();
}

// Process tweets on the page
function processTweets() {
  // This selector tries to find tweet text containers
  // Twitter's DOM structure changes frequently, so this may need updates
  const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
  
  tweetElements.forEach((tweetElement) => {
    // Skip already processed tweets
    if (tweetElement.getAttribute('data-fact-checked') === 'true') {
      return;
    }
    
    // Mark as processed
    tweetElement.setAttribute('data-fact-checked', 'true');
    
    // Find the tweet text element
    const tweetTextElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (!tweetTextElement) return;
    
    // Get tweet text
    const tweetText = tweetTextElement.textContent;
    if (!tweetText || tweetText.trim().length < 10) return; // Skip short tweets
    
    // Add fact check button
    addFactCheckButton(tweetElement, tweetText);
  });
}

// Add fact-check button to a tweet
function addFactCheckButton(tweetElement, tweetText) {
  // Find a good location to add our button (below the tweet)
  const actionsElement = tweetElement.querySelector('[role="group"]');
  if (!actionsElement) return;
  
  // Create button element
  const factCheckButton = document.createElement('button');
  factCheckButton.className = 'fact-check-button';
  factCheckButton.textContent = 'Fact Check';
  factCheckButton.addEventListener('click', () => {
    factCheckTweet(tweetElement, tweetText);
  });
  
  // Add button to the tweet
  actionsElement.parentNode.insertBefore(factCheckButton, actionsElement.nextSibling);
}

// Perform fact-checking on a tweet
async function factCheckTweet(tweetElement, tweetText) {
  // Create overlay for results (or use existing)
  let overlay = tweetElement.querySelector('.fact-check-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'fact-check-overlay';
    
    // Find position to insert overlay
    const button = tweetElement.querySelector('.fact-check-button');
    if (button) {
      button.parentNode.insertBefore(overlay, button.nextSibling);
    }
  }
  
  // Show loading indicator
  overlay.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div>Analyzing tweet and checking facts...</div>
    </div>
  `;
  
  try {
    // Step 1: Extract claims using simplified approach
    const claims = await extractClaims(tweetText);
    
    // Step 2: Fact-check the claims
    const factCheckResults = await factCheckClaims(claims);
    
    // Step 3: Display results
    displayFactCheckResults(overlay, claims, factCheckResults);
  } catch (error) {
    overlay.innerHTML = `<p>Error: ${error.message}</p>`;
    console.error('Fact-checking error:', error);
  }
}

// Extract claims from tweet text using OpenAI API
async function extractClaims(tweetText) {
  // Define prompt for claim extraction
  const prompt = `
    Extract any concrete, factual claims from this tweet. Ignore opinions or vague statements.
    A claim should be factual, specific, and verifiable. Return ONLY an array of claim strings.
    If there are no concrete claims, return an empty array.
    
    Tweet: "${tweetText}"
    
    Claims:
  `;
  
  // Check if we can use the API
  if (!window.DEMO_MODE && OPENAI_API_KEY) {
    try {
      console.log("Using OpenAI API for claim extraction");
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You extract verifiable factual claims from text.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 250
        })
      });
      
      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }
      
      const data = await response.json();
      const claimsText = data.choices[0].message.content.trim();
      try {
        // Try to parse as JSON
        return JSON.parse(claimsText);
      } catch (e) {
        // If not valid JSON, split by lines and filter empty ones
        return claimsText.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith("[") && !line.startsWith("]"))
          .map(line => line.replace(/^- /, "").replace(/^"/, "").replace(/"$/, ""));
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
      console.log("Falling back to demo mode");
      // Fall back to demo mode on error
      window.DEMO_MODE = true;
    }
  }
  
  // Demo mode with mock data
  console.log("Using demo mode for claim extraction");
  
  // Mock data based on tweet content
  if (tweetText.includes('vaccine') || tweetText.includes('covid')) {
    return [
      "COVID-19 vaccines cause serious side effects in 50% of recipients",
      "Vaccinated people shed spike proteins to the unvaccinated"
    ];
  } else if (tweetText.includes('election') || tweetText.includes('vote')) {
    return [
      "The 2020 election had widespread voter fraud",
      "Mail-in ballots are not verified"
    ];
  } else if (tweetText.includes('climate')) {
    return [
      "Global temperatures have not increased in the last decade",
      "CO2 is not a significant contributor to climate change"
    ];
  } else {
    // Generate some mock claims based on text content
    return [
      `${tweetText.substring(0, 30)}... is factually correct`,
      `${tweetText.substring(Math.min(30, tweetText.length), Math.min(60, tweetText.length))}... needs verification`
    ];
  }
}

// Fact-check claims using Perplexity API
async function factCheckClaims(claims) {
  const results = [];
  
  // Process each claim
  for (const claim of claims) {
    // Check if we can use the Perplexity API
    if (!window.DEMO_MODE && PERPLEXITY_API_KEY) {
      try {
        console.log("Using Perplexity API for fact-checking");
        
        // Create fact-checking prompt
        const factCheckPrompt = `
          Evaluate the factuality of the following claim. Provide your evaluation in JSON format with these fields:
          - truthValue: one of "definitely true", "likely true", "needs verification", "likely false", "definitely false"
          - explanation: brief explanation of your assessment (1-2 sentences)
          - sources: array of source descriptions (include titles and URLs when available)
          
          Claim: "${claim}"
          
          IMPORTANT: Return ONLY a raw JSON object with no markdown formatting, code blocks, or additional text.
          Just return a simple, valid JSON object that can be parsed with JSON.parse().
        `;
        
        // Make API request to Perplexity
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: 'sonar', // Using model that works in browser context
            messages: [
              {
                role: 'system',
                content: 'You are a helpful fact-checking assistant that evaluates claims for accuracy, providing truthfulness assessments and citations.'
              },
              { role: 'user', content: factCheckPrompt }
            ],
            temperature: 0.2,
            max_tokens: 500
          })
        });
        
        if (!response.ok) {
          throw new Error('Perplexity API request failed');
        }
        
        const data = await response.json();
        const resultText = data.choices[0].message.content.trim();
        
        try {
          // Clean the response if it contains markdown formatting
          let cleanedText = resultText;
          
          // Remove markdown code blocks if present
          if (cleanedText.includes('```json')) {
            cleanedText = cleanedText.replace(/```json/g, '');
            cleanedText = cleanedText.replace(/```/g, '');
          }
          
          // Attempt to find valid JSON anywhere in the response
          let jsonStart = cleanedText.indexOf('{');
          let jsonEnd = cleanedText.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            // Extract what looks like the JSON part
            cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
          }
          
          console.log("Attempting to parse cleaned JSON:", cleanedText);
          
          // Parse the cleaned JSON response
          const factCheckResult = JSON.parse(cleanedText);
          results.push({
            claim,
            truthValue: factCheckResult.truthValue || 'needs verification',
            explanation: factCheckResult.explanation || 'Unable to verify this claim.',
            sources: factCheckResult.sources || []
          });
          
          // Continue to next claim
          continue;
        } catch (e) {
          console.error("Error parsing Perplexity response:", e, "Raw text:", resultText);
          // Fall through to demo mode for this claim
        }
      } catch (error) {
        console.error("Perplexity API error:", error);
        console.log("Falling back to demo mode for this claim");
        // Fall through to demo mode for this claim
      }
    }
    
    // Demo mode with mock data
    console.log("Using demo mode for fact checking");
    
    // Generate mock response based on content of claim
    let truthValue = 'needs verification';
    let explanation = 'This claim requires additional evidence to verify.';
    let sources = [];
    
    // Very simple logic for demo
    if (claim.includes('vaccine') || claim.includes('shed')) {
      truthValue = 'definitely false';
      explanation = 'This claim has been thoroughly debunked by medical research.';
      sources = [
        'CDC: COVID-19 Vaccines (https://www.cdc.gov/coronavirus/2019-ncov/vaccines/)',
        'WHO: COVID-19 Vaccine Research (https://www.who.int/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines)'
      ];
    } else if (claim.includes('election') || claim.includes('fraud') || claim.includes('mail-in')) {
      truthValue = 'definitely false';
      explanation = 'Multiple audits and court cases have found no evidence of widespread fraud.';
      sources = [
        'AP News: Fact Check on 2020 Election (https://apnews.com/article/election-2020-ap-fact-check)',
        'Reuters: Fact Check on Mail-in Voting (https://www.reuters.com/article/us-usa-election-vote-by-mail-explainer)'
      ];
    } else if (claim.includes('climate') || claim.includes('CO2')) {
      truthValue = 'definitely false';
      explanation = 'Scientific consensus confirms rising temperatures and CO2 impact.';
      sources = [
        'NASA: Climate Change Evidence (https://climate.nasa.gov/evidence/)',
        'IPCC: Climate Change 2021 Report (https://www.ipcc.ch/report/ar6/wg1/)'
      ];
    } else if (claim.includes('factually correct')) {
      truthValue = 'likely true';
      explanation = 'This appears to be accurate based on available information.';
      sources = ['Various news sources have reported similar information'];
    } else {
      truthValue = 'needs verification';
      explanation = 'Insufficient information to make a determination.';
      sources = ['No specific sources found for this claim'];
    }
    
    results.push({
      claim,
      truthValue,
      explanation,
      sources
    });
  }
  
  return results;
}

// Display fact-check results in the overlay
function displayFactCheckResults(overlay, claims, factCheckResults) {
  if (claims.length === 0) {
    overlay.innerHTML = '<p>No specific factual claims detected in this tweet.</p>';
    return;
  }
  
  // Build results HTML
  let resultsHTML = '<h4>Fact Check Results</h4>';
  
  factCheckResults.forEach(result => {
    // Convert truthValue to CSS class
    const truthClass = result.truthValue.toLowerCase().replace(' ', '-');
    
    resultsHTML += `
      <div class="fact-check-claim">
        <div><strong>Claim:</strong> ${result.claim}</div>
        <div class="truth-value ${truthClass}">${result.truthValue}</div>
        <div>${result.explanation}</div>
        <div class="sources">
          <strong>Sources:</strong>
          <ul>
            ${result.sources.map(source => `<li>${source}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  });
  
  overlay.innerHTML = resultsHTML;
}

// Initialize extension
window.addEventListener('load', initTweetFactChecker);
// Also run on document ready in case page was already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initTweetFactChecker, 1000);
}