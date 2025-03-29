
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, MessageSquare, Lightbulb, Sparkles, 
  CloudLightning, Brain, User, Building2, MapPin
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';

const NLPConfig = () => {
  const [modelSettings, setModelSettings] = useState({
    sentimentModel: 'transformers',
    summaryModel: 'extractive',
    entityModel: 'spacy',
    clusteringAlgorithm: 'kmeans'
  });

  const [modelParameters, setModelParameters] = useState({
    sentimentThreshold: 70,
    summaryLength: 150,
    entityConfidence: 60,
    clusteringThreshold: 40
  });
  
  const [features, setFeatures] = useState({
    enableSentiment: true,
    enableSummary: true,
    enableNER: true,
    enableTopicModeling: true,
    enableClusterAnalysis: true
  });
  
  const updateParameter = (param: string, value: number[]) => {
    setModelParameters(prev => ({
      ...prev,
      [param]: value[0]
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>NLP Models & Processing</CardTitle>
          <CardDescription>
            Configure natural language processing models and techniques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <Label className="font-medium">Model Selection</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <Label htmlFor="enable-sentiment" className="font-medium">Sentiment Analysis</Label>
                  </div>
                  <Switch 
                    id="enable-sentiment" 
                    checked={features.enableSentiment} 
                    onCheckedChange={(checked) => setFeatures(prev => ({...prev, enableSentiment: checked}))}
                  />
                </div>
                
                {features.enableSentiment && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="sentiment-model">Model Type</Label>
                      <Select 
                        value={modelSettings.sentimentModel} 
                        onValueChange={(value) => setModelSettings(prev => ({...prev, sentimentModel: value}))}>
                        <SelectTrigger id="sentiment-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lexicon">Lexicon-based</SelectItem>
                          <SelectItem value="transformers">Transformer-based (BERT)</SelectItem>
                          <SelectItem value="gpt">GPT-based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Confidence Threshold: {modelParameters.sentimentThreshold}%</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs text-muted-foreground underline cursor-help">What's this?</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Higher threshold means sentiment will only be assigned if the model is very confident. Lower values may catch more sentiments but be less accurate.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Slider 
                        value={[modelParameters.sentimentThreshold]} 
                        min={50} 
                        max={95} 
                        step={5}
                        onValueChange={(value) => updateParameter('sentimentThreshold', value)}
                      />
                    </div>
                    
                    {modelSettings.sentimentModel === 'transformers' && (
                      <div className="p-2 bg-blue-500/10 rounded-md">
                        <p className="text-xs text-blue-500">Using BERT requires additional processing time but provides better accuracy for Ukrainian and Russian text.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Summarization */}
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <Label htmlFor="enable-summary" className="font-medium">Text Summarization</Label>
                  </div>
                  <Switch 
                    id="enable-summary" 
                    checked={features.enableSummary} 
                    onCheckedChange={(checked) => setFeatures(prev => ({...prev, enableSummary: checked}))}
                  />
                </div>
                
                {features.enableSummary && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="summary-model">Summarization Technique</Label>
                      <Select 
                        value={modelSettings.summaryModel} 
                        onValueChange={(value) => setModelSettings(prev => ({...prev, summaryModel: value}))}>
                        <SelectTrigger id="summary-model">
                          <SelectValue placeholder="Select technique" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="extractive">Extractive (sentence selection)</SelectItem>
                          <SelectItem value="abstractive">Abstractive (generate new sentences)</SelectItem>
                          <SelectItem value="hybrid">Hybrid approach</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Summary Length: {modelParameters.summaryLength} chars</Label>
                      </div>
                      <Slider 
                        value={[modelParameters.summaryLength]} 
                        min={80} 
                        max={300} 
                        step={10}
                        onValueChange={(value) => updateParameter('summaryLength', value)}
                      />
                    </div>
                    
                    {modelSettings.summaryModel === 'abstractive' && (
                      <div className="p-2 bg-yellow-500/10 rounded-md">
                        <p className="text-xs text-yellow-500">Abstractive summarization uses more resources but creates more natural, human-like summaries.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Named Entity Recognition */}
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    <Label htmlFor="enable-ner" className="font-medium">Named Entity Recognition</Label>
                  </div>
                  <Switch 
                    id="enable-ner" 
                    checked={features.enableNER} 
                    onCheckedChange={(checked) => setFeatures(prev => ({...prev, enableNER: checked}))}
                  />
                </div>
                
                {features.enableNER && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="ner-model">NER Framework</Label>
                      <Select 
                        value={modelSettings.entityModel} 
                        onValueChange={(value) => setModelSettings(prev => ({...prev, entityModel: value}))}>
                        <SelectTrigger id="ner-model">
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spacy">spaCy</SelectItem>
                          <SelectItem value="flair">Flair</SelectItem>
                          <SelectItem value="transformers">BERT-NER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Entity Confidence: {modelParameters.entityConfidence}%</Label>
                      </div>
                      <Slider 
                        value={[modelParameters.entityConfidence]} 
                        min={30} 
                        max={95} 
                        step={5}
                        onValueChange={(value) => updateParameter('entityConfidence', value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Entity Types to Extract</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {type: "PER", label: "People", icon: <User className="h-3 w-3" />, active: true},
                          {type: "ORG", label: "Organizations", icon: <Building2 className="h-3 w-3" />, active: true},
                          {type: "LOC", label: "Locations", icon: <MapPin className="h-3 w-3" />, active: true},
                          {type: "DATE", label: "Dates", active: false},
                          {type: "EVENT", label: "Events", active: false}
                        ].map(entity => (
                          <Badge 
                            key={entity.type} 
                            variant={entity.active ? "default" : "outline"}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            {entity.icon}
                            {entity.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Topic Modeling/Cluster Analysis */}
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="h-4 w-4 text-purple-500" />
                    <Label htmlFor="enable-topic" className="font-medium">Cluster & Topic Analysis</Label>
                  </div>
                  <Switch 
                    id="enable-topic" 
                    checked={features.enableClusterAnalysis} 
                    onCheckedChange={(checked) => setFeatures(prev => ({...prev, enableClusterAnalysis: checked}))}
                  />
                </div>
                
                {features.enableClusterAnalysis && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="clustering-algorithm">Clustering Algorithm</Label>
                      <Select 
                        value={modelSettings.clusteringAlgorithm} 
                        onValueChange={(value) => setModelSettings(prev => ({...prev, clusteringAlgorithm: value}))}>
                        <SelectTrigger id="clustering-algorithm">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kmeans">K-Means</SelectItem>
                          <SelectItem value="dbscan">DBSCAN</SelectItem>
                          <SelectItem value="hierarchical">Hierarchical</SelectItem>
                          <SelectItem value="lda">LDA Topic Modeling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Clustering Threshold: {modelParameters.clusteringThreshold}%</Label>
                      </div>
                      <Slider 
                        value={[modelParameters.clusteringThreshold]} 
                        min={20} 
                        max={80} 
                        step={5}
                        onValueChange={(value) => updateParameter('clusteringThreshold', value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Model Performance Indicators */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Model Performance Estimations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sentiment Analysis Accuracy</span>
                  <span className="text-sm font-medium">
                    {modelSettings.sentimentModel === 'lexicon' ? '78%' : 
                     modelSettings.sentimentModel === 'transformers' ? '92%' : '95%'}
                  </span>
                </div>
                <Progress value={
                  modelSettings.sentimentModel === 'lexicon' ? 78 : 
                  modelSettings.sentimentModel === 'transformers' ? 92 : 95
                } className="h-2" />
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm">Text Summarization Quality</span>
                  <span className="text-sm font-medium">
                    {modelSettings.summaryModel === 'extractive' ? '75%' : 
                     modelSettings.summaryModel === 'abstractive' ? '88%' : '85%'}
                  </span>
                </div>
                <Progress value={
                  modelSettings.summaryModel === 'extractive' ? 75 : 
                  modelSettings.summaryModel === 'abstractive' ? 88 : 85
                } className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Entity Recognition Precision</span>
                  <span className="text-sm font-medium">
                    {modelSettings.entityModel === 'spacy' ? '82%' : 
                     modelSettings.entityModel === 'flair' ? '87%' : '91%'}
                  </span>
                </div>
                <Progress value={
                  modelSettings.entityModel === 'spacy' ? 82 : 
                  modelSettings.entityModel === 'flair' ? 87 : 91
                } className="h-2" />
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm">Clustering Quality</span>
                  <span className="text-sm font-medium">
                    {modelSettings.clusteringAlgorithm === 'kmeans' ? '70%' : 
                     modelSettings.clusteringAlgorithm === 'dbscan' ? '78%' : 
                     modelSettings.clusteringAlgorithm === 'hierarchical' ? '75%' : '82%'}
                  </span>
                </div>
                <Progress value={
                  modelSettings.clusteringAlgorithm === 'kmeans' ? 70 : 
                  modelSettings.clusteringAlgorithm === 'dbscan' ? 78 : 
                  modelSettings.clusteringAlgorithm === 'hierarchical' ? 75 : 82
                } className="h-2" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-md mt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-blue-500 font-medium">AI Model Recommendation</p>
            </div>
            <p className="text-xs mt-1 text-blue-500">
              {modelSettings.sentimentModel === 'transformers' && 
               modelSettings.summaryModel === 'abstractive' ? (
                "Your current configuration is optimal for Ukrainian language analysis with high accuracy but requires significant computing resources."
               ) : (
                "Consider upgrading to Transformer-based models for sentiment analysis and abstractive summarization to improve Ukrainian language understanding."
               )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NLPConfig;
