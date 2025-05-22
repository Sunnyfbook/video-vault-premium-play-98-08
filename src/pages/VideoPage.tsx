
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import AdContainer from '@/components/AdContainer';
import { getVideoById, incrementViews, Video } from '@/models/Video';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Loading video...</h1>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Video not found</h1>
        <p className="mb-8">The video you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 lg:py-8 bg-gray-50 min-h-screen">
      {/* Top ads */}
      {topAds.length > 0 && (
        <div className="mb-6">
          {topAds.map(ad => (
            <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
          ))}
        </div>
      )}
      
      {/* Back button */}
      <div className="flex justify-between items-center mb-4">
        <Link to="/" className="inline-flex items-center text-brand hover:text-brand-accent">
          <ArrowLeft className="mr-2" size={16} />
          Back to home
        </Link>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={copyCurrentLink}
        >
          {copied ? 'Copied!' : 'Share Video'}
          <Copy size={16} />
        </Button>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="w-full lg:w-8/12">
          {/* In-video ads above player */}
          {inVideoAds.length > 0 && (
            <div className="mb-4">
              {inVideoAds.map(ad => (
                <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
              ))}
            </div>
          )}
          
          {/* Video player */}
          <div className="bg-black rounded-lg shadow-lg overflow-hidden">
            <VideoPlayer src={video.url} title={video.title} />
          </div>
          
          {/* Video info */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-1">{video.title}</h1>
            <div className="flex text-sm text-gray-500 mb-4">
              <span>{new Date(video.dateAdded).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{video.views} views</span>
            </div>
            <p className="text-gray-700">{video.description}</p>
          </div>
          
          {/* Bottom ads - showing more of them */}
          {bottomAds.length > 0 && (
            <div className="mt-8 grid gap-4">
              {bottomAds.map(ad => (
                <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-4/12 mt-8 lg:mt-0">
          {/* Sidebar ads - showing in a grid for mobile, stack for desktop */}
          {sidebarAds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {sidebarAds.map(ad => (
                <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
              ))}
            </div>
          )}
          
          {/* Additional sidebar content */}
          <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
            <h3 className="font-semibold mb-2">About this video</h3>
            <p className="text-sm text-gray-600 mb-4">
              This premium content is provided by Video Player Pro.
            </p>
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={copyCurrentLink}
              >
                Copy Link
                <Copy size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={() => window.open('/', '_blank')}
              >
                More Videos
                <ExternalLink size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
