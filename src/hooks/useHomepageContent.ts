
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
    setLoading(true);
    setError(null);
    
    // Get content from Supabase
    // The RLS policies we created will handle the access control
    const { data, error } = await supabase
      .from("homepage_content")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) {
      console.error("Error fetching homepage content:", error);
      setError(error.message);
      setContent([]);
      setLoading(false);
      return;
    }
    
    setContent((data || []) as HomepageContent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContent();

    // Set up realtime listener
    const channel = supabase
      .channel("public:homepage_content")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content" },
        fetchContent
      )
      .subscribe();

    return () => {
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
