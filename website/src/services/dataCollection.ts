import { searchTwitter, TwitterDataMethod } from './twitterAPI';
import { fetchTelegramMessages } from './telegramAPI';
import { 
  analyzeSentiment, 
  generateSummary, 
  extractKeyTerms, 
  extractRegions,
  extractEntities,
  performClusterAnalysis,
  detectDisinformation,
  generateAbstractiveSummary
} from './naturalLanguageProcessing';
import { AnalysisResult, Claim, Source } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { analyzeSocialMedia as mockAnalyzeSocialMedia } from './mockData';

// Flag to use mock data instead of real API calls - modify this as needed
const USE_MOCK_DATA = true;

// Data collection method settings
const TWITTER_METHOD = TwitterDataMethod.SCRAPE; // Use scraping by default to save costs

// Ukrainian and Russian declension mappings for search enhancement
const ukrTermDeclensions: Record<string, string[]> = {
  'військов': ['військовий', 'військових', 'військові', 'військовими', 'військову', 'військова', 'військове', 'військовим', 'військовому'],
  'обстріл': ['обстріли', 'обстрілів', 'обстрілами', 'обстрілу', 'обстрілом', 'обстрілам', 'обстрілах'],
  'атак': ['атака', 'атаки', 'атакам', 'атакою', 'атакували', 'атакує', 'атаці'],
  'оборон': ['оборона', 'оборону', 'обороні', 'обороною', 'оборони', 'обороною'],
  'евакуац': ['евакуація', 'евакуації', 'евакуацію', 'евакуацією', 'евакуаційні', 'евакуаційного'],
  'біженц': ['біженці', 'біженців', 'біженцям', 'біженцями', 'біженцях'],
  'харків': ['харківський', 'харківська', 'харківське', 'харківські', 'харківських'],
};

const rusTermDeclensions: Record<string, string[]> = {
  'военн': ['военный', 'военная', 'военное', 'военные', 'военных', 'военным', 'военными'],
  'обстрел': ['обстрелы', 'обстрелов', 'обстрелами', 'обстрелу', 'обстрелом', 'обстрелах'],
  'атак': ['атака', 'атаки', 'атаке', 'атаку', 'атакой', 'атакуют', 'атаковать'],
  'оборон': ['оборона', 'обороны', 'обороне', 'оборону', 'обороной', 'обороняются'],
  'эвакуац': ['эвакуация', 'эвакуации', 'эвакуацию', 'эвакуацией', 'эвакуационный'],
  'беженц': ['беженцы', 'беженцев', 'беженцам', 'беженцами', 'беженцах'],
  'харьков': ['харьковский', 'харьковская', 'харьковское', 'харьковские', 'харьковских'],
};

// Data collection configuration - will be updated via UI
let dataCollectionConfig = {
  sources: {
    twitter: true,
    telegram: true,
    reddit: false,
    facebook: false,
    web: false
  },
  limits: {
    twitter: 100,
    telegram: 100,
    reddit: 50,
    facebook: 50,
    web: 30
  },
  cleaning: {
    removeBots: true,
    removeAds: true,
    filterLanguages: true,
    enableTranslation: false
  },
  allowedLanguages: ["uk", "ru", "en"],
  targetLanguage: "en"
};

// NLP processing configuration - will be updated via UI
let nlpConfig = {
  models: {
    sentimentModel: 'transformers', // 'lexicon', 'transformers', 'gpt'
    summaryModel: 'extractive',     // 'extractive', 'abstractive', 'hybrid'
    entityModel: 'spacy',           // 'spacy', 'flair', 'transformers'
    clusteringAlgorithm: 'kmeans'   // 'kmeans', 'dbscan', 'hierarchical', 'lda'
  },
  parameters: {
    sentimentThreshold: 70,
    summaryLength: 150,
    entityConfidence: 60,
    clusteringThreshold: 40
  },
  features: {
    enableSentiment: true,
    enableSummary: true,
    enableNER: true,
    enableTopicModeling: true,
    enableClusterAnalysis: true
  }
};

/**
 * Update data collection configuration
 */
export const updateDataCollectionConfig = (newConfig: any) => {
  dataCollectionConfig = {
    ...dataCollectionConfig,
    ...newConfig
  };
  console.log('Updated data collection config:', dataCollectionConfig);
};

/**
 * Update NLP processing configuration
 */
export const updateNLPConfig = (newConfig: any) => {
  nlpConfig = {
    ...nlpConfig,
    ...newConfig
  };
  console.log('Updated NLP config:', nlpConfig);
};

/**
 * Get current configuration
 */
export const getConfig = () => {
  return {
    dataCollection: dataCollectionConfig,
    nlp: nlpConfig
  };
};

/**
 * Enhance query with declension forms for better search results
 */
const enhanceQueryWithDeclensions = (query: string): string => {
  let enhancedQuery = query;
  
  // Check language of the query (very basic detection)
  const hasUkrainianChars = /[іїєґ]/i.test(query);
  const hasRussianChars = /[ыъэё]/i.test(query);
  
  // Process Ukrainian query
  if (hasUkrainianChars || (!hasRussianChars && !hasUkrainianChars)) {
    // Check for Ukrainian terms and add their declensions
    for (const [stem, forms] of Object.entries(ukrTermDeclensions)) {
      if (query.toLowerCase().includes(stem)) {
        // Add OR conditions for all forms
        const additionalTerms = forms.slice(0, 5).join(' OR '); // Limit to 5 forms to avoid overlong queries
        enhancedQuery += ` OR ${additionalTerms}`;
        break; // Only add forms for the first matching stem to avoid query getting too long
      }
    }
  }
  
  // Process Russian query
  if (hasRussianChars) {
    // Check for Russian terms and add their declensions
    for (const [stem, forms] of Object.entries(rusTermDeclensions)) {
      if (query.toLowerCase().includes(stem)) {
        // Add OR conditions for all forms
        const additionalTerms = forms.slice(0, 5).join(' OR '); // Limit to 5 forms to avoid overlong queries
        enhancedQuery += ` OR ${additionalTerms}`;
        break; // Only add forms for the first matching stem to avoid query getting too long
      }
    }
  }
  
  return enhancedQuery;
};

/**
 * Collects and analyzes social media data from multiple sources
 */
export const analyzeSocialMedia = async (query: string, selectedSources: Source[] = ['twitter', 'telegram']): Promise<AnalysisResult> => {
  try {
    console.log(`Starting analysis for query: "${query}"`);
    console.log('Using sources:', selectedSources);
    
    // If mock data is enabled, use that instead of real API calls
    if (USE_MOCK_DATA) {
      console.log('Using mock data for analysis');
      let mockResult = await mockAnalyzeSocialMedia(query);
      
      // Filter mock data based on enabled sources from parameters
      if (selectedSources && Array.isArray(selectedSources)) {
        mockResult.claims = mockResult.claims.filter(claim => 
          selectedSources.includes(claim.source as Source)
        );
      }
      
      // Recalculate stats after filtering
      const sourceCount = mockResult.claims.reduce((counts: Record<string, number>, claim) => {
        const source = claim.source;
        counts[source] = (counts[source] || 0) + 1;
        return counts;
      }, {});
      
      mockResult.sources = sourceCount as any;
      mockResult.totalPosts = mockResult.claims.length;
      
      return mockResult;
    }
    
    // Enhance query with declension forms
    const enhancedQuery = enhanceQueryWithDeclensions(query);
    console.log(`Enhanced query: "${enhancedQuery}"`);
    
    // Create an array of promises for all enabled data sources
    const dataPromises: Promise<Claim[]>[] = [];
    
    // Add sources based on selectedSources parameter
    if (selectedSources.includes('twitter')) {
      console.log('Adding Twitter data source');
      dataPromises.push(searchTwitter(
        enhancedQuery, 
        dataCollectionConfig.limits.twitter, 
        TWITTER_METHOD
      ));
    }
    
    // Add Telegram if enabled
    if (selectedSources.includes('telegram')) {
      console.log('Adding Telegram data source');
      dataPromises.push(fetchTelegramMessages(enhancedQuery));
    }
    
    // TODO: Add Reddit, Facebook, Web scraping when implemented
    // These are placeholders for future implementation
    if (selectedSources.includes('reddit')) {
      console.log('Reddit source is selected but not yet implemented');
      // dataPromises.push(searchReddit(enhancedQuery));
    }
    
    if (selectedSources.includes('facebook')) {
      console.log('Facebook source is selected but not yet implemented');
      // dataPromises.push(searchFacebook(enhancedQuery));
    }
    
    if (selectedSources.includes('web')) {
      console.log('Web scraping source is selected but not yet implemented');
      // dataPromises.push(scrapeWebsites(enhancedQuery));
    }
    
    // Fetch data from all enabled sources in parallel
    const results = await Promise.allSettled(dataPromises);
    
    // Combine successful results
    let allClaims: Claim[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allClaims = [...allClaims, ...result.value];
      }
    });
    
    console.log(`Fetched ${allClaims.length} total claims from all sources`);
    
    // Apply data cleaning based on config
    if (dataCollectionConfig.cleaning.removeBots) {
      // Simple bot detection (would be more sophisticated in production)
      allClaims = allClaims.filter(claim => {
        // Filter out claims that look automated
        const botPatterns = [
          /\[automated\]/i,
          /bot_/i,
          /\d{8,}/  // Usernames with many consecutive digits
        ];
        
        return !botPatterns.some(pattern => 
          pattern.test(claim.username || '') || pattern.test(claim.text)
        );
      });
    }
    
    if (dataCollectionConfig.cleaning.removeAds) {
      // Simple ad detection
      allClaims = allClaims.filter(claim => {
        const adPatterns = [
          /купити|купить/i,
          /продаж|продажа/i,
          /реклама/i,
          /знижк|скидк/i,
          /переходь за посиланням/i
        ];
        
        return !adPatterns.some(pattern => pattern.test(claim.text));
      });
    }
    
    if (dataCollectionConfig.cleaning.filterLanguages) {
      // Filter by allowed languages
      allClaims = allClaims.filter(claim => {
        // If language is specified and it's in our allowed list
        if (claim.language) {
          return dataCollectionConfig.allowedLanguages.includes(claim.language);
        }
        // If no language is specified, keep the claim
        return true;
      });
    }
    
    // Process and enhance all claims with better summaries and sentiment
    const processedClaims: Claim[] = allClaims.map(claim => {
      // Generate appropriate summary based on config
      let betterSummary = claim.summary;
      
      if (nlpConfig.features.enableSummary) {
        if (nlpConfig.models.summaryModel === 'extractive') {
          betterSummary = generateSummary(claim.text, nlpConfig.parameters.summaryLength);
        } else if (nlpConfig.models.summaryModel === 'abstractive') {
          betterSummary = generateAbstractiveSummary(claim.text, nlpConfig.parameters.summaryLength);
        } else {
          // Hybrid approach - use both and combine
          betterSummary = generateAbstractiveSummary(
            generateSummary(claim.text, nlpConfig.parameters.summaryLength * 1.5),
            nlpConfig.parameters.summaryLength
          );
        }
      }
      
      // Get more accurate sentiment if enabled
      let refinedSentiment = claim.sentiment;
      if (nlpConfig.features.enableSentiment) {
        refinedSentiment = analyzeSentiment(claim.text);
      }
      
      return {
        ...claim,
        summary: betterSummary,
        sentiment: refinedSentiment,
        id: claim.id || uuidv4()
      };
    });
    
    // Sort claims by relevance
    processedClaims.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Calculate total posts and source distribution
    const totalPosts = allClaims.length;
    
    // Count sources
    const sourceCount = allClaims.reduce((counts: Record<string, number>, claim) => {
      const source = claim.source;
      counts[source] = (counts[source] || 0) + 1;
      return counts;
    }, {});
    
    // Count sentiment distribution
    const sentimentBreakdown = {
      positive: processedClaims.filter(c => c.sentiment === 'positive').length,
      negative: processedClaims.filter(c => c.sentiment === 'negative').length,
      neutral: processedClaims.filter(c => c.sentiment === 'neutral').length
    };
    
    // Count source categories
    const sourceCategories: Record<string, number> = {};
    allClaims.forEach(claim => {
      if (claim.category) {
        sourceCategories[claim.category] = (sourceCategories[claim.category] || 0) + 1;
      }
    });
    
    // Extract key terms
    const keyTerms = extractKeyTerms(allClaims);
    
    // Extract regions
    const regions = extractRegions(allClaims);
    
    // Extract named entities if enabled
    let entities = null;
    if (nlpConfig.features.enableNER) {
      entities = extractEntities(allClaims);
    }
    
    // Perform cluster analysis if enabled
    let clusters = null;
    if (nlpConfig.features.enableClusterAnalysis) {
      clusters = performClusterAnalysis(allClaims);
    }
    
    // Generate disinformation alerts
    const disinformationAlerts = detectDisinformation(allClaims);
    
    // Construct the final analysis result
    const result: AnalysisResult = {
      claims: allClaims,
      totalPosts,
      sources: sourceCount as any,
      sentimentBreakdown,
      sourceCategories: sourceCategories as any,
      keyTerms,
      regions,
      entities,
      clusters: clusters as any,
      alerts: disinformationAlerts
    };
    
    return result;
  } catch (error) {
    console.error('Error in social media analysis:', error);
    
    // Fallback to mock data in case of any error
    console.log('Falling back to mock data due to error');
    let mockResult = await mockAnalyzeSocialMedia(query);
    
    // Filter mock data based on enabled sources from parameters
    if (selectedSources && Array.isArray(selectedSources)) {
      mockResult.claims = mockResult.claims.filter(claim => 
        selectedSources.includes(claim.source as Source)
      );
    }
    
    // Recalculate stats after filtering
    const sourceCount = mockResult.claims.reduce((counts: Record<string, number>, claim) => {
      const source = claim.source;
      counts[source] = (counts[source] || 0) + 1;
      return counts;
    }, {});
    
    mockResult.sources = sourceCount as any;
    mockResult.totalPosts = mockResult.claims.length;
    
    return mockResult;
  }
};

/**
 * Updates the data collection method settings
 */
export const updateDataCollectionSettings = (
  useMockData: boolean,
  twitterMethod: TwitterDataMethod = TwitterDataMethod.SCRAPE
) => {
  // This function is called by the API Key Setup component
  console.log(`Updating data collection settings: useMock=${useMockData}, twitterMethod=${twitterMethod}`);
  (window as any).USE_MOCK_DATA = useMockData;
  (window as any).TWITTER_METHOD = twitterMethod;
};

// Export the current settings for components to use
export const getDataCollectionSettings = () => {
  return {
    useMockData: (window as any).USE_MOCK_DATA !== undefined ? (window as any).USE_MOCK_DATA : USE_MOCK_DATA,
    twitterMethod: (window as any).TWITTER_METHOD || TWITTER_METHOD
  };
};
