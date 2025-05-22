
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getVideos, Video as VideoType } from '@/models/Video';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get videos from local storage
    const fetchedVideos = getVideos();
    setVideos(fetchedVideos);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Video Player</h1>
          <p className="text-gray-500">Watch and enjoy high quality videos</p>
        </div>
        <Link to="/admin">
          <Button variant="outline">Admin Panel</Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-semibold mb-4">No videos available yet</h2>
          <p className="text-gray-500 mb-8 text-center">
            Login to the admin panel to add videos to your collection
          </p>
          <Link to="/admin">
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/video/${video.id}`}>
                <div className="relative pt-[56.25%]">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Thumbnail</span>
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{video.title}</CardTitle>
                <CardDescription>{new Date(video.dateAdded).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-500 text-sm line-clamp-2">{video.description}</p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <span className="text-sm text-gray-500">{video.views} views</span>
                <Link to={`/video/${video.id}`}>
                  <Button variant="secondary" size={isMobile ? "sm" : "default"}>Watch Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
