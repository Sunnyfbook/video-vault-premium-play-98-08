
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoById, incrementViews, Video } from '@/models/Video';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { getSEOSettingByPage, SEOSetting } from '@/models/SEO'; 
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';

// Import our components
import AdsSection from '@/components/video/AdsSection';
import VideoHeader from '@/components/video/VideoHeader';
import MainVideoSection from '@/components/video/MainVideoSection';
import VideoSidebar from '@/components/video/VideoSidebar';
import LoadingState from '@/components/video/LoadingState';
import ErrorState from '@/components/video/ErrorState';

const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  // Load video and SEO settings
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        // Reset states when ID changes
        setLoading(true);
        setError(null);
        
        try {
          // Load video data
          const foundVideo = await getVideoById(id);
          
          if (foundVideo) {
            setVideo(foundVideo);
            // Increment view count
            await incrementViews(id);
            
            // Load SEO settings for video page
            const seoData = await getSEOSettingByPage('video');
            setSeoSettings(seoData);
          } else {
            setError(`Video with ID ${id} was not found.`);
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
        const fetchTopAds = await getAdsByPosition('top');
        setTopAds(fetchTopAds);
        
        const fetchBottomAds = await getAdsByPosition('bottom');
        setBottomAds(fetchBottomAds);
        
        const fetchSidebarAds = await getAdsByPosition('sidebar');
        setSidebarAds(fetchSidebarAds);
        
        const fetchInVideoAds = await getAdsByPosition('in-video');
        setInVideoAds(fetchInVideoAds);
      }
    };

    loadData();
    
    // Set up real-time listeners for ads
    const adsChannel = supabase
      .channel('public:ads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        (payload) => {
          // Reload ads when changes occur
          const loadAds = async () => {
            const fetchTopAds = await getAdsByPosition('top');
            setTopAds(fetchTopAds);
            
            const fetchBottomAds = await getAdsByPosition('bottom');
            setBottomAds(fetchBottomAds);
            
            const fetchSidebarAds = await getAdsByPosition('sidebar');
            setSidebarAds(fetchSidebarAds);
            
            const fetchInVideoAds = await getAdsByPosition('in-video');
            setInVideoAds(fetchInVideoAds);
          };
          
          loadAds();
        }
      )
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(adsChannel);
    };
  }, [id, toast]);

  const copyCurrentLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Video link copied to clipboard!",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !video) {
    return <ErrorState errorMessage={error || undefined} />;
  }

  // Generate dynamic SEO metadata
  const pageTitle = seoSettings ? 
    seoSettings.title.replace('{title}', video.title) : 
    `${video.title} - Video Player`;
  
  const pageDescription = seoSettings ? 
    seoSettings.description.replace('{description}', video.description || '') : 
    video.description || 'Watch this video on our platform';

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
        <meta property="og:type" content="video" />
        {video.url && <meta property="og:video" content={video.url} />}
        
        {/* Twitter Card */}
        {seoSettings?.twitter_card && <meta name="twitter:card" content={seoSettings.twitter_card} />}
        <meta name="twitter:title" content={seoSettings?.twitter_title || pageTitle} />
        <meta name="twitter:description" content={seoSettings?.twitter_description || pageDescription} />
        {seoSettings?.twitter_image && <meta name="twitter:image" content={seoSettings.twitter_image} />}
        
        {/* Canonical URL */}
        {seoSettings?.canonical_url && <link rel="canonical" href={seoSettings.canonical_url} />}
      </Helmet>

      <div className="container mx-auto px-4 py-4 lg:py-8 bg-gray-50 min-h-screen">
        {/* Top ads */}
        <AdsSection ads={topAds} className="mb-6" />
        
        {/* Back button */}
        <VideoHeader onCopyLink={copyCurrentLink} copied={copied} />
        
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content with video player */}
          <MainVideoSection 
            video={video} 
            inVideoAds={inVideoAds} 
            bottomAds={bottomAds} 
          />
          
          {/* Sidebar */}
          <VideoSidebar 
            sidebarAds={sidebarAds} 
            onCopyLink={copyCurrentLink} 
          />
        </div>
      </div>
    </>
  );
};

export default VideoPage;
