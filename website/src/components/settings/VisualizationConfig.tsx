
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, PieChart, LineChart, Map, 
  LayoutDashboard, Palette, Eye, Monitor, 
  BarChart3, ListFilter, SquareStack
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const VisualizationConfig = () => {
  const [chartSettings, setChartSettings] = useState({
    colorScheme: 'default',
    animateCharts: true,
    interactiveCharts: true,
    darkMode: false,
    regionalMap: 'ukraine',
    maxDataPoints: 50
  });
  
  const [visibleElements, setVisibleElements] = useState({
    showAlerts: true,
    showKeyTerms: true,
    showRegions: true,
    showTimeline: true,
    showCluster: true,
    showSourceStats: true,
    showSentimentBreakdown: true
  });
  
  const [dashboardLayout, setDashboardLayout] = useState('balanced');
  const [chartType, setChartType] = useState({
    sentiment: 'donut',
    regions: 'bar',
    sources: 'pie',
    timeline: 'line'
  });
  
  const toggleElement = (element: string) => {
    setVisibleElements(prev => ({
      ...prev,
      [element]: !prev[element as keyof typeof prev]
    }));
  };
  
  const colorSchemes = [
    { id: 'default', name: 'Default Blue', colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'] },
    { id: 'contrast', name: 'High Contrast', colors: ['#0891b2', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'] },
    { id: 'ukraine', name: 'Ukrainian Flag', colors: ['#0057b7', '#3481d2', '#88c0fc', '#ffd700', '#ffecaa'] },
    { id: 'military', name: 'Military', colors: ['#4b5320', '#708238', '#a9b38c', '#4a5c6a', '#313d44'] },
    { id: 'neutral', name: 'Neutral Tones', colors: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9'] }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visualization Settings</CardTitle>
          <CardDescription>
            Configure the dashboard layout and visualization preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layout Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Dashboard Layout</h3>
            </div>
            
            <Tabs defaultValue="layout" className="w-full">
              <TabsList className="grid grid-cols-2 w-[400px]">
                <TabsTrigger value="layout">Layout & Elements</TabsTrigger>
                <TabsTrigger value="charts">Chart Types</TabsTrigger>
              </TabsList>
              
              <TabsContent value="layout" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-layout">Dashboard Layout Preset</Label>
                  <Select 
                    value={dashboardLayout}
                    onValueChange={setDashboardLayout}>
                    <SelectTrigger id="dashboard-layout">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (Default)</SelectItem>
                      <SelectItem value="data-focused">Data-Focused</SelectItem>
                      <SelectItem value="alert-focused">Alert-Focused</SelectItem>
                      <SelectItem value="compact">Compact View</SelectItem>
                      <SelectItem value="expanded">Expanded View</SelectItem>
                      <SelectItem value="custom">Custom Layout</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {dashboardLayout === 'custom' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Custom layout allows you to toggle individual elements below
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-500/20 text-red-500">Alert</Badge>
                        <Label htmlFor="show-alerts">Alert System</Label>
                      </div>
                      <Switch 
                        id="show-alerts" 
                        checked={visibleElements.showAlerts} 
                        onCheckedChange={() => toggleElement('showAlerts')} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-500">Terms</Badge>
                        <Label htmlFor="show-terms">Key Terms</Label>
                      </div>
                      <Switch 
                        id="show-terms" 
                        checked={visibleElements.showKeyTerms} 
                        onCheckedChange={() => toggleElement('showKeyTerms')} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/20 text-green-500">Geo</Badge>
                        <Label htmlFor="show-regions">Regional Analysis</Label>
                      </div>
                      <Switch 
                        id="show-regions" 
                        checked={visibleElements.showRegions} 
                        onCheckedChange={() => toggleElement('showRegions')} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-500">Time</Badge>
                        <Label htmlFor="show-timeline">Temporal Analysis</Label>
                      </div>
                      <Switch 
                        id="show-timeline" 
                        checked={visibleElements.showTimeline} 
                        onCheckedChange={() => toggleElement('showTimeline')} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-500">Cluster</Badge>
                        <Label htmlFor="show-cluster">Cluster Visualizer</Label>
                      </div>
                      <Switch 
                        id="show-cluster" 
                        checked={visibleElements.showCluster} 
                        onCheckedChange={() => toggleElement('showCluster')} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-sky-500/20 text-sky-500">Source</Badge>
                        <Label htmlFor="show-sources">Source Statistics</Label>
                      </div>
                      <Switch 
                        id="show-sources" 
                        checked={visibleElements.showSourceStats} 
                        onCheckedChange={() => toggleElement('showSourceStats')} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-pink-500/20 text-pink-500">Sentiment</Badge>
                        <Label htmlFor="show-sentiment">Sentiment Breakdown</Label>
                      </div>
                      <Switch 
                        id="show-sentiment" 
                        checked={visibleElements.showSentimentBreakdown} 
                        onCheckedChange={() => toggleElement('showSentimentBreakdown')} 
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-pink-500" />
                        <Label htmlFor="sentiment-chart">Sentiment Chart</Label>
                      </div>
                      <Select 
                        value={chartType.sentiment}
                        onValueChange={(value) => setChartType(prev => ({...prev, sentiment: value}))}>
                        <SelectTrigger id="sentiment-chart">
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="donut">Donut Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="horizontal">Horizontal Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-green-500" />
                        <Label htmlFor="regions-chart">Regions Chart</Label>
                      </div>
                      <Select 
                        value={chartType.regions}
                        onValueChange={(value) => setChartType(prev => ({...prev, regions: value}))}>
                        <SelectTrigger id="regions-chart">
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Vertical Bar</SelectItem>
                          <SelectItem value="horizontal">Horizontal Bar</SelectItem>
                          <SelectItem value="map">Map Visualization</SelectItem>
                          <SelectItem value="treemap">Treemap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-sky-500" />
                        <Label htmlFor="sources-chart">Sources Chart</Label>
                      </div>
                      <Select 
                        value={chartType.sources}
                        onValueChange={(value) => setChartType(prev => ({...prev, sources: value}))}>
                        <SelectTrigger id="sources-chart">
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="donut">Donut Chart</SelectItem>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="stacked">Stacked Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-purple-500" />
                        <Label htmlFor="timeline-chart">Timeline Chart</Label>
                      </div>
                      <Select 
                        value={chartType.timeline}
                        onValueChange={(value) => setChartType(prev => ({...prev, timeline: value}))}>
                        <SelectTrigger id="timeline-chart">
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="stacked">Stacked Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <Separator />
          
          {/* Style Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Visual Style</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Select 
                    value={chartSettings.colorScheme}
                    onValueChange={(value) => setChartSettings(prev => ({...prev, colorScheme: value}))}>
                    <SelectTrigger id="color-scheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorSchemes.map(scheme => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {scheme.colors.map((color, i) => (
                                <div key={i} style={{backgroundColor: color}} className="h-3 w-3"></div>
                              ))}
                            </div>
                            <span>{scheme.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regional-map">Regional Map Style</Label>
                  <Select 
                    value={chartSettings.regionalMap}
                    onValueChange={(value) => setChartSettings(prev => ({...prev, regionalMap: value}))}>
                    <SelectTrigger id="regional-map">
                      <SelectValue placeholder="Select map style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ukraine">Ukraine Political</SelectItem>
                      <SelectItem value="ukraine-detailed">Ukraine Detailed (Oblasts)</SelectItem>
                      <SelectItem value="eastern-europe">Eastern Europe</SelectItem>
                      <SelectItem value="heat">Heat Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Maximum Data Points: {chartSettings.maxDataPoints}</Label>
                  </div>
                  <Slider 
                    value={[chartSettings.maxDataPoints]} 
                    min={10} 
                    max={200} 
                    step={10}
                    onValueChange={(value) => setChartSettings(prev => ({...prev, maxDataPoints: value[0]}))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <Label htmlFor="animate-charts">Animated Charts</Label>
                  </div>
                  <Switch 
                    id="animate-charts" 
                    checked={chartSettings.animateCharts} 
                    onCheckedChange={(checked) => setChartSettings(prev => ({...prev, animateCharts: checked}))} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    <Label htmlFor="interactive-charts">Interactive Charts</Label>
                  </div>
                  <Switch 
                    id="interactive-charts" 
                    checked={chartSettings.interactiveCharts} 
                    onCheckedChange={(checked) => setChartSettings(prev => ({...prev, interactiveCharts: checked}))} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-primary" />
                    <Label htmlFor="dark-mode">Dark Mode Charts</Label>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={chartSettings.darkMode} 
                    onCheckedChange={(checked) => setChartSettings(prev => ({...prev, darkMode: checked}))} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Results Panel Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SquareStack className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Results Display</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <Label htmlFor="results-layout">Results Layout</Label>
                  </div>
                  <Select defaultValue="grid">
                    <SelectTrigger id="results-layout">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Layout (Default)</SelectItem>
                      <SelectItem value="list">List Layout</SelectItem>
                      <SelectItem value="compact">Compact Cards</SelectItem>
                      <SelectItem value="detailed">Detailed View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="results-per-page">Results Per Page</Label>
                  <Select defaultValue="10">
                    <SelectTrigger id="results-per-page">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Claims</SelectItem>
                      <SelectItem value="10">10 Claims</SelectItem>
                      <SelectItem value="20">20 Claims</SelectItem>
                      <SelectItem value="50">50 Claims</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">UI</Badge>
                    <Label htmlFor="highlight-keywords">Highlight Search Keywords</Label>
                  </div>
                  <Switch id="highlight-keywords" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4 text-primary" />
                    <Label htmlFor="default-sort">Default Sort Order</Label>
                  </div>
                  <Select defaultValue="relevance">
                    <SelectTrigger id="default-sort">
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance (Default)</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="sentiment-positive">Positive Sentiment</SelectItem>
                      <SelectItem value="sentiment-negative">Negative Sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auto-refresh">Auto-Refresh Rate (seconds)</Label>
                  <Input id="auto-refresh" type="number" min="0" max="3600" defaultValue="0" />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 to disable auto-refresh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add the missing import
import { Moon } from 'lucide-react';

export default VisualizationConfig;
