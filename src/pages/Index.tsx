
import React from "react";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // CardDescription removed as it wasn't used for title/desc
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Video, Image as ImageIcon } from "lucide-react"; // Renamed Image to ImageIcon to avoid conflict with HTMLImageElement

const Index = () => {
  const { videos, images, loading } = useHomepageContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-accent">
              Video Player Pro
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover, watch, and enjoy our curated collection of high-quality videos and stunning featured images.
          </p>
        </header>

        <main>
          {/* Featured Videos Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Video size={32} className="text-brand" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Featured Videos</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="rounded-xl shadow-lg animate-pulse">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
                    <CardContent className="p-5">
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center shadow-md">
                <Video size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg text-gray-500 dark:text-gray-400">No featured videos at the moment. Check back soon!</p>
              </div>
            ) : (
              <Carousel 
                opts={{ align: "start", loop: videos.length > 2 }} 
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {videos.map((video) => (
                    <CarouselItem key={video.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:scale-105 transform duration-300 ease-out bg-white dark:bg-slate-800 h-full flex flex-col">
                        <div className="relative aspect-video bg-black rounded-t-xl">
                          <video
                            src={video.url}
                            poster={video.thumbnail || undefined}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            controls
                          />
                        </div>
                        <CardContent className="p-5 flex-grow">
                          <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-white">{video.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{video.description}</p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {videos.length > 1 && (
                  <>
                    <CarouselPrevious className="ml-12 bg-white/80 hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700" />
                    <CarouselNext className="mr-12 bg-white/80 hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700" />
                  </>
                )}
              </Carousel>
            )}
          </section>

          {/* Featured Images Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon size={32} className="text-brand-accent" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Featured Images</h2>
            </div>
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="rounded-xl shadow-lg animate-pulse">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
                    <CardContent className="p-5">
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center shadow-md">
                <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg text-gray-500 dark:text-gray-400">No featured images to display right now.</p>
              </div>
            ) : (
              <Carousel 
                opts={{ align: "start", loop: images.length > 2 }} 
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {images.map((img) => (
                    <CarouselItem key={img.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:scale-105 transform duration-300 ease-out bg-white dark:bg-slate-800 h-full flex flex-col">
                        <div className="aspect-square sm:aspect-video overflow-hidden rounded-t-xl">
                          <img
                            src={img.url}
                            alt={img.title}
                            className="w-full h-full object-cover "
                          />
                        </div>
                        <CardContent className="p-5 flex-grow">
                          <h3 className="font-semibold text-xl mb-2 text-gray-800 dark:text-white">{img.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{img.description}</p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                 {images.length > 1 && (
                  <>
                    <CarouselPrevious className="ml-12 bg-white/80 hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700" />
                    <CarouselNext className="mr-12 bg-white/80 hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700" />
                  </>
                )}
              </Carousel>
            )}
          </section>
        </main>

        <footer className="mt-20 pt-8 border-t border-gray-300 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} Video Player Pro. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
