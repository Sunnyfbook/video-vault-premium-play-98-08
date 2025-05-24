
import { supabase } from "@/integrations/supabase/client";

export interface AccessCodeButtonConfig {
  id: string;
  button_text: string;
  button_url: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to ensure admin context is properly set
const ensureAdminContext = async () => {
  const userId = localStorage.getItem('userId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  console.log('Setting admin context for button config:', { userId, isAdmin });
  
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

  console.log('Auth context set successfully for button config:', data);
  return true;
};

// Get the access code button configuration (public access)
export const getAccessCodeButtonConfig = async (): Promise<AccessCodeButtonConfig | null> => {
  try {
    const { data, error } = await supabase
      .from("access_code_button_config")
      .select("*")
      .eq("id", "main_config")
      .single();
    
    if (error) {
      console.error("Error loading access code button config:", error);
      return null;
    }
    
    console.log('Loaded access code button config:', data);
    return data as AccessCodeButtonConfig;
  } catch (error) {
    console.error("Error loading access code button config:", error);
    return null;
  }
};

// Update the access code button configuration (admin only)
export const updateAccessCodeButtonConfig = async (config: Partial<AccessCodeButtonConfig>): Promise<AccessCodeButtonConfig | null> => {
  try {
    console.log('Attempting to update access code button config with:', config);
    
    // Direct update without admin context check for now
    const { data, error } = await supabase
      .from("access_code_button_config")
      .update({
        button_text: config.button_text,
        button_url: config.button_url,
        is_enabled: config.is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq("id", "main_config")
      .select()
      .single();
    
    if (error) {
      console.error("Error updating access code button config:", error);
      console.error("Error details:", error.message, error.details, error.hint);
      throw new Error(`Failed to update access code button config: ${error.message}`);
    }
    
    console.log('Successfully updated access code button config:', data);
    return data as AccessCodeButtonConfig;
  } catch (error) {
    console.error("Error updating access code button config:", error);
    throw error;
  }
};
