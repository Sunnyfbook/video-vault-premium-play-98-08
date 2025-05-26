import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Video as VideoModel, getVideos } from '@/models/Video';
import { Ad as AdModel, getAds } from '@/models/Ad';
import { SEOSetting, getSEOSettings } from '@/models/SEO';
import { VideoAccessCode, getAccessCodes } from '@/models/VideoAccess';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import HomepageContentManager from "@/components/admin/HomepageContentManager";
import AdminCredentialsManager from '@/components/admin/AdminCredentialsManager';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import VideosTab from '@/components/admin/VideosTab';
import AdsTab from '@/components/admin/AdsTab';
import VideoAccessTab from '@/components/admin/VideoAccessTab';
import AccessCodeButtonTab from '@/components/admin/AccessCodeButtonTab';
import SEOTab from '@/components/admin/SEOTab';
import HomepageSettingsTab from '@/components/admin/HomepageSettingsTab';
import AdContainerSizesTab from '@/components/admin/AdContainerSizesTab';

const Admin: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [ads, setAds] = useState<AdModel[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [accessCodes, setAccessCodes] = useState<VideoAccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    // Load data on component mount
    const loadData = async () => {
      console.log('Admin: Loading initial data');
      setLoading(true);
      try {
        const [videosData, adsData, seoData, accessCodesData] = await Promise.allSettled([
          getVideos(),
          getAds(),
          getSEOSettings(),
          getAccessCodes()
        ]);
        
        if (videosData.status === 'fulfilled') {
          setVideos(videosData.value);
          console.log('Admin: Videos loaded successfully:', videosData.value.length);
        } else {
          console.error('Admin: Error loading videos:', videosData.reason);
          toast({
            title: "Error",
            description: "Failed to load videos from the database",
            variant: "destructive"
          });
        }
        
        if (adsData.status === 'fulfilled') {
          setAds(adsData.value);
          console.log('Admin: Ads loaded successfully:', adsData.value.length);
        } else {
          console.error('Admin: Error loading ads:', adsData.reason);
          toast({
            title: "Error",
            description: "Failed to load ads from the database",
            variant: "destructive"
          });
        }
        
        if (seoData.status === 'fulfilled') {
          setSeoSettings(seoData.value);
          console.log('Admin: SEO settings loaded successfully:', seoData.value.length);
        } else {
          console.error('Admin: Error loading SEO settings:', seoData.reason);
          toast({
            title: "Error",
            description: "Failed to load SEO settings from the database",
            variant: "destructive"
          });
        }
        
        if (accessCodesData.status === 'fulfilled') {
          setAccessCodes(accessCodesData.value);
          console.log('Admin: Access codes loaded successfully:', accessCodesData.value.length);
        } else {
          console.error('Admin: Error loading access codes:', accessCodesData.reason);
          toast({
            title: "Error",
            description: "Failed to load access codes from the database",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Admin: Unexpected error loading data:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up real-time listeners with improved error handling
    console.log('Admin: Setting up real-time subscriptions');
    
    const videosChannel = supabase
      .channel('admin_videos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' },
        async (payload) => {
          console.log('Admin: Videos table changed:', payload.eventType);
          try {
            const updatedVideos = await getVideos();
            setVideos(updatedVideos);
          } catch (error) {
            console.error('Admin: Error refetching videos:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin: Successfully subscribed to videos changes');
        }
        if (err) {
          console.error('Admin: Videos subscription error:', err);
        }
      });
      
    const adsChannel = supabase
      .channel('admin_ads_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        async (payload) => {
          console.log('Admin: Ads table changed:', payload.eventType);
          try {
            const updatedAds = await getAds();
            setAds(updatedAds);
          } catch (error) {
            console.error('Admin: Error refetching ads:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin: Successfully subscribed to ads changes');
        }
        if (err) {
          console.error('Admin: Ads subscription error:', err);
        }
      });
      
    const seoChannel = supabase
      .channel('admin_seo_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seo_settings' },
        async (payload) => {
          console.log('Admin: SEO settings table changed:', payload.eventType);
          try {
            const updatedSEO = await getSEOSettings();
            setSeoSettings(updatedSEO);
          } catch (error) {
            console.error('Admin: Error refetching SEO settings:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin: Successfully subscribed to SEO changes');
        }
        if (err) {
          console.error('Admin: SEO subscription error:', err);
        }
      });

    const accessCodesChannel = supabase
      .channel('admin_access_codes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_access_codes' },
        async (payload) => {
          console.log('Admin: Access codes table changed:', payload.eventType);
          try {
            const updatedAccessCodes = await getAccessCodes();
            setAccessCodes(updatedAccessCodes);
          } catch (error) {
            console.error('Admin: Error refetching access codes:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Admin: Successfully subscribed to access codes changes');
        }
        if (err) {
          console.error('Admin: Access codes subscription error:', err);
        }
      });
    
    // Clean up subscriptions
    return () => {
      console.log('Admin: Cleaning up real-time subscriptions');
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(seoChannel);
      supabase.removeChannel(accessCodesChannel);
    };
  }, [toast]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your videos and ads</p>
        </div>
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="outline">View Site</Button>
          </Link>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>
      </div>
      
      <Tabs defaultValue="videos">
        <TabsList className="mb-6">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="ad_sizes">Ad Sizes</TabsTrigger>
          <TabsTrigger value="access_codes">Video Access</TabsTrigger>
          <TabsTrigger value="access_button">Access Button</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="homepage_settings">Homepage Settings</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos">
          <VideosTab videos={videos} />
        </TabsContent>

        <TabsContent value="ads">
          <AdsTab ads={ads} />
        </TabsContent>

        <TabsContent value="ad_sizes">
          <AdContainerSizesTab />
        </TabsContent>

        <TabsContent value="access_codes">
          <VideoAccessTab accessCodes={accessCodes} />
        </TabsContent>

        <TabsContent value="access_button">
          <AccessCodeButtonTab />
        </TabsContent>

        <TabsContent value="seo">
          <SEOTab seoSettings={seoSettings} />
        </TabsContent>

        <TabsContent value="homepage">
          <HomepageContentManager />
        </TabsContent>

        <TabsContent value="homepage_settings">
          <HomepageSettingsTab />
        </TabsContent>

        <TabsContent value="account">
          <AdminCredentialsManager />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
