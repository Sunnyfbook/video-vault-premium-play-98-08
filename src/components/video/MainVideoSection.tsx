
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
  videoTopAds?: Ad[];
  videoMiddleAds?: Ad[];
  videoBottomAds?: Ad[];
  videoLeftAds?: Ad[];
  videoRightAds?: Ad[];
}

const MainVideoSection: React.FC<MainVideoSectionProps> = ({ 
  video, 
  inVideoAds, 
  bottomAds,
  belowVideoAds = [],
  afterVideoAds = [],
  videoTopAds = [],
  videoMiddleAds = [],
  videoBottomAds = [],
  videoLeftAds = [],
  videoRightAds = []
}) => {
  const [showInVideoAd, setShowInVideoAd] = useState(false);
  const [adTimer, setAdTimer] = useState<NodeJS.Timeout | null>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inVideoAds.length === 0) return;

    const showAdInterval = setInterval(() => {
      console.log('Displaying in-video ad');
      setShowInVideoAd(true);
      
      // Set auto-close timer for 10 seconds
      const timer = setTimeout(() => {
        console.log('Auto-closing in-video ad after 10 seconds');
        setShowInVideoAd(false);
      }, 10000);
      
      setAdTimer(timer);
    }, 10000);

    return () => {
      clearInterval(showAdInterval);
      if (adTimer) {
        clearTimeout(adTimer);
      }
    };
  }, [inVideoAds, adTimer]);

  const handleCloseInVideoAd = () => {
    console.log('User manually closed in-video ad');
    setShowInVideoAd(false);
    if (adTimer) {
      clearTimeout(adTimer);
      setAdTimer(null);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Video Top Ads */}
      {videoTopAds.length > 0 && (
        <div className="video-top-ads-container">
          <AdsSection 
            ads={videoTopAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={0.5}
            positionClass="video-top-ads-section" 
          />
        </div>
      )}

      <div className="flex gap-4">
        {/* Video Left Ads */}
        {videoLeftAds.length > 0 && (
          <div className="video-left-ads-container hidden lg:block">
            <AdsSection 
              ads={videoLeftAds} 
              className="w-full" 
              staggerDelay={true} 
              baseDelaySeconds={1}
              positionClass="video-left-ads-section" 
            />
          </div>
        )}

        <div className="flex-1">
          <div ref={videoPlayerRef} className="relative">
            <VideoPlayer 
              src={video.url} 
              title={video.title}
              disableClickToToggle={showInVideoAd}
              inVideoAds={inVideoAds}
              showInVideoAd={showInVideoAd}
              onCloseInVideoAd={handleCloseInVideoAd}
            />
          </div>

          {/* Video Middle Ads */}
          {videoMiddleAds.length > 0 && (
            <div className="video-middle-ads-container mt-4">
              <AdsSection 
                ads={videoMiddleAds} 
                className="w-full" 
                staggerDelay={true} 
                baseDelaySeconds={1.5}
                positionClass="video-middle-ads-section" 
              />
            </div>
          )}
        </div>

        {/* Video Right Ads */}
        {videoRightAds.length > 0 && (
          <div className="video-right-ads-container hidden lg:block">
            <AdsSection 
              ads={videoRightAds} 
              className="w-full" 
              staggerDelay={true} 
              baseDelaySeconds={1.2}
              positionClass="video-right-ads-section" 
            />
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

      {/* Video Bottom Ads */}
      {videoBottomAds.length > 0 && (
        <div className="video-bottom-ads-container">
          <AdsSection 
            ads={videoBottomAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={2.5}
            positionClass="video-bottom-ads-section" 
          />
        </div>
      )}
      
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
