
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomepageConfig, getHomepageConfig, defaultConfig, ensureHomepageConfigExists } from "@/models/HomepageConfig";

export function useHomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setError(null);
    try {
      // Ensure config exists, then fetch it
      await ensureHomepageConfigExists();
      const data = await getHomepageConfig();
      setConfig(data);
    } catch (e: any) {
      console.error("Error in fetchConfig:", e);
      setError(e.message);
      setConfig(defaultConfig); // Fallback to default on error
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig(true); // Initial fetch

    const channel = supabase
      .channel("public:homepage_config")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_config", filter: `id=eq.${defaultConfig.id}` },
        (payload) => {
          console.log("Homepage config change received!", payload);
          if (payload.new) {
            setConfig(payload.new as HomepageConfig);
          } else {
            // If payload.new is not there (e.g. on delete, though we don't expect delete for this row)
            // or if there's an issue, refetch.
            fetchConfig();
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to homepage_config changes!');
        }
        if (err) {
          console.error('Error subscribing to homepage_config:', err);
          setError('Failed to subscribe to real-time updates.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConfig]);

  return { config, loading, error, refetchConfig: fetchConfig };
}
