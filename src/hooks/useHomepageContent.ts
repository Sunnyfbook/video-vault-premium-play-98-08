
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HomepageContent = {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  type: "video" | "image";
  display_order?: number;
};

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("homepage_content")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      setContent([]);
      setLoading(false);
      return;
    }
    setContent(
      (data || []) as HomepageContent[]
    );
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

  const videos = content.filter((c) => c.type === "video");
  const images = content.filter((c) => c.type === "image");

  return { content, videos, images, loading, refetch: fetchContent };
}
