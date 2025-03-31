
import React, { useState } from 'react';
import { Claim } from '@/types';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { analyzeClaimWithPerplexityIdiot } from '@/services/claimAnalysis';
interface ClaimAnalysisButtonProps {
  claim: Claim;
}

const ClaimAnalysisButton: React.FC<ClaimAnalysisButtonProps> = ({ claim }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const { toast } = useToast();

  const analyzeClaimWithPerplexity = async () => {
    setIsLoading(true);
    try {
      const response =await analyzeClaimWithPerplexityIdiot(claim); //await fetch('/api/analyze-claim', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(claim),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to analyze claim');
      // }

      // const result = await response.json();
      // setAnalysisResult(result);
      setAnalysisResult(response);
    } catch (error) {
      console.error('Error analyzing claim:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze this claim. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeClick = () => {
    setIsOpen(true);
    analyzeClaimWithPerplexity();
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-xs" 
        onClick={handleAnalyzeClick}
      >
        <Lightbulb className="h-3 w-3" />
        Analyze
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim Analysis</DialogTitle>
            <DialogDescription>
              Deep research analysis of the claim using Perplexity AI
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Original claim:</h4>
            <div className="bg-secondary/30 p-3 rounded-md text-sm">
              {claim.text}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : analysisResult ? (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Summary:</h4>
                <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Analyzed Claims:</h4>
                <div className="space-y-3">
                  {analysisResult.claims.map((analyzedClaim: any, index: number) => (
                    <div key={index} className="border border-border rounded-md p-3">
                      <div className="flex items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{analyzedClaim.claim}</p>
                        </div>
                        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full ml-2">
                          {Math.round(analyzedClaim.confidence * 100)}%
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                        <ul className="space-y-1">
                          {analyzedClaim.sources.map((source: string, sourceIndex: number) => (
                            <li key={sourceIndex} className="text-xs">
                              {source}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Data Quality Score: {Math.round(analysisResult.dataQuality * 100)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  Powered by Perplexity AI
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No analysis data available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimAnalysisButton;
