import React from "react";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Video, Image as ImageIcon, Zap, Play, ArrowRight } from "lucide-react";

const Index = () => {
  const { videos, images, loading } = useHomepageContent();

  const cardHoverClass = "transition-all duration-300 ease-in-out group-hover:shadow-card-hover group-hover:-translate-y-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 animate-fade-in">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <header className="mb-16 md:mb-20 text-center">
          <Zap size={48} className="mx-auto mb-6 text-brand-accent animate-pulse-soft" />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="gradient-text">
              Video Player Pro
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in our curated collection of high-definition videos and breathtaking featured images. Experience content like never before.
          </p>
        </header>

        <main className="space-y-16 md:space-y-20">
          {/* Featured Videos Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Video size={36} className="text-primary" />
              <h2 className="section-title !mb-0">Featured Videos</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="rounded-xl shadow-card animate-pulse bg-gray-200 dark:bg-slate-800">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
                    <CardContent className="p-5">
                      <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-5/6"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-10 text-center shadow-subtle">
                <Video size={52} className="mx-auto text-gray-400 dark:text-gray-500 mb-5" />
                <p className="text-xl text-muted-foreground">No featured videos available right now. Please check back later!</p>
              </div>
            ) : (
              <Carousel 
                opts={{ align: "start", loop: videos.length > 2 }} 
                className="w-full group"
              >
                <CarouselContent className="-ml-4">
                  {videos.map((video) => (
                    <CarouselItem key={video.id} className="pl-4 md:basis-1/2 lg:basis-1/3 group">
                      <Card className={`rounded-xl shadow-card overflow-hidden bg-card h-full flex flex-col ${cardHoverClass}`}>
                        <div className="relative aspect-video bg-black rounded-t-xl group-hover:opacity-90 transition-opacity">
                          <video
                            src={video.url}
                            poster={video.thumbnail || undefined}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            controls
                          />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <Play size={32} className="text-white opacity-80" />
                          </div>
                        </div>
                        <CardContent className="p-5 flex-grow flex flex-col">
                          <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">{video.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{video.description}</p>
                           <a href={`/video/${video.id}`} className="mt-4 inline-flex items-center text-sm font-medium text-brand-accent hover:underline">
                            Watch Now <ArrowRight size={16} className="ml-1" />
                          </a>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {videos.length > 1 && ( 
                  <>
                    <CarouselPrevious className="ml-12 bg-background/80 hover:bg-background dark:bg-slate-700/80 dark:hover:bg-slate-700 shadow-md" />
                    <CarouselNext className="mr-12 bg-background/80 hover:bg-background dark:bg-slate-700/80 dark:hover:bg-slate-700 shadow-md" />
                  </>
                )}
              </Carousel>
            )}
          </section>

          {/* Featured Images Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <ImageIcon size={36} className="text-brand-accent" />
              <h2 className="section-title !mb-0">Featured Images</h2>
            </div>
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                   <Card key={i} className="rounded-xl shadow-card animate-pulse bg-gray-200 dark:bg-slate-800">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
                    <CardContent className="p-5">
                      <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-10 text-center shadow-subtle">
                <ImageIcon size={52} className="mx-auto text-gray-400 dark:text-gray-500 mb-5" />
                <p className="text-xl text-muted-foreground">No featured images to showcase at the moment.</p>
              </div>
            ) : (
              <Carousel 
                opts={{ align: "start", loop: images.length > 2 }} 
                className="w-full group"
              >
                <CarouselContent className="-ml-4">
                  {images.map((img) => (
                    <CarouselItem key={img.id} className="pl-4 md:basis-1/2 lg:basis-1/3 group">
                      <Card className={`rounded-xl shadow-card overflow-hidden bg-card h-full flex flex-col ${cardHoverClass}`}>
                        <div className="aspect-square sm:aspect-video overflow-hidden rounded-t-xl relative">
                          <img
                            src={img.url}
                            alt={img.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <CardContent className="p-5 flex-grow">
                          <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-brand-accent transition-colors">{img.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{img.description}</p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                 {images.length > 1 && (
                  <>
                    <CarouselPrevious className="ml-12 bg-background/80 hover:bg-background dark:bg-slate-700/80 dark:hover:bg-slate-700 shadow-md" />
                    <CarouselNext className="mr-12 bg-background/80 hover:bg-background dark:bg-slate-700/80 dark:hover:bg-slate-700 shadow-md" />
                  </>
                )}
              </Carousel>
            )}
          </section>
        </main>

        <footer className="mt-20 md:mt-24 pt-10 border-t border-border/50 text-center">
          <p className="text-md text-muted-foreground">&copy; {new Date().getFullYear()} Video Player Pro. All rights reserved.</p>
          <p className="text-sm text-muted-foreground/80 mt-2">Crafted with passion for seamless media experiences.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
