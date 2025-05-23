
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoById, getVideoByCustomUrl, incrementViews, Video } from '@/models/Video';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { getSEOSettingByPage, SEOSetting } from '@/models/SEO'; 
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import { incrementPageView, incrementUniqueVisitor } from '@/models/Analytics';

// Import our components
import AdsSection from '@/components/video/AdsSection';
import VideoHeader from '@/components/video/VideoHeader';
import MainVideoSection from '@/components/video/MainVideoSection';
import VideoSidebar from '@/components/video/VideoSidebar';
import LoadingState from '@/components/video/LoadingState';
import ErrorState from '@/components/video/ErrorState';

const VideoPage: React.FC = () => {
  const { id, customUrl } = useParams<{ id?: string, customUrl?: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
  const [inVideoAds, setInVideoAds] = useState<Ad[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSetting | undefined>(undefined);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  // Load video and SEO settings
  useEffect(() => {
    const loadData = async () => {
      // Reset states when URL params change
      setLoading(true);
      setError(null);
      setVideo(null);
      
      try {
        let foundVideo: Video | undefined;
        
        // Try to load by custom URL first if available
        if (customUrl) {
          foundVideo = await getVideoByCustomUrl(customUrl);
        } 
        // If no custom URL or not found by custom URL, try regular ID
        if (!foundVideo && id) {
          foundVideo = await getVideoById(id);
        }
        
        if (foundVideo) {
          setVideo(foundVideo);
          await incrementViews(foundVideo.id); // Increment views
          const seoData = await getSEOSettingByPage('video');
          setSeoSettings(seoData);
        } else {
          setError(`Video was not found.`);
          toast({
            title: "Video Not Found",
            description: "The requested video could not be found.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Error loading video:", e);
        setError("An error occurred while loading the video.");
        toast({
          title: "Error",
          description: "An error occurred while loading the video.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }

      // Load ads by position
      const [
        fetchTopAds,
        fetchBottomAds,
        fetchSidebarAds,
        fetchInVideoAds,
      ] = await Promise.all([
        getAdsByPosition('top'),
        getAdsByPosition('bottom'),
        getAdsByPosition('sidebar'),
        getAdsByPosition('in-video'),
      ]);
      setTopAds(fetchTopAds);
      setBottomAds(fetchBottomAds);
      setSidebarAds(fetchSidebarAds);
      setInVideoAds(fetchInVideoAds);
    };

    loadData();
    
    // Set up real-time listeners for ads
    const adsChannel = supabase
      .channel('public:ads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        async () => {
          console.log('Ads changed, refetching');
          // Reload ads when changes occur
          const [
            refetchedTopAds,
            refetchedBottomAds,
            refetchedSidebarAds,
            refetchedInVideoAds,
          ] = await Promise.all([
            getAdsByPosition('top'),
            getAdsByPosition('bottom'),
            getAdsByPosition('sidebar'),
            getAdsByPosition('in-video'),
          ]);
          setTopAds(refetchedTopAds);
          setBottomAds(refetchedBottomAds);
          setSidebarAds(refetchedSidebarAds);
          setInVideoAds(refetchedInVideoAds);
        }
      )
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(adsChannel);
    };
  }, [id, customUrl, toast]);

  const copyCurrentLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Video link copied to clipboard!",
      variant: "default",
    });
    
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 flex items-center justify-center"><LoadingState /></div>;
  }

  if (error || !video) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 flex items-center justify-center"><ErrorState errorMessage={error || "Video data is unavailable."} /></div>;
  }

  // Generate dynamic SEO metadata
  const pageTitle = seoSettings && video ? 
    seoSettings.title.replace('{title}', video.title) : 
    (video ? `${video.title} - Video Player Pro` : 'Video Player Pro');
  
  const pageDescription = seoSettings && video ? 
    seoSettings.description.replace('{description}', video.description || '') : 
    (video?.description || 'Watch this exciting video on our platform.');

  // Generate shorter share URL if custom URL exists
  const shareUrl = video.custom_url ? 
    `${window.location.origin}/v/${video.custom_url}` : 
    `${window.location.origin}/video/${video.id}`;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {seoSettings?.keywords && <meta name="keywords" content={seoSettings.keywords} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={seoSettings?.og_title || pageTitle} />
        <meta property="og:description" content={seoSettings?.og_description || pageDescription} />
        {seoSettings?.og_image && <meta property="og:image" content={seoSettings.og_image} />}
        <meta property="og:type" content="video.movie" />
        {video.url && <meta property="og:video" content={video.url} />}
        <meta property="og:url" content={shareUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={seoSettings?.twitter_card || "summary_large_image"} />
        <meta name="twitter:title" content={seoSettings?.twitter_title || pageTitle} />
        <meta name="twitter:description" content={seoSettings?.twitter_description || pageDescription} />
        {seoSettings?.twitter_image && <meta name="twitter:image" content={seoSettings.twitter_image} />}
        
        {/* Canonical URL */}
        {video.custom_url ? 
          <link rel="canonical" href={`${window.location.origin}/v/${video.custom_url}`} /> : 
          <link rel="canonical" href={`${window.location.origin}/video/${video.id}`} />
        }
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 animate-fade-in">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Top ads */}
          {topAds.length > 0 && (
            <div className="mb-6 md:mb-8">
              <AdsSection ads={topAds} className="grid grid-cols-1 gap-4" />
            </div>
          )}
          
          <VideoHeader onCopyLink={copyCurrentLink} copied={copied} />
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <MainVideoSection 
              video={video} 
              inVideoAds={inVideoAds} 
              bottomAds={bottomAds} 
            />
            
            <VideoSidebar 
              sidebarAds={sidebarAds} 
              onCopyLink={copyCurrentLink} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPage;
