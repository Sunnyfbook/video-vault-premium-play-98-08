
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

interface ContentCarouselProps {
  items: HomepageContent[];
  type: "video" | "image";
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ items, type }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const { config } = useHomepageConfig();
  const [embla, setEmbla] = useState<any>(null);
  
  // Responsive sizing with better mobile defaults
  const containerMaxWidth = config?.container_max_width || '320px';
  const containerAspectRatio = config?.container_aspect_ratio || '9/16';

  // Setup video refs
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, items.length);
  }, [items]);

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
    };

    emblaApi.on('select', onSelect);
    // Initial call to set the first video playing
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  };

  useEffect(() => {
    if (!embla) return;
    
    const cleanup = handleCarouselCreated(embla);
    return cleanup;
  }, [embla, items]);

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
      return (
        <video
          ref={el => {
            if (el) videoRefs.current[index] = el;
          }}
          src={item.url}
          poster={item.thumbnail || undefined}
          className="w-full h-full object-cover"
          playsInline
          muted
          loop
          controls={false}
        />
      );
    } else {
      return (
        <img
          src={item.url}
          alt={item.title || "Featured image"}
          className="w-full h-full object-cover"
        />
      );
    }
  };

  // Responsive container style
  const containerStyle = {
    maxWidth: containerMaxWidth,
    aspectRatio: containerAspectRatio,
    width: '100%',
    minWidth: '280px' // Ensure minimum size on mobile
  };

  const onCarouselCreated = React.useCallback((api) => {
    setEmbla(api);
  }, []);

  return (
    <div className="relative group px-2 sm:px-0" ref={carouselRef}>
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
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item, index) => (
            <CarouselItem 
              key={item.id} 
              className={`pl-2 md:pl-4 basis-full sm:basis-auto flex justify-center transition-all duration-300 ${
                activeIndex === index 
                  ? "opacity-100 scale-100" 
                  : "opacity-80 scale-95"
              }`}
            >
              <Card className="rounded-xl overflow-hidden shadow-lg border-0 w-auto will-change-transform">
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
        
        {/* Touch-friendly navigation arrows */}
        <CarouselPrevious className="opacity-80 hover:opacity-100 transition-opacity duration-300 touch-button left-2 sm:left-4" />
        <CarouselNext className="opacity-80 hover:opacity-100 transition-opacity duration-300 touch-button right-2 sm:right-4" />
      </Carousel>
      
      {/* Responsive dots indicator */}
      {items.length > 1 && (
        <div className="flex justify-center mt-3 md:mt-4 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all touch-button ${
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
