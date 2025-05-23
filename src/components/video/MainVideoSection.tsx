
import React, { useState, useEffect, useRef } from 'react';
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
  const adDisplayTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const adIntervalId = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Show in-video ad after the specified time and repeat every adTimingSeconds
    const adTimingSeconds = video.ad_timing_seconds || 10;
    
    // Clear any existing intervals
    if (adIntervalId.current) {
      clearInterval(adIntervalId.current);
    }
    
    // Set up new interval for displaying ads
    adIntervalId.current = setInterval(() => {
      if (inVideoAds.length > 0) {
        console.log('Displaying in-video ad');
        setShowInVideoAd(true);
        
        // Clear any existing timeout
        if (adDisplayTimeoutId.current) {
          clearTimeout(adDisplayTimeoutId.current);
        }
        
        // Auto-hide after 15 seconds
        adDisplayTimeoutId.current = setTimeout(() => {
          console.log('Auto-hiding in-video ad');
          setShowInVideoAd(false);
          adDisplayTimeoutId.current = null;
        }, 15000);
      }
    }, adTimingSeconds * 1000);
    
    return () => {
      // Clean up on unmount
      if (adIntervalId.current) {
        clearInterval(adIntervalId.current);
      }
      if (adDisplayTimeoutId.current) {
        clearTimeout(adDisplayTimeoutId.current);
      }
    };
  }, [video.ad_timing_seconds, inVideoAds]);

  const handleDismissAd = () => {
    console.log('Ad manually dismissed');
    setShowInVideoAd(false);
    
    // Clear any existing timeout
    if (adDisplayTimeoutId.current) {
      clearTimeout(adDisplayTimeoutId.current);
      adDisplayTimeoutId.current = null;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="relative">
        <VideoPlayer src={video.url} title={video.title} disableClickToToggle={true} />
        
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
