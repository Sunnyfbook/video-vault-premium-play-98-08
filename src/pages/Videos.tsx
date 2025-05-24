
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, getVideos } from '@/models/Video';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Videos page: Fetching videos');
        const videosData = await getVideos();
        console.log('Videos page: Fetched videos:', videosData.length);
        setVideos(videosData);
      } catch (error) {
        console.error('Videos page: Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">All Videos</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse through our complete collection of videos
          </p>
        </header>

        {videos.length === 0 ? (
          <div className="text-center py-20">
            <Play size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
              No videos available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Check back later for new content!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const videoUrl = video.custom_url ? `/v/${video.custom_url}` : `/video/${video.id}`;
              console.log('Video card:', video.title, 'URL:', videoUrl);
              
              return (
                <Card key={video.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        <Play size={32} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play size={32} className="text-white" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg">{video.title}</CardTitle>
                    {video.description && (
                      <CardDescription className="line-clamp-2">
                        {video.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDistanceToNow(new Date(video.date_added))} ago</span>
                      </div>
                    </div>
                    
                    <Link to={videoUrl} className="block">
                      <Button className="w-full">
                        <Play size={16} className="mr-2" />
                        Watch Video
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
