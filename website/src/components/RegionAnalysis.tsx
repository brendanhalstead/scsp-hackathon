
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RegionAnalysisProps {
  regions: Record<string, number>;
}

const RegionAnalysis: React.FC<RegionAnalysisProps> = ({ regions }) => {
  const sortedRegions = Object.entries(regions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Get top 5 regions
    
  const maxCount = Math.max(...sortedRegions.map(([_, count]) => count));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Most Mentioned Regions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRegions.map(([region, count]) => (
            <div key={region}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{region}</Badge>
                  <span className="text-xs text-muted-foreground">{count} mentions</span>
                </div>
                <span className="text-xs font-medium">{((count / maxCount) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={(count / maxCount) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionAnalysis;
