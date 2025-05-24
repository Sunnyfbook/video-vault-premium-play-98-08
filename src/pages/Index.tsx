
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, ImageIcon, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';
import { supabase } from '@/integrations/supabase/client';
import { incrementPageView, incrementUniqueVisitor } from '@/models/Analytics';

// Import our components
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

  const overallLoading = contentLoading || configLoading;

  // Track visit
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
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Top Ads */}
        {topAds.length > 0 && (
          <div className="mb-8 top-ads-container">
            <AdsSection 
              ads={topAds} 
              className="w-full" 
              staggerDelay={true} 
              baseDelaySeconds={0.5}
              positionClass="top-ads-section" 
            />
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
              
              {/* View All Videos Button - placed here below featured videos */}
              <div className="text-center mt-8">
                <Link to="/videos">
                  <Button variant="outline" className="flex items-center gap-2 mx-auto">
                    View All Videos
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
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
              <div className="mt-8 bottom-ads-container">
                <AdsSection 
                  ads={bottomAds} 
                  className="w-full" 
                  staggerDelay={true} 
                  baseDelaySeconds={6} 
                  positionClass="bottom-ads-section"
                />
              </div>
            )}
          </main>

          {/* Sidebar Ads */}
          {sidebarAds.length > 0 && (
            <aside className="w-full lg:w-64 xl:w-80 shrink-0">
              <div className="sticky top-8 sidebar-ads-container">
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
