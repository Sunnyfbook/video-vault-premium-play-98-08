
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
    
    // Clear any existing intervals on new load
    if (adIntervalId.current) {
      clearInterval(adIntervalId.current);
      adIntervalId.current = null;
    }
    
    if (adDisplayTimeoutId.current) {
      clearTimeout(adDisplayTimeoutId.current);
      adDisplayTimeoutId.current = null;
    }
    
    // Set up new interval for displaying ads if we have ads to display
    if (inVideoAds.length > 0) {
      console.log(`Setting up ad interval every ${adTimingSeconds} seconds`);
      
      // Set a short delay before showing the first ad
      setTimeout(() => {
        console.log('Showing first in-video ad');
        setShowInVideoAd(true);
        
        // Auto-hide after 15 seconds
        adDisplayTimeoutId.current = setTimeout(() => {
          console.log('Auto-hiding in-video ad');
          setShowInVideoAd(false);
          adDisplayTimeoutId.current = null;
        }, 15000);
      }, 3000); // Show first ad after 3 seconds
      
      // Then set up the regular interval
      adIntervalId.current = setInterval(() => {
        if (inVideoAds.length > 0) {
          console.log('Displaying periodic in-video ad');
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
    }
    
    return () => {
      // Clean up on unmount
      console.log('Cleaning up ad timers');
      if (adIntervalId.current) {
        clearInterval(adIntervalId.current);
        adIntervalId.current = null;
      }
      if (adDisplayTimeoutId.current) {
        clearTimeout(adDisplayTimeoutId.current);
        adDisplayTimeoutId.current = null;
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
            <div className="in-video-ad-container bg-white dark:bg-gray-800 rounded-lg p-4 shadow-2xl max-w-md">
              <button 
                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center z-50"
                onClick={handleDismissAd}
                aria-label="Close ad"
              >
                ✕
              </button>
              <AdsSection 
                ads={inVideoAds.slice(0, 1)} 
                className="in-video-ad"
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
