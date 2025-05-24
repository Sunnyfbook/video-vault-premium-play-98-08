
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateHomepageConfig, HomepageConfig, defaultConfig as initialHomepageConfigValues } from '@/models/HomepageConfig';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import { useToast } from '@/hooks/use-toast';

const HomepageSettingsTab: React.FC = () => {
  const { config: currentHomepageConfig, loading: homepageConfigLoading } = useHomepageConfig();
  const [homepageConfigForm, setHomepageConfigForm] = useState<Partial<HomepageConfig>>(initialHomepageConfigValues);
  const [savingHomepageConfig, setSavingHomepageConfig] = useState(false);
  const [customAspectRatio, setCustomAspectRatio] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentHomepageConfig) {
      setHomepageConfigForm({
        site_title: currentHomepageConfig.site_title,
        site_description: currentHomepageConfig.site_description,
        footer_copyright: currentHomepageConfig.footer_copyright,
        container_max_width: currentHomepageConfig.container_max_width || '280px',
        container_aspect_ratio: currentHomepageConfig.container_aspect_ratio || '9/16',
      });
      
      setCustomAspectRatio(
        currentHomepageConfig.container_aspect_ratio !== '9/16' && 
        currentHomepageConfig.container_aspect_ratio !== '1/1' && 
        currentHomepageConfig.container_aspect_ratio !== '16/9'
      );
    }
  }, [currentHomepageConfig]);

  const handleHomepageConfigChange = (field: keyof HomepageConfig, value: string) => {
    setHomepageConfigForm(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAspectRatioChange = (ratio: string) => {
    setCustomAspectRatio(ratio === 'custom');
    if (ratio !== 'custom') {
      handleHomepageConfigChange('container_aspect_ratio', ratio);
    }
  };

  const handleSaveHomepageConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHomepageConfig(true);
    try {
      const result = await updateHomepageConfig({
        site_title: homepageConfigForm.site_title,
        site_description: homepageConfigForm.site_description,
        footer_copyright: homepageConfigForm.footer_copyright,
        container_max_width: homepageConfigForm.container_max_width,
        container_aspect_ratio: homepageConfigForm.container_aspect_ratio,
      });
      if (result) {
        toast({
          title: "Homepage Settings Updated",
          description: "Your homepage texts and layout have been updated.",
        });
      } else {
        throw new Error("Failed to update homepage settings");
      }
    } catch (error) {
      console.error("Error updating homepage settings:", error);
      toast({
        title: "Error",
        description: "Failed to update homepage settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingHomepageConfig(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Text & Layout Settings</CardTitle>
        <CardDescription>
          Manage the main title, description, footer copyright text, and content container size displayed on your homepage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {homepageConfigLoading ? (
          <p>Loading settings...</p>
        ) : (
          <form onSubmit={handleSaveHomepageConfig} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site_title">Main Site Title</Label>
              <Input
                id="site_title"
                value={homepageConfigForm.site_title || ""}
                onChange={(e) => handleHomepageConfigChange('site_title', e.target.value)}
                placeholder="Enter main site title"
              />
              <p className="text-xs text-muted-foreground">
                This is the main heading on your homepage (e.g., "Video Player Pro").
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={homepageConfigForm.site_description || ""}
                onChange={(e) => handleHomepageConfigChange('site_description', e.target.value)}
                placeholder="Enter site description"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                The introductory paragraph below the main title on your homepage.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_copyright">Footer Copyright Text</Label>
              <Input
                id="footer_copyright"
                value={homepageConfigForm.footer_copyright || ""}
                onChange={(e) => handleHomepageConfigChange('footer_copyright', e.target.value)}
                placeholder="Enter footer copyright text"
              />
               <p className="text-xs text-muted-foreground">
                e.g., "© {new Date().getFullYear()} Your Company. All rights reserved."
              </p>
            </div>
            
            {/* New Content Container Size Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Content Container Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="container_max_width">Container Width</Label>
                <Input
                  id="container_max_width"
                  value={homepageConfigForm.container_max_width || "280px"}
                  onChange={(e) => handleHomepageConfigChange('container_max_width', e.target.value)}
                  placeholder="e.g., 280px, 350px, 25rem, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Maximum width of video and image containers. Use CSS units (px, rem, etc).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <div className="flex flex-wrap gap-3 pt-1">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="ratio_9_16" 
                      name="aspect_ratio" 
                      checked={homepageConfigForm.container_aspect_ratio === '9/16' && !customAspectRatio}
                      onChange={() => handleAspectRatioChange('9/16')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="ratio_9_16" className="text-sm cursor-pointer">
                      9:16 (Portrait)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="ratio_1_1" 
                      name="aspect_ratio" 
                      checked={homepageConfigForm.container_aspect_ratio === '1/1' && !customAspectRatio}
                      onChange={() => handleAspectRatioChange('1/1')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="ratio_1_1" className="text-sm cursor-pointer">
                      1:1 (Square)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="ratio_16_9" 
                      name="aspect_ratio" 
                      checked={homepageConfigForm.container_aspect_ratio === '16/9' && !customAspectRatio}
                      onChange={() => handleAspectRatioChange('16/9')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="ratio_16_9" className="text-sm cursor-pointer">
                      16:9 (Landscape)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="ratio_custom" 
                      name="aspect_ratio" 
                      checked={customAspectRatio}
                      onChange={() => handleAspectRatioChange('custom')}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="ratio_custom" className="text-sm cursor-pointer">
                      Custom
                    </Label>
                  </div>
                </div>
                
                {customAspectRatio && (
                  <div className="pt-2">
                    <Input
                      value={homepageConfigForm.container_aspect_ratio || ""}
                      onChange={(e) => handleHomepageConfigChange('container_aspect_ratio', e.target.value)}
                      placeholder="e.g., 4/3, 3/2, etc."
                      className="max-w-[200px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use format "width/height" (e.g., 4/3, 3/2)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={savingHomepageConfig}>
              {savingHomepageConfig ? "Saving..." : "Save Homepage Settings"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default HomepageSettingsTab;
