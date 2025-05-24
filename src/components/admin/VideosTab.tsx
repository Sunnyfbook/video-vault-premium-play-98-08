
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video as VideoModel, addVideo, deleteVideo } from '@/models/Video';
import { useToast } from '@/hooks/use-toast';

interface VideosTabProps {
  videos: VideoModel[];
}

const VideosTab: React.FC<VideosTabProps> = ({ videos }) => {
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: ''
  });
  const [customUrl, setCustomUrl] = useState<string>('');
  const [adTimingSeconds, setAdTimingSeconds] = useState<number>(10);
  const { toast } = useToast();

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
      await addVideo({
        ...newVideo,
        custom_url: customUrl.trim() || undefined,
        ad_timing_seconds: adTimingSeconds || 10
      } as any);
      
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
  );
};

export default VideosTab;
