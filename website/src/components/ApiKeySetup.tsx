
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Info, AlertCircle, Database, Globe } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TwitterDataMethod } from '../services/twitterAPI';
import { getDataCollectionSettings, updateDataCollectionSettings } from '../services/dataCollection';

interface ApiKeySetupProps {
  onKeysSubmit: (keys: { twitter: string; telegram: string }) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeysSubmit }) => {
  const [twitterKey, setTwitterKey] = useState('');
  const [telegramKey, setTelegramKey] = useState('');
  const [showError, setShowError] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [twitterMethod, setTwitterMethod] = useState<TwitterDataMethod>(TwitterDataMethod.SCRAPE);
  const { toast } = useToast();

  // Initialize settings from stored values
  useEffect(() => {
    const settings = getDataCollectionSettings();
    setUseMockData(settings.useMockData);
    setTwitterMethod(settings.twitterMethod);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using mock data, we don't need valid API keys
    if (useMockData) {
      // Store mock data preference
      localStorage.setItem('USE_MOCK_DATA', 'true');
      updateDataCollectionSettings(true, twitterMethod);
      
      toast({
        title: "Mock Data Enabled",
        description: "The application will use sample data instead of real API calls.",
      });
      
      onKeysSubmit({
        twitter: 'mock',
        telegram: 'mock'
      });
      
      return;
    }
    
    // Store the Twitter method preference
    localStorage.setItem('TWITTER_METHOD', twitterMethod);
    updateDataCollectionSettings(false, twitterMethod);
    
    // If using the official API, we need valid API keys
    if (twitterMethod === TwitterDataMethod.API && (!twitterKey || !telegramKey)) {
      setShowError(true);
      return;
    }
    
    // If using scraping methods, we don't need the Twitter API key
    if (twitterMethod !== TwitterDataMethod.API && !telegramKey) {
      setShowError(true);
      return;
    }
    
    // Store keys in localStorage with Vite environment variable naming convention
    if (twitterMethod === TwitterDataMethod.API) {
      localStorage.setItem('VITE_TWITTER_BEARER_TOKEN', twitterKey);
    }
    localStorage.setItem('VITE_TELEGRAM_API_KEY', telegramKey);
    localStorage.setItem('USE_MOCK_DATA', 'false');
    
    // For the current session, we can also set them in window.ENV
    if (typeof window !== 'undefined') {
      window.ENV = window.ENV || {};
      if (twitterMethod === TwitterDataMethod.API) {
        window.ENV.VITE_TWITTER_BEARER_TOKEN = twitterKey;
      }
      window.ENV.VITE_TELEGRAM_API_KEY = telegramKey;
    }
    
    toast({
      title: "Data Collection Configured",
      description: twitterMethod === TwitterDataMethod.API 
        ? "Using official Twitter API with your keys."
        : "Using alternative Twitter data collection method to save costs.",
    });
    
    onKeysSubmit({
      twitter: twitterMethod === TwitterDataMethod.API ? twitterKey : 'scraper',
      telegram: telegramKey
    });
  };

  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Data Collection Configuration
        </CardTitle>
        <CardDescription>
          Choose between real data collection, cost-efficient scraping, or mock data
        </CardDescription>
      </CardHeader>
      
      <Alert className="mx-4 bg-blue-950/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription className="text-xs">
          Twitter API access can be expensive. You can use web scraping or mock data instead.
        </AlertDescription>
      </Alert>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 mt-4">
          <div className="flex items-center space-x-2 p-2 bg-secondary/40 rounded-md">
            <Switch
              id="mock-data"
              checked={useMockData}
              onCheckedChange={setUseMockData}
            />
            <Label htmlFor="mock-data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Use mock data instead of real data collection
            </Label>
          </div>
          
          {!useMockData && (
            <>
              <div className="space-y-2">
                <Label htmlFor="twitter-method">Twitter Data Collection Method</Label>
                <Select
                  value={twitterMethod}
                  onValueChange={(value) => setTwitterMethod(value as TwitterDataMethod)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TwitterDataMethod.SCRAPE}>
                      Web Scraping (Cost-free)
                    </SelectItem>
                    <SelectItem value={TwitterDataMethod.PROXY}>
                      Server Proxy (Requires backend)
                    </SelectItem>
                    <SelectItem value={TwitterDataMethod.API}>
                      Official API (Costs $$$)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {twitterMethod === TwitterDataMethod.SCRAPE && 
                    "Web scraping directly from Twitter/X. May have limitations but costs nothing."}
                  {twitterMethod === TwitterDataMethod.PROXY && 
                    "Uses your server as a proxy to scrape Twitter. Requires setting up a backend service."}
                  {twitterMethod === TwitterDataMethod.API && 
                    "Uses official Twitter API. Reliable but costs start at $100/month."}
                </p>
              </div>
              
              {twitterMethod === TwitterDataMethod.API && (
                <div className="space-y-2">
                  <Label htmlFor="twitter-key">Twitter API Bearer Token</Label>
                  <Input
                    id="twitter-key"
                    type="password"
                    placeholder="Enter your Twitter Bearer Token"
                    value={twitterKey}
                    onChange={(e) => {
                      setTwitterKey(e.target.value);
                      setShowError(false);
                    }}
                  />
                </div>
              )}
              
              {twitterMethod === TwitterDataMethod.PROXY && (
                <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <p className="text-xs">
                      Configure your proxy server URL in your environment variables as VITE_TWITTER_SCRAPER_PROXY
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="telegram-key">Telegram API Key</Label>
                <Input
                  id="telegram-key"
                  type="password"
                  placeholder="Enter your Telegram API Key"
                  value={telegramKey}
                  onChange={(e) => {
                    setTelegramKey(e.target.value);
                    setShowError(false);
                  }}
                />
              </div>
              
              {showError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {twitterMethod === TwitterDataMethod.API 
                      ? "Both API keys are required when using the official Twitter API."
                      : "Telegram API key is required for real data collection."}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full">
            {useMockData ? "Use Mock Data" : "Save Configuration & Start Collection"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// Add this declaration for TypeScript to recognize window.ENV
declare global {
  interface Window {
    ENV?: {
      VITE_TWITTER_BEARER_TOKEN?: string;
      VITE_TELEGRAM_API_KEY?: string;
    };
  }
}

export default ApiKeySetup;
