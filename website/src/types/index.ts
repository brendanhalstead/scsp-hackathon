
export type Source = 'twitter' | 'telegram' | 'reddit' | 'facebook' | 'web';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type SourceCategory = 'government' | 'major_media' | 'independent_journalist' | 'local_source' | 'military_affiliated';

// Updated to remove 'ideology' as requested
export type ClusterType = 'figure' | 'place';

export type Cluster = {
  type: ClusterType;
  name: string;
  count?: number;
  importance?: number; // 0-100 importance score
};

export type Claim = {
  id: string;
  source: Source;
  text: string;
  summary: string;
  sentiment: SentimentType;
  relevanceScore: number;
  timestamp: string;
  username?: string;
  platform: string;
  followers?: number;
  category?: SourceCategory;
  language?: string;
  verified?: boolean;
  region?: string;
  cluster?: Cluster; // Added cluster information
  clusterRelevance?: number; // How relevant this claim is to its cluster (0-1)
  trend?: 'rising' | 'falling' | 'stable'; // Trend of this topic
  entities?: {
    people: string[];
    organizations: string[];
    locations: string[];
  };
  factChecked?: boolean;
  factCheckRating?: 'true' | 'mostly_true' | 'mixed' | 'mostly_false' | 'false';
  factCheckSource?: string;
  translatedText?: string;
  originalLanguage?: string;
};

export type AnalysisResult = {
  claims: Claim[];
  totalPosts: number;
  sources: {
    twitter?: number;
    telegram?: number;
    reddit?: number;
    facebook?: number;
    web?: number;
  };
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sourceCategories?: Record<SourceCategory, number>;
  keyTerms?: string[];
  regions?: Record<string, number>;
  entities?: {
    people: [string, number][];
    organizations: [string, number][];
    locations: [string, number][];
  };
  clusters?: {
    figures: Record<string, number>;
    places: Record<string, number>;
    ideologies: Record<string, number>;
  };
  alerts?: {
    id: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    category?: string;
    region?: string;
    source?: string;
  }[];
};

export type NLPModels = {
  sentimentModel: 'lexicon' | 'transformers' | 'gpt';
  summaryModel: 'extractive' | 'abstractive' | 'hybrid';
  entityModel: 'spacy' | 'flair' | 'transformers';
  clusteringAlgorithm: 'kmeans' | 'dbscan' | 'hierarchical' | 'lda';
};

export type NLPParameters = {
  sentimentThreshold: number;
  summaryLength: number;
  entityConfidence: number;
  clusteringThreshold: number;
};

export type NLPFeatures = {
  enableSentiment: boolean;
  enableSummary: boolean;
  enableNER: boolean;
  enableTopicModeling: boolean;
  enableClusterAnalysis: boolean;
};

export type DataCollectionConfig = {
  sources: {
    twitter: boolean;
    telegram: boolean;
    reddit: boolean;
    facebook: boolean;
    web: boolean;
  };
  limits: {
    twitter: number;
    telegram: number;
    reddit: number;
    facebook: number;
    web: number;
  };
  cleaning: {
    removeBots: boolean;
    removeAds: boolean;
    filterLanguages: boolean;
    enableTranslation: boolean;
  };
  allowedLanguages: string[];
  targetLanguage: string;
};

export type NLPConfig = {
  models: NLPModels;
  parameters: NLPParameters;
  features: NLPFeatures;
};

export type SystemConfig = {
  dataCollection: DataCollectionConfig;
  nlp: NLPConfig;
};
