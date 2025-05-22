
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
    <div className="w-full lg:w-8/12">
      {/* In-video ads above player */}
      <AdsSection ads={inVideoAds} className="mb-4" />
      
      {/* Video player */}
      <div className="bg-black rounded-lg shadow-lg overflow-hidden">
        <VideoPlayer src={video.url} title={video.title} />
      </div>
      
      {/* Video info */}
      <VideoInfo video={video} />
      
      {/* Bottom ads */}
      <AdsSection ads={bottomAds} className="mt-8 grid gap-4" />
    </div>
  );
};

export default MainVideoSection;
