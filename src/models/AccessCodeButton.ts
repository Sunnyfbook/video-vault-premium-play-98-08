
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
    console.log('Attempting to update access code button config with:', config);
    
    const updateData = {
      id: "main_config",
      button_text: config.button_text || "Get Access Code",
      button_url: config.button_url || "https://example.com/get-access",
      is_enabled: config.is_enabled ?? true,
      updated_at: new Date().toISOString()
    };
    
    console.log('Update data being sent:', updateData);
    
    // Use upsert to either insert or update
    const { data, error } = await supabase
      .from("access_code_button_config")
      .upsert(updateData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error upserting access code button config:", error);
      throw new Error(`Failed to update access code button config: ${error.message}`);
    }
    
    console.log('Successfully updated access code button config:', data);
    return data as AccessCodeButtonConfig;
    
  } catch (error) {
    console.error("Error updating access code button config:", error);
    throw error;
  }
};
