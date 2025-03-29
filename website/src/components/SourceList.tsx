
import React, { useState } from 'react';
import { Claim, SourceCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Shield, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SourceListProps {
  claims: Claim[];
}

const SourceList: React.FC<SourceListProps> = ({ claims }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SourceCategory | 'all'>('all');

  const uniqueSources = claims.reduce<Record<string, Claim>>((acc, claim) => {
    if (!acc[claim.username || '']) {
      acc[claim.username || ''] = claim;
    }
    return acc;
  }, {});

  const sources = Object.values(uniqueSources);

  const filteredSources = sources.filter(source => {
    const matchesSearch = searchTerm === '' || 
      source.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (source.category && source.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || source.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<SourceCategory | 'all', string> = {
    'all': 'All Sources',
    'government': 'Government',
    'major_media': 'Major Media',
    'independent_journalist': 'Independent',
    'local_source': 'Local Sources',
    'military_affiliated': 'Military'
  };

  const categoryColors: Record<SourceCategory, string> = {
    'government': 'bg-purple-800/20 text-purple-400 hover:bg-purple-800/30',
    'major_media': 'bg-yellow-800/20 text-yellow-400 hover:bg-yellow-800/30',
    'independent_journalist': 'bg-blue-800/20 text-blue-400 hover:bg-blue-800/30',
    'local_source': 'bg-green-800/20 text-green-400 hover:bg-green-800/30',
    'military_affiliated': 'bg-red-800/20 text-red-400 hover:bg-red-800/30'
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Source Analysis</span>
          <span className="text-sm font-normal text-muted-foreground">{filteredSources.length} unique sources</span>
        </CardTitle>
        <div className="flex flex-col md:flex-row gap-2 pt-2">
          <Input
            placeholder="Search sources..."
            className="bg-secondary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "cursor-pointer", 
                categoryFilter === 'all' ? 'bg-primary/20 text-primary' : 'bg-secondary/50'
              )}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </Badge>
            {Object.keys(categoryLabels).filter(key => key !== 'all').map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className={cn(
                  "cursor-pointer", 
                  categoryFilter === category 
                    ? categoryColors[category as SourceCategory] 
                    : 'bg-secondary/50'
                )}
                onClick={() => setCategoryFilter(category as SourceCategory)}
              >
                {categoryLabels[category as SourceCategory]}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Source</TableHead>
                <TableHead className="hidden md:table-cell">Platform</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead className="hidden lg:table-cell">Region</TableHead>
                <TableHead className="text-right">Relevance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.sort((a, b) => (b.followers || 0) - (a.followers || 0)).map((source) => (
                <TableRow key={source.username}>
                  <TableCell className="font-medium flex items-center gap-1">
                    {source.username}
                    {source.verified && <Check className="h-3 w-3 text-blue-400" />}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={cn("text-xs", source.platform.toLowerCase() === 'twitter' ? 'bg-twitter/20 text-twitter' : 'bg-telegram/20 text-telegram')}>
                      {source.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {source.category && (
                      <Badge variant="outline" className={cn("text-xs", categoryColors[source.category])}>
                        {categoryLabels[source.category]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {source.followers ? (
                        source.followers > 1000000 
                          ? `${(source.followers / 1000000).toFixed(1)}M`
                          : source.followers > 1000 
                            ? `${(source.followers / 1000).toFixed(1)}K` 
                            : source.followers
                      ) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {source.region && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {source.region}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={cn(
                      "text-xs",
                      source.relevanceScore > 0.9 ? "bg-green-500/20 text-green-400" :
                      source.relevanceScore > 0.7 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    )}>
                      {(source.relevanceScore * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceList;
