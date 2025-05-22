
import React from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from './VideoInfo';
import AdsSection from './AdsSection';
import { Video } from '@/models/Video';
import { Ad } from '@/models/Ad';

interface MainVideoSectionProps {
  video: Video;
  inVideoAds: Ad[];
  bottomAds: Ad[];
}

const MainVideoSection: React.FC<MainVideoSectionProps> = ({ 
  video, 
  inVideoAds, 
  bottomAds 
}) => {
  return (
    <div className="w-full lg:w-8/12 flex-shrink-0 space-y-6 md:space-y-8">
      {/* In-video ads above player */}
      {inVideoAds.length > 0 && (
        <div className="bg-card p-4 rounded-xl shadow-card">
           <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider text-center">Advertisement</h3>
          <AdsSection ads={inVideoAds} className="grid grid-cols-1 gap-3" />
        </div>
      )}
      
      {/* Video player */}
      <div className="bg-video-background rounded-xl shadow-2xl overflow-hidden border-2 border-gray-800 dark:border-black sticky top-4 aspect-video"> {/* Ensured aspect ratio for player container */}
        <VideoPlayer src={video.url} title={video.title} />
      </div>
      
      {/* Video info */}
      <VideoInfo video={video} />
      
      {/* Bottom ads */}
      {bottomAds.length > 0 && (
         <div className="bg-card p-4 rounded-xl shadow-card mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider text-center">Advertisement</h3>
          <AdsSection ads={bottomAds} className="grid grid-cols-1 sm:grid-cols-2 gap-4" />
        </div>
      )}
    </div>
  );
};

export default MainVideoSection;
