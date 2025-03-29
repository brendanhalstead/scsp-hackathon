
import React, { useState } from 'react';
import { Source } from '@/types';
import SearchInput from './search/SearchInput';
import SourceSelection from './search/SourceSelection';
import SuggestedTerms from './search/SuggestedTerms';
import { 
  suggestedUkrainianTerms, 
  suggestedRussianTerms, 
  suggestedEnglishTerms 
} from './search/SearchTermsData';

interface SearchFormProps {
  onSearch: (query: string, sources: Source[]) => void;
  isSearching: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isSearching }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ukrainian');
  const [selectedSources, setSelectedSources] = useState<Record<Source, boolean>>({
    twitter: true,
    telegram: true,
    reddit: false,
    facebook: false,
    web: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      // Filter only enabled sources
      const enabledSources = Object.entries(selectedSources)
        .filter(([_, enabled]) => enabled)
        .map(([source]) => source) as Source[];
      
      onSearch(query, enabledSources);
    }
  };

  const handleSourceToggle = (source: Source) => {
    setSelectedSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleTermClick = (term: string) => {
    if (!isSearching) {
      // Filter only enabled sources
      const enabledSources = Object.entries(selectedSources)
        .filter(([_, enabled]) => enabled)
        .map(([source]) => source) as Source[];
      
      setQuery(term);
      onSearch(term, enabledSources);
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'ukrainian':
        return "Enter Ukrainian keywords (військові дії, обстріли)...";
      case 'russian':
        return "Enter Russian keywords (военные действия, обстрелы)...";
      case 'english':
      default:
        return "Enter English keywords (military operations, shelling)...";
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <SearchInput
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        onSubmit={handleSubmit}
        isSearching={isSearching}
        placeholder={getPlaceholder()}
      />
      
      <SourceSelection
        selectedSources={selectedSources}
        onSourceToggle={handleSourceToggle}
      />
      
      <SuggestedTerms
        suggestedUkrainianTerms={suggestedUkrainianTerms}
        suggestedRussianTerms={suggestedRussianTerms}
        suggestedEnglishTerms={suggestedEnglishTerms}
        onTermClick={handleTermClick}
        isSearching={isSearching}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default SearchForm;
