
import React, { useState } from "react";
import { Video } from "@/models/Video";
import { Ad } from "@/models/Ad";
import VideoInfo from "./VideoInfo";
import AdsSection from "./AdsSection";

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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <main className="flex-grow space-y-6">
      {/* Video container */}
      <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
        <video
          src={video.url}
          poster={video.thumbnail}
          controls
          className="w-full h-full object-contain"
        />
        
        {/* In-video ads section (if any) */}
        {inVideoAds.length > 0 && (
          <div className="absolute bottom-16 left-0 w-full px-4">
            <AdsSection ads={inVideoAds} className="max-w-md mx-auto" />
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
