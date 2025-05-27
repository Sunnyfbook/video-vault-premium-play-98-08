
import React, { useEffect, useRef } from "react";
import { HomepageContent } from "@/hooks/useHomepageContent";

interface CarouselVideoItemProps {
  item: HomepageContent;
  isActive: boolean;
  videoRef?: (el: HTMLVideoElement | null) => void;
}

const CarouselVideoItem: React.FC<CarouselVideoItemProps> = ({ item, isActive, videoRef }) => {
  return (
    <video
      ref={videoRef}
      src={item.url}
      poster={item.thumbnail || undefined}
      className="w-full h-full object-cover"
      loop
      playsInline
      muted
      controls={false}
      preload={isActive ? "auto" : "none"}
      style={{
        background: "#111",
        opacity: isActive ? 1 : 0.7,
        transition: "opacity 0.2s",
      }}
    />
  );
};

export default CarouselVideoItem;
