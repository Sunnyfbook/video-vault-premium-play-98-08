
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getDownloadConfig, updateDownloadConfig } from '@/models/DownloadConfig';

const DownloadConfigManager: React.FC = () => {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const config = await getDownloadConfig();
        if (config) {
          setDownloadUrl(config.download_url);
        }
      } catch (error) {
        console.error('Error loading download config:', error);
        toast({
          title: "Error",
          description: "Failed to load download configuration.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [toast]);

  const handleSave = async () => {
    if (!downloadUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid download URL.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const success = await updateDownloadConfig(downloadUrl.trim());
      if (success) {
        toast({
          title: "Success",
          description: "Download URL updated successfully.",
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating download config:', error);
      toast({
        title: "Error",
        description: "Failed to update download URL.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Download Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="downloadUrl">Download Page URL</Label>
          <Input
            id="downloadUrl"
            type="url"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            placeholder="https://example.com/download-page"
          />
          <p className="text-sm text-gray-500">
            This URL will open when users click the download button for the first time.
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Download URL'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DownloadConfigManager;
