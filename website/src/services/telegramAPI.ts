import axios from 'axios';
import { Claim, SourceCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// We'll use a proxy server approach since direct browser access to Telegram
// is limited. This would be the endpoint of your deployed backend service.
const TELEGRAM_API_PROXY = import.meta.env.VITE_TELEGRAM_API_PROXY || 'https://your-backend-service.com/api/telegram';

// List of Ukrainian Telegram channels to monitor
const TELEGRAM_CHANNELS = [
  'truexanewsua',    // TrueXA - Ukrainian news
  'ukrainenowenglish', // Ukraine NOW English
  'verkhovnaradaofukraine', // Official Verkhovna Rada channel
  'V_Zelenskiy_official', // President Zelensky's channel
  'operativnoZSU',   // Ukrainian Armed Forces
  'ministry_of_defense_ua', // Ministry of Defense
  'UkraineNow'       // Ukraine NOW - main channel
];

/**
 * Fetches recent messages from Ukrainian Telegram channels
 */
export const fetchTelegramMessages = async (query: string): Promise<Claim[]> => {
  try {
    // In a real implementation, this would call your backend proxy
    // which would use Telegram API to fetch messages
    const response = await axios.post(TELEGRAM_API_PROXY + '/search', {
      channels: TELEGRAM_CHANNELS,
      query: query,
      limit: 100
    });

    if (!response.data || !response.data.messages) {
      console.warn('No Telegram messages found or invalid response');
      return [];
    }

    // Map Telegram messages to our Claim interface
    const claims: Claim[] = response.data.messages.map((message: any) => {
      // Determine channel category based on channel name or description
      let category: SourceCategory;
      
      if (message.channel.includes('ministry') || 
          message.channel.includes('official') ||
          message.channel.includes('verkhovnarada')) {
        category = 'government';
      } else if (message.channel.includes('news') || 
                 message.channel.includes('NOW') || 
                 message.channel.includes('media')) {
        category = 'major_media'; 
      } else if (message.channel.includes('ZSU') || 
                message.channel.includes('defense')) {
        category = 'military_affiliated';
      } else {
        category = 'local_source';
      }

      // Simple sentiment analysis (would be replaced with a proper model)
      const textLower = message.text.toLowerCase();
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      const positiveWords = ['перемога', 'успіх', 'звільнення', 'захистили', 'відбили'];
      const negativeWords = ['обстріл', 'атака', 'втрати', 'загроза', 'жертви'];
      
      const positiveMatches = positiveWords.filter(word => textLower.includes(word)).length;
      const negativeMatches = negativeWords.filter(word => textLower.includes(word)).length;
      
      if (positiveMatches > negativeMatches) sentiment = 'positive';
      else if (negativeMatches > positiveMatches) sentiment = 'negative';

      // Calculate relevance score
      const relevanceScore = Math.min(
        0.95,
        0.6 + (Math.random() * 0.3) + (category === 'government' ? 0.1 : 0)
      );

      // Extract possible regions mentioned
      let region;
      const regionKeywords = [
        'Київ', 'Харків', 'Одеса', 'Львів', 'Донецьк', 'Луганськ',
        'Херсон', 'Маріуполь', 'Бахмут', 'Чернігів', 'Суми', 'Запоріжжя'
      ];
      
      for (const keyword of regionKeywords) {
        if (message.text.includes(keyword)) {
          region = keyword;
          break;
        }
      }

      return {
        id: uuidv4(),
        source: 'telegram',
        text: message.text,
        summary: message.text.length > 200 ? message.text.substring(0, 200) + '...' : message.text,
        sentiment,
        relevanceScore,
        timestamp: message.date,
        username: message.channel,
        platform: 'Telegram',
        followers: message.channel_subscribers || undefined,
        category,
        language: message.language || 'uk',
        verified: category === 'government' || category === 'military_affiliated',
        region
      };
    });

    return claims;
  } catch (error) {
    console.error('Error fetching Telegram data:', error);
    return [];
  }
};
