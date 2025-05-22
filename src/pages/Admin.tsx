
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [ads, setAds] = useState<AdModel[]>([]);
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
    isActive: true
  });
  const { toast } = useToast();
  
  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    // Load videos and ads
    setVideos(getVideos());
    setAds(getAds());
  }, []);
  
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVideo.url.trim()) {
      toast({
        title: "Error",
        description: "Video URL is required.",
        variant: "destructive",
      });
      return;
    }
    
    const addedVideo = addVideo(newVideo);
    setVideos([...videos, addedVideo]);
    
    // Reset form
    setNewVideo({
      title: '',
      description: '',
      url: '',
      thumbnail: ''
    });
    
    toast({
      title: "Video Added",
      description: "Your video has been added successfully.",
    });
  };
  
  const handleRemoveVideo = (id: string) => {
    const success = deleteVideo(id);
    if (success) {
      setVideos(videos.filter(video => video.id !== id));
      toast({
        title: "Video Removed",
        description: "The video has been removed.",
      });
    }
  };
  
  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAd.code.trim()) {
      toast({
        title: "Error",
        description: "Ad code is required.",
        variant: "destructive",
      });
      return;
    }
    
    const addedAd = addAd(newAd);
    setAds([...ads, addedAd]);
    
    // Reset form
    setNewAd({
      name: '',
      type: 'monetag',
      code: '',
      position: 'top',
      isActive: true
    });
    
    toast({
      title: "Ad Added",
      description: "Your ad has been added successfully.",
    });
  };
  
  const handleToggleAd = (ad: AdModel) => {
    const updatedAd = { ...ad, isActive: !ad.isActive };
    updateAd(updatedAd);
    setAds(ads.map(a => a.id === ad.id ? updatedAd : a));
  };
  
  const handleRemoveAd = (id: string) => {
    const success = deleteAd(id);
    if (success) {
      setAds(ads.filter(ad => ad.id !== id));
      toast({
        title: "Ad Removed",
        description: "The ad has been removed.",
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
                            <span>{new Date(video.dateAdded).toLocaleDateString()}</span>
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
                            <Link to={`/video/${video.id}`} target="_blank">
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
                        checked={newAd.isActive}
                        onCheckedChange={(checked) => setNewAd({ ...newAd, isActive: checked })}
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
                                ad.isActive 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {ad.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`ad-toggle-${ad.id}`}
                                checked={ad.isActive}
                                onCheckedChange={() => handleToggleAd(ad)}
                              />
                              <Label htmlFor={`ad-toggle-${ad.id}`} className="text-sm">
                                {ad.isActive ? 'Enabled' : 'Disabled'}
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
      </Tabs>
    </div>
  );
};

export default Admin;
