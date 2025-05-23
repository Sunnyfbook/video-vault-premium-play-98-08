
import React, { useState, useEffect } from 'react';
import {
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  Video
} from '@/models/Video';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Admin: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideo, setNewVideo] = useState<Omit<Video, "id" | "date_added" | "views">>({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    ad_timing_seconds: 10
  });
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const videos = await getVideos();
      setVideos(videos);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewVideo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddVideo = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Custom URL is now generated automatically in the model
      const addedVideo = await addVideo(newVideo);
      toast({
        title: "Video Added",
        description: "Your video has been successfully added.",
      });
      
      // Reset form and reload videos
      setNewVideo({
        title: '',
        description: '',
        url: '',
        thumbnail: '',
        ad_timing_seconds: 10
      });
      loadVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (video: Video) => {
    setEditingVideo(video);
  };

  const handleUpdateInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingVideo) return;
    const { name, value } = event.target;
    setEditingVideo(prevState => ({
      ...prevState!,
      [name]: value
    }));
  };

  const handleUpdateVideo = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!editingVideo) return;
      const updatedVideo = await updateVideo(editingVideo);
      if (updatedVideo) {
        toast({
          title: "Video Updated",
          description: "Your video has been successfully updated.",
        });
        loadVideos();
        setEditingVideo(null);
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteVideo(id);
      if (success) {
        toast({
          title: "Video Deleted",
          description: "Your video has been successfully deleted.",
        });
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Add Video Form */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Video</h2>
        <form onSubmit={handleAddVideo} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={newVideo.title}
              onChange={handleInputChange}
              required
              className="w-full mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newVideo.description}
              onChange={handleInputChange}
              className="w-full mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="url">Video URL</Label>
            <Input
              type="url"
              id="url"
              name="url"
              value={newVideo.url}
              onChange={handleInputChange}
              required
              className="w-full mt-1"
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={newVideo.thumbnail}
              onChange={handleInputChange}
              className="w-full mt-1"
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="ad_timing_seconds">Ad Timing (seconds)</Label>
            <Input
              type="number"
              id="ad_timing_seconds"
              name="ad_timing_seconds"
              value={newVideo.ad_timing_seconds}
              onChange={handleInputChange}
              className="w-full mt-1"
              min={1}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Adding..." : "Add Video"}
          </Button>
        </form>
      </div>

      {/* Edit Video Form */}
      {editingVideo && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm border border-blue-200 dark:border-blue-900">
          <h2 className="text-xl font-semibold mb-4">Edit Video</h2>
          <form onSubmit={handleUpdateVideo} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                type="text"
                id="edit-title"
                name="title"
                value={editingVideo.title}
                onChange={handleUpdateInputChange}
                required
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editingVideo.description || ''}
                onChange={handleUpdateInputChange}
                className="w-full mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-url">Video URL</Label>
              <Input
                type="url"
                id="edit-url"
                name="url"
                value={editingVideo.url}
                onChange={handleUpdateInputChange}
                required
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
              <Input
                type="url"
                id="edit-thumbnail"
                name="thumbnail"
                value={editingVideo.thumbnail || ''}
                onChange={handleUpdateInputChange}
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-ad_timing_seconds">Ad Timing (seconds)</Label>
              <Input
                type="number"
                id="edit-ad_timing_seconds"
                name="ad_timing_seconds"
                value={editingVideo.ad_timing_seconds || 10}
                onChange={handleUpdateInputChange}
                className="w-full mt-1"
                min={1}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Video"}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setEditingVideo(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Video List */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Video List</h2>
        <Table>
          <TableCaption>A list of your videos.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead className="hidden md:table-cell">URL</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No videos found</TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="block max-w-[250px] truncate">{video.url}</span>
                  </TableCell>
                  <TableCell>{video.views}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(video)}
                        className="whitespace-nowrap"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
                        className="whitespace-nowrap"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;
