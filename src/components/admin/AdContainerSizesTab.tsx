
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAdContainerSizes } from '@/hooks/useAdContainerSizes';
import { updateAdContainerSizes } from '@/models/AdContainerSizes';

const AdContainerSizesTab: React.FC = () => {
  const { sizes, loading } = useAdContainerSizes();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    in_video_width: 320,
    in_video_height: 50,
    top_width: 320,
    top_height: 50,
    below_video_width: 320,
    below_video_height: 50,
    bottom_width: 300,
    bottom_height: 250,
    sidebar_width: 300,
    sidebar_height: 250,
  });

  React.useEffect(() => {
    if (sizes) {
      setFormData({
        in_video_width: sizes.in_video_width,
        in_video_height: sizes.in_video_height,
        top_width: sizes.top_width,
        top_height: sizes.top_height,
        below_video_width: sizes.below_video_width,
        below_video_height: sizes.below_video_height,
        bottom_width: sizes.bottom_width,
        bottom_height: sizes.bottom_height,
        sidebar_width: sizes.sidebar_width,
        sidebar_height: sizes.sidebar_height,
      });
    }
  }, [sizes]);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateAdContainerSizes(formData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Ad container sizes updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update ad container sizes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating ad container sizes:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating ad container sizes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ad Container Sizes</h2>
        <p className="text-gray-600">Configure the dimensions for different ad positions</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Ad Positions</CardTitle>
            <CardDescription>Configure sizes for ads displayed with videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="in_video_width">In-Video Width (px)</Label>
                <Input
                  id="in_video_width"
                  type="number"
                  value={formData.in_video_width}
                  onChange={handleInputChange('in_video_width')}
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="in_video_height">In-Video Height (px)</Label>
                <Input
                  id="in_video_height"
                  type="number"
                  value={formData.in_video_height}
                  onChange={handleInputChange('in_video_height')}
                  min="30"
                  max="500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="top_width">Top Width (px)</Label>
                <Input
                  id="top_width"
                  type="number"
                  value={formData.top_width}
                  onChange={handleInputChange('top_width')}
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="top_height">Top Height (px)</Label>
                <Input
                  id="top_height"
                  type="number"
                  value={formData.top_height}
                  onChange={handleInputChange('top_height')}
                  min="30"
                  max="500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="below_video_width">Below Video Width (px)</Label>
                <Input
                  id="below_video_width"
                  type="number"
                  value={formData.below_video_width}
                  onChange={handleInputChange('below_video_width')}
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="below_video_height">Below Video Height (px)</Label>
                <Input
                  id="below_video_height"
                  type="number"
                  value={formData.below_video_height}
                  onChange={handleInputChange('below_video_height')}
                  min="30"
                  max="500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Ad Positions</CardTitle>
            <CardDescription>Configure sizes for ads displayed on the page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bottom_width">Bottom Width (px)</Label>
                <Input
                  id="bottom_width"
                  type="number"
                  value={formData.bottom_width}
                  onChange={handleInputChange('bottom_width')}
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="bottom_height">Bottom Height (px)</Label>
                <Input
                  id="bottom_height"
                  type="number"
                  value={formData.bottom_height}
                  onChange={handleInputChange('bottom_height')}
                  min="30"
                  max="500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sidebar_width">Sidebar Width (px)</Label>
                <Input
                  id="sidebar_width"
                  type="number"
                  value={formData.sidebar_width}
                  onChange={handleInputChange('sidebar_width')}
                  min="50"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="sidebar_height">Sidebar Height (px)</Label>
                <Input
                  id="sidebar_height"
                  type="number"
                  value={formData.sidebar_height}
                  onChange={handleInputChange('sidebar_height')}
                  min="30"
                  max="500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdContainerSizesTab;
