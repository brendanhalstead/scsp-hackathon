
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, HelpCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Claim } from '@/types';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface TemporalAnalysisProps {
  claims: Claim[];
  timeframe?: '1h' | '6h' | '24h' | '7d';
}

const TemporalAnalysis: React.FC<TemporalAnalysisProps> = ({ claims, timeframe = '24h' }) => {
  // Group claims by hour/timeframe
  const groupedData = React.useMemo(() => {
    const now = new Date();
    const timeFrameMs = timeframe === '1h' ? 3600000 :
                       timeframe === '6h' ? 21600000 :
                       timeframe === '24h' ? 86400000 :
                       604800000; // 7d
    
    // Filter claims within the timeframe
    const relevantClaims = claims.filter(claim => {
      const claimTime = new Date(claim.timestamp).getTime();
      return (now.getTime() - claimTime) <= timeFrameMs;
    });
    
    // Number of intervals to divide the timeframe into
    const intervals = timeframe === '1h' ? 12 :  // 5-minute intervals
                     timeframe === '6h' ? 12 :   // 30-minute intervals
                     timeframe === '24h' ? 24 :  // 1-hour intervals
                     14;                         // 12-hour intervals for 7d
    
    const intervalMs = timeFrameMs / intervals;
    const result: { time: string, count: number }[] = [];
    
    // Initialize all intervals
    for (let i = 0; i < intervals; i++) {
      const intervalTime = new Date(now.getTime() - (intervals - i) * intervalMs);
      const timeLabel = timeframe === '7d' 
        ? intervalTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : intervalTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      
      result.push({
        time: timeLabel,
        count: 0,
      });
    }
    
    // Populate intervals with claim counts
    relevantClaims.forEach(claim => {
      const claimTime = new Date(claim.timestamp).getTime();
      const index = Math.floor((claimTime - (now.getTime() - timeFrameMs)) / intervalMs);
      
      if (index >= 0 && index < intervals) {
        result[index].count += 1;
      }
    });
    
    return result;
  }, [claims, timeframe]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Temporal Analysis</span>
          <UITooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Shows the frequency of claims over time, helping to identify spikes in social media activity.</p>
            </TooltipContent>
          </UITooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={groupedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                name="Claim Frequency" 
                activeDot={{ r: 8 }} 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporalAnalysis;
