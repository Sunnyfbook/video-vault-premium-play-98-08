
import { supabase } from "@/integrations/supabase/client";

export interface HomepageConfig {
  id: string;
  site_title: string | null;
  site_description: string | null;
  footer_copyright: string | null;
  updated_at: string | null;
}

export const defaultConfig: HomepageConfig = {
  id: 'main_config',
  site_title: 'Video Player Pro',
  site_description: 'Immerse yourself in our curated collection of high-definition videos and breathtaking featured images. Experience content like never before.',
  footer_copyright: '© 2025 Video Player Pro. All rights reserved.',
  updated_at: null
};

export const getHomepageConfig = async (): Promise<HomepageConfig> => {
  try {
    const { data, error } = await supabase
      .from("homepage_config")
      .select("*")
      .eq("id", "main_config")
      .single();

    if (error) {
      console.error("Error fetching homepage config:", error);
      return defaultConfig;
    }

    return data as HomepageConfig;
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    return defaultConfig;
  }
};

export const updateHomepageConfig = async (updates: Partial<HomepageConfig>): Promise<HomepageConfig | null> => {
  try {
    // Don't update the id field
    const updateData = { ...updates };
    delete updateData.id;
    
    const { data, error } = await supabase
      .from("homepage_config")
      .update(updateData)
      .eq("id", "main_config")
      .select()
      .single();

    if (error) {
      console.error("Error updating homepage config:", error);
      throw error;
    }

    return data as HomepageConfig;
  } catch (error) {
    console.error("Error updating homepage config:", error);
    throw error;
  }
};

export const ensureHomepageConfigExists = async (): Promise<void> => {
  try {
    // Check if the config exists
    const { data, error } = await supabase
      .from("homepage_config")
      .select("id")
      .eq("id", "main_config")
      .maybeSingle();

    if (error) {
      console.error("Error checking homepage config:", error);
      return;
    }

    if (!data) {
      // If not found, insert the default config
      const { error: insertError } = await supabase
        .from("homepage_config")
        .insert([defaultConfig]);

      if (insertError) {
        console.error("Error creating default homepage config:", insertError);
      }
    }
  } catch (error) {
    console.error("Error ensuring homepage config exists:", error);
  }
};

// Setup real-time subscription to homepage config changes
export const setupHomepageConfigSubscription = (onUpdate: () => void) => {
  const channel = supabase
    .channel('homepage_config_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'homepage_config', filter: `id=eq.${defaultConfig.id}` },
      () => {
        onUpdate();
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
