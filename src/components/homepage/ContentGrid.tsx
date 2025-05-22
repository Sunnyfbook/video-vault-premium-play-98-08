
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Image } from 'lucide-react';
import { HomepageContent } from '@/models/Homepage';

interface ContentGridProps {
  title: string;
  items: HomepageContent[];
  type: 'video' | 'image';
}

const ContentGrid: React.FC<ContentGridProps> = ({ title, items, type }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative pt-[56.25%]">
                <img 
                  src={item.thumbnail || '/placeholder.svg'} 
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-3">
                      <Play className="text-white" size={24} />
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="py-4 flex-grow">
                <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button asChild variant="secondary" className="w-full gap-2">
                  <Link to={type === 'video' ? `/video/${item.url}` : item.url}>
                    {type === 'video' ? (
                      <>
                        <Play size={16} />
                        Watch Now
                      </>
                    ) : (
                      <>
                        <Image size={16} />
                        View Full Size
                      </>
                    )}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentGrid;
