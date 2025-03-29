
import React from 'react';
import { Loader2, Twitter, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  progress: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ progress }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center p-6">
      <div className="relative flex justify-center items-center h-24 mb-6">
        <div className={cn(
          "absolute transition-opacity duration-700",
          progress < 30 ? "opacity-100" : "opacity-0"
        )}>
          <Twitter className="h-12 w-12 text-blue-400 animate-pulse" />
        </div>
        <div className={cn(
          "absolute transition-opacity duration-700",
          progress >= 30 && progress < 70 ? "opacity-100" : "opacity-0"
        )}>
          <Send className="h-12 w-12 text-sky-400 animate-pulse" />
        </div>
        <div className={cn(
          "absolute transition-opacity duration-700",
          progress >= 70 ? "opacity-100" : "opacity-0"
        )}>
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-4">Analyzing Social Media</h3>
      
      <Progress value={progress} className="h-2 mb-2" />
      
      <div className="text-sm text-muted-foreground">
        {progress < 30 && "Scanning Twitter feeds..."}
        {progress >= 30 && progress < 70 && "Processing Telegram channels..."}
        {progress >= 70 && progress < 90 && "Identifying claims and narratives..."}
        {progress >= 90 && "Generating summaries..."}
      </div>
    </div>
  );
};

export default LoadingState;
