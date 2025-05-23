
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
  const [adDisplayTimeoutId, setAdDisplayTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [currentInVideoAdIndex, setCurrentInVideoAdIndex] = useState(0);
  
  useEffect(() => {
    // Show in-video ad after the specified time and repeat every adTimingSeconds
    const adTimingSeconds = video.ad_timing_seconds || 10;
    
    const showAdInterval = setInterval(() => {
      if (inVideoAds.length > 0) {
        console.log('Displaying in-video ad');
        setShowInVideoAd(true);
        
        // Rotate through available in-video ads
        setCurrentInVideoAdIndex(prevIndex => 
          prevIndex >= inVideoAds.length - 1 ? 0 : prevIndex + 1
        );
        
        // Auto-hide after 15 seconds
        const timeoutId = setTimeout(() => {
          console.log('Auto-hiding in-video ad');
          setShowInVideoAd(false);
        }, 15000);
        
        setAdDisplayTimeoutId(timeoutId);
      }
    }, adTimingSeconds * 1000);
    
    return () => {
      clearInterval(showAdInterval);
      if (adDisplayTimeoutId) {
        clearTimeout(adDisplayTimeoutId);
      }
    };
  }, [video.ad_timing_seconds, inVideoAds]);

  useEffect(() => {
    // Log ad count for debugging
    console.log(`MainVideoSection: ${inVideoAds.length} in-video ads, ${bottomAds.length} bottom ads available`);
  }, [inVideoAds, bottomAds]);

  const handleDismissAd = () => {
    console.log('Ad manually dismissed');
    setShowInVideoAd(false);
    
    // Clear any existing timeout to prevent memory leaks
    if (adDisplayTimeoutId) {
      clearTimeout(adDisplayTimeoutId);
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
                ads={[inVideoAds[currentInVideoAdIndex]]} 
                className="in-video-ad shadow-xl"
                staggerDelay={false}
                baseDelaySeconds={0}
                positionClass="in-video-ads-section"
              />
            </div>
          </div>
        )}
      </div>
      
      <VideoInfo video={video} />
      
      {/* Bottom ads - EXACT same implementation as homepage */}
      {bottomAds.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider text-center">Advertisement</h4>
          <AdsSection 
            ads={bottomAds} 
            className="grid grid-cols-1 gap-4"
            staggerDelay={true}
            baseDelaySeconds={2}
            positionClass="bottom-ads-section"
          />
        </div>
      )}
    </div>
  );
};

export default MainVideoSection;
