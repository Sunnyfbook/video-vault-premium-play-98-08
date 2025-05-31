
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video as VideoModel, addVideo, deleteVideo } from '@/models/Video';
import { useToast } from '@/hooks/use-toast';
import EditVideoModal from './EditVideoModal';

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
  const [editingVideo, setEditingVideo] = useState<VideoModel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleEditVideo = (video: VideoModel) => {
    setEditingVideo(video);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingVideo(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
        {/* Add Video Form */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Video</CardTitle>
              <CardDescription className="text-sm">
                Enter video details to add to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVideo} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-sm">Title</Label>
                  <Input
                    id="title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Enter video title"
                    required
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    placeholder="Enter video description"
                    rows={2}
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="url" className="text-sm">Video URL</Label>
                  <Input
                    id="url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    required
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="thumbnail" className="text-sm">Thumbnail URL (Optional)</Label>
                  <Input
                    id="thumbnail"
                    value={newVideo.thumbnail}
                    onChange={(e) => setNewVideo({ ...newVideo, thumbnail: e.target.value })}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="customUrl" className="text-sm">Custom URL (Optional)</Label>
                  <Input
                    id="customUrl"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="my-awesome-video"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Creates a shorter, user-friendly URL like /v/my-awesome-video
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="adTimingSeconds" className="text-sm">Ad Timing (seconds)</Label>
                  <Input
                    id="adTimingSeconds"
                    type="number"
                    min="0"
                    value={adTimingSeconds}
                    onChange={(e) => setAdTimingSeconds(parseInt(e.target.value) || 10)}
                    placeholder="10"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Time to wait before showing in-video ads (seconds)
                  </p>
                </div>
                
                <Button type="submit" className="w-full text-sm">
                  Add Video
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Video List */}
        <div className="xl:col-span-2">
          <h2 className="text-lg lg:text-xl font-semibold mb-3">Your Videos</h2>
          
          {videos.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-3 text-sm">No videos available</p>
              <p className="text-xs text-gray-400">Add your first video using the form</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/4 relative pt-[56.25%] sm:pt-0 sm:h-auto">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="absolute top-0 left-0 w-full h-full object-cover sm:relative sm:h-24 lg:sm:h-32"
                        />
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center sm:relative sm:h-24 lg:sm:h-32">
                          <span className="text-gray-400 text-xs">No Thumbnail</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 lg:p-4 w-full sm:w-3/4">
                      <h3 className="font-semibold text-sm lg:text-lg mb-1 line-clamp-1">{video.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-500 mb-2 line-clamp-1">{video.description}</p>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        <span>{new Date(video.date_added).toLocaleDateString()}</span>
                        <span className="mx-1">•</span>
                        <span>{video.views} views</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 lg:gap-2">
                        <Button 
                          onClick={() => handleEditVideo(video)} 
                          variant="default" 
                          size="sm"
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button 
                          onClick={() => copyVideoLink(video.id)} 
                          variant="secondary" 
                          size="sm"
                          className="text-xs"
                        >
                          Copy Link
                        </Button>
                        <Link to={video.custom_url ? `/v/${video.custom_url}` : `/video/${video.id}`} target="_blank">
                          <Button size="sm" variant="outline" className="text-xs">
                            Preview
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => handleRemoveVideo(video.id)} 
                          variant="destructive" 
                          size="sm"
                          className="text-xs"
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

      <EditVideoModal 
        video={editingVideo}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </>
  );
};

export default VideosTab;
