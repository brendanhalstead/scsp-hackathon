
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Claim, SourceCategory, ClusterType } from '@/types';
import { MessageSquare, Users, Award, MapPin, Globe, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import RelevanceScoreInfo from './RelevanceScoreInfo';
import ClaimAnalysisButton from './ClaimAnalysisButton';

interface ClaimCardProps {
  claim: Claim;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getPlatformColor = (platform: string) => {
    return platform.toLowerCase() === 'twitter' ? 'bg-twitter/20 text-twitter' : 'bg-telegram/20 text-telegram';
  };

  const getCategoryBadge = (category?: SourceCategory) => {
    if (!category) return null;
    
    const categoryColors: Record<SourceCategory, string> = {
      'government': 'bg-purple-800/20 text-purple-400',
      'major_media': 'bg-yellow-800/20 text-yellow-400',
      'independent_journalist': 'bg-blue-800/20 text-blue-400',
      'local_source': 'bg-green-800/20 text-green-400',
      'military_affiliated': 'bg-red-800/20 text-red-400'
    };
    
    const categoryLabels: Record<SourceCategory, string> = {
      'government': 'Government',
      'major_media': 'Major Media',
      'independent_journalist': 'Independent',
      'local_source': 'Local Source',
      'military_affiliated': 'Military'
    };
    
    return (
      <Badge variant="outline" className={cn("text-xs", categoryColors[category])}>
        {categoryLabels[category]}
      </Badge>
    );
  };

  const getClusterIcon = (type?: ClusterType) => {
    if (!type) return null;
    
    switch (type) {
      case 'figure': return <User className="h-3 w-3" />;
      case 'place': return <MapPin className="h-3 w-3" />;
      default: return null;
    }
  };

  const getClusterColor = (type?: ClusterType) => {
    if (!type) return '';
    
    switch (type) {
      case 'figure': return 'bg-indigo-100 text-indigo-800';
      case 'place': return 'bg-emerald-100 text-emerald-800';
      default: return '';
    }
  };

  const formatFollowers = (followers?: number) => {
    if (!followers) return null;
    if (followers > 1000000) return `${(followers / 1000000).toFixed(1)}M followers`;
    if (followers > 1000) return `${(followers / 1000).toFixed(1)}K followers`;
    return `${followers} followers`;
  };

  const getLanguageLabel = (code?: string) => {
    if (!code) return "Unknown";
    switch(code.toLowerCase()) {
      case 'uk': return 'Ukrainian';
      case 'ru': return 'Russian';
      case 'en': return 'English';
      default: return code;
    }
  };

  return (
    <Card className="overflow-hidden border-secondary/50 transition-all duration-200 hover:border-accent/50">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between bg-secondary/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {claim.username}
            {claim.verified && <span className="ml-1 text-blue-400">✓</span>}
          </span>
          <Badge variant="outline" className={cn("text-xs", getPlatformColor(claim.platform))}>
            {claim.platform}
          </Badge>
          {claim.category && getCategoryBadge(claim.category)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTimeAgo(claim.timestamp)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        {claim.cluster && (
          <Badge 
            variant="outline" 
            className={cn(
              "mb-2 flex items-center gap-1 text-xs", 
              getClusterColor(claim.cluster.type)
            )}
          >
            {getClusterIcon(claim.cluster.type)}
            <span>{claim.cluster.name}</span>
          </Badge>
        )}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{claim.text}</p>
        <div className="border-l-2 border-primary/50 pl-3">
          <p className="text-sm font-medium">{claim.summary}</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <div className="flex flex-1 flex-wrap gap-2">
          {claim.followers && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatFollowers(claim.followers)}</span>
            </div>
          )}
          {claim.region && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{claim.region}</span>
            </div>
          )}
          {claim.language && (
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="flex items-center">
                <span title="Content language">{getLanguageLabel(claim.language)}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="flex items-center gap-1">
              Relevance: {(claim.relevanceScore * 100).toFixed(0)}%
              <RelevanceScoreInfo />
            </span>
          </div>
          <ClaimAnalysisButton claim={claim} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClaimCard;
