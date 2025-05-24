
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
import SEOTab from '@/components/admin/SEOTab';
import HomepageSettingsTab from '@/components/admin/HomepageSettingsTab';

const Admin: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [videos, setVideos] = useState<VideoModel[]>([]);
  const [ads, setAds] = useState<AdModel[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [accessCodes, setAccessCodes] = useState<VideoAccessCode[]>([]);
  const { toast } = useToast();
  
  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  useEffect(() => {
    // Load data on component mount
    const loadData = async () => {
      try {
        const videosData = await getVideos();
        setVideos(videosData);
        
        const adsData = await getAds();
        setAds(adsData);
        
        const seoData = await getSEOSettings();
        setSeoSettings(seoData);
        
        const accessCodesData = await getAccessCodes();
        setAccessCodes(accessCodesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data from the database",
          variant: "destructive"
        });
      }
    };
    
    loadData();
    
    // Set up real-time listeners
    const videosChannel = supabase
      .channel('public:videos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' },
        () => { getVideos().then(setVideos); }
      )
      .subscribe();
      
    const adsChannel = supabase
      .channel('public:ads')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        () => { getAds().then(setAds); }
      )
      .subscribe();
      
    const seoChannel = supabase
      .channel('public:seo')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seo_settings' },
        () => { getSEOSettings().then(setSeoSettings); }
      )
      .subscribe();

    const accessCodesChannel = supabase
      .channel('public:video_access_codes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_access_codes' },
        () => { getAccessCodes().then(setAccessCodes); }
      )
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(seoChannel);
      supabase.removeChannel(accessCodesChannel);
    };
  }, [toast]);
  
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
          <TabsTrigger value="access_codes">Video Access</TabsTrigger>
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

        <TabsContent value="access_codes">
          <VideoAccessTab accessCodes={accessCodes} />
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
