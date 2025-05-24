
import { supabase } from "@/integrations/supabase/client";

export interface AccessCodeButtonConfig {
  id: string;
  button_text: string;
  button_url: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Get the access code button configuration (public access)
export const getAccessCodeButtonConfig = async (): Promise<AccessCodeButtonConfig | null> => {
  try {
    const { data, error } = await supabase
      .from("access_code_button_config")
      .select("*")
      .eq("id", "main_config")
      .maybeSingle();
    
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
    console.log('Attempting to update button config with:', config);
    
    // Use upsert method with explicit fields to avoid RLS issues
    const { data, error } = await supabase
      .from("access_code_button_config")
      .upsert({
        id: "main_config",
        button_text: config.button_text,
        button_url: config.button_url,
        is_enabled: config.is_enabled,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error("Error updating button config:", error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned from update operation");
      return null;
    }
    
    console.log('Successfully updated button config:', data[0]);
    return data[0] as AccessCodeButtonConfig;
  } catch (error) {
    console.error("Error updating button config:", error);
    throw error;
  }
};
