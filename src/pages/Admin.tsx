import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video as VideoModel, getVideos, addVideo, deleteVideo } from '@/models/Video';
import { Ad as AdModel, getAds, addAd, updateAd, deleteAd } from '@/models/Ad';
import { SEOSetting, getSEOSettings, updateSEOSetting } from '@/models/SEO';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import HomepageContentManager from "@/components/admin/HomepageContentManager";
import { getHomepageConfig, updateHomepageConfig, HomepageConfig, defaultConfig as initialHomepageConfigValues } from '@/models/HomepageConfig';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import AdminCredentialsManager from '@/components/admin/AdminCredentialsManager';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';

const Admin: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [ads, setAds] = useState<AdModel[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [selectedSEO, setSelectedSEO] = useState<SEOSetting | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: ''
  });
  const [newAd, setNewAd] = useState({
    name: '',
    type: 'monetag' as 'monetag' | 'adstera',
    code: '',
    position: 'top' as 'top' | 'bottom' | 'sidebar' | 'in-video',
    is_active: true
  });
  const { toast } = useToast();
  const { config: currentHomepageConfig, loading: homepageConfigLoading, refetchConfig: refetchHomepageConfig } = useHomepageConfig();
  const [homepageConfigForm, setHomepageConfigForm] = useState<Partial<HomepageConfig>>(initialHomepageConfigValues);
  const [savingHomepageConfig, setSavingHomepageConfig] = useState(false);
  const [customAspectRatio, setCustomAspectRatio] = useState(false);
  
  // New state for custom URLs and ad timing
  const [customUrl, setCustomUrl] = useState<string>('');
  const [adTimingSeconds, setAdTimingSeconds] = useState<number>(10);
  
  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    // Load data on component mount
    const loadData = async () => {
      try {
        const videosData = await getVideos();
        setVideos(videosData);
        
        const adsData = await getAds();
        setAds(adsData);
        
        const seoData = await getSEOSettings();
        setSeoSettings(seoData);
        
        // Fetch initial homepage config for the form
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data from the database",
          variant: "destructive"
        });
      }
    };
    
    loadData();
    
    // Set up real-time listeners
    const videosChannel = supabase
      .channel('public:videos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' },
        () => { getVideos().then(setVideos); }
      )
      .subscribe();
      
    const adsChannel = supabase
      .channel('public:ads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        () => { getAds().then(setAds); }
      )
      .subscribe();
      
    const seoChannel = supabase
      .channel('public:seo')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seo_settings' },
        () => { getSEOSettings().then(setSeoSettings); }
      )
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(seoChannel);
    };
  }, [toast]);
  
  useEffect(() => {
    if (currentHomepageConfig) {
      setHomepageConfigForm({
        site_title: currentHomepageConfig.site_title,
        site_description: currentHomepageConfig.site_description,
        footer_copyright: currentHomepageConfig.footer_copyright,
        container_max_width: currentHomepageConfig.container_max_width || '280px',
        container_aspect_ratio: currentHomepageConfig.container_aspect_ratio || '9/16',
      });
      
      // Check if using custom aspect ratio
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

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVideo.url.trim()) {
      toast({
        title: "Error",
        description: "Video URL is required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add video with customUrl and adTimingSeconds as separate properties
      await addVideo({
        ...newVideo,
        custom_url: customUrl.trim() || undefined,
        ad_timing_seconds: adTimingSeconds || 10
      } as any); // Using 'as any' to temporarily bypass TypeScript checking
      
      // Reset form
      setNewVideo({
        title: '',
        description: '',
        url: '',
        thumbnail: ''
      });
      setCustomUrl('');
      setAdTimingSeconds(10);
      
      toast({
        title: "Video Added",
        description: "Your video has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveVideo = async (id: string) => {
    try {
      const success = await deleteVideo(id);
      if (success) {
        toast({
          title: "Video Removed",
          description: "The video has been removed.",
        });
      } else {
        throw new Error("Failed to delete video");
      }
    } catch (error) {
      console.error("Error removing video:", error);
      toast({
        title: "Error",
        description: "Failed to remove video. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAd.code.trim()) {
      toast({
        title: "Error",
        description: "Ad code is required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addAd(newAd);
      
      // Reset form
      setNewAd({
        name: '',
        type: 'monetag',
        code: '',
        position: 'top',
        is_active: true
      });
      
      toast({
        title: "Ad Added",
        description: "Your ad has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding ad:", error);
      toast({
        title: "Error",
        description: "Failed to add ad. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleAd = async (ad: AdModel) => {
    try {
      const updatedAd = { ...ad, is_active: !ad.is_active };
      await updateAd(updatedAd);
      
      toast({
        title: "Ad Updated",
        description: `Ad ${ad.is_active ? 'disabled' : 'enabled'} successfully.`,
      });
    } catch (error) {
      console.error("Error toggling ad:", error);
      toast({
        title: "Error",
        description: "Failed to update ad. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveAd = async (id: string) => {
    try {
      const success = await deleteAd(id);
      if (success) {
        toast({
          title: "Ad Removed",
          description: "The ad has been removed.",
        });
      } else {
        throw new Error("Failed to delete ad");
      }
    } catch (error) {
      console.error("Error removing ad:", error);
      toast({
        title: "Error",
        description: "Failed to remove ad. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const copyVideoLink = (videoId: string) => {
    const origin = window.location.origin;
    const link = `${origin}/video/${videoId}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link Copied",
      description: "Video link copied to clipboard.",
    });
  };
  
  // Handle updating SEO settings
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your videos and ads</p>
        </div>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="outline">View Site</Button>
          </Link>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
      
      <Tabs defaultValue="videos">
        <TabsList className="mb-6">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="homepage_settings">Homepage Settings</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        {/* Videos Tab */}
        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add Video Form */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Video</CardTitle>
                  <CardDescription>
                    Enter video details to add to your collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVideo} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                        placeholder="Enter video title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newVideo.description}
                        onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                        placeholder="Enter video description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="url">Video URL</Label>
                      <Input
                        id="url"
                        value={newVideo.url}
                        onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
                      <Input
                        id="thumbnail"
                        value={newVideo.thumbnail}
                        onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>

                    {/* Custom URL Field */}
                    <div className="space-y-2">
                      <Label htmlFor="customUrl">Custom URL (Optional)</Label>
                      <Input
                        id="customUrl"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="my-awesome-video"
                      />
                      <p className="text-xs text-gray-500">
                        Creates a shorter, user-friendly URL like /v/my-awesome-video
                      </p>
                    </div>

                    {/* Ad Timing Field */}
                    <div className="space-y-2">
                      <Label htmlFor="adTimingSeconds">Ad Timing (seconds)</Label>
                      <Input
                        id="adTimingSeconds"
                        type="number"
                        min="0"
                        value={adTimingSeconds}
                        onChange={(e) => setAdTimingSeconds(parseInt(e.target.value) || 10)}
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-500">
                        Time to wait before showing in-video ads (seconds)
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Add Video
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Video List */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
              
              {videos.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">No videos available</p>
                  <p className="text-sm text-gray-400">Add your first video using the form</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 relative pt-[56.25%] md:pt-0 md:h-auto">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title} 
                              className="absolute top-0 left-0 w-full h-full object-cover md:relative md:h-32"
                            />
                          ) : (
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center md:relative md:h-32">
                              <span className="text-gray-400">No Thumbnail</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 w-full md:w-3/4">
                          <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-1">{video.description}</p>
                          
                          <div className="text-xs text-gray-500 mb-4">
                            <span>{new Date(video.date_added).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{video.views} views</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              onClick={() => copyVideoLink(video.id)} 
                              variant="secondary" 
                              size="sm"
                            >
                              Copy Link
                            </Button>
                            <Link to={video.custom_url ? `/v/${video.custom_url}` : `/video/${video.id}`} target="_blank">
                              <Button size="sm" variant="outline">
                                Preview
                              </Button>
                            </Link>
                            <Button 
                              onClick={() => handleRemoveVideo(video.id)} 
                              variant="destructive" 
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        {/* Ads Tab */}
        <TabsContent value="ads">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add Ad Form */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Ad</CardTitle>
                  <CardDescription>
                    Configure your Monetag and Adstera ads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adName">Ad Name</Label>
                      <Input
                        id="adName"
                        value={newAd.name}
                        onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                        placeholder="E.g. Top Banner"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adType">Ad Provider</Label>
                      <Select 
                        value={newAd.type}
                        onValueChange={(value: 'monetag' | 'adstera') => setNewAd({ ...newAd, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ad provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monetag">Monetag</SelectItem>
                          <SelectItem value="adstera">Adstera</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adPosition">Position</Label>
                      <Select 
                        value={newAd.position}
                        onValueChange={(value: 'top' | 'bottom' | 'sidebar' | 'in-video') => 
                          setNewAd({ ...newAd, position: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="in-video">In-video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adCode">Ad Code</Label>
                      <Textarea
                        id="adCode"
                        value={newAd.code}
                        onChange={(e) => setNewAd({ ...newAd, code: e.target.value })}
                        placeholder="Paste ad code here"
                        rows={5}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="adActive"
                        checked={newAd.is_active}
                        onCheckedChange={(checked) => setNewAd({ ...newAd, is_active: checked })}
                      />
                      <Label htmlFor="adActive">Active</Label>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Add Ad
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Ad List */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Your Ads</h2>
              
              {ads.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">No ads configured</p>
                  <p className="text-sm text-gray-400">Add your first ad using the form</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <Card key={ad.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{ad.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                ad.type === 'monetag' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {ad.type}
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                {ad.position}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                ad.is_active 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {ad.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`ad-toggle-${ad.id}`}
                                checked={ad.is_active}
                                onCheckedChange={() => handleToggleAd(ad)}
                              />
                              <Label htmlFor={`ad-toggle-${ad.id}`} className="text-sm">
                                {ad.is_active ? 'Enabled' : 'Disabled'}
                              </Label>
                            </div>
                            
                            <Button 
                              onClick={() => handleRemoveAd(ad.id)} 
                              variant="destructive" 
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-100">
                          <p className="text-xs text-gray-500 font-mono break-all">
                            {ad.code.length > 100 ? `${ad.code.slice(0, 100)}...` : ad.code}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        {/* SEO Tab */}
        <TabsContent value="seo">
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
        </TabsContent>
        {/* Homepage Content Tab */}
        <TabsContent value="homepage">
          <HomepageContentManager />
        </TabsContent>
        {/* Homepage Settings Tab - updated with container size controls */}
        <TabsContent value="homepage_settings">
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
        </TabsContent>
        {/* Account Tab - New tab for admin credentials */}
        <TabsContent value="account">
          <AdminCredentialsManager />
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
