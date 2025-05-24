
import React from 'react';
import { Video } from '@/models/Video';
import { formatDistanceToNow } from 'date-fns';
import ReactionSection from './ReactionSection';
import CommentSection from './CommentSection';
import DownloadButton from './DownloadButton';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VideoInfoProps {
  video: Video;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const { toast } = useToast();
  
  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Video link copied to clipboard!",
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="professional-card">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">{video.title}</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-500 text-sm mb-4 gap-2 sm:gap-0">
          <div className="text-responsive">
            <span>{video.views} views</span>
            <span className="mx-2">•</span>
            <span>
              {formatDistanceToNow(new Date(video.date_added), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <DownloadButton videoSrc={video.url} videoTitle={video.title} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShareClick}
              className="text-primary hover:bg-primary/10 touch-button text-responsive"
            >
              <Share2 size={16} className="mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      <ReactionSection videoId={video.id} />
      
      {video.description && (
        <div className="professional-card">
          <p className="whitespace-pre-line text-responsive leading-relaxed">{video.description}</p>
        </div>
      )}
      
      <div className="professional-card">
        <CommentSection videoId={video.id} />
      </div>
    </div>
  );
};

export default VideoInfo;
