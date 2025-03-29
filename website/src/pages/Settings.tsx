
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import DataSourcesConfig from '@/components/settings/DataSourcesConfig';
import NLPConfig from '@/components/settings/NLPConfig';
import VisualizationConfig from '@/components/settings/VisualizationConfig';
import BackendConfig from '@/components/settings/BackendConfig';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("datasources");
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your configuration changes have been saved.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
          <p className="text-muted-foreground">
            Configure data sources, NLP processing, visualization options, and backend settings
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="datasources">Data Sources</TabsTrigger>
            <TabsTrigger value="nlp">NLP Processing</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="backend">Backend & Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="datasources" className="space-y-4">
            <DataSourcesConfig />
          </TabsContent>
          
          <TabsContent value="nlp" className="space-y-4">
            <NLPConfig />
          </TabsContent>
          
          <TabsContent value="visualization" className="space-y-4">
            <VisualizationConfig />
          </TabsContent>
          
          <TabsContent value="backend" className="space-y-4">
            <BackendConfig />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
