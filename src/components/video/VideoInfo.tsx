
import React from 'react';
import { Video } from '@/models/Video';
import { Eye, CalendarDays, Copy, Share2 } from 'lucide-react'; // Added Eye, CalendarDays, Share2
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
      title: "Link Copied!",
      description: "The video link has been copied to your clipboard.",
      variant: "default", // Changed from no variant for better visibility
    });
    
    setTimeout(() => setCopied(false), 3000); // Increased timeout
  };

  return (
    <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">{video.title}</h1>
      <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-5 gap-x-4 gap-y-2">
        <div className="flex items-center">
          <CalendarDays size={16} className="mr-1.5 text-gray-400 dark:text-gray-500" />
          <span>{new Date(video.date_added).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          <Eye size={16} className="mr-1.5 text-gray-400 dark:text-gray-500" />
          <span>{video.views.toLocaleString()} views</span>
        </div>
      </div>
      {video.description && (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 prose prose-sm dark:prose-invert max-w-full">
          {video.description}
        </p>
      )}
      
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <Button 
          variant="default" // Changed to default for more prominence
          className="bg-brand hover:bg-brand/90 dark:bg-brand-accent dark:hover:bg-brand-accent/90 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow" 
          onClick={copyCurrentLink}
        >
          {copied ? (
            <>
              <Copy size={18} className="mr-1" /> Link Copied!
            </>
            ) : (
            <>
              <Share2 size={18} className="mr-1" /> Share Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
