
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, AlertCircle, Info, Filter, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Alert = {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  category?: string;
  region?: string;
  source?: string;
  dismissed?: boolean;
};

interface AlertSystemProps {
  alerts: Alert[];
}

const AlertSystem: React.FC<AlertSystemProps> = ({ alerts: initialAlerts = [] }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [showDismissed, setShowDismissed] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'severity'>('newest');
  const [dismissedAlerts, setDismissedAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  // Generate some example alerts if none are provided
  useEffect(() => {
    if (initialAlerts.length === 0) {
      const exampleAlerts = [
        {
          id: '1',
          message: 'Spike in negative sentiment detected around Kharkiv region',
          severity: 'high' as const,
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          category: 'Sentiment Analysis',
          region: 'Kharkiv',
          source: 'Twitter'
        },
        {
          id: '2',
          message: 'New propaganda narrative detected: "Peacekeeping operation"',
          severity: 'medium' as const,
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          category: 'Narrative Analysis',
          region: 'Multiple',
          source: 'Telegram'
        },
        {
          id: '3',
          message: 'Increased social media activity around Kyiv',
          severity: 'low' as const,
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          category: 'Volume Analysis',
          region: 'Kyiv',
          source: 'Multiple'
        },
        {
          id: '4',
          message: 'Anomalous clustering of claims about military equipment',
          severity: 'medium' as const,
          timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
          category: 'Cluster Analysis',
          region: 'Donbas',
          source: 'Telegram'
        },
        {
          id: '5',
          message: 'Potential disinformation campaign about evacuation routes',
          severity: 'high' as const,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          category: 'Disinformation Alert',
          region: 'Zaporizhzhia',
          source: 'Multiple'
        }
      ];
      
      setAlerts(exampleAlerts);
      
      // Show a toast when alerts are loaded
      toast({
        title: "Alert System Active",
        description: `${exampleAlerts.length} alerts detected in the monitoring system`,
      });
    } else {
      setAlerts(initialAlerts.filter(alert => !alert.dismissed));
      setDismissedAlerts(initialAlerts.filter(alert => alert.dismissed));
    }
  }, [initialAlerts, toast]);

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityClass = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default:
        return '';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const dismissAlert = (id: string) => {
    const alertToDismiss = alerts.find(alert => alert.id === id);
    if (alertToDismiss) {
      setAlerts(alerts.filter(alert => alert.id !== id));
      setDismissedAlerts([...dismissedAlerts, {...alertToDismiss, dismissed: true}]);
      toast({
        title: "Alert Dismissed",
        description: "The alert has been acknowledged and removed",
      });
    }
  };
  
  const restoreAlert = (id: string) => {
    const alertToRestore = dismissedAlerts.find(alert => alert.id === id);
    if (alertToRestore) {
      setDismissedAlerts(dismissedAlerts.filter(alert => alert.id !== id));
      setAlerts([...alerts, {...alertToRestore, dismissed: false}]);
      toast({
        title: "Alert Restored",
        description: "The alert has been restored to your active alerts",
      });
    }
  };

  const clearAllAlerts = () => {
    setDismissedAlerts([...dismissedAlerts, ...alerts.map(alert => ({...alert, dismissed: true}))]);
    setAlerts([]);
    toast({
      title: "All Alerts Dismissed",
      description: "All alerts have been acknowledged and removed",
    });
  };
  
  const handleSortChange = (value: string) => {
    setSortOrder(value as 'newest' | 'oldest' | 'severity');
  };

  // Filter and sort the alerts
  const filteredAlerts = (showDismissed ? dismissedAlerts : alerts)
    .filter(alert => !filterSeverity || alert.severity === filterSeverity)
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else {
        // Sort by severity: high > medium > low
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
    });
  
  const alertsByCategory = (showDismissed ? dismissedAlerts : alerts).reduce((acc, alert) => {
    const category = alert.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const alertsByRegion = (showDismissed ? dismissedAlerts : alerts).reduce((acc, alert) => {
    const region = alert.region || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const alertsBySeverity = (showDismissed ? dismissedAlerts : alerts).reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Alert System</span>
            {alerts.length > 0 && (
              <Badge className={cn(
                "ml-2",
                alerts.some(a => a.severity === 'high') ? "bg-red-500" :
                alerts.some(a => a.severity === 'medium') ? "bg-amber-500" : "bg-blue-500"
              )}>{alerts.length}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter alerts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Alerts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !filterSeverity && "text-primary font-medium")}
                    onClick={() => setFilterSeverity(null)}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    All Severities
                    {!filterSeverity && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", filterSeverity === 'high' && "text-red-500 font-medium")}
                    onClick={() => setFilterSeverity('high')}
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    High Severity
                    {filterSeverity === 'high' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", filterSeverity === 'medium' && "text-amber-500 font-medium")}
                    onClick={() => setFilterSeverity('medium')}
                  >
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    Medium Severity
                    {filterSeverity === 'medium' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", filterSeverity === 'low' && "text-blue-500 font-medium")}
                    onClick={() => setFilterSeverity('low')}
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Low Severity
                    {filterSeverity === 'low' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowDismissed(!showDismissed)}
                >
                  <Clock className="h-4 w-4" />
                  {showDismissed ? 'Show Active Alerts' : 'Show Dismissed Alerts'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="severity">By Severity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {showDismissed && (
          <div className="flex items-center mt-2 px-1">
            <Badge variant="outline" className="text-xs bg-secondary/50">
              Showing dismissed alerts ({dismissedAlerts.length})
            </Badge>
            <Button 
              variant="link" 
              className="ml-auto text-xs h-auto p-0" 
              onClick={() => setShowDismissed(false)}
            >
              Return to active alerts
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {filteredAlerts.length > 0 ? (
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "p-3 border-l-4 rounded-md transition-all hover:bg-opacity-80",
                  getSeverityClass(alert.severity),
                  alert.dismissed && "opacity-70"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <span className="font-medium text-sm">{alert.message}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                    <button 
                      onClick={() => showDismissed ? restoreAlert(alert.id) : dismissAlert(alert.id)} 
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showDismissed ? 'Restore' : 'Dismiss'}
                    </button>
                  </div>
                </div>
                
                {(alert.category || alert.region || alert.source) && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pl-6">
                    {alert.category && (
                      <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {alert.category}
                      </Badge>
                    )}
                    {alert.region && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">
                        {alert.region}
                      </Badge>
                    )}
                    {alert.source && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {alert.source}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>{showDismissed ? 'No dismissed alerts' : 'No active alerts at this time'}</p>
            <p className="text-xs mt-1">System is monitoring for suspicious activity</p>
          </div>
        )}
      </CardContent>
      
      {!showDismissed && alerts.length > 0 && (
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex flex-wrap gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1" />
                    <span className="text-xs">{alertsBySeverity['high'] || 0}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>High severity alerts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center ml-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-1" />
                    <span className="text-xs">{alertsBySeverity['medium'] || 0}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Medium severity alerts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center ml-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-1" />
                    <span className="text-xs">{alertsBySeverity['low'] || 0}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Low severity alerts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7"
            onClick={clearAllAlerts}
          >
            Dismiss All
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AlertSystem;
