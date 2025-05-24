import { supabase } from "@/integrations/supabase/client";

export interface HomepageConfig {
  id: string;
  site_title: string | null;
  site_description: string | null;
  footer_copyright: string | null;
  container_max_width: string | null;
  container_aspect_ratio: string | null;
  updated_at: string | null;
}

export const defaultConfig: HomepageConfig = {
  id: 'main_config',
  site_title: 'Video Player Pro',
  site_description: 'Immerse yourself in our curated collection of high-definition videos and breathtaking featured images. Experience content like never before.',
  footer_copyright: '© 2025 Video Player Pro. All rights reserved.',
  container_max_width: '280px',
  container_aspect_ratio: '9/16',
  updated_at: null
};

// Helper function to ensure admin context is properly set
const ensureAdminContext = async () => {
  const userId = localStorage.getItem('userId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  console.log('Setting admin context for homepage config:', { userId, isAdmin });
  
  if (!userId || !isAdmin) {
    throw new Error('Admin access required');
  }

  // Set the custom auth context for RLS policies
  const { data, error } = await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId,
    is_local: true
  });

  if (error) {
    console.error('Error setting auth context:', error);
    throw error;
  }

  console.log('Auth context set successfully for homepage config:', data);
  return true;
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
    await ensureAdminContext();

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
      // Since we've already created the default config in the SQL migration,
      // this should not be needed anymore, but keeping it for safety
      console.log("Homepage config already exists or was created by migration");
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
