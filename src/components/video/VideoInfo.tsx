
import React from 'react';
import { Video } from '@/models/Video';
import { Eye, CalendarDays, Copy, Share2, CheckCircle } from 'lucide-react'; // Added CheckCircle
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
      variant: "default",
    });
    
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-xl shadow-card">
      <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 text-foreground">{video.title}</h1>
      <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-6 gap-x-5 gap-y-2">
        <div className="flex items-center">
          <CalendarDays size={18} className="mr-2 text-primary" />
          <span>Published on {new Date(video.date_added).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          <Eye size={18} className="mr-2 text-primary" />
          <span>{video.views.toLocaleString()} views</span>
        </div>
      </div>
      {video.description && (
        <div className="prose prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed mb-8">
          <p>{video.description}</p>
        </div>
      )}
      
      <div className="mt-6 border-t border-border pt-6 flex flex-col sm:flex-row items-center gap-4">
        <Button 
          variant={copied ? "default" : "primary"}
          size="lg"
          className={`w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300 ease-in-out
                      ${copied ? 'bg-green-500 hover:bg-green-600 text-white' 
                               : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
          onClick={copyCurrentLink}
        >
          {copied ? (
            <>
              <CheckCircle size={20} className="mr-2" /> Link Copied!
            </>
            ) : (
            <>
              <Share2 size={20} className="mr-2" /> Share Video
            </>
          )}
        </Button>
        {/* Placeholder for other actions if needed */}
      </div>
    </div>
  );
};

export default VideoInfo;
