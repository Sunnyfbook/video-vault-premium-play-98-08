
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomepageHeader from '@/components/homepage/HomepageHeader';
import FeaturedCarousel from '@/components/homepage/FeaturedCarousel';
import ContentGrid from '@/components/homepage/ContentGrid';
import AdContainer from '@/components/AdContainer';
import { getFeaturedContent, getVideoContent, getImageContent, HomepageContent } from '@/models/Homepage';
import { getAdsByPosition } from '@/models/Ad';
import { Ad } from '@/models/Ad';

const Index = () => {
  const [featuredContent, setFeaturedContent] = useState<HomepageContent[]>([]);
  const [videoContent, setVideoContent] = useState<HomepageContent[]>([]);
  const [imageContent, setImageContent] = useState<HomepageContent[]>([]);
  const [topAds, setTopAds] = useState<Ad[]>([]);
  const [bottomAds, setBottomAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Load homepage content
        const [featured, videos, images, topAdsData, bottomAdsData] = await Promise.all([
          getFeaturedContent(),
          getVideoContent(),
          getImageContent(),
          getAdsByPosition('top'),
          getAdsByPosition('bottom')
        ]);

        setFeaturedContent(featured);
        setVideoContent(videos);
        setImageContent(images);
        setTopAds(topAdsData);
        setBottomAds(bottomAdsData);
      } catch (error) {
        console.error('Error loading homepage content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageHeader />
      
      {topAds.length > 0 && (
        <div className="container mx-auto py-4">
          {topAds.map((ad) => (
            <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
          ))}
        </div>
      )}
      
      {isLoading ? (
        <div className="container mx-auto py-16 flex justify-center">
          <div className="animate-pulse space-y-8 w-full max-w-5xl">
            <div className="h-[400px] bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {featuredContent.length > 0 && <FeaturedCarousel items={featuredContent} />}
          
          <Tabs defaultValue="videos" className="container mx-auto px-4 py-8">
            <TabsList className="mb-6">
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos">
              {videoContent.length > 0 ? (
                <ContentGrid title="Latest Videos" items={videoContent} type="video" />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">No videos available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="images">
              {imageContent.length > 0 ? (
                <ContentGrid title="Featured Images" items={imageContent} type="image" />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">No images available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {bottomAds.length > 0 && (
        <div className="container mx-auto py-4">
          {bottomAds.map((ad) => (
            <AdContainer key={ad.id} adType={ad.type} adCode={ad.code} className="mb-4" />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
