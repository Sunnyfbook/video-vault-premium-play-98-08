
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomepageConfig, getHomepageConfig, defaultConfig, ensureHomepageConfigExists } from "@/models/HomepageConfig";

export function useHomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async (isInitialLoad = false) => {
    console.log('useHomepageConfig: Fetching homepage config');
    if (isInitialLoad) setLoading(true);
    setError(null);
    
    try {
      // Ensure config exists, then fetch it
      await ensureHomepageConfigExists();
      const data = await getHomepageConfig();
      console.log('useHomepageConfig: Config fetched successfully');
      setConfig(data);
    } catch (e: any) {
      console.error("useHomepageConfig: Error in fetchConfig:", e);
      setError(`Failed to load homepage configuration: ${e.message}`);
      setConfig(defaultConfig); // Fallback to default on error
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig(true); // Initial fetch

    console.log('useHomepageConfig: Setting up real-time subscription');
    const channel = supabase
      .channel("homepage_config_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_config", filter: `id=eq.${defaultConfig.id}` },
        (payload) => {
          console.log("useHomepageConfig: Homepage config change received!", payload.eventType);
          if (payload.new && payload.eventType !== 'DELETE') {
            console.log('useHomepageConfig: Updating config from real-time data');
            setConfig(payload.new as HomepageConfig);
          } else {
            // If payload.new is not there (e.g. on delete, though we don't expect delete for this row)
            // or if there's an issue, refetch.
            console.log('useHomepageConfig: Refetching config due to incomplete payload');
            fetchConfig();
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('useHomepageConfig: Successfully subscribed to real-time updates');
        }
        if (err) {
          console.error('useHomepageConfig: Subscription error:', err);
          setError('Failed to subscribe to real-time updates');
        }
      });

    return () => {
      console.log('useHomepageConfig: Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchConfig]);

  return { config, loading, error, refetchConfig: fetchConfig };
}
