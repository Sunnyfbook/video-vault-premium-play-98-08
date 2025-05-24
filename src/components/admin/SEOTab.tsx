
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEOSetting, updateSEOSetting } from '@/models/SEO';
import { useToast } from '@/hooks/use-toast';

interface SEOTabProps {
  seoSettings: SEOSetting[];
}

const SEOTab: React.FC<SEOTabProps> = ({ seoSettings }) => {
  const [selectedSEO, setSelectedSEO] = useState<SEOSetting | null>(null);
  const { toast } = useToast();

  const handleSEOUpdate = async () => {
    if (!selectedSEO) return;
    
    try {
      await updateSEOSetting(selectedSEO);
      
      toast({
        title: "SEO Settings Updated",
        description: `SEO settings for ${selectedSEO.page} page updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      toast({
        title: "Error",
        description: "Failed to update SEO settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* SEO Page List */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>SEO Pages</CardTitle>
            <CardDescription>
              Select a page to edit SEO settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seoSettings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No SEO settings available</p>
              ) : (
                <div className="space-y-2">
                  {seoSettings.map((setting) => (
                    <Button
                      key={setting.id}
                      variant={selectedSEO?.id === setting.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedSEO(setting)}
                    >
                      {setting.page.charAt(0).toUpperCase() + setting.page.slice(1)} Page
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* SEO Settings Editor */}
      <div className="md:col-span-2">
        {selectedSEO ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit SEO Settings: {selectedSEO.page.charAt(0).toUpperCase() + selectedSEO.page.slice(1)} Page</CardTitle>
              <CardDescription>
                Optimize your page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Basic SEO</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">Page Title</Label>
                    <Input
                      id="seo-title"
                      value={selectedSEO.title}
                      onChange={(e) => setSelectedSEO({...selectedSEO, title: e.target.value})}
                      placeholder="Page title"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include keywords and keep it under 60 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo-description">Meta Description</Label>
                    <Textarea
                      id="seo-description"
                      value={selectedSEO.description}
                      onChange={(e) => setSelectedSEO({...selectedSEO, description: e.target.value})}
                      placeholder="Page description"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include keywords and keep it under 160 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo-keywords">Meta Keywords</Label>
                    <Input
                      id="seo-keywords"
                      value={selectedSEO.keywords || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, keywords: e.target.value})}
                      placeholder="Comma-separated keywords"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Open Graph (Social Sharing)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="og-title">OG Title</Label>
                    <Input
                      id="og-title"
                      value={selectedSEO.og_title || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, og_title: e.target.value})}
                      placeholder="Social sharing title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="og-description">OG Description</Label>
                    <Textarea
                      id="og-description"
                      value={selectedSEO.og_description || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, og_description: e.target.value})}
                      placeholder="Social sharing description"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="og-image">OG Image URL</Label>
                    <Input
                      id="og-image"
                      value={selectedSEO.og_image || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, og_image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 1200x630 pixels
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Twitter Card</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter-card">Card Type</Label>
                    <Select
                      value={selectedSEO.twitter_card || 'summary_large_image'}
                      onValueChange={(value) => setSelectedSEO({...selectedSEO, twitter_card: value})}
                    >
                      <SelectTrigger id="twitter-card">
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">Summary with Large Image</SelectItem>
                        <SelectItem value="player">Player</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter-title">Twitter Title</Label>
                    <Input
                      id="twitter-title"
                      value={selectedSEO.twitter_title || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, twitter_title: e.target.value})}
                      placeholder="Twitter title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter-description">Twitter Description</Label>
                    <Textarea
                      id="twitter-description"
                      value={selectedSEO.twitter_description || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, twitter_description: e.target.value})}
                      placeholder="Twitter description"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter-image">Twitter Image URL</Label>
                    <Input
                      id="twitter-image"
                      value={selectedSEO.twitter_image || ''}
                      onChange={(e) => setSelectedSEO({...selectedSEO, twitter_image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="canonical-url">Canonical URL (Optional)</Label>
                  <Input
                    id="canonical-url"
                    value={selectedSEO.canonical_url || ''}
                    onChange={(e) => setSelectedSEO({...selectedSEO, canonical_url: e.target.value})}
                    placeholder="https://yourdomain.com/page"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use when you have duplicate content across multiple URLs
                  </p>
                </div>
                
                <Button onClick={handleSEOUpdate} className="w-full">
                  Save SEO Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Page</h3>
              <p className="text-gray-500">Choose a page from the left to edit its SEO settings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOTab;
