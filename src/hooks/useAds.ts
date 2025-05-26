
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdsByPosition, Ad } from "@/models/Ad";

export function useAds() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAds = useCallback(async () => {
    console.log('useAds: Fetching all ads from Supabase');
    setLoading(true);
    setError(null);
    
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
      
      console.log(`useAds: Fetched ads - top: ${topAdsData.length}, bottom: ${bottomAdsData.length}, sidebar: ${sidebarAdsData.length}, in-video: ${inVideoAdsData.length}, below-video: ${belowVideoAdsData.length}, before-video: ${beforeVideoAdsData.length}, after-video: ${afterVideoAdsData.length}, sidebar-top: ${sidebarTopAdsData.length}, sidebar-bottom: ${sidebarBottomAdsData.length}, video-top: ${videoTopAdsData.length}, video-middle: ${videoMiddleAdsData.length}, video-bottom: ${videoBottomAdsData.length}, video-left: ${videoLeftAdsData.length}, video-right: ${videoRightAdsData.length}`);
      
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
    } catch (err) {
      console.error('useAds: Error fetching ads:', err);
      setError('Failed to load ads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAds();

    // Set up real-time listener for ads changes
    console.log('useAds: Setting up real-time subscription for ads');
    const adsChannel = supabase
      .channel('ads_real_time')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ads' },
        (payload) => {
          console.log('useAds: Real-time ads change detected:', payload.eventType);
          // Refetch all ads when any change occurs
          fetchAllAds();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('useAds: Successfully subscribed to ads real-time updates');
        }
        if (err) {
          console.error('useAds: Subscription error:', err);
          setError('Failed to subscribe to real-time updates');
        }
      });

    return () => {
      console.log('useAds: Cleaning up ads real-time subscription');
      supabase.removeChannel(adsChannel);
    };
  }, [fetchAllAds]);

  return {
    topAds,
    bottomAds,
    sidebarAds,
    inVideoAds,
    belowVideoAds,
    beforeVideoAds,
    afterVideoAds,
    sidebarTopAds,
    sidebarBottomAds,
    videoTopAds,
    videoMiddleAds,
    videoBottomAds,
    videoLeftAds,
    videoRightAds,
    loading,
    error,
    refetchAds: fetchAllAds
  };
}
