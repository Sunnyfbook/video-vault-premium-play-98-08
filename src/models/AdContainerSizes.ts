
import { supabase } from '@/integrations/supabase/client';

export interface AdContainerSizes {
  id: string;
  in_video_width: number;
  in_video_height: number;
  top_width: number;
  top_height: number;
  below_video_width: number;
  below_video_height: number;
  bottom_width: number;
  bottom_height: number;
  sidebar_width: number;
  sidebar_height: number;
  created_at: string;
  updated_at: string;
}

export const getAdContainerSizes = async (): Promise<AdContainerSizes | null> => {
  const { data, error } = await supabase
    .from('ad_container_sizes')
    .select('*')
    .eq('id', 'main_config')
    .maybeSingle();

  if (error) {
    console.error('Error fetching ad container sizes:', error);
    return null;
  }

  return data;
};

export const updateAdContainerSizes = async (sizes: Partial<Omit<AdContainerSizes, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('ad_container_sizes')
    .update({
      ...sizes,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'main_config');

  if (error) {
    console.error('Error updating ad container sizes:', error);
    return false;
  }

  return true;
};
