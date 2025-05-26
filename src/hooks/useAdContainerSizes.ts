
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAdContainerSizes, AdContainerSizes } from '@/models/AdContainerSizes';

export function useAdContainerSizes() {
  const [sizes, setSizes] = useState<AdContainerSizes | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const data = await getAdContainerSizes();
      setSizes(data);
    } catch (error) {
      console.error('Error fetching ad container sizes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();

    // Set up real-time listener
    const channel = supabase
      .channel('ad_container_sizes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ad_container_sizes' },
        () => {
          fetchSizes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    sizes,
    loading,
    refetch: fetchSizes
  };
}
