# Aletheia Chrome Extension

A Chrome extension that adds fact-checking capabilities to Twitter/X.

## Hackathon Demo

This is a minimal implementation created for hackathon demonstration purposes. It shows how the main project's fact-checking capabilities could be integrated directly into the Twitter interface.

## Features

- Adds "Fact Check" buttons to tweets
- Extracts factual claims from tweet text
- Verifies claims and provides truthfulness assessment
- Shows sources for verification
- Visual indicators for claim truthfulness

## Demo Mode

For the hackathon demo, the extension works in two ways:

1. **Live on Twitter/X**: Install the extension and visit Twitter to see it in action
2. **Local Demo Page**: Open `demo.html` in a browser to see the extension working with example tweets

## Installation for Testing

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `extension` folder
4. Visit Twitter or open `demo.html` to test

## Implementation Notes

- The current version uses mock data for API responses to avoid API key requirements
- In a real implementation, proper API keys would be needed for OpenAI and Perplexity
- The tweet detection selectors may need updates as Twitter's DOM structure changes

## Future Improvements

- Proper API key management and storage
- Caching of results to reduce API costs
- Automatic detection of viral/trending tweets
- Enhanced UI with settings panel
- Backend service for claim aggregation and community verification

## Technologies Used

- JavaScript
- Chrome Extensions API
- CSS for styling