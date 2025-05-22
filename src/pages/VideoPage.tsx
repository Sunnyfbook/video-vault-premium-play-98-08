
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoById, incrementViews, Video } from '@/models/Video';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { useToast } from '@/hooks/use-toast';

// Import our new components
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
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      // Reset states when ID changes
      setLoading(true);
      setError(null);
      
      try {
        const foundVideo = getVideoById(id);
        
        if (foundVideo) {
          setVideo(foundVideo);
          // Increment view count
          incrementViews(id);
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
      setTopAds(getAdsByPosition('top'));
      setBottomAds(getAdsByPosition('bottom'));
      setSidebarAds(getAdsByPosition('sidebar'));
      setInVideoAds(getAdsByPosition('in-video'));
    }
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

  return (
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
  );
};

export default VideoPage;
