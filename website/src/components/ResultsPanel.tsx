
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResult, Claim, ClusterType } from '@/types';
import ClaimCard from './ClaimCard';
import { Twitter, Send, Filter } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface ResultsPanelProps {
  result: AnalysisResult;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  const [view, setView] = useState('all');
  const [clusterFilter, setClusterFilter] = useState<{type?: ClusterType, name?: string}>({});

  // Collect all available clusters from claims
  const availableClusters: Record<ClusterType, Set<string>> = {
    figure: new Set(),
    place: new Set()
  };

  result.claims.forEach(claim => {
    if (claim.cluster) {
      const { type, name } = claim.cluster;
      // Only add if the type exists in our availableClusters object
      if (type in availableClusters) {
        availableClusters[type].add(name);
      }
    }
  });

  const filteredClaims = result.claims.filter((claim) => {
    // Filter by source
    const sourceMatch = view === 'all' || claim.source === view;
    
    // Filter by cluster
    const clusterMatch = 
      !clusterFilter.type || 
      (claim.cluster && 
       claim.cluster.type === clusterFilter.type && 
       (!clusterFilter.name || claim.cluster.name === clusterFilter.name));
    
    return sourceMatch && clusterMatch;
  });

  const clearFilters = () => {
    setClusterFilter({});
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="all" value={view} onValueChange={setView}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Extracted Claims & Narratives</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn(
                  "flex items-center gap-1",
                  Object.keys(clusterFilter).length > 0 && "border-primary"
                )}>
                  <Filter className="h-4 w-4" />
                  Clusters
                  {Object.keys(clusterFilter).length > 0 && (
                    <span className="ml-1 text-xs bg-primary/20 rounded-full px-1.5">
                      {clusterFilter.name || clusterFilter.type || ''}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by clusters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuRadioGroup value={clusterFilter.type || ''} onValueChange={(value) => {
                  if (value) {
                    setClusterFilter({...clusterFilter, type: value as ClusterType});
                  } else {
                    setClusterFilter({});
                  }
                }}>
                  <DropdownMenuRadioItem value="">All Types</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="figure">Figures</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="place">Places</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                
                {clusterFilter.type && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>
                      {clusterFilter.type === 'figure' ? 'Figures' : 'Places'}
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup 
                      value={clusterFilter.name || ''} 
                      onValueChange={(value) => {
                        setClusterFilter({...clusterFilter, name: value || undefined});
                      }}
                    >
                      <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
                      {Array.from(availableClusters[clusterFilter.type]).map(name => (
                        <DropdownMenuRadioItem key={name} value={name}>
                          {name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center gap-1">
                <Twitter className="h-3 w-3" /> Twitter
              </TabsTrigger>
              <TabsTrigger value="telegram" className="flex items-center gap-1">
                <Send className="h-3 w-3" /> Telegram
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="twitter" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="telegram" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Add the cn utility that was missing
import { cn } from '@/lib/utils';

export default ResultsPanel;
