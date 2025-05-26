
import { useState, useEffect } from 'react';
import { getSEOSettingByPage, SEOSetting } from '@/models/SEO';
import { supabase } from '@/integrations/supabase/client';

export const useSEOSettings = (page: string) => {
  const [seoSettings, setSeoSettings] = useState<SEOSetting | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        console.log(`useSEOSettings: Fetching SEO settings for page: ${page}`);
        console.log('useSEOSettings: Current window location:', window.location.href);
        setLoading(true);
        const settings = await getSEOSettingByPage(page);
        setSeoSettings(settings);
        console.log(`useSEOSettings: Loaded SEO settings for ${page}:`, settings);
        
        // Log the actual meta tags being set
        if (settings) {
          console.log('useSEOSettings: SEO Title:', settings.title);
          console.log('useSEOSettings: SEO Description:', settings.description);
          console.log('useSEOSettings: OG Title:', settings.og_title);
          console.log('useSEOSettings: OG Description:', settings.og_description);
        } else {
          console.log('useSEOSettings: No SEO settings found, will use defaults');
        }
      } catch (err) {
        console.error(`useSEOSettings: Error fetching SEO settings for ${page}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load SEO settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSEOSettings();

    // Set up real-time listener for SEO settings changes
    const channel = supabase
      .channel('seo-settings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seo_settings' },
        async (payload) => {
          console.log('useSEOSettings: SEO settings changed, refetching for page:', page);
          console.log('useSEOSettings: Payload:', payload);
          try {
            const settings = await getSEOSettingByPage(page);
            setSeoSettings(settings);
            console.log(`useSEOSettings: Updated SEO settings for ${page}:`, settings);
          } catch (err) {
            console.error(`useSEOSettings: Error refetching SEO settings for ${page}:`, err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page]);

  return { seoSettings, loading, error };
};
