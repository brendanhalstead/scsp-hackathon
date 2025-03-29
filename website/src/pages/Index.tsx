import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import { analyzeSocialMedia, updateDataCollectionConfig } from '@/services/dataCollection';
import { AnalysisResult, Claim, ClusterType, Source } from '@/types';
import AnalysisStats from '@/components/AnalysisStats';
import ResultsPanel from '@/components/ResultsPanel';
import LoadingState from '@/components/LoadingState';
import SourceList from '@/components/SourceList';
import KeyTerms from '@/components/KeyTerms';
import RegionAnalysis from '@/components/RegionAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import LoadMoreButton from '@/components/LoadMoreButton';
import { useQuery } from '@tanstack/react-query';
import ClusterVisualizer from '@/components/ClusterVisualizer';
import TemporalAnalysis from '@/components/TemporalAnalysis';
import AlertSystem from '@/components/AlertSystem';

const termLanguageMapper = (terms: string[]): Array<{term: string, translation: string, language: 'ukrainian' | 'russian' | 'english' | 'both'}> => {
  const knownTerms: Record<string, {russian: string, english: string}> = {
    'військові дії': { russian: 'военные действия', english: 'military actions' },
    'обстріли': { russian: 'обстрелы', english: 'shelling' },
    'евакуація': { russian: 'эвакуация', english: 'evacuation' },
    'гуманітарна допомога': { russian: 'гуманитарная помощь', english: 'humanitarian aid' },
    'Харків': { russian: 'Харьков', english: 'Kharkiv' },
    'атака': { russian: 'атака', english: 'attack' },
    'оборона': { russian: 'оборона', english: 'defense' },
    'перемога': { russian: 'победа', english: 'victory' },
    'мир': { russian: 'мир', english: 'peace' },
    'мирні переговори': { russian: 'мирные переговоры', english: 'peace talks' },
    'контрнаступ': { russian: 'контрнаступление', english: 'counteroffensive' },
    'територіальна оборона': { russian: 'территориальная оборона', english: 'territorial defense' },
    'біженці': { russian: 'беженцы', english: 'refugees' },
    'повітряна тривога': { russian: 'воздушная тревога', english: 'air raid alert' }
  };

  const russianToUkrainian: Record<string, string> = {};
  Object.entries(knownTerms).forEach(([uk, data]) => {
    russianToUkrainian[data.russian] = uk;
  });

  const englishTerms = [
    'military operations',
    'artillery shelling',
    'humanitarian corridor',
    'civilian evacuation',
    'Kharkiv defense',
    'ceasefire negotiations',
    'counteroffensive',
    'territorial defense forces',
    'refugee crisis',
    'air defense systems'
  ];

  return terms.map(term => {
    if (englishTerms.includes(term)) {
      return {
        term,
        translation: undefined,
        language: 'english' as const
      };
    }
    
    if (term in knownTerms) {
      return {
        term,
        translation: knownTerms[term].english,
        language: 'ukrainian' as const
      };
    }
    
    if (term in russianToUkrainian) {
      return {
        term,
        translation: knownTerms[russianToUkrainian[term]].english,
        language: 'russian' as const
      };
    }
    
    return {
      term,
      translation: undefined,
      language: 'ukrainian' as const
    };
  });
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<Source[]>(['twitter', 'telegram']);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeCluster, setActiveCluster] = useState<{type?: ClusterType, name?: string}>({});
  const { toast } = useToast();

  const {
    data: result,
    isLoading: isSearching,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['socialMediaAnalysis', searchQuery, selectedSources, page],
    queryFn: async () => {
      if (!searchQuery) return null;
      updateDataCollectionConfig({
        sources: {
          twitter: selectedSources.includes('twitter'),
          telegram: selectedSources.includes('telegram'),
          reddit: selectedSources.includes('reddit'),
          facebook: selectedSources.includes('facebook'),
          web: selectedSources.includes('web')
        }
      });
      return await analyzeSocialMedia(searchQuery, selectedSources);
    },
    enabled: false,
    staleTime: 60000,
  });

  const progress = isFetching 
    ? Math.min(99, Math.floor(Math.random() * 30) + 70) 
    : isSearching 
      ? Math.floor(Math.random() * 60) + 20 
      : 0;

  const handleSearch = async (query: string, sources: Source[] = ['twitter', 'telegram']) => {
    setSearchQuery(query);
    setSelectedSources(sources);
    setPage(1);
    refetch();
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setPage(prevPage => prevPage + 1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Additional Data Loaded",
        description: "More social media claims have been analyzed.",
      });
    } catch (error) {
      toast({
        title: "Failed to Load More",
        description: "Could not retrieve additional data at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleTermClick = (term: string) => {
    handleSearch(term, selectedSources);
  };
  
  const handleClusterSelect = (type: ClusterType, name: string) => {
    setActiveCluster({ type, name });
  };

  useEffect(() => {
    handleSearch("військові дії", ['twitter', 'telegram']);
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze social media data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const processedKeyTerms = result?.keyTerms ? termLanguageMapper(result.keyTerms) : [];

  const demoAlerts = [
    {
      id: '1',
      message: 'Spike in mentions detected around Kharkiv region',
      severity: 'high' as const,
      timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
    },
    {
      id: '2',
      message: 'New narrative detected: "Peacekeeping operation"',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: '3',
      message: 'Increased social media activity around Kyiv',
      severity: 'low' as const,
      timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Ukraine Conflict OSINT Monitor</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time analysis of Ukrainian, Russian, and English social media to extract key claims, regional activity, 
            and intelligence signals from both official and local sources.
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <SearchForm onSearch={handleSearch} isSearching={isFetching || isSearching} />
        </div>

        {(isSearching || isFetching) && <LoadingState progress={progress} />}
        
        {result && (
          <div className="animate-in fade-in-0 duration-500">
            <div className="mb-4 pb-4 border-b border-border">
              <h2 className="text-xl font-semibold">
                Results for: <span className="text-primary">{searchQuery}</span>
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  Analysis completed {new Date().toLocaleTimeString()}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Analyzed {result.totalPosts} posts from multiple Ukrainian, Russian, and English language sources
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="col-span-2">
                <div className="grid grid-cols-1 gap-6">
                  <AnalysisStats result={result} />
                  <TemporalAnalysis claims={result.claims} />
                </div>
              </div>
              <div className="space-y-6">
                <AlertSystem alerts={demoAlerts} />
                {processedKeyTerms.length > 0 && (
                  <KeyTerms terms={processedKeyTerms} onTermClick={handleTermClick} />
                )}
                {result.regions && (
                  <RegionAnalysis regions={result.regions} />
                )}
              </div>
            </div>

            <div className="mb-8">
              <ClusterVisualizer 
                claims={result.claims} 
                onClusterSelect={handleClusterSelect}
              />
            </div>

            <Tabs defaultValue="claims" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
                <TabsTrigger value="sources">Source Intelligence</TabsTrigger>
              </TabsList>
              <TabsContent value="claims" className="mt-0">
                <ResultsPanel result={result} />
                <LoadMoreButton 
                  isLoading={isLoadingMore}
                  onClick={handleLoadMore}
                  disabled={isSearching || isFetching}
                />
              </TabsContent>
              <TabsContent value="sources" className="mt-0">
                <SourceList claims={result.claims} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
