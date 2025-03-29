// Demo-specific functionality for TweetFact Checker
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the extension functionality
  if (typeof initTweetFactChecker === 'function') {
    initTweetFactChecker();
  }
  
  // Set up demo buttons
  const checkAllButton = document.getElementById('check-all');
  const resetDemoButton = document.getElementById('reset-demo');
  
  if (checkAllButton) {
    checkAllButton.addEventListener('click', function() {
      document.querySelectorAll('.demo-tweet').forEach(tweet => {
        const tweetText = tweet.querySelector('[data-testid="tweetText"]').textContent;
        const button = tweet.querySelector('.fact-check-button');
        if (button) {
          button.click();
        }
      });
    });
  }
  
  if (resetDemoButton) {
    resetDemoButton.addEventListener('click', function() {
      document.querySelectorAll('.fact-check-overlay').forEach(overlay => {
        overlay.remove();
      });
      document.querySelectorAll('.demo-tweet').forEach(tweet => {
        tweet.setAttribute('data-fact-checked', 'false');
      });
      // Re-initialize to add buttons
      if (typeof initTweetFactChecker === 'function') {
        initTweetFactChecker();
      }
    });
  }
});