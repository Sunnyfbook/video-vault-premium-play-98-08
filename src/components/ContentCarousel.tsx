
import React, { useState, useRef, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";
import { HomepageContent } from "@/hooks/useHomepageContent";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import MobileCharacterCarousel from "./MobileCharacterCarousel";

interface ContentCarouselProps {
  items: HomepageContent[];
  type: "video" | "image";
  showMobileCharacterView?: boolean;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ 
  items, 
  type, 
  showMobileCharacterView = false 
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { config } = useHomepageConfig();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Show mobile character carousel if enabled and on mobile
  if (showMobileCharacterView && isMobile) {
    return <MobileCharacterCarousel items={items} />;
  }

  // If no items, show empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type}s available
      </div>
    );
  }

  const containerMaxWidth = config?.container_max_width || "280px";
  const aspectRatio = config?.container_aspect_ratio || "9/16";

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item, index) => (
            <CarouselItem 
              key={item.id} 
              className="pl-2 md:pl-4 basis-auto"
            >
              <Card 
                className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm"
                style={{ maxWidth: containerMaxWidth }}
              >
                <CardContent className="p-0">
                  <div 
                    className="relative overflow-hidden rounded-lg"
                    style={{ aspectRatio }}
                  >
                    {type === "video" ? (
                      <>
                        <video
                          src={item.url}
                          poster={item.thumbnail || undefined}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          muted
                          loop
                          playsInline
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="icon" variant="secondary" className="rounded-full bg-white/90 text-black hover:bg-white">
                            <Play size={20} fill="currentColor" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button size="icon" variant="secondary" className="rounded-full bg-white/90 text-black hover:bg-white h-8 w-8">
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white text-sm font-semibold truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-white/80 text-xs mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {items.length > 1 && (
          <>
            <CarouselPrevious className="left-2 opacity-70 hover:opacity-100" />
            <CarouselNext className="right-2 opacity-70 hover:opacity-100" />
          </>
        )}
      </Carousel>
      
      {items.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                i + 1 === current 
                  ? "bg-primary scale-125" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel;
