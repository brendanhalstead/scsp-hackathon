
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface TermWithTranslation {
  term: string;
  translation: string | null;
}

interface SuggestedTermsProps {
  suggestedUkrainianTerms: TermWithTranslation[];
  suggestedRussianTerms: TermWithTranslation[];
  suggestedEnglishTerms: TermWithTranslation[];
  onTermClick: (term: string) => void;
  isSearching: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SuggestedTerms: React.FC<SuggestedTermsProps> = ({
  suggestedUkrainianTerms,
  suggestedRussianTerms,
  suggestedEnglishTerms,
  onTermClick,
  isSearching,
  activeTab,
  onTabChange
}) => {
  return (
    <Tabs 
      defaultValue="ukrainian" 
      value={activeTab}
      onValueChange={onTabChange}
      className="mb-3"
    >
      <TabsList className="w-full mb-2">
        <TabsTrigger value="ukrainian" className="flex-1">
          <Badge variant="outline" className="mr-1 bg-blue-100 text-blue-800">UA</Badge>
          Ukrainian Terms
        </TabsTrigger>
        <TabsTrigger value="russian" className="flex-1">
          <Badge variant="outline" className="mr-1 bg-red-100 text-red-800">RU</Badge>
          Russian Terms
        </TabsTrigger>
        <TabsTrigger value="english" className="flex-1">
          <Badge variant="outline" className="mr-1 bg-green-100 text-green-800">EN</Badge>
          English Terms
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="ukrainian" className="mt-0">
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestedUkrainianTerms.map(({ term, translation }) => (
            <Button 
              key={term}
              variant="outline" 
              size="sm"
              className="text-xs border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 group"
              disabled={isSearching}
              onClick={() => onTermClick(term)}
            >
              {term}
              <span className="ml-1 text-blue-500 text-[10px] group-hover:opacity-100 opacity-70">
                ({translation})
              </span>
            </Button>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="russian" className="mt-0">
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestedRussianTerms.map(({ term, translation }) => (
            <Button 
              key={term}
              variant="outline" 
              size="sm"
              className="text-xs border-red-300 bg-red-50 text-red-800 hover:bg-red-100 group"
              disabled={isSearching}
              onClick={() => onTermClick(term)}
            >
              {term}
              <span className="ml-1 text-red-500 text-[10px] group-hover:opacity-100 opacity-70">
                ({translation})
              </span>
            </Button>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="english" className="mt-0">
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestedEnglishTerms.map(({ term }) => (
            <Button 
              key={term}
              variant="outline" 
              size="sm"
              className="text-xs border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
              disabled={isSearching}
              onClick={() => onTermClick(term)}
            >
              {term}
            </Button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SuggestedTerms;
