
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import AdContainer from '@/components/AdContainer';
import { getVideoById, incrementViews, Video } from '@/models/Video';
import { getAdsByPosition, Ad } from '@/models/Ad';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [sidebarAds, setSidebarAds] = useState<Ad[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const foundVideo = getVideoById(id);
      
      if (foundVideo) {
        setVideo(foundVideo);
        // Increment view count
        incrementViews(id);
      } else {
        toast({
          title: "Video Not Found",
          description: "The requested video could not be found.",
          variant: "destructive",
        });
      }

      // Load ads by position
      setTopAds(getAdsByPosition('top'));
      setBottomAds(getAdsByPosition('bottom'));
      setSidebarAds(getAdsByPosition('sidebar'));
    }
  }, [id, toast]);

  if (!video) {
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
    <div className="container mx-auto px-4 py-4 lg:py-8">
      {/* Back button */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center text-brand hover:text-brand-accent">
          <ArrowLeft className="mr-2" size={16} />
          Back to videos
        </Link>
      </div>
      
      {/* Top ads */}
      {topAds.length > 0 && (
        <div className="mb-6">
          {topAds.map(ad => (
            <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
          ))}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row">
        {/* Main content */}
        <div className="w-full lg:w-8/12">
          {/* Video player */}
          <VideoPlayer src={video.url} title={video.title} />
          
          {/* Video info */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold mb-1">{video.title}</h1>
            <div className="flex text-sm text-gray-500 mb-4">
              <span>{new Date(video.dateAdded).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{video.views} views</span>
            </div>
            <p className="text-gray-700">{video.description}</p>
          </div>
          
          {/* Bottom ads */}
          {bottomAds.length > 0 && (
            <div className="mt-8">
              {bottomAds.map(ad => (
                <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-4/12 lg:pl-6 mt-8 lg:mt-0">
          {/* Sidebar ads */}
          {sidebarAds.length > 0 && (
            <div>
              {sidebarAds.map(ad => (
                <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
