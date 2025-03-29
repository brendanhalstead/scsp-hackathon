
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  isLoading, 
  onClick, 
  disabled = false 
}) => {
  return (
    <div className="flex justify-center my-8">
      <Button 
        variant="outline" 
        size="lg"
        onClick={onClick}
        disabled={isLoading || disabled}
        className="relative"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading more data...
          </>
        ) : (
          'Load More Claims'
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
