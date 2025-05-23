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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
      // Remove custom_url from the newVideo object since it's now generated automatically
      const { custom_url, ...videoToAdd } = newVideo;
      
      const addedVideo = await addVideo(videoToAdd);
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Add Video Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Video</h2>
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
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newVideo.description}
              onChange={handleInputChange}
              className="w-full"
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
              className="w-full"
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
              className="w-full"
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
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Video"}
          </Button>
        </form>
      </div>

      {/* Edit Video Form */}
      {editingVideo && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Edit Video</h2>
          <form onSubmit={handleUpdateVideo} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={editingVideo.title}
                onChange={handleUpdateInputChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editingVideo.description || ''}
                onChange={handleUpdateInputChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="url">Video URL</Label>
              <Input
                type="url"
                id="url"
                name="url"
                value={editingVideo.url}
                onChange={handleUpdateInputChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={editingVideo.thumbnail || ''}
                onChange={handleUpdateInputChange}
                className="w-full"
              />
            </div>
             <div>
              <Label htmlFor="ad_timing_seconds">Ad Timing (seconds)</Label>
              <Input
                type="number"
                id="ad_timing_seconds"
                name="ad_timing_seconds"
                value={editingVideo.ad_timing_seconds || 10}
                onChange={handleUpdateInputChange}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Video"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditingVideo(null)}>
              Cancel
            </Button>
          </form>
        </div>
      )}

      {/* Video List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Video List</h2>
        <Table>
          <TableCaption>A list of your videos.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>{video.url}</TableCell>
                <TableCell>{video.views}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(video)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the video from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteVideo(video.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;
