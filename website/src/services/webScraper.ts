import { Claim } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * A service that scrapes Twitter/X data using a simple fetch request to public pages
 * This is a basic implementation and would need to be expanded for production use
 */

// Helper function to extract tweets from HTML content
const extractTweetsFromHTML = (html: string): Claim[] => {
  const claims: Claim[] = [];
  
  // Extract tweet text using regex patterns
  // This is a simplified approach - in production you'd want to use a proper HTML parser
  const tweetMatches = html.match(/<div[^>]*data-testid="tweetText"[^>]*>(.*?)<\/div>/gm) || [];
  const usernameMatches = html.match(/<div[^>]*data-testid="User-Name"[^>]*>(.*?)<\/div>/gm) || [];
  const timestampMatches = html.match(/<time[^>]*datetime="([^"]*)"[^>]*>/gm) || [];
  
  // Process each found tweet
  tweetMatches.forEach((tweetHTML, index) => {
    // Clean up the tweet text - ensure tweetHTML is a string
    const text = tweetHTML
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract username (basic implementation)
    let username = 'unknown';
    if (usernameMatches[index]) {
      const usernameMatch = usernameMatches[index].match(/@([A-Za-z0-9_]+)/);
      if (usernameMatch && usernameMatch[1]) {
        username = usernameMatch[1];
      }
    }
    
    // Extract timestamp (basic implementation)
    let timestamp = new Date().toISOString();
    if (timestampMatches[index]) {
      const dateMatch = timestampMatches[index].match(/datetime="([^"]*)"/);
      if (dateMatch && dateMatch[1]) {
        timestamp = dateMatch[1];
      }
    }
    
    // Detect language (very basic implementation)
    // In production, use proper language detection libraries
    const language = detectLanguage(text);
    
    // Determine sentiment
    const sentiment = analyzeSentiment(text);
    
    // Create a claim object
    claims.push({
      id: uuidv4(),
      source: 'twitter',
      text,
      summary: text.substring(0, 120) + (text.length > 120 ? '...' : ''),
      sentiment,
      relevanceScore: 0.5 + Math.random() * 0.4, // Random score between 0.5 and 0.9
      timestamp,
      username,
      platform: 'Twitter',
      category: 'local_source', // Default category
      language, // Now using detected language
      verified: false,
      region: detectRegion(text)
    });
  });
  
  return claims;
};

/**
 * Basic sentiment analysis - this would be replaced with a proper NLP library in production
 */
const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'успіх', 'перемога'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disaster', 'провал', 'катастрофа'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  // Count positive and negative words
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  // Determine sentiment
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

/**
 * Very basic language detection - this would be replaced with a proper NLP library in production
 */
const detectLanguage = (text: string): string => {
  // Ukrainian-specific characters and patterns
  const ukrainianPatterns = ['ї', 'є', 'і', 'ґ', 'україн'];
  
  // Russian-specific characters and patterns
  const russianPatterns = ['ы', 'ъ', 'э', 'росси'];
  
  let ukrainianScore = 0;
  let russianScore = 0;
  
  // Check for Ukrainian patterns
  for (const pattern of ukrainianPatterns) {
    if (text.toLowerCase().includes(pattern)) {
      ukrainianScore++;
    }
  }
  
  // Check for Russian patterns
  for (const pattern of russianPatterns) {
    if (text.toLowerCase().includes(pattern)) {
      russianScore++;
    }
  }
  
  // Determine language based on score
  if (ukrainianScore > russianScore) return 'uk';
  if (russianScore > ukrainianScore) return 'ru';
  return 'uk'; // Default to Ukrainian if can't determine
};

/**
 * Basic region detection from text
 */
const detectRegion = (text: string): string | undefined => {
  const regions = [
    'Київ', 'Kyiv', 'Kiev',
    'Харків', 'Kharkiv', 'Kharkov',
    'Одеса', 'Odesa', 'Odessa',
    'Львів', 'Lviv', 'Lvov',
    'Донецьк', 'Donetsk',
    'Луганськ', 'Luhansk', 'Lugansk',
    'Херсон', 'Kherson',
    'Маріуполь', 'Mariupol',
    'Бахмут', 'Bakhmut', 'Artemovsk',
    'Запоріжжя', 'Zaporizhzhia', 'Zaporozhye'
  ];
  
  for (const region of regions) {
    if (text.includes(region)) {
      return region;
    }
  }
  
  return undefined;
};

/**
 * Scrapes Twitter search results for the given query
 * This uses a public-facing search page approach which doesn't require API keys
 */
export const scrapeTwitter = async (query: string, language?: string): Promise<Claim[]> => {
  try {
    console.log(`Scraping Twitter for query: "${query}" ${language ? `in ${language}` : ''}`);
    
    // Encode the query for use in URL
    const encodedQuery = encodeURIComponent(query);
    
    // Use a CORS proxy to avoid CORS issues (for development only)
    // In production, this should be replaced with a proper backend service
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    
    // Twitter search URL with language parameter if provided
    const langParam = language ? `&lang=${language}` : '';
    const searchUrl = `${corsProxy}https://twitter.com/search?q=${encodedQuery}&f=live${langParam}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Twitter data: ${response.status}`);
    }
    
    const html = await response.text();
    const claims = extractTweetsFromHTML(html);
    
    console.log(`Scraped ${claims.length} claims from Twitter`);
    return claims;
  } catch (error) {
    console.error('Error scraping Twitter:', error);
    return []; // Return empty array on error
  }
};

/**
 * Scrapes both Ukrainian and Russian language tweets
 */
export const scrapeBilingualTwitter = async (query: string): Promise<Claim[]> => {
  try {
    console.log(`Performing bilingual Twitter scrape for: "${query}"`);
    
    // Scrape both Ukrainian and Russian tweets in parallel
    const [ukrainianTweets, russianTweets] = await Promise.all([
      scrapeTwitter(query, 'uk'),
      scrapeTwitter(query, 'ru')
    ]);
    
    console.log(`Found ${ukrainianTweets.length} Ukrainian and ${russianTweets.length} Russian tweets`);
    
    // Combine results
    return [...ukrainianTweets, ...russianTweets];
  } catch (error) {
    console.error('Error in bilingual Twitter scrape:', error);
    return [];
  }
};

/**
 * Alternative method using a server proxy approach (for demonstration)
 * This assumes you have a server endpoint that handles the Twitter scraping
 */
export const proxyScrapedTwitter = async (query: string): Promise<Claim[]> => {
  try {
    console.log(`Using server proxy to scrape Twitter for query: "${query}"`);
    
    // Replace this URL with your actual proxy server endpoint
    const proxyUrl = import.meta.env.VITE_TWITTER_SCRAPER_PROXY || 'https://your-proxy-service.com/api/twitter-scrape';
    
    const response = await fetch(`${proxyUrl}?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch proxy data: ${response.status}`);
    }
    
    // The server should return properly formatted claims
    const data = await response.json();
    return data.claims || [];
  } catch (error) {
    console.error('Error using Twitter scraper proxy:', error);
    return [];
  }
};
