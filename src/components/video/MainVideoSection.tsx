
import React, { useState, useEffect, useRef } from "react";
import { Video } from "@/models/Video";
import { Ad } from "@/models/Ad";
import VideoInfo from "./VideoInfo";
import AdsSection from "./AdsSection";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInVideoAd, setShowInVideoAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const adIntervalRef = useRef<number | null>(null);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle ad rotation and display timing
  useEffect(() => {
    if (inVideoAds.length === 0) return;

    // Function to show next ad
    const showNextAd = () => {
      setShowInVideoAd(true);
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % inVideoAds.length);
      
      // Auto-hide ad after 15 seconds if not dismissed
      setTimeout(() => {
        setShowInVideoAd(false);
      }, 15000);
    };

    // Start timer when video is playing
    const startAdTimer = () => {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
      }
      
      // Show ads every 10 seconds
      adIntervalRef.current = window.setInterval(() => {
        showNextAd();
      }, 10000);
    };

    // Clear timer when video is paused
    const pauseAdTimer = () => {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
        adIntervalRef.current = null;
      }
    };

    // Add event listeners to the video element
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('play', startAdTimer);
      videoElement.addEventListener('pause', pauseAdTimer);
      videoElement.addEventListener('ended', pauseAdTimer);
    }

    // Cleanup
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', startAdTimer);
        videoElement.removeEventListener('pause', pauseAdTimer);
        videoElement.removeEventListener('ended', pauseAdTimer);
      }
      
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
      }
    };
  }, [inVideoAds]);

  // Dismiss the ad
  const dismissAd = () => {
    setShowInVideoAd(false);
  };

  return (
    <main className="flex-grow space-y-6">
      {/* Video container */}
      <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
        <video
          ref={videoRef}
          src={video.url}
          poster={video.thumbnail}
          controls
          className="w-full h-full object-contain"
        />
        
        {/* In-video ads section with close button */}
        {showInVideoAd && inVideoAds.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="relative max-w-md w-full pointer-events-auto">
              <Button 
                onClick={dismissAd}
                variant="secondary"
                size="icon"
                className="absolute -top-2 -right-2 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-1 shadow-lg z-20 border border-gray-200 dark:border-gray-700"
                aria-label="Close advertisement"
              >
                <X size={16} className="text-gray-700 dark:text-gray-200" />
              </Button>
              <AdsSection 
                ads={[inVideoAds[currentAdIndex]]} 
                className="in-video-ad-container" 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Video info section */}
      <VideoInfo 
        video={video}
        isExpanded={isExpanded}
        toggleExpanded={toggleExpanded}
      />
      
      {/* Bottom ads section (if any) */}
      {bottomAds.length > 0 && (
        <div className="mt-8">
          <AdsSection ads={bottomAds} />
        </div>
      )}
    </main>
  );
};

export default MainVideoSection;
