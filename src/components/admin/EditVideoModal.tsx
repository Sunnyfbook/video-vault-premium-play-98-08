
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video as VideoModel, updateVideo } from '@/models/Video';
import { useToast } from '@/hooks/use-toast';

interface EditVideoModalProps {
  video: VideoModel | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditVideoModal: React.FC<EditVideoModalProps> = ({ video, isOpen, onClose }) => {
  const [editedVideo, setEditedVideo] = useState<VideoModel | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (video) {
      setEditedVideo({ ...video });
    }
  }, [video]);

  const handleSave = async () => {
    if (!editedVideo) return;
    
    setSaving(true);
    try {
      await updateVideo(editedVideo);
      toast({
        title: "Video Updated",
        description: "Video details have been updated successfully.",
      });
      onClose();
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: "Failed to update video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!editedVideo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Update the video details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editedVideo.title}
              onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
              placeholder="Enter video title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editedVideo.description}
              onChange={(e) => setEditedVideo({ ...editedVideo, description: e.target.value })}
              placeholder="Enter video description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-url">Video URL</Label>
            <Input
              id="edit-url"
              value={editedVideo.url}
              onChange={(e) => setEditedVideo({ ...editedVideo, url: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
            <Input
              id="edit-thumbnail"
              value={editedVideo.thumbnail || ''}
              onChange={(e) => setEditedVideo({ ...editedVideo, thumbnail: e.target.value })}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-custom-url">Custom URL</Label>
            <Input
              id="edit-custom-url"
              value={editedVideo.custom_url || ''}
              onChange={(e) => setEditedVideo({ ...editedVideo, custom_url: e.target.value })}
              placeholder="my-awesome-video"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-ad-timing">Ad Timing (seconds)</Label>
            <Input
              id="edit-ad-timing"
              type="number"
              min="0"
              value={editedVideo.ad_timing_seconds || 10}
              onChange={(e) => setEditedVideo({ ...editedVideo, ad_timing_seconds: parseInt(e.target.value) || 10 })}
              placeholder="10"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditVideoModal;
