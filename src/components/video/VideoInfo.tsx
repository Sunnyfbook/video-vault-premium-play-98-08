
import React from 'react';
import { Video } from '@/models/Video';
import { formatDistanceToNow } from 'date-fns';
import ReactionSection from './ReactionSection';
import CommentSection from './CommentSection';

interface VideoInfoProps {
  video: Video;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
        <div className="flex justify-between items-center text-gray-500 text-sm">
          <div>
            <span>{video.views} views</span>
            <span className="mx-2">•</span>
            <span>
              {formatDistanceToNow(new Date(video.date_added), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
      
      <ReactionSection videoId={video.id} />
      
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
