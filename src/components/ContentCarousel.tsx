
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
  
  // Default size values, with fallbacks if config values are missing
  const containerMaxWidth = config?.container_max_width || '280px';
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
    <div className="relative group" ref={carouselRef}>
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
        <CarouselPrevious className="opacity-0 group-hover:opacity-100" />
        <CarouselNext className="opacity-0 group-hover:opacity-100" />
      </Carousel>
    </div>
  );
};

export default ContentCarousel;
