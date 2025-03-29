
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, List } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TermInfo {
  term: string;
  translation?: string;
  language: 'ukrainian' | 'russian' | 'english' | 'both';
}

interface KeyTermsProps {
  terms: TermInfo[];
  onTermClick: (term: string) => void;
}

const KeyTerms: React.FC<KeyTermsProps> = ({ terms, onTermClick }) => {
  // Define language-specific colors for the badges
  const getTermColor = (language: 'ukrainian' | 'russian' | 'english' | 'both') => {
    switch (language) {
      case 'ukrainian':
        return 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300';
      case 'russian':
        return 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300';
      case 'english':
        return 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300';
      case 'both':
        return 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300';
      default:
        return '';
    }
  };

  const getLanguageFlag = (language: 'ukrainian' | 'russian' | 'english' | 'both') => {
    switch (language) {
      case 'ukrainian':
        return '🇺🇦';
      case 'russian':
        return '🇷🇺';
      case 'english':
        return '🇬🇧';
      case 'both':
        return '🇺🇦/🇷🇺';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <span>Key Terms</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center gap-2 text-xs flex-wrap">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">UA</Badge>
          <span className="text-muted-foreground">Ukrainian</span>
          <Badge variant="outline" className="bg-red-100 text-red-800">RU</Badge>
          <span className="text-muted-foreground">Russian</span>
          <Badge variant="outline" className="bg-green-100 text-green-800">EN</Badge>
          <span className="text-muted-foreground">English</span>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">UA/RU</Badge>
          <span className="text-muted-foreground">Both languages</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {terms.map((termInfo) => (
            <Tooltip key={termInfo.term}>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline"
                  className={`cursor-pointer border ${getTermColor(termInfo.language)}`}
                  onClick={() => onTermClick(termInfo.term)}
                >
                  {termInfo.term}
                  {termInfo.translation && termInfo.language !== 'english' && (
                    <span className="ml-1 text-xs opacity-70">({termInfo.translation})</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-semibold">
                    {getLanguageFlag(termInfo.language)} 
                    {termInfo.language === 'ukrainian' ? 'Ukrainian' : 
                     termInfo.language === 'russian' ? 'Russian' : 
                     termInfo.language === 'english' ? 'English' :
                     'Both languages'}
                  </p>
                  {termInfo.translation && termInfo.language !== 'english' && (
                    <p className="text-muted-foreground">English: {termInfo.translation}</p>
                  )}
                  {termInfo.language !== 'english' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Includes declensions and conjugations
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyTerms;
