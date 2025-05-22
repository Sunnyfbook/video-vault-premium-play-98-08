
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Trash, PencilLine, Play, Image as ImageIcon } from 'lucide-react';
import { HomepageContent, addHomepageContent, updateHomepageContent, deleteHomepageContent, reorderHomepageContent } from '@/models/Homepage';

interface HomepageContentTabProps {
  content: HomepageContent[];
  videos: { id: string; title: string; thumbnail?: string }[];
  refreshContent: () => void;
}

const HomepageContentTab: React.FC<HomepageContentTabProps> = ({ 
  content, 
  videos,
  refreshContent 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<HomepageContent> & { id?: string }>({
    type: 'featured',
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    order: 0
  });

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentItem.id) {
        // Update existing content
        await updateHomepageContent(currentItem as HomepageContent);
        toast({
          title: "Content Updated",
          description: "Homepage content has been updated successfully."
        });
      } else {
        // Calculate next order number
        const nextOrder = content.length > 0 
          ? Math.max(...content.map(item => item.order)) + 1 
          : 0;
        
        // Add new content
        await addHomepageContent({
          ...currentItem as Omit<HomepageContent, 'id' | 'created_at'>,
          order: nextOrder
        });
        toast({
          title: "Content Added",
          description: "New content has been added to the homepage."
        });
      }
      
      // Reset form and refresh content
      resetForm();
      refreshContent();
    } catch (error) {
      console.error('Error saving homepage content:', error);
      toast({
        title: "Error",
        description: "There was a problem saving the content.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: HomepageContent) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHomepageContent(id);
      toast({
        title: "Content Deleted",
        description: "Homepage content has been removed."
      });
      refreshContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting the content.",
        variant: "destructive"
      });
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = content.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === content.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetItem = content[targetIndex];
    const currentItem = content[currentIndex];

    // Swap orders
    const updates = [
      { id: currentItem.id, order: targetItem.order },
      { id: targetItem.id, order: currentItem.order }
    ];

    try {
      await reorderHomepageContent(updates);
      refreshContent();
      toast({
        title: "Order Updated",
        description: "Content order has been updated."
      });
    } catch (error) {
      console.error('Error reordering content:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the content order.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setCurrentItem({
      type: 'featured',
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      order: 0
    });
    setIsEditing(false);
  };

  const handleVideoSelect = (videoId: string) => {
    const selectedVideo = videos.find(v => v.id === videoId);
    if (selectedVideo) {
      setCurrentItem({
        ...currentItem,
        url: videoId,
        title: currentItem.title || selectedVideo.title,
        thumbnail: currentItem.thumbnail || selectedVideo.thumbnail || ''
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Add/Edit Form */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Content' : 'Add Homepage Content'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update existing homepage content' 
                : 'Add new content to display on the homepage'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select 
                  value={currentItem.type}
                  onValueChange={(value: 'featured' | 'video' | 'image') => 
                    setCurrentItem({ ...currentItem, type: value })
                  }
                >
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured Content</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentTitle">Title</Label>
                <Input
                  id="contentTitle"
                  value={currentItem.title || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentDescription">Description (Optional)</Label>
                <Textarea
                  id="contentDescription"
                  value={currentItem.description || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              {currentItem.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="videoSelect">Select Video</Label>
                  <Select
                    value={currentItem.url || ''}
                    onValueChange={handleVideoSelect}
                  >
                    <SelectTrigger id="videoSelect">
                      <SelectValue placeholder="Select a video" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos.map(video => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentItem.type !== 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="contentUrl">
                    {currentItem.type === 'image' ? 'Image URL' : 'Content URL'}
                  </Label>
                  <Input
                    id="contentUrl"
                    value={currentItem.url || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
                    placeholder={currentItem.type === 'image' 
                      ? "https://example.com/image.jpg" 
                      : "Enter URL"
                    }
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={currentItem.thumbnail || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, thumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  {currentItem.type === 'image' 
                    ? 'Optional. Leave empty to use the image itself as thumbnail.' 
                    : 'Preview image for this content'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {isEditing ? 'Update' : 'Add Content'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Homepage Content</h2>
        
        {content.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No homepage content available</p>
            <p className="text-sm text-gray-400">Add your first content using the form</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.type === 'video' ? (
                          <Play size={16} className="text-blue-600" />
                        ) : item.type === 'image' ? (
                          <ImageIcon size={16} className="text-green-600" />
                        ) : (
                          <div className="bg-amber-100 text-amber-800 text-xs rounded-full px-2 py-1">
                            Featured
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium truncate max-w-[200px]">
                          {item.title}
                        </div>
                        {item.thumbnail && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {item.thumbnail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMove(item.id, 'up')}
                          disabled={content.indexOf(item) === 0}
                        >
                          <ArrowUp size={16} />
                        </Button>
                        <span className="w-6 text-center">{item.order}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMove(item.id, 'down')}
                          disabled={content.indexOf(item) === content.length - 1}
                        >
                          <ArrowDown size={16} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <PencilLine size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomepageContentTab;
