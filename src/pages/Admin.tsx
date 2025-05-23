
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import HomepageContentManager from '@/components/admin/HomepageContentManager';
import AdminCredentialsManager from '@/components/admin/AdminCredentialsManager';
import { Video, addVideo, getVideos, deleteVideo } from '@/models/Video';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    adTimingSeconds: 10
  });
  
  // Define handleAddVideo here, before it's used
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVideo({
        title: formData.title,
        description: formData.description,
        url: formData.url,
        thumbnail: formData.thumbnail,
        ad_timing_seconds: formData.adTimingSeconds
      });
      
      toast({
        title: "Video Added",
        description: "The video has been successfully added.",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        url: '',
        thumbnail: '',
        adTimingSeconds: 10
      });
      
      // Refresh videos list
      loadVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const fetchedVideos = await getVideos();
    setVideos(fetchedVideos);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      const success = await deleteVideo(id);
      if (success) {
        toast({
          title: "Video Deleted",
          description: "The video has been successfully deleted.",
        });
        loadVideos();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete video. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="videos" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Video</CardTitle>
              <CardDescription>Upload a new video to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={3} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Video URL</Label>
                  <Input 
                    id="url" 
                    name="url" 
                    value={formData.url} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="https://example.com/video.mp4" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input 
                    id="thumbnail" 
                    name="thumbnail" 
                    value={formData.thumbnail} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com/thumbnail.jpg" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adTimingSeconds">Ad Timing (seconds)</Label>
                  <Input 
                    id="adTimingSeconds" 
                    name="adTimingSeconds" 
                    type="number" 
                    value={formData.adTimingSeconds} 
                    onChange={handleNumberChange} 
                    min={0} 
                  />
                  <p className="text-sm text-gray-500">Set to 0 to disable ads</p>
                </div>
                
                <Button type="submit">Add Video</Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video bg-black relative">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                      <span className="text-gray-500">No Thumbnail</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/watch/${video.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View site performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsOverview />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="homepage">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
              <CardDescription>Manage homepage content and layout</CardDescription>
            </CardHeader>
            <CardContent>
              <HomepageContentManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Manage credentials and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCredentialsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
