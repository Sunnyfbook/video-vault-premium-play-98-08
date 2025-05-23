
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
  const [downloadUrl, setDownloadUrl] = useState('https://www.profitableratecpm.com/f3q79p604b?key=85d2abaa690441f1f256ac2e30814b92');
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

  const handleDownload = () => {
    const isFirstClick = downloadClickCount % 2 === 0;
    
    if (isFirstClick) {
      // First click - open the configured URL
      window.open(downloadUrl, '_blank');
      toast({
        title: "Redirected to download page",
        description: "Click the download button again to download the video directly.",
      });
    } else {
      // Second click - start video download
      // Get the file extension to determine how to handle the download
      const fileExtension = videoSrc.split('.').pop()?.toLowerCase();
      
      // For streaming formats like m3u8, we can't direct download
      if (fileExtension === 'm3u8') {
        toast({
          title: "Streaming Format",
          description: "This video format (HLS) cannot be downloaded directly. Please use a browser extension or specialized downloader.",
          variant: "destructive",
        });
        return;
      }
      
      // For standard formats, proceed with download
      const link = document.createElement('a');
      link.href = videoSrc;
      link.download = videoTitle || 'video';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your video download has begun.",
      });
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
      {downloadClickCount % 2 === 0 ? "Download" : "Download"}
    </Button>
  );
};

export default DownloadButton;
