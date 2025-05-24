
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
    
    // First try to update existing record
    const { data: updateResult, error: updateError } = await supabase
      .from("access_code_button_config")
      .update(updateData)
      .eq("id", "main_config")
      .select()
      .single();
    
    if (updateError && updateError.code === 'PGRST116') {
      // No rows returned, so insert new record
      console.log('No existing record found, inserting new one');
      const { data: insertResult, error: insertError } = await supabase
        .from("access_code_button_config")
        .insert(updateData)
        .select()
        .single();
      
      if (insertError) {
        console.error("Error inserting access code button config:", insertError);
        throw new Error(`Failed to create access code button config: ${insertError.message}`);
      }
      
      console.log('Successfully created access code button config:', insertResult);
      return insertResult as AccessCodeButtonConfig;
    } else if (updateError) {
      console.error("Error updating access code button config:", updateError);
      throw new Error(`Failed to update access code button config: ${updateError.message}`);
    }
    
    console.log('Successfully updated access code button config:', updateResult);
    return updateResult as AccessCodeButtonConfig;
    
  } catch (error) {
    console.error("Error updating access code button config:", error);
    throw error;
  }
};
