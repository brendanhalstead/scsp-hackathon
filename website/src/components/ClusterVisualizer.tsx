
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ClusterType, Claim } from '@/types';
import { cn } from '@/lib/utils';

interface ClusterVisualizerProps {
  claims: Claim[];
  onClusterSelect?: (type: ClusterType, name: string) => void;
}

const ClusterVisualizer: React.FC<ClusterVisualizerProps> = ({ claims, onClusterSelect }) => {
  const [activeTab, setActiveTab] = useState<ClusterType>('figure');
  
  // Extract and aggregate cluster data
  // Note: We're explicitly defining the object shape instead of using Record<ClusterType>
  // since we're only handling 'figure' and 'place' clusters (not 'ideology')
  const clusterData = {
    figure: {} as Record<string, { count: number, followers: number }>,
    place: {} as Record<string, { count: number, followers: number }>,
  };
  
  claims.forEach(claim => {
    if (claim.cluster) {
      const { type, name } = claim.cluster;
      
      // Skip if the type isn't in our data structure
      // Use type narrowing instead of direct comparison with 'ideology' string
      if (!(type in clusterData)) return;
      
      if (!clusterData[type as keyof typeof clusterData][name]) {
        clusterData[type as keyof typeof clusterData][name] = { count: 0, followers: 0 };
      }
      
      clusterData[type as keyof typeof clusterData][name].count += 1;
      clusterData[type as keyof typeof clusterData][name].followers += claim.followers || 0;
    }
  });
  
  // Convert to chart format
  const getChartData = (type: ClusterType) => {
    if (!clusterData[type]) return [];
    
    return Object.entries(clusterData[type])
      .map(([name, { count, followers }]) => ({
        name,
        count,
        followers,
        followersInK: followers > 1000 ? (followers / 1000).toFixed(1) + 'K' : followers
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 clusters
  };
  
  // Get color for each cluster type
  const getClusterTypeIcon = (type: ClusterType) => {
    switch (type) {
      case 'figure': return <User className="h-4 w-4" />;
      case 'place': return <MapPin className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getClusterTypeColor = (type: ClusterType) => {
    switch (type) {
      case 'figure': return ['#8884d8', '#a4a1e4', '#c0bef0'];
      case 'place': return ['#82ca9d', '#a1d6b4', '#c0e3cc'];
      default: return ['#8884d8'];
    }
  };
  
  const getTrendIcon = (trend?: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'falling': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const chartData = getChartData(activeTab);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span>Cluster Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ClusterType)}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="figure" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="place" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Places
            </TabsTrigger>
          </TabsList>
          
          {['figure', 'place'].map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              {chartData.length > 0 ? (
                <>
                  <div className="h-52 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getChartData(type as ClusterType)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'count' ? `${value} mentions` : `${value} followers`,
                            name === 'count' ? 'Mentions' : 'Followers'
                          ]} 
                        />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          fill={getClusterTypeColor(type as ClusterType)[0]} 
                          name="Mentions" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Top {type === 'figure' ? 'People' : 'Places'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getChartData(type as ClusterType).map((item, index) => (
                        <div 
                          key={item.name} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-accent/50",
                            index === 0 && "border-primary/50"
                          )}
                          onClick={() => onClusterSelect && onClusterSelect(type as ClusterType, item.name)}
                        >
                          <div className="flex items-center gap-2">
                            {getClusterTypeIcon(type as ClusterType)}
                            <span className="font-medium text-sm">{item.name}</span>
                            {/* Example trend icon - in real app would be based on data */}
                            {getTrendIcon(index % 3 === 0 ? 'rising' : index % 3 === 1 ? 'falling' : 'stable')}
                          </div>
                          <div className="flex flex-col items-end text-xs">
                            <Badge variant="outline" className="mb-1">
                              {item.count} mentions
                            </Badge>
                            <span className="text-muted-foreground">
                              {item.followersInK} followers
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No {type} clusters found in current data.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClusterVisualizer;
