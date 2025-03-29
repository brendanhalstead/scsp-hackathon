
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const RelevanceScoreInfo = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
          <Info className="h-4 w-4" />
          <span className="sr-only">Relevance score info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">About Relevance Scores</h4>
          <p className="text-sm text-muted-foreground">
            Relevance scores are calculated based on multiple factors:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>User verification (verified accounts receive +15%)</li>
            <li>Account authority and reputation</li>
            <li>Content freshness and recency</li>
            <li>Keyword match quality</li>
            <li>Engagement metrics (likes, shares)</li>
            <li>Citation of credible sources</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            The language indicator (UK/RU) refers to the content's language, not the user's nationality.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RelevanceScoreInfo;
