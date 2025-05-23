
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDownloadConfig } from '@/models/DownloadConfig';
import { useToast } from '@/hooks/use-toast';

interface DownloadButtonProps {
  videoSrc: string;
  videoTitle: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ videoSrc, videoTitle }) => {
  const [downloadClickCount, setDownloadClickCount] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('https://example.com/download-page');
  const { toast } = useToast();

  useEffect(() => {
    const loadDownloadConfig = async () => {
      const config = await getDownloadConfig();
      if (config) {
        setDownloadUrl(config.download_url);
      }
    };

    loadDownloadConfig();
  }, []);

  const handleDownload = async () => {
    const isFirstClick = downloadClickCount % 2 === 0;
    
    if (isFirstClick) {
      // First click - open the configured URL
      window.open(downloadUrl, '_blank');
      toast({
        title: "Redirected to download page",
        description: "Click the download button again to download the video directly.",
      });
    } else {
      // Second click - start video download directly
      try {
        const response = await fetch(videoSrc);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${videoTitle || 'video'}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Your video download has begun.",
        });
      } catch (error) {
        console.error('Download failed:', error);
        toast({
          title: "Download Failed",
          description: "Could not download the video. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    setDownloadClickCount(count => count + 1);
  };

  return (
    <Button 
      onClick={handleDownload} 
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download size={16} />
      Download
    </Button>
  );
};

export default DownloadButton;
