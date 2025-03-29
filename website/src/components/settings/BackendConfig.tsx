
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const backendConfigSchema = z.object({
  backendURL: z.string().url({ message: "Please enter a valid URL" }),
  apiKeyEnabled: z.boolean().default(false),
  apiKey: z.string().optional(),
});

type BackendConfigValues = z.infer<typeof backendConfigSchema>;

const BackendConfig = () => {
  // Define the form with react-hook-form
  const form = useForm<BackendConfigValues>({
    resolver: zodResolver(backendConfigSchema),
    defaultValues: {
      backendURL: 'http://localhost:8000',
      apiKeyEnabled: false,
      apiKey: '',
    },
  });
  
  const apiKeyEnabled = form.watch('apiKeyEnabled');

  const handleSubmit = (data: BackendConfigValues) => {
    // Handle form submission logic here, e.g., saving to a config file or sending to an API
    console.log('Submitting Backend Configuration:', data);
    alert('Backend configuration saved!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend Configuration</CardTitle>
        <CardDescription>
          Configure the backend URL and API key settings for accessing the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="backendURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backend URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="http://localhost:8000"
                    />
                  </FormControl>
                  <FormDescription>The URL of the backend server.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKeyEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable API Key</FormLabel>
                    <FormDescription>Enable or disable the use of an API key for authentication.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {apiKeyEnabled && (
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your API key"
                      />
                    </FormControl>
                    <FormDescription>The API key used to authenticate with the backend.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit">Save Backend Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BackendConfig;
