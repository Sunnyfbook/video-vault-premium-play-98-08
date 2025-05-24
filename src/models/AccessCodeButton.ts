
import { supabase } from '@/integrations/supabase/client';

export interface AccessCodeButtonConfig {
  id: string;
  button_text: string;
  button_url: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Default configuration
const defaultConfig: Omit<AccessCodeButtonConfig, 'created_at' | 'updated_at'> = {
  id: "main_config",
  button_text: "Get Access Code",
  button_url: "https://example.com/get-access",
  is_enabled: true
};

// Get the access code button configuration from Supabase
export const getAccessCodeButtonConfig = async (): Promise<AccessCodeButtonConfig | null> => {
  try {
    console.log('Loading access code button config from Supabase...');
    
    const { data, error } = await supabase
      .from('access_code_button_config')
      .select('*')
      .eq('id', 'main_config')
      .maybeSingle();

    if (error) {
      console.error('Error loading access code button config:', error);
      return null;
    }

    if (data) {
      console.log('Loaded access code button config from Supabase:', data);
      return data as AccessCodeButtonConfig;
    }

    // If no config exists, create default one
    console.log('No config found, creating default config');
    const { data: newData, error: insertError } = await supabase
      .from('access_code_button_config')
      .insert({
        id: defaultConfig.id,
        button_text: defaultConfig.button_text,
        button_url: defaultConfig.button_url,
        is_enabled: defaultConfig.is_enabled
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating default config:', insertError);
      return null;
    }

    return newData as AccessCodeButtonConfig;
  } catch (error) {
    console.error("Error loading access code button config from Supabase:", error);
    return null;
  }
};

// Update the access code button configuration in Supabase
export const updateAccessCodeButtonConfig = async (config: Partial<AccessCodeButtonConfig>): Promise<AccessCodeButtonConfig | null> => {
  try {
    console.log('Updating button config in Supabase with:', config);
    
    const { data, error } = await supabase
      .from('access_code_button_config')
      .update({
        button_text: config.button_text,
        button_url: config.button_url,
        is_enabled: config.is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'main_config')
      .select()
      .single();
    
    if (error) {
      console.error("Error updating button config in Supabase:", error);
      throw error;
    }
    
    console.log('Successfully updated button config in Supabase:', data);
    return data as AccessCodeButtonConfig;
  } catch (error) {
    console.error("Error updating button config in Supabase:", error);
    throw error;
  }
};
