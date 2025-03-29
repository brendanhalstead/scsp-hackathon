
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/types';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Twitter, Send } from 'lucide-react';

interface AnalysisStatsProps {
  result: AnalysisResult;
}

const AnalysisStats: React.FC<AnalysisStatsProps> = ({ result }) => {
  const { totalPosts, sources } = result;
  
  const sourceData = [
    { name: 'Twitter', value: sources.twitter || 0, icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', value: sources.telegram || 0, icon: Send, color: '#0088cc' },
  ].filter(source => source.value > 0); // Only show sources that have data
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Posts Analyzed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalPosts}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sources</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-2 rounded-md text-xs">
                          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs mt-2">
            {sourceData.map((source) => (
              <div key={source.name} className="flex items-center gap-1">
                <source.icon className="h-3 w-3" style={{ color: source.color }} />
                <span>{source.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisStats;
