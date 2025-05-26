import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoById, getVideoByCustomUrl, incrementViews, Video } from '@/models/Video';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { useSEOSettings } from '@/hooks/useSEOSettings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { incrementPageView, incrementUniqueVisitor } from '@/models/Analytics';

// Import our components
import AdsSection from '@/components/video/AdsSection';
import VideoHeader from '@/components/video/VideoHeader';
import MainVideoSection from '@/components/video/MainVideoSection';
import VideoSidebar from '@/components/video/VideoSidebar';
import LoadingState from '@/components/video/LoadingState';
import ErrorState from '@/components/video/ErrorState';
import SEOHead from '@/components/SEOHead';

const VideoPage: React.FC = () => {
  const { id, customUrl } = useParams<{ id?: string, customUrl?: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
  const [inVideoAds, setInVideoAds] = useState<Ad[]>([]);
  const [belowVideoAds, setBelowVideoAds] = useState<Ad[]>([]);
  const [beforeVideoAds, setBeforeVideoAds] = useState<Ad[]>([]);
  const [afterVideoAds, setAfterVideoAds] = useState<Ad[]>([]);
  const [sidebarTopAds, setSidebarTopAds] = useState<Ad[]>([]);
  const [sidebarBottomAds, setSidebarBottomAds] = useState<Ad[]>([]);
  const [videoTopAds, setVideoTopAds] = useState<Ad[]>([]);
  const [videoMiddleAds, setVideoMiddleAds] = useState<Ad[]>([]);
  const [videoBottomAds, setVideoBottomAds] = useState<Ad[]>([]);
  const [videoLeftAds, setVideoLeftAds] = useState<Ad[]>([]);
  const [videoRightAds, setVideoRightAds] = useState<Ad[]>([]);
  const { seoSettings } = useSEOSettings('video');
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Track visit
  useEffect(() => {
    console.log('VideoPage: Tracking page visit');
    incrementPageView();
    
    const hasVisitedBefore = localStorage.getItem('hasVisited');
    if (!hasVisitedBefore) {
      incrementUniqueVisitor();
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Load video and SEO settings
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setVideo(null);
      
      try {
        console.log('VideoPage: Loading video data with params:', { id, customUrl });
        let foundVideo: Video | undefined;
        
        // Try to load by custom URL first if available
        if (customUrl) {
          console.log('VideoPage: Attempting to load by custom URL:', customUrl);
          foundVideo = await getVideoByCustomUrl(customUrl);
        } 
        // If no custom URL or not found by custom URL, try regular ID
        if (!foundVideo && id) {
          console.log('VideoPage: Attempting to load by ID:', id);
          foundVideo = await getVideoById(id);
        }
        
        if (foundVideo) {
          console.log('VideoPage: Video found:', foundVideo.title);
          setVideo(foundVideo);
          await incrementViews(foundVideo.id);
        } else {
          console.error('VideoPage: Video not found');
          setError(`Video was not found.`);
          toast({
            title: "Video Not Found",
            description: "The requested video could not be found.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("VideoPage: Error loading video:", e);
        setError("An error occurred while loading the video.");
        toast({
          title: "Error",
          description: "An error occurred while loading the video.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id || customUrl) {
      loadData();
    } else {
      setError("No video identifier provided");
      setLoading(false);
    }
  }, [id, customUrl, toast]);

  // Load ads
  useEffect(() => {
    const loadAds = async () => {
      try {
        console.log("VideoPage: Fetching ads...");
        const [
          topAdsData,
          bottomAdsData,
          sidebarAdsData,
          inVideoAdsData,
          belowVideoAdsData,
          beforeVideoAdsData,
          afterVideoAdsData,
          sidebarTopAdsData,
          sidebarBottomAdsData,
          videoTopAdsData,
          videoMiddleAdsData,
          videoBottomAdsData,
          videoLeftAdsData,
          videoRightAdsData
        ] = await Promise.all([
          getAdsByPosition('top'),
          getAdsByPosition('bottom'),
          getAdsByPosition('sidebar'),
          getAdsByPosition('in-video'),
          getAdsByPosition('below-video'),
          getAdsByPosition('before-video'),
          getAdsByPosition('after-video'),
          getAdsByPosition('sidebar-top'),
          getAdsByPosition('sidebar-bottom'),
          getAdsByPosition('video-top'),
          getAdsByPosition('video-middle'),
          getAdsByPosition('video-bottom'),
          getAdsByPosition('video-left'),
          getAdsByPosition('video-right')
        ]);
        
        console.log(`VideoPage: Fetched ads: ${topAdsData.length} top, ${bottomAdsData.length} bottom, ${sidebarAdsData.length} sidebar, ${inVideoAdsData.length} in-video, ${belowVideoAdsData.length} below-video, ${beforeVideoAdsData.length} before-video, ${afterVideoAdsData.length} after-video, ${sidebarTopAdsData.length} sidebar-top, ${sidebarBottomAdsData.length} sidebar-bottom, ${videoTopAdsData.length} video-top, ${videoMiddleAdsData.length} video-middle, ${videoBottomAdsData.length} video-bottom, ${videoLeftAdsData.length} video-left, ${videoRightAdsData.length} video-right`);
        
        setTopAds(topAdsData);
        setBottomAds(bottomAdsData);
        setSidebarAds(sidebarAdsData);
        setInVideoAds(inVideoAdsData);
        setBelowVideoAds(belowVideoAdsData);
        setBeforeVideoAds(beforeVideoAdsData);
        setAfterVideoAds(afterVideoAdsData);
        setSidebarTopAds(sidebarTopAdsData);
        setSidebarBottomAds(sidebarBottomAdsData);
        setVideoTopAds(videoTopAdsData);
        setVideoMiddleAds(videoMiddleAdsData);
        setVideoBottomAds(videoBottomAdsData);
        setVideoLeftAds(videoLeftAdsData);
        setVideoRightAds(videoRightAdsData);
      } catch (error) {
        console.error("VideoPage: Error fetching ads:", error);
      }
    };

    loadAds();
    
    // Set up real-time listeners for ads
    const adsChannel = supabase
      .channel('video-page-ads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        async () => {
          console.log('VideoPage: Ads changed, refetching');
          try {
            const [
              topAdsData,
              bottomAdsData,
              sidebarAdsData,
              inVideoAdsData,
              belowVideoAdsData,
              beforeVideoAdsData,
              afterVideoAdsData,
              sidebarTopAdsData,
              sidebarBottomAdsData,
              videoTopAdsData,
              videoMiddleAdsData,
              videoBottomAdsData,
              videoLeftAdsData,
              videoRightAdsData
            ] = await Promise.all([
              getAdsByPosition('top'),
              getAdsByPosition('bottom'),
              getAdsByPosition('sidebar'),
              getAdsByPosition('in-video'),
              getAdsByPosition('below-video'),
              getAdsByPosition('before-video'),
              getAdsByPosition('after-video'),
              getAdsByPosition('sidebar-top'),
              getAdsByPosition('sidebar-bottom'),
              getAdsByPosition('video-top'),
              getAdsByPosition('video-middle'),
              getAdsByPosition('video-bottom'),
              getAdsByPosition('video-left'),
              getAdsByPosition('video-right')
            ]);
            
            setTopAds(topAdsData);
            setBottomAds(bottomAdsData);
            setSidebarAds(sidebarAdsData);
            setInVideoAds(inVideoAdsData);
            setBelowVideoAds(belowVideoAdsData);
            setBeforeVideoAds(beforeVideoAdsData);
            setAfterVideoAds(afterVideoAdsData);
            setSidebarTopAds(sidebarTopAdsData);
            setSidebarBottomAds(sidebarBottomAdsData);
            setVideoTopAds(videoTopAdsData);
            setVideoMiddleAds(videoMiddleAdsData);
            setVideoBottomAds(videoBottomAdsData);
            setVideoLeftAds(videoLeftAdsData);
            setVideoRightAds(videoRightAdsData);
          } catch (error) {
            console.error("VideoPage: Error refetching ads:", error);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(adsChannel);
    };
  }, []);

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 flex items-center justify-center">
        <ErrorState errorMessage={error || "Video data is unavailable."} />
      </div>
    );
  }

  // Generate dynamic SEO metadata with video placeholders
  let pageTitle = video.title;
  let pageDescription = video.description || 'Watch this exciting video on our platform.';
  
  if (seoSettings) {
    pageTitle = seoSettings.title.replace('{title}', video.title);
    pageDescription = seoSettings.description.replace('{description}', video.description || '');
  }

  // Generate shorter share URL if custom URL exists
  const shareUrl = video.custom_url ? 
    `${window.location.origin}/v/${video.custom_url}` : 
    `${window.location.origin}/video/${video.id}`;

  return (
    <>
      <SEOHead 
        seoSettings={seoSettings}
        title={pageTitle}
        description={pageDescription}
        url={shareUrl}
        image={video.thumbnail || seoSettings?.og_image}
        type="video.movie"
        videoUrl={video.url}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 animate-fade-in">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Top ads */}
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
          
          <VideoHeader onCopyLink={copyCurrentLink} copied={copied} />
          
          {/* Before video ads */}
          {beforeVideoAds.length > 0 && (
            <div className="mb-6 before-video-ads-container">
              <AdsSection 
                ads={beforeVideoAds} 
                className="w-full" 
                staggerDelay={true} 
                baseDelaySeconds={1}
                positionClass="before-video-ads-section" 
              />
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <MainVideoSection 
              video={video} 
              inVideoAds={inVideoAds} 
              bottomAds={bottomAds}
              belowVideoAds={belowVideoAds}
              afterVideoAds={afterVideoAds}
              videoTopAds={videoTopAds}
              videoMiddleAds={videoMiddleAds}
              videoBottomAds={videoBottomAds}
              videoLeftAds={videoLeftAds}
              videoRightAds={videoRightAds}
            />
            
            <VideoSidebar 
              sidebarAds={sidebarAds} 
              sidebarTopAds={sidebarTopAds}
              sidebarBottomAds={sidebarBottomAds}
              onCopyLink={copyCurrentLink} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPage;
