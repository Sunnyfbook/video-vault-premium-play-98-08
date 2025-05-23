
import React, { useState, useEffect } from 'react';
import { Video } from '@/models/Video';
import { Ad } from '@/models/Ad';
import VideoPlayer from '@/components/VideoPlayer';
import AdsSection from './AdsSection';
import VideoInfo from './VideoInfo';

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
  const [showInVideoAd, setShowInVideoAd] = useState(false);
  
  useEffect(() => {
    // Show in-video ad after the specified time
    const adTimingSeconds = video.ad_timing_seconds || 10;
    
    const timer = setTimeout(() => {
      if (inVideoAds.length > 0) {
        setShowInVideoAd(true);
        
        // Auto-hide after 15 seconds
        const hideTimer = setTimeout(() => {
          setShowInVideoAd(false);
        }, 15000);
        
        return () => clearTimeout(hideTimer);
      }
    }, adTimingSeconds * 1000);
    
    return () => clearTimeout(timer);
  }, [video.ad_timing_seconds, inVideoAds]);

  const handleDismissAd = () => {
    setShowInVideoAd(false);
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="relative">
        <VideoPlayer src={video.url} title={video.title} />
        
        {/* In-video ad overlay - centered in the player */}
        {showInVideoAd && inVideoAds.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center animate-fade-in z-50">
            <div className="in-video-ad-container">
              <button 
                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center z-50"
                onClick={handleDismissAd}
              >
                ✕
              </button>
              <AdsSection 
                ads={inVideoAds.slice(0, 1)} 
                className="in-video-ad shadow-xl"
              />
            </div>
          </div>
        )}
      </div>
      
      <VideoInfo video={video} />
      
      {bottomAds.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <AdsSection ads={bottomAds} />
        </div>
      )}
    </div>
  );
};

export default MainVideoSection;
