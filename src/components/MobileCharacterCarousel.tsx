
import React, { useState, useRef, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomepageContent } from "@/hooks/useHomepageContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileCharacterCarouselProps {
  items: HomepageContent[];
  onSelect?: (item: HomepageContent) => void;
  title?: string;
}

const MobileCharacterCarousel: React.FC<MobileCharacterCarouselProps> = ({ 
  items, 
  onSelect,
  title = "Choose favourite Character" 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [embla, setEmbla] = useState<any>(null);
  const isMobile = useIsMobile();

  const handleCarouselCreated = (emblaApi: any) => {
    setEmbla(emblaApi);
    
    const onSelect = () => {
      const currentIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(currentIndex);
    };

    emblaApi.on('select', onSelect);
    onSelect(); // Initial call
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  };

  const handleSelectCharacter = () => {
    if (onSelect && items[activeIndex]) {
      onSelect(items[activeIndex]);
    }
  };

  if (!isMobile) {
    return null; // Only show on mobile
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-black flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {title}
        </h1>
      </div>

      {/* Carousel Container */}
      <div className="flex-1 flex flex-col justify-center px-4">
        <Carousel
          opts={{
            loop: true,
            align: "center",
            skipSnaps: false,
            containScroll: "keepSnaps"
          }}
          className="w-full"
          onCreated={handleCarouselCreated}
        >
          <CarouselContent className="ml-0">
            {items.map((item, index) => (
              <CarouselItem 
                key={item.id} 
                className={cn(
                  "pl-4 basis-4/5 flex justify-center transition-all duration-500",
                  activeIndex === index 
                    ? "opacity-100 scale-100" 
                    : "opacity-60 scale-90"
                )}
              >
                <Card className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-0 bg-gradient-to-b from-slate-700 to-slate-800">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        poster={item.thumbnail || undefined}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || "Character"}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Character name overlay */}
                    {item.title && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold text-center">
                          {item.title}
                        </h3>
                      </div>
                    )}
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation arrows - subtle and positioned */}
          <CarouselPrevious className="left-2 opacity-70 hover:opacity-100 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
          <CarouselNext className="right-2 opacity-70 hover:opacity-100 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
        </Carousel>
      </div>

      {/* Selection Button */}
      <div className="pb-12 px-6">
        <Button 
          onClick={handleSelectCharacter}
          className="w-full py-4 text-lg font-semibold rounded-2xl bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-lg"
          disabled={!items[activeIndex]}
        >
          Select Character
        </Button>
      </div>

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="flex justify-center pb-6 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeIndex === index 
                  ? "bg-white scale-125" 
                  : "bg-white/40"
              )}
              onClick={() => embla?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileCharacterCarousel;
