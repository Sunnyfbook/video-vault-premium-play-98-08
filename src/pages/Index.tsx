import React, { useEffect, useState, useRef } from "react";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";
import { Card } from "@/components/ui/card";
import { Video, Image as ImageIcon, Zap, Instagram } from "lucide-react";
import { Ad, getActiveAds, getAdsByPosition } from "@/models/Ad";
import AdsSection from "@/components/video/AdsSection";
import InstagramEmbed from "@/components/InstagramEmbed";
import ContentCarousel from "@/components/ContentCarousel";

const Index = () => {
  const { videos, images, loading: contentLoading } = useHomepageContent();
  const { config: homepageConfig, loading: configLoading, error: configError } = useHomepageConfig();
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
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
            title={item.title || "Instagram content"}
            className="w-full h-full"
          />
        </div>
      );
    } else if (item.type === "video") {
      return (
        <video
          src={item.url}
          poster={item.thumbnail || undefined}
          className="w-full h-full object-cover"
          playsInline
          muted
          loop
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 animate-fade-in overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Top Ads */}
        {topAds.length > 0 && (
          <div className="mb-8">
            <AdsSection ads={topAds} className="w-full" staggerDelay={true} baseDelaySeconds={0.5} />
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
                <div className="h-80 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              ) : videos.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center shadow-subtle">
                  <Video size={52} className="mx-auto text-gray-400 dark:text-gray-500 mb-5" />
                  <p className="text-xl text-muted-foreground">No featured videos available right now. Please check back later!</p>
                </div>
              ) : (
                <ContentCarousel items={videos} type="video" />
              )}
            </section>

            {/* Featured Images Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <ImageIcon size={36} className="text-brand-accent" />
                <h2 className="section-title !mb-0">Featured Images</h2>
              </div>
              {contentLoading ? (
                <div className="h-80 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              ) : images.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center shadow-subtle">
                  <ImageIcon size={52} className="mx-auto text-gray-400 dark:text-gray-500 mb-5" />
                  <p className="text-xl text-muted-foreground">No featured images to showcase at the moment.</p>
                </div>
              ) : (
                <ContentCarousel items={images} type="image" />
              )}
            </section>

            {/* Bottom Ads */}
            {bottomAds.length > 0 && (
              <div className="mt-8">
                <AdsSection ads={bottomAds} className="w-full" staggerDelay={true} baseDelaySeconds={4} />
              </div>
            )}
          </main>

          {/* Sidebar Ads */}
          {sidebarAds.length > 0 && (
            <aside className="w-full lg:w-64 xl:w-80 shrink-0">
              <div className="sticky top-8">
                <AdsSection ads={sidebarAds} staggerDelay={true} baseDelaySeconds={7} />
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
