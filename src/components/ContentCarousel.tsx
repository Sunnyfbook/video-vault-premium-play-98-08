
import React, { useState, useRef, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { HomepageContent } from "@/hooks/useHomepageContent";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileCharacterCarousel from "@/components/MobileCharacterCarousel";
import CarouselVideoItem from "@/components/carousel/CarouselVideoItem";
import CarouselImageItem from "@/components/carousel/CarouselImageItem";
import CarouselInstagramItem from "@/components/carousel/CarouselInstagramItem";

interface ContentCarouselProps {
  items: HomepageContent[];
  type: "video" | "image";
  showMobileCharacterView?: boolean;
  onCharacterSelect?: (item: HomepageContent) => void;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ 
  items, 
  type, 
  showMobileCharacterView = false,
  onCharacterSelect 
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const { config } = useHomepageConfig();
  const [embla, setEmbla] = useState<any>(null);
  const isMobile = useIsMobile();
  const autoSwipeRef = useRef<NodeJS.Timeout | null>(null);
  
  // Show mobile character carousel if requested and on mobile
  if (showMobileCharacterView && isMobile) {
    return (
      <MobileCharacterCarousel 
        items={items} 
        onSelect={onCharacterSelect}
        title="Choose favourite Character"
      />
    );
  }

  // Default size values, with fallbacks if config values are missing
  const containerMaxWidth = config?.container_max_width || '280px';
  const containerAspectRatio = config?.container_aspect_ratio || '9/16';

  // Setup video refs
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, items.length);
  }, [items]);

  // Auto-swipe functionality
  const startAutoSwipe = () => {
    if (autoSwipeRef.current) {
      clearTimeout(autoSwipeRef.current);
    }
    const interval = type === "video" ? 5000 : 2000;
    autoSwipeRef.current = setTimeout(() => {
      if (embla) {
        embla.scrollNext();
      }
    }, interval);
  };

  const stopAutoSwipe = () => {
    if (autoSwipeRef.current) {
      clearTimeout(autoSwipeRef.current);
      autoSwipeRef.current = null;
    }
  };

  const handleCarouselCreated = (emblaApi) => {
    setEmbla(emblaApi);
    const onSelect = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(currentIndex);
      // Pause all videos
      videoRefs.current.forEach((video, i) => {
        if (video) {
          if (i === currentIndex) {
            video.play().catch(err => console.log('Autoplay was prevented'));
          } else {
            video.pause();
          }
        }
      });
      startAutoSwipe();
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  };

  useEffect(() => {
    if (!embla) return;
    const cleanup = handleCarouselCreated(embla);
    return cleanup;
  }, [embla, items, type]);

  useEffect(() => {
    return () => {
      stopAutoSwipe();
    };
  }, []);

  const handleMouseEnter = () => { stopAutoSwipe(); };
  const handleMouseLeave = () => { startAutoSwipe(); };

  // New renderContent using split-out components
  const renderContent = (item: HomepageContent, index: number) => {
    if (item.type === "instagram") {
      return <CarouselInstagramItem item={item} />;
    } else if (item.type === "video") {
      const isActive = activeIndex === index;
      return (
        <CarouselVideoItem 
          item={item} 
          isActive={isActive} 
          videoRef={el => { if (el) videoRefs.current[index] = el; }}
        />
      );
    } else {
      return <CarouselImageItem item={item} />;
    }
  };

  const containerStyle = {
    maxWidth: containerMaxWidth,
    aspectRatio: containerAspectRatio,
    width: '100%'
  };

  const onCarouselCreated = React.useCallback((api) => {
    setEmbla(api);
  }, []);

  return (
    <div 
      className="relative group" 
      ref={carouselRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        opts={{
          loop: true,
          align: "center",
          skipSnaps: false,
          containScroll: "keepSnaps"
        }}
        className="w-full"
        onCreated={onCarouselCreated}
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem 
              key={item.id} 
              className={`basis-full md:basis-auto flex justify-center transition-all duration-300 ${
                activeIndex === index 
                  ? "opacity-100 scale-100" 
                  : "opacity-80 scale-95"
              }`}
            >
              <Card className="rounded-xl overflow-hidden shadow-lg border-0 w-auto">
                <div 
                  className="bg-black overflow-hidden" 
                  style={containerStyle}
                >
                  {renderContent(item, index)}
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="opacity-70 md:opacity-70 hover:opacity-100 transition-opacity duration-300" />
        <CarouselNext className="opacity-70 md:opacity-70 hover:opacity-100 transition-opacity duration-300" />
      </Carousel>
      {items.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeIndex === index 
                  ? "bg-primary scale-125" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              onClick={() => embla?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
