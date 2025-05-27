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
import InstagramEmbed from "@/components/InstagramEmbed";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileCharacterCarousel from "@/components/MobileCharacterCarousel";

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
    
    // Set different intervals based on content type
    const interval = type === "video" ? 5000 : 2000; // 5s for video, 2s for image
    
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

  // Handle carousel initialization and slide change
  const handleCarouselCreated = (emblaApi) => {
    setEmbla(emblaApi);
    
    const onSelect = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(currentIndex);
      
      // Pause all videos
      videoRefs.current.forEach((video, i) => {
        if (video) {
          if (i === currentIndex) {
            // Play the center video
            video.play().catch(err => console.log('Autoplay was prevented'));
          } else {
            // Pause other videos
            video.pause();
          }
        }
      });

      // Restart auto-swipe timer when slide changes
      startAutoSwipe();
    };

    emblaApi.on('select', onSelect);
    // Initial call to set the first video playing and start auto-swipe
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

  // Clean up auto-swipe on unmount
  useEffect(() => {
    return () => {
      stopAutoSwipe();
    };
  }, []);

  // Pause auto-swipe on mouse enter, resume on mouse leave
  const handleMouseEnter = () => {
    stopAutoSwipe();
  };

  const handleMouseLeave = () => {
    startAutoSwipe();
  };

  const renderContent = (item: HomepageContent, index: number) => {
    if (item.type === "instagram") {
      return (
        <InstagramEmbed 
          url={item.url}
          title={item.title || "Instagram content"} 
          className="w-full h-full"
        />
      );
    } else if (item.type === "video") {
      // Only preload/play the active video
      const isActive = activeIndex === index;
      return (
        <video
          ref={el => {
            if (el) videoRefs.current[index] = el;
          }}
          src={item.url}
          poster={item.thumbnail || undefined}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted
          controls={false}
          preload={isActive ? "auto" : "none"}
          style={{
            background: "#111", // Keep a dark background before video loads
            opacity: isActive ? 1 : 0.7,
            transition: "opacity 0.2s"
          }}
        />
      );
    } else {
      return (
        <img
          src={item.url}
          alt={item.title || "Featured image"}
          className="w-full h-full object-cover bg-gray-200 transition-opacity"
          loading="lazy"
          style={{
            background: "linear-gradient(90deg,#e5e7eb,#f3f4f6)",
            objectFit: "cover"
          }}
        />
      );
    }
  };

  // Apply custom style for container from config
  const containerStyle = {
    maxWidth: containerMaxWidth,
    aspectRatio: containerAspectRatio,
    width: '100%' // Make sure it takes full available width up to max width
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
        
        {/* Always visible navigation arrows, more visible on hover */}
        <CarouselPrevious className="opacity-70 md:opacity-70 hover:opacity-100 transition-opacity duration-300" />
        <CarouselNext className="opacity-70 md:opacity-70 hover:opacity-100 transition-opacity duration-300" />
      </Carousel>
      
      {/* Dots indicator at the bottom */}
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
