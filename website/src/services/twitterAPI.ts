
import axios from 'axios';
import { Claim, SourceCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { scrapeTwitter, proxyScrapedTwitter } from './webScraper';

// Twitter API v2 endpoints
const TWITTER_API_BASE = 'https://api.twitter.com/2';
// Use Vite's environment variable format instead of process.env
const BEARER_TOKEN = import.meta.env.VITE_TWITTER_BEARER_TOKEN;

// Define data collection methods
export enum TwitterDataMethod {
  API = 'api',
  SCRAPE = 'scrape',
  PROXY = 'proxy'
}

/**
 * Searches Twitter for recent tweets matching the query
 * Supports multiple data collection methods: official API, web scraping, or proxy server
 */
export const searchTwitter = async (
  query: string, 
  maxResults = 100,
  method: TwitterDataMethod = TwitterDataMethod.SCRAPE // Default to scraping to save costs
): Promise<Claim[]> => {
  console.log(`Searching Twitter with method: ${method}`);
  
  switch (method) {
    case TwitterDataMethod.API:
      return searchTwitterAPI(query, maxResults);
    case TwitterDataMethod.SCRAPE:
      return scrapeTwitter(query);
    case TwitterDataMethod.PROXY:
      return proxyScrapedTwitter(query);
    default:
      console.log('Unknown method, falling back to scraping');
      return scrapeTwitter(query);
  }
};

/**
 * Original API-based Twitter search function
 * Uses Twitter API v2 recent search endpoint (requires paid API keys)
 */
const searchTwitterAPI = async (query: string, maxResults = 100): Promise<Claim[]> => {
  try {
    if (!BEARER_TOKEN) {
      console.error('Twitter API bearer token is not configured');
      return [];
    }

    // Prepare search parameters - include tweet metrics, user info, and media
    const params = new URLSearchParams({
      'query': `${query} lang:uk OR lang:ru -is:retweet`,
      'max_results': maxResults.toString(),
      'tweet.fields': 'created_at,public_metrics,lang,geo',
      'user.fields': 'name,username,verified,public_metrics,description',
      'expansions': 'author_id,geo.place_id',
    });

    const response = await axios.get(
      `${TWITTER_API_BASE}/tweets/search/recent?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`
        }
      }
    );

    if (!response.data || !response.data.data) {
      return [];
    }

    // Map the Twitter API response to our Claim interface
    const claims: Claim[] = response.data.data.map((tweet: any) => {
      const user = response.data.includes?.users?.find(
        (u: any) => u.id === tweet.author_id
      );

      // Try to determine the user's category based on their description and metrics
      let category: SourceCategory | undefined = undefined;
      const userDescription = user?.description?.toLowerCase() || '';
      
      if (userDescription.includes('govern') || 
          userDescription.includes('official') || 
          userDescription.includes('міністер') || 
          userDescription.includes('президент')) {
        category = 'government';
      } else if (userDescription.includes('news') || 
                userDescription.includes('media') || 
                userDescription.includes('press') ||
                userDescription.includes('новини')) {
        category = 'major_media';
      } else if (userDescription.includes('journalist') || 
                userDescription.includes('reporter') || 
                userDescription.includes('correspondent') || 
                userDescription.includes('журналіст')) {
        category = 'independent_journalist';
      } else if (userDescription.includes('military') || 
                userDescription.includes('army') || 
                userDescription.includes('soldier') || 
                userDescription.includes('війська') ||
                userDescription.includes('армія')) {
        category = 'military_affiliated';
      } else {
        category = 'local_source';
      }

      // Extract location from geo data when available
      let region: string | undefined;
      if (tweet.geo?.place_id) {
        const place = response.data.includes?.places?.find(
          (p: any) => p.id === tweet.geo.place_id
        );
        region = place?.full_name || place?.name;
      }

      // Determine sentiment based on content (basic implementation)
      const tweetText = tweet.text.toLowerCase();
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      const positiveWords = ['перемога', 'успіх', 'звільнення', 'добре', 'надія'];
      const negativeWords = ['атака', 'бомба', 'загибель', 'поразка', 'втрати'];
      
      const positiveMatches = positiveWords.filter(word => tweetText.includes(word)).length;
      const negativeMatches = negativeWords.filter(word => tweetText.includes(word)).length;
      
      if (positiveMatches > negativeMatches) sentiment = 'positive';
      else if (negativeMatches > positiveMatches) sentiment = 'negative';
      
      // Calculate basic relevance score
      const relevanceScore = Math.min(
        0.95,
        0.5 + (Math.random() * 0.3) + (user?.verified ? 0.15 : 0)
      );

      return {
        id: uuidv4(),
        source: 'twitter',
        text: tweet.text,
        summary: tweet.text.substring(0, 120) + (tweet.text.length > 120 ? '...' : ''),
        sentiment,
        relevanceScore,
        timestamp: tweet.created_at,
        username: user?.username || 'anonymous',
        platform: 'Twitter',
        followers: user?.public_metrics?.followers_count,
        category,
        language: tweet.lang === 'uk' ? 'uk' : tweet.lang,
        verified: user?.verified || false,
        region
      };
    });

    return claims;
  } catch (error) {
    console.error('Error fetching Twitter API data:', error);
    return [];
  }
};
