
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Image } from 'lucide-react';
import { HomepageContent } from '@/models/Homepage';

interface FeaturedCarouselProps {
  items: HomepageContent[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="py-8 px-4">
      <Carousel className="relative w-full max-w-5xl mx-auto">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id}>
              <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl">
                <img 
                  src={item.thumbnail || '/placeholder.svg'} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h2>
                  {item.description && (
                    <p className="text-white/90 mb-4 max-w-xl">{item.description}</p>
                  )}
                  <div className="flex gap-3">
                    <Button asChild variant="default" className="gap-2">
                      <Link to={item.type === 'video' ? `/video/${item.url}` : item.url}>
                        {item.type === 'video' ? (
                          <>
                            <Play size={16} />
                            Watch Now
                          </>
                        ) : (
                          <>
                            <Image size={16} />
                            View
                          </>
                        )}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2" />
        <CarouselNext className="absolute right-4 top-1/2" />
      </Carousel>
    </div>
  );
};

export default FeaturedCarousel;
