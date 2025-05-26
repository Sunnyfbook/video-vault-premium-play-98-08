
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '@/models/Video';
import { Ad } from '@/models/Ad';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from './VideoInfo';
import AdsSection from './AdsSection';

interface MainVideoSectionProps {
  video: Video;
  inVideoAds: Ad[];
  bottomAds: Ad[];
  belowVideoAds?: Ad[];
  afterVideoAds?: Ad[];
}

const MainVideoSection: React.FC<MainVideoSectionProps> = ({ 
  video, 
  inVideoAds, 
  bottomAds,
  belowVideoAds = [],
  afterVideoAds = []
}) => {
  const [showInVideoAd, setShowInVideoAd] = useState(false);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inVideoAds.length === 0) return;

    const showAdInterval = setInterval(() => {
      console.log('Displaying in-video ad');
      setShowInVideoAd(true);
      
      setTimeout(() => {
        console.log('Auto-hiding in-video ad');
        setShowInVideoAd(false);
      }, 5000);
    }, 10000);

    return () => clearInterval(showAdInterval);
  }, [inVideoAds]);

  return (
    <div className="flex-1 space-y-6">
      <div ref={videoPlayerRef} className="relative">
        <VideoPlayer 
          src={video.url} 
          title={video.title}
          disableClickToToggle={showInVideoAd}
        />
        
        {/* In-video ads overlay */}
        {showInVideoAd && inVideoAds.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="in-video-ads-section pointer-events-auto">
              <AdsSection 
                ads={inVideoAds} 
                className="in-video-ad-container" 
                staggerDelay={false} 
                baseDelaySeconds={0}
                positionClass="in-video-ads-section" 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* After video ads */}
      {afterVideoAds.length > 0 && (
        <div className="after-video-ads-container">
          <AdsSection 
            ads={afterVideoAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={1.5}
            positionClass="after-video-ads-section" 
          />
        </div>
      )}
      
      <VideoInfo video={video} belowVideoAds={belowVideoAds} />
      
      {/* Bottom ads */}
      {bottomAds.length > 0 && (
        <div className="bottom-ads-container">
          <AdsSection 
            ads={bottomAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={4}
            positionClass="bottom-ads-section" 
          />
        </div>
      )}
    </div>
  );
};

export default MainVideoSection;
