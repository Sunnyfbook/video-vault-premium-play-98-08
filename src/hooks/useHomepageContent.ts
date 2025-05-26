
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HomepageContent = {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  type: "video" | "image" | "instagram";
  display_order?: number;
};

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    console.log('useHomepageContent: Fetching homepage content');
    setLoading(true);
    setError(null);
    
    try {
      // Get content from Supabase
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) {
        console.error("useHomepageContent: Error fetching homepage content:", error);
        setError(`Failed to load homepage content: ${error.message}`);
        setContent([]);
        return;
      }
      
      console.log('useHomepageContent: Content fetched successfully:', data?.length || 0);
      setContent((data || []) as HomepageContent[]);
    } catch (err) {
      console.error("useHomepageContent: Unexpected error:", err);
      setError('An unexpected error occurred while loading content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    // Set up realtime listener with proper error handling
    console.log('useHomepageContent: Setting up real-time subscription');
    const channel = supabase
      .channel("homepage_content_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content" },
        (payload) => {
          console.log('useHomepageContent: Real-time change detected:', payload.eventType);
          // Refetch content to ensure consistency
          fetchContent();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('useHomepageContent: Successfully subscribed to real-time updates');
        }
        if (err) {
          console.error('useHomepageContent: Subscription error:', err);
          setError('Failed to subscribe to real-time updates');
        }
      });

    return () => {
      console.log('useHomepageContent: Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchContent]);

  // Categorize content:
  // - Instagram reels are treated as videos
  // - Instagram posts are treated as images
  // - Regular videos and images are handled as before
  const videos = content.filter((c) => 
    c.type === "video" || (c.type === "instagram" && c.url.includes("/reel"))
  );
  
  const images = content.filter((c) => 
    c.type === "image" || (c.type === "instagram" && !c.url.includes("/reel"))
  );

  return { content, videos, images, loading, error, refetch: fetchContent };
}
