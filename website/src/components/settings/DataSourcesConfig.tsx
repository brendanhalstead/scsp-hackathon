
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Twitter, Send, MessageCircle, Facebook, Globe, 
  Database, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TwitterDataMethod } from '@/services/twitterAPI';

const DataSourcesConfig = () => {
  const [enabledSources, setEnabledSources] = useState({
    twitter: true,
    telegram: true,
    reddit: false,
    facebook: false,
    web: false
  });
  
  const [dataLimits, setDataLimits] = useState({
    twitter: 100,
    telegram: 100,
    reddit: 50,
    facebook: 50,
    web: 30
  });
  
  const [cleaningOptions, setCleaningOptions] = useState({
    removeBots: true,
    removeAds: true,
    filterLanguages: true,
    enableTranslation: false
  });
  
  const [languageOptions, setLanguageOptions] = useState(["uk", "ru", "en"]);
  
  const toggleSource = (source: string) => {
    setEnabledSources(prev => ({
      ...prev,
      [source]: !prev[source as keyof typeof prev]
    }));
  };
  
  const updateDataLimit = (source: string, value: number[]) => {
    setDataLimits(prev => ({
      ...prev,
      [source]: value[0]
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>
            Configure which platforms to collect data from and their respective limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Twitter Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-sky-500" />
                <Label htmlFor="twitter-toggle" className="font-medium">Twitter / X</Label>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 ml-2">Active</Badge>
              </div>
              <Switch 
                id="twitter-toggle" 
                checked={enabledSources.twitter} 
                onCheckedChange={() => toggleSource('twitter')} 
              />
            </div>
            
            {enabledSources.twitter && (
              <div className="pl-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter-method">Collection Method</Label>
                    <Select defaultValue={TwitterDataMethod.SCRAPE}>
                      <SelectTrigger id="twitter-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TwitterDataMethod.API}>Official API (Paid)</SelectItem>
                        <SelectItem value={TwitterDataMethod.SCRAPE}>Web Scraping</SelectItem>
                        <SelectItem value={TwitterDataMethod.PROXY}>Server Proxy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-api-key">API Key {TwitterDataMethod.API && "(Required)"}</Label>
                    <Input id="twitter-api-key" type="password" placeholder="Enter API key" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Posts to Collect: {dataLimits.twitter}</Label>
                    <span className="text-xs text-muted-foreground">(1-500)</span>
                  </div>
                  <Slider 
                    defaultValue={[dataLimits.twitter]} 
                    min={1} 
                    max={500} 
                    step={10}
                    onValueChange={(value) => updateDataLimit('twitter', value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="twitter-realtime" />
                  <Label htmlFor="twitter-realtime">Enable real-time streaming (uses more API credits)</Label>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Telegram Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                <Label htmlFor="telegram-toggle" className="font-medium">Telegram</Label>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 ml-2">Active</Badge>
              </div>
              <Switch 
                id="telegram-toggle" 
                checked={enabledSources.telegram} 
                onCheckedChange={() => toggleSource('telegram')} 
              />
            </div>
            
            {enabledSources.telegram && (
              <div className="pl-7 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-api-key">API Key (Required)</Label>
                  <Input id="telegram-api-key" type="password" placeholder="Enter API key" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Posts to Collect: {dataLimits.telegram}</Label>
                    <span className="text-xs text-muted-foreground">(1-500)</span>
                  </div>
                  <Slider 
                    defaultValue={[dataLimits.telegram]} 
                    min={1} 
                    max={500} 
                    step={10}
                    onValueChange={(value) => updateDataLimit('telegram', value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telegram-channels" className="mb-2 block">Monitor Channels (comma separated)</Label>
                  <Input 
                    id="telegram-channels" 
                    placeholder="channel1, channel2, channel3" 
                    defaultValue="truexanewsua, ukrainenowenglish, verkhovnaradaofukraine"
                  />
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Reddit Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                <Label htmlFor="reddit-toggle" className="font-medium">Reddit</Label>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 ml-2">Coming Soon</Badge>
              </div>
              <Switch 
                id="reddit-toggle" 
                checked={enabledSources.reddit} 
                onCheckedChange={() => toggleSource('reddit')} 
              />
            </div>
            
            {enabledSources.reddit && (
              <div className="pl-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reddit-client-id">Client ID</Label>
                    <Input id="reddit-client-id" type="password" placeholder="Enter Client ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reddit-client-secret">Client Secret</Label>
                    <Input id="reddit-client-secret" type="password" placeholder="Enter Client Secret" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Posts to Collect: {dataLimits.reddit}</Label>
                    <span className="text-xs text-muted-foreground">(1-200)</span>
                  </div>
                  <Slider 
                    defaultValue={[dataLimits.reddit]} 
                    min={1} 
                    max={200} 
                    step={10}
                    onValueChange={(value) => updateDataLimit('reddit', value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reddit-subreddits" className="mb-2 block">Monitor Subreddits</Label>
                  <Input 
                    id="reddit-subreddits" 
                    placeholder="ukraine, UkrainianConflict, RussiaUkraineWar2022" 
                    defaultValue="ukraine, UkrainianConflict"
                  />
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Facebook Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-700" />
                <Label htmlFor="facebook-toggle" className="font-medium">Facebook</Label>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 ml-2">Coming Soon</Badge>
              </div>
              <Switch 
                id="facebook-toggle" 
                checked={enabledSources.facebook} 
                onCheckedChange={() => toggleSource('facebook')} 
              />
            </div>
            
            {enabledSources.facebook && (
              <div className="pl-7 opacity-70 pointer-events-none">
                <div className="p-3 bg-yellow-500/10 rounded-md flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm">Facebook API integration requires approval and is currently in development.</p>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Web Scraping Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <Label htmlFor="web-toggle" className="font-medium">Web Scraping</Label>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 ml-2">Coming Soon</Badge>
              </div>
              <Switch 
                id="web-toggle" 
                checked={enabledSources.web} 
                onCheckedChange={() => toggleSource('web')} 
              />
            </div>
            
            {enabledSources.web && (
              <div className="pl-7 space-y-4">
                <div>
                  <Label htmlFor="web-urls" className="mb-2 block">Target URLs (one per line)</Label>
                  <textarea 
                    id="web-urls" 
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                    placeholder="https://example.com/news"
                    defaultValue="https://www.pravda.com.ua/\nhttps://www.ukrinform.ua/"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Pages to Scrape: {dataLimits.web}</Label>
                    <span className="text-xs text-muted-foreground">(1-100)</span>
                  </div>
                  <Slider 
                    defaultValue={[dataLimits.web]} 
                    min={1} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => updateDataLimit('web', value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="web-respect-robots" defaultChecked />
                  <Label htmlFor="web-respect-robots">Respect robots.txt</Label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Cleaning & Preprocessing</CardTitle>
          <CardDescription>
            Configure how data is cleaned and preprocessed before analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <Label htmlFor="remove-bots">Bot Detection & Filtering</Label>
                </div>
                <Switch 
                  id="remove-bots" 
                  checked={cleaningOptions.removeBots} 
                  onCheckedChange={(checked) => setCleaningOptions(prev => ({...prev, removeBots: checked}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <Label htmlFor="remove-ads">Remove Ads & Spam</Label>
                </div>
                <Switch 
                  id="remove-ads" 
                  checked={cleaningOptions.removeAds} 
                  onCheckedChange={(checked) => setCleaningOptions(prev => ({...prev, removeAds: checked}))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <Label htmlFor="filter-languages">Language Filtering</Label>
                </div>
                <Switch 
                  id="filter-languages" 
                  checked={cleaningOptions.filterLanguages} 
                  onCheckedChange={(checked) => setCleaningOptions(prev => ({...prev, filterLanguages: checked}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <Label htmlFor="enable-translation">Auto-Translation</Label>
                </div>
                <Switch 
                  id="enable-translation" 
                  checked={cleaningOptions.enableTranslation} 
                  onCheckedChange={(checked) => setCleaningOptions(prev => ({...prev, enableTranslation: checked}))}
                />
              </div>
            </div>
          </div>
          
          {cleaningOptions.filterLanguages && (
            <div className="space-y-2">
              <Label>Languages to Include</Label>
              <div className="flex flex-wrap gap-2">
                {["uk", "ru", "en", "pl", "fr", "de"].map(lang => {
                  const isActive = languageOptions.includes(lang);
                  return (
                    <Badge 
                      key={lang} 
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (isActive) {
                          setLanguageOptions(prev => prev.filter(l => l !== lang));
                        } else {
                          setLanguageOptions(prev => [...prev, lang]);
                        }
                      }}
                    >
                      {lang.toUpperCase()}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {cleaningOptions.enableTranslation && (
            <div className="space-y-2">
              <Label htmlFor="target-language">Translate To</Label>
              <Select defaultValue="en">
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Ukrainian</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourcesConfig;
