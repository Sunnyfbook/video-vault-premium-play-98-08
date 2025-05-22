
import React, { useEffect, useState } from "react";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Video, Image as ImageIcon, Zap, Play, ArrowRight, Instagram } from "lucide-react";
import { Ad, getActiveAds, getAdsByPosition } from "@/models/Ad";
import AdsSection from "@/components/video/AdsSection";
import InstagramEmbed from "@/components/InstagramEmbed";

const Index = () => {
  const { videos, images, loading: contentLoading } = useHomepageContent();
  const { config: homepageConfig, loading: configLoading, error: configError } = useHomepageConfig();
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cardHoverClass = "transition-all duration-300 ease-in-out group-hover:shadow-card-hover group-hover:-translate-y-1";
  
  const overallLoading = contentLoading || configLoading || loading;

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const topAdsData = await getAdsByPosition('top');
        const bottomAdsData = await getAdsByPosition('bottom');
        const sidebarAdsData = await getAdsByPosition('sidebar');
        
        setTopAds(topAdsData);
        setBottomAds(bottomAdsData);
        setSidebarAds(sidebarAdsData);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Helper function to render appropriate content based on type
  const renderContent = (item) => {
    if (item.type === "instagram") {
      return (
        <div className="w-full h-full">
          <InstagramEmbed 
            url={item.url}
            title={item.title}
            className="w-full h-full"
          />
        </div>
      );
    } else if (item.type === "video") {
      return (
        <>
          <video
            src={item.url}
            poster={item.thumbnail || undefined}
            className="absolute top-0 left-0 w-full h-full object-cover"
            controls
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Play size={32} className="text-white opacity-80" />
          </div>
        </>
      );
    } else {
      return (
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 animate-fade-in overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Top Ads */}
        {topAds.length > 0 && (
          <div className="mb-8">
            <AdsSection ads={topAds} className="w-full" />
          </div>
        )}

        <header className="mb-16 md:mb-20 text-center">
          <Zap size={48} className="mx-auto mb-6 text-brand-accent animate-pulse-soft" />
          {overallLoading ? (
            <>
              <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-6 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
            </>
          ) : configError ? (
            <p className="text-red-500">Error loading homepage configuration: {configError}</p>
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
                <span className="gradient-text">
                  {homepageConfig.site_title}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {homepageConfig.site_description}
              </p>
            </>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="space-y-16 md:space-y-20 flex-grow">
            {/* Featured Videos Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Video size={36} className="text-primary" />
                <h2 className="section-title !mb-0">Featured Videos</h2>
              </div>
              {contentLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="rounded-xl shadow-card animate-pulse bg-gray-200 dark:bg-slate-800">
                      <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
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
                  className="w-full group py-10"
                >
                  <CarouselContent className="-ml-4">
                    {videos.map((video) => (
                      <CarouselItem key={video.id} className="pl-4 md:basis-1/2 lg:basis-1/2 group">
                        <Card className={`rounded-xl shadow-card overflow-hidden bg-card ${cardHoverClass}`}>
                          <div className="relative aspect-video lg:aspect-[16/10] xl:aspect-[16/9] bg-black rounded-xl group-hover:opacity-90 transition-opacity">
                            {renderContent(video)}
                          </div>
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
              {contentLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(3)].map((_, i) => (
                     <Card key={i} className="rounded-xl shadow-card animate-pulse bg-gray-200 dark:bg-slate-800">
                      <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
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
                  className="w-full group py-10"
                >
                  <CarouselContent className="-ml-4">
                    {images.map((img) => (
                      <CarouselItem key={img.id} className="pl-4 md:basis-1/2 lg:basis-1/2 group">
                        <Card className={`rounded-xl shadow-card overflow-hidden bg-card ${cardHoverClass}`}>
                          <div className="aspect-square md:aspect-[4/3] lg:aspect-[16/10] xl:aspect-[16/9] overflow-hidden rounded-xl relative">
                            {renderContent(img)}
                          </div>
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

            {/* Bottom Ads */}
            {bottomAds.length > 0 && (
              <div className="mt-8">
                <AdsSection ads={bottomAds} className="w-full" />
              </div>
            )}
          </main>

          {/* Sidebar Ads */}
          {sidebarAds.length > 0 && (
            <aside className="w-full lg:w-64 xl:w-80 shrink-0">
              <div className="sticky top-8">
                <AdsSection ads={sidebarAds} />
              </div>
            </aside>
          )}
        </div>

        <footer className="mt-20 md:mt-24 pt-10 border-t border-border/50 text-center">
          {overallLoading ? (
             <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
          ) : (
            <p className="text-md text-muted-foreground">{homepageConfig.footer_copyright}</p>
          )}
          <p className="text-sm text-muted-foreground/80 mt-2">Crafted with passion for seamless media experiences.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
