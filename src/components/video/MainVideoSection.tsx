
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
    <div className="w-full lg:w-8/12 flex-shrink-0"> {/* Added flex-shrink-0 */}
      {/* In-video ads above player */}
      {inVideoAds.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg mb-4">
           <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider text-center">Advertisement</h3>
          <AdsSection ads={inVideoAds} />
        </div>
      )}
      
      {/* Video player */}
      <div className="bg-black rounded-xl shadow-2xl overflow-hidden border-4 border-gray-900 dark:border-black sticky top-4"> {/* Enhanced styling */}
        <VideoPlayer src={video.url} title={video.title} />
      </div>
      
      {/* Video info */}
      <VideoInfo video={video} />
      
      {/* Bottom ads */}
      {bottomAds.length > 0 && (
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg mt-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider text-center">Advertisement</h3>
          <AdsSection ads={bottomAds} className="grid grid-cols-1 sm:grid-cols-2 gap-4" />
        </div>
      )}
    </div>
  );
};

export default MainVideoSection;
