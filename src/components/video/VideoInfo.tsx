
import React from 'react';
import { Video } from '@/models/Video';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VideoInfoProps {
  video: Video;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyCurrentLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Video link copied to clipboard!",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-1">{video.title}</h1>
      <div className="flex text-sm text-gray-500 mb-4">
        <span>{new Date(video.dateAdded).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span>{video.views} views</span>
      </div>
      <p className="text-gray-700">{video.description}</p>
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={copyCurrentLink}
        >
          {copied ? 'Copied!' : 'Share Video'}
          <Copy size={16} />
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
