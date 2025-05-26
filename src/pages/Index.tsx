
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, ImageIcon, Zap, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { incrementPageView, incrementUniqueVisitor } from '@/models/Analytics';

import AdsSection from '@/components/video/AdsSection';
import ContentCarousel from '@/components/ContentCarousel';

const Index = () => {
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
  
  const { 
    videos, 
    images, 
    loading: contentLoading, 
    error: contentError 
  } = useHomepageContent();
  
  const { 
    config: homepageConfig, 
    loading: configLoading, 
    error: configError 
  } = useHomepageConfig();

  const isMobile = useIsMobile();
  const overallLoading = contentLoading || configLoading;

  useEffect(() => {
    // Track page view
    incrementPageView();
    
    // Track unique visitor (in a real app, you'd check cookies/localStorage)
    // This is simplified for demo purposes
    const hasVisitedBefore = localStorage.getItem('hasVisited');
    if (!hasVisitedBefore) {
      incrementUniqueVisitor();
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Load ads
  useEffect(() => {
    const loadAds = async () => {
      try {
        console.log("Fetching ads for homepage...");
        const topAdsData = await getAdsByPosition('top');
        const bottomAdsData = await getAdsByPosition('bottom');
        const sidebarAdsData = await getAdsByPosition('sidebar');
        
        console.log(`Fetched ads: ${topAdsData.length} top, ${bottomAdsData.length} bottom, ${sidebarAdsData.length} sidebar`);
        
        setTopAds(topAdsData);
        setBottomAds(bottomAdsData);
        setSidebarAds(sidebarAdsData);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    loadAds();
    
    // Set up real-time listeners for ads
    const adsChannel = supabase
      .channel('public:ads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        async () => {
          console.log('Ads changed, refetching');
          // Reload ads when changes occur
          try {
            const topAdsData = await getAdsByPosition('top');
            const bottomAdsData = await getAdsByPosition('bottom');
            const sidebarAdsData = await getAdsByPosition('sidebar');
            
            setTopAds(topAdsData);
            setBottomAds(bottomAdsData);
            setSidebarAds(sidebarAdsData);
          } catch (error) {
            console.error("Error refetching ads:", error);
          }
        }
      )
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(adsChannel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 animate-fade-in overflow-x-hidden">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
        {/* Top Ads - ZERO SPACING */}
        {topAds.length > 0 && (
          <div className="mb-2 no-spacing">
            <AdsSection 
              ads={topAds} 
              className="w-full no-spacing" 
              staggerDelay={true} 
              baseDelaySeconds={0.5}
              positionClass="top-ads-section" 
            />
          </div>
        )}

        <header className="mb-3 md:mb-4 text-center">
          <Zap size={48} className="mx-auto mb-2 text-brand-accent animate-pulse-soft" />
          {overallLoading ? (
            <>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-full max-w-3xl mx-auto animate-pulse"></div>
            </>
          ) : configError ? (
            <p className="text-red-500">Error loading homepage configuration: {configError}</p>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2">
                <span className="gradient-text">
                  {homepageConfig.site_title}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {homepageConfig.site_description}
              </p>
            </>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-3">
          <main className="space-y-3 md:space-y-4 flex-grow">
            {/* Featured Videos Section */}
            <section>
              {!isMobile && (
                <div className="flex items-center gap-2 mb-3">
                  <Video size={28} className="text-primary" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-0-force">Featured Videos</h2>
                </div>
              )}
              {contentLoading ? (
                <div className="h-60 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              ) : videos.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-4 text-center shadow-subtle">
                  <Video size={36} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-base text-muted-foreground">No featured videos available right now. Please check back later!</p>
                </div>
              ) : (
                <ContentCarousel 
                  items={videos} 
                  type="video" 
                  showMobileCharacterView={isMobile}
                />
              )}
              
              {/* Enhanced View All Videos Button - Only show on desktop */}
              {!isMobile && (
                <div className="text-center mt-6">
                  <Link to="/videos" className="inline-block">
                    <Button 
                      size="lg" 
                      className="group relative overflow-hidden bg-gradient-to-r from-primary via-brand-accent to-accent text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 min-w-[240px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent via-brand-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <PlayCircle size={24} className="animate-pulse" />
                        <span className="tracking-wide">Explore All Videos</span>
                        <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* Featured Images Section - Only show on desktop */}
            {!isMobile && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={28} className="text-brand-accent" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-0-force">Featured Images</h2>
                </div>
                {contentLoading ? (
                  <div className="h-60 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                ) : images.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-4 text-center shadow-subtle">
                    <ImageIcon size={36} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-base text-muted-foreground">No featured images to showcase at the moment.</p>
                  </div>
                ) : (
                  <ContentCarousel items={images} type="image" />
                )}
              </section>
            )}

            {/* Bottom Ads - ZERO SPACING */}
            {bottomAds.length > 0 && (
              <div className="mt-2 no-spacing">
                <AdsSection 
                  ads={bottomAds} 
                  className="w-full no-spacing" 
                  staggerDelay={true} 
                  baseDelaySeconds={6} 
                  positionClass="bottom-ads-section"
                />
              </div>
            )}
          </main>

          {/* Sidebar Ads - ZERO SPACING - Only show on desktop */}
          {!isMobile && sidebarAds.length > 0 && (
            <aside className="w-full lg:w-64 xl:w-80 shrink-0">
              <div className="sticky top-2 no-spacing">
                <AdsSection 
                  ads={sidebarAds} 
                  staggerDelay={true} 
                  baseDelaySeconds={3} 
                  positionClass="sidebar-ads-section"
                />
              </div>
            </aside>
          )}
        </div>

        <footer className="mt-4 md:mt-6 pt-3 border-t border-border/50 text-center">
          {overallLoading ? (
             <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
          ) : (
            <p className="text-xs text-muted-foreground">{homepageConfig.footer_copyright}</p>
          )}
          <p className="text-xs text-muted-foreground/80 mt-1">Crafted with passion for seamless media experiences.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
