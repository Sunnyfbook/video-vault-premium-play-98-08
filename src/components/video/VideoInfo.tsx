
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, ThumbsUp, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Video } from '@/models/Video';

interface VideoInfoProps {
  video: Video;
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video, isExpanded, toggleExpanded }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Truncate description if not expanded and longer than 120 characters
  const shouldTruncate = !isExpanded && video.description && video.description.length > 120;
  const displayDescription = shouldTruncate
    ? video.description.slice(0, 120) + '...'
    : video.description;
    
  return (
    <Card className="shadow-sm bg-card">
      <CardContent className="p-4 pt-5">
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-foreground">{video.title}</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-y-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <span>{video.views} views</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
            <span>{formatDate(video.date_added)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" /> Like
            </Button>
            
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Video description */}
        {video.description && (
          <div className="relative text-sm text-muted-foreground">
            <p className="whitespace-pre-line">{displayDescription}</p>
            
            {video.description.length > 120 && (
              <Button
                variant="ghost" 
                size="sm" 
                className="mt-1 flex items-center gap-1 font-medium px-2 py-0.5"
                onClick={toggleExpanded}
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoInfo;
