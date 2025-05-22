
import React, { useState, useRef, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { HomepageContent } from "@/hooks/useHomepageContent";
import InstagramEmbed from "@/components/InstagramEmbed";
import useEmblaCarousel from "embla-carousel-react";

interface ContentCarouselProps {
  items: HomepageContent[];
  type: "video" | "image";
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ items, type }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false, // This ensures each swipe moves exactly to the next slide
    containScroll: "keepSnaps" // Keeps slides within the viewport
  });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  // Setup video refs
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, items.length);
  }, [items]);

  // Handle carousel slide change
  useEffect(() => {
    if (!emblaApi) return;
    
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
  }, [emblaApi]);

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

  return (
    <div className="relative group">
      <Carousel
        opts={{
          loop: true,
          align: "center",
          skipSnaps: false,
          containScroll: "keepSnaps"
        }}
        className="w-full"
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem 
                key={item.id} 
                className={`basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transition-all duration-300 ${
                  activeIndex === index 
                    ? "opacity-100 scale-100" 
                    : "opacity-80 scale-95"
                }`}
              >
                <Card className="rounded-xl overflow-hidden shadow-lg border-0">
                  <div className="aspect-[9/16] bg-black overflow-hidden">
                    {renderContent(item, index)}
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
        <CarouselPrevious className="opacity-0 group-hover:opacity-100" />
        <CarouselNext className="opacity-0 group-hover:opacity-100" />
      </Carousel>
    </div>
  );
};

export default ContentCarousel;
