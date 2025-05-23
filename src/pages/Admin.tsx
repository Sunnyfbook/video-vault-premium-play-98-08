import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Video, getVideos, addVideo, updateVideo, deleteVideo } from '@/models/Video';
import { format } from 'date-fns';

const Admin: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  // Add video dialog state
  const [openAddVideoDialog, setOpenAddVideoDialog] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoThumbnail, setNewVideoThumbnail] = useState("");
  const [newVideoAdTiming, setNewVideoAdTiming] = useState(10);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Edit video dialog state
  const [openEditVideoDialog, setOpenEditVideoDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState("");
  const [editVideoDescription, setEditVideoDescription] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoThumbnail, setEditVideoThumbnail] = useState("");
  const [editVideoAdTiming, setEditVideoAdTiming] = useState(10);
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);

  // Delete video state
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const videos = await getVideos();
      setVideos(videos);
    } catch (e) {
      console.error("Error loading videos:", e);
      setError("Failed to load videos. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Fix the add video form to align with our updated model
  const addVideoForm = (
    <form onSubmit={handleAddVideo} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          value={newVideoTitle} 
          onChange={(e) => setNewVideoTitle(e.target.value)} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={newVideoDescription} 
          onChange={(e) => setNewVideoDescription(e.target.value)} 
        />
      </div>
      <div>
        <Label htmlFor="url">Video URL</Label>
        <Input 
          id="url" 
          value={newVideoUrl} 
          onChange={(e) => setNewVideoUrl(e.target.value)} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
        <Input 
          id="thumbnail" 
          value={newVideoThumbnail} 
          onChange={(e) => setNewVideoThumbnail(e.target.value)} 
        />
      </div>
      <div>
        <Label htmlFor="adTimingSeconds">Ad timing (seconds)</Label>
        <Input 
          id="adTimingSeconds" 
          type="number" 
          min="5"
          value={String(newVideoAdTiming)} 
          onChange={(e) => setNewVideoAdTiming(Number(e.target.value))} 
        />
      </div>
      <Button type="submit" disabled={isAddingVideo}>
        {isAddingVideo ? "Adding..." : "Add Video"}
      </Button>
    </form>
  );

  // Fix the handleAddVideo function to match our updated model
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVideoTitle || !newVideoUrl) {
      toast({
        title: "Error",
        description: "Title and URL are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingVideo(true);
    
    try {
      const newVideo = await addVideo({
        title: newVideoTitle,
        description: newVideoDescription,
        url: newVideoUrl,
        thumbnail: newVideoThumbnail || undefined,
        ad_timing_seconds: newVideoAdTiming
      });
      
      toast({
        title: "Success",
        description: "Video added successfully!",
      });
      
      // Reset form
      setNewVideoTitle("");
      setNewVideoDescription("");
      setNewVideoUrl("");
      setNewVideoThumbnail("");
      setNewVideoAdTiming(10);
      
      // Refresh videos
      loadVideos();
      
      // Close dialog
      setOpenAddVideoDialog(false);
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingVideo(false);
    }
  };

  const handleOpenEditVideoDialog = (video: Video) => {
    setSelectedVideo(video);
    setEditVideoTitle(video.title);
    setEditVideoDescription(video.description);
    setEditVideoUrl(video.url);
    setEditVideoThumbnail(video.thumbnail || "");
    setEditVideoAdTiming(video.ad_timing_seconds || 10);
    setOpenEditVideoDialog(true);
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVideo) return;
    
    setIsUpdatingVideo(true);
    
    try {
      const updatedVideo = {
        ...selectedVideo,
        title: editVideoTitle,
        description: editVideoDescription,
        url: editVideoUrl,
        thumbnail: editVideoThumbnail || undefined,
        ad_timing_seconds: editVideoAdTiming
      };
      
      const result = await updateVideo(updatedVideo);
      
      if (result) {
        toast({
          title: "Success",
          description: "Video updated successfully!",
        });
        
        // Refresh videos
        loadVideos();
        
        // Close dialog
        setOpenEditVideoDialog(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update video. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: "Failed to update video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVideo(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    setIsDeletingVideo(true);
    
    try {
      const result = await deleteVideo(id);
      
      if (result) {
        toast({
          title: "Success",
          description: "Video deleted successfully!",
        });
        
        // Refresh videos
        loadVideos();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete video. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingVideo(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <Dialog open={openAddVideoDialog} onOpenChange={setOpenAddVideoDialog}>
          <DialogTrigger asChild>
            <Button>Add Video</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Video</DialogTitle>
              <DialogDescription>
                Add a new video to the platform.
              </DialogDescription>
            </DialogHeader>
            {addVideoForm}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpenAddVideoDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading videos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableCaption>A list of your videos.</TableCaption>
            <TableHead>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>{formatDate(video.date_added)}</TableCell>
                  <TableCell>{video.views}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleOpenEditVideoDialog(video)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={isDeletingVideo}
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      {isDeletingVideo ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Video Dialog */}
      <Dialog open={openEditVideoDialog} onOpenChange={setOpenEditVideoDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Edit the details of the selected video.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateVideo} className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title</Label>
              <Input 
                id="editTitle" 
                value={editVideoTitle} 
                onChange={(e) => setEditVideoTitle(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea 
                id="editDescription" 
                value={editVideoDescription} 
                onChange={(e) => setEditVideoDescription(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="editUrl">Video URL</Label>
              <Input 
                id="editUrl" 
                value={editVideoUrl} 
                onChange={(e) => setEditVideoUrl(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="editThumbnail">Thumbnail URL (optional)</Label>
              <Input 
                id="editThumbnail" 
                value={editVideoThumbnail} 
                onChange={(e) => setEditVideoThumbnail(e.target.value)} 
              />
            </div>
             <div>
              <Label htmlFor="editAdTimingSeconds">Ad timing (seconds)</Label>
              <Input 
                id="editAdTimingSeconds" 
                type="number" 
                min="5"
                value={String(editVideoAdTiming)} 
                onChange={(e) => setEditVideoAdTiming(Number(e.target.value))} 
              />
            </div>
            <Button type="submit" disabled={isUpdatingVideo}>
              {isUpdatingVideo ? "Updating..." : "Update Video"}
            </Button>
          </form>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpenEditVideoDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
