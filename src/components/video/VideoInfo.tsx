
import React from 'react';
import { Video } from '@/models/Video';
import { Ad } from '@/models/Ad';
import { formatDistanceToNow } from 'date-fns';
import ReactionSection from './ReactionSection';
import CommentSection from './CommentSection';
import DownloadButton from './DownloadButton';
import AdsSection from './AdsSection';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VideoInfoProps {
  video: Video;
  belowVideoAds?: Ad[];
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video, belowVideoAds = [] }) => {
  const { toast } = useToast();
  
  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Video link copied to clipboard!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
        <div className="flex justify-between items-center text-gray-500 text-sm mb-4">
          <div>
            <span>{video.views} views</span>
            <span className="mx-2">•</span>
            <span>
              {formatDistanceToNow(new Date(video.date_added), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <DownloadButton videoSrc={video.url} videoTitle={video.title} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShareClick}
              className="text-primary hover:bg-primary/10"
            >
              <Share2 size={16} className="mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      <ReactionSection videoId={video.id} />
      
      {/* Below video ads */}
      {belowVideoAds.length > 0 && (
        <div className="below-video-ads-container">
          <AdsSection 
            ads={belowVideoAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={2}
            positionClass="below-video-ads-section" 
          />
        </div>
      )}
      
      {video.description && (
        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-md">
          <p className="whitespace-pre-line">{video.description}</p>
        </div>
      )}
      
      <div className="pt-4 border-t">
        <CommentSection videoId={video.id} />
      </div>
    </div>
  );
};

export default VideoInfo;
