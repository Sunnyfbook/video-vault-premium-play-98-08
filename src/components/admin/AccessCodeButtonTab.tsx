
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getAccessCodeButtonConfig, updateAccessCodeButtonConfig, AccessCodeButtonConfig } from '@/models/AccessCodeButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AccessCodeButtonTab: React.FC = () => {
  const [config, setConfig] = useState<AccessCodeButtonConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    button_text: '',
    button_url: '',
    is_enabled: true,
  });
  const { toast } = useToast();

  // Load configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        console.log('Loading access code button configuration...');
        const buttonConfig = await getAccessCodeButtonConfig();
        
        if (buttonConfig) {
          console.log('Admin: Loaded config:', buttonConfig);
          setConfig(buttonConfig);
          setFormData({
            button_text: buttonConfig.button_text,
            button_url: buttonConfig.button_url,
            is_enabled: buttonConfig.is_enabled,
          });
        }
      } catch (error) {
        console.error('Error loading button configuration:', error);
        toast({
          title: "Error",
          description: "Failed to load button configuration.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();

    // Set up real-time listener for configuration changes
    const channel = supabase
      .channel('admin_access_code_button_config_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'access_code_button_config',
          filter: 'id=eq.main_config'
        },
        (payload) => {
          console.log('Admin: Button configuration changed via real-time:', payload);
          if (payload.new) {
            const buttonConfig = payload.new as AccessCodeButtonConfig;
            setConfig(buttonConfig);
            setFormData({
              button_text: buttonConfig.button_text,
              button_url: buttonConfig.button_url,
              is_enabled: buttonConfig.is_enabled,
            });
          } else {
            // Refetch if payload.new is not available
            loadConfig();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.button_text.trim()) {
      toast({
        title: "Error",
        description: "Button text is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.button_url.trim()) {
      toast({
        title: "Error",
        description: "Button URL is required.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      console.log('Submitting form data:', formData);
      const updatedConfig = await updateAccessCodeButtonConfig(formData);
      
      if (updatedConfig) {
        console.log('Config updated successfully:', updatedConfig);
        toast({
          title: "Success",
          description: "Access code button configuration updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating button configuration:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update button configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Changing field ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Access Code Button Configuration</CardTitle>
          <CardDescription>
            Manage the "Get Access Code" button that appears on the access prompt page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={formData.button_text}
                onChange={(e) => handleInputChange('button_text', e.target.value)}
                placeholder="Get Access Code"
                required
                disabled={saving}
              />
              <p className="text-sm text-gray-500">
                The text that will be displayed on the button
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buttonUrl">Button URL</Label>
              <Input
                id="buttonUrl"
                type="url"
                value={formData.button_url}
                onChange={(e) => handleInputChange('button_url', e.target.value)}
                placeholder="https://example.com/get-access"
                required
                disabled={saving}
              />
              <p className="text-sm text-gray-500">
                The URL that users will be redirected to when they click the button
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isEnabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => handleInputChange('is_enabled', checked)}
                disabled={saving}
              />
              <Label htmlFor="isEnabled">Enable Button</Label>
            </div>
            <p className="text-sm text-gray-500">
              When enabled, the button will be visible on the access prompt page
            </p>
            
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
          
          {config && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Current Configuration</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Text:</span> {config.button_text}</p>
                <p><span className="font-medium">URL:</span> {config.button_url}</p>
                <p><span className="font-medium">Status:</span> {config.is_enabled ? 'Enabled' : 'Disabled'}</p>
                <p><span className="font-medium">Last Updated:</span> {new Date(config.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessCodeButtonTab;
