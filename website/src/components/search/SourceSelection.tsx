
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Source } from '@/types';

interface SourceSelectionProps {
  selectedSources: Record<Source, boolean>;
  onSourceToggle: (source: Source) => void;
}

const SourceSelection: React.FC<SourceSelectionProps> = ({
  selectedSources,
  onSourceToggle
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 mt-2">
      <span className="text-sm font-medium">Sources:</span>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox 
            checked={selectedSources.twitter}
            onCheckedChange={() => onSourceToggle('twitter')}
            id="twitter-source"
          />
          <span className={cn(
            "text-sm",
            !selectedSources.twitter && "text-muted-foreground"
          )}>Twitter</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox 
            checked={selectedSources.telegram}
            onCheckedChange={() => onSourceToggle('telegram')}
            id="telegram-source"
          />
          <span className={cn(
            "text-sm",
            !selectedSources.telegram && "text-muted-foreground"
          )}>Telegram</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox 
            checked={selectedSources.reddit}
            onCheckedChange={() => onSourceToggle('reddit')}
            id="reddit-source"
            disabled
          />
          <span className="text-sm text-muted-foreground">Reddit (coming soon)</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox 
            checked={selectedSources.facebook}
            onCheckedChange={() => onSourceToggle('facebook')}
            id="facebook-source"
            disabled
          />
          <span className="text-sm text-muted-foreground">Facebook (coming soon)</span>
        </label>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox 
            checked={selectedSources.web}
            onCheckedChange={() => onSourceToggle('web')}
            id="web-source"
            disabled
          />
          <span className="text-sm text-muted-foreground">Web Scraping (coming soon)</span>
        </label>
      </div>
    </div>
  );
};

export default SourceSelection;
