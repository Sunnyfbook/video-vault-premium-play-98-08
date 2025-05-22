
import React from "react";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Video, Image } from "lucide-react";

const Index = () => {
  const { videos, images, loading } = useHomepageContent();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-brand mb-2 text-center">Video Player Pro</h1>
        <p className="text-gray-500 text-center">Watch high-quality videos and enjoy featured images</p>
      </header>

      <main>
        {/* Featured Videos Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Video size={28} className="text-brand" />
            <h2 className="text-2xl font-semibold">Featured Videos</h2>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : videos.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No featured videos yet.</p>
            </div>
          ) : (
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {videos.map((video) => (
                  <CarouselItem key={video.id} className="px-1">
                    <Card className="rounded-md shadow-md overflow-hidden">
                      <div className="relative pt-[56.25%] bg-black rounded-t-md">
                        <video
                          src={video.url}
                          poster={video.thumbnail || undefined}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          controls
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-500">{video.description}</p>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </section>

        {/* Featured Images Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Image size={28} className="text-brand" />
            <h2 className="text-2xl font-semibold">Featured Images</h2>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : images.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No featured images yet.</p>
            </div>
          ) : (
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {images.map((img) => (
                  <CarouselItem key={img.id} className="px-1">
                    <Card className="rounded-md shadow-md overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-64 object-cover rounded-t-md"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{img.title}</h3>
                        <p className="text-sm text-gray-500">{img.description}</p>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
