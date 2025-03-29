#!/bin/bash

# Package the extension for distribution
echo "Packaging TweetFact Checker extension..."

# Create a zip file of the extension
cd "$(dirname "$0")"
zip -r tweetfact-checker.zip . -x "*.git*" -x "*.zip" -x "package.sh" -x "*.DS_Store"

echo "Extension packaged successfully: tweetfact-checker.zip"
echo "To install:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable Developer Mode"
echo "3. Drag and drop the zip file onto the page"