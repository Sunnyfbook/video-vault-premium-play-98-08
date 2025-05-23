
import { supabase } from '@/integrations/supabase/client';

export interface DownloadConfig {
  id: string;
  download_url: string;
  created_at: string;
  updated_at: string;
}

export const getDownloadConfig = async (): Promise<DownloadConfig | null> => {
  const { data, error } = await supabase
    .from('download_config')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching download config:', error);
    return null;
  }

  return data;
};

export const updateDownloadConfig = async (downloadUrl: string): Promise<boolean> => {
  // Get the first config record (we only have one)
  const { data: existingConfig } = await supabase
    .from('download_config')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (!existingConfig) {
    console.error('No download config found to update');
    return false;
  }

  const { error } = await supabase
    .from('download_config')
    .update({ 
      download_url: downloadUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', existingConfig.id);

  if (error) {
    console.error('Error updating download config:', error);
    return false;
  }

  return true;
};
