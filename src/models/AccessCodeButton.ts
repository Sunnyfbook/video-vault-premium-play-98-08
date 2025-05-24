
export interface AccessCodeButtonConfig {
  id: string;
  button_text: string;
  button_url: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'access_code_button_config';

// Default configuration
const defaultConfig: AccessCodeButtonConfig = {
  id: "main_config",
  button_text: "Get Access Code",
  button_url: "https://example.com/get-access",
  is_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Get the access code button configuration from localStorage
export const getAccessCodeButtonConfig = async (): Promise<AccessCodeButtonConfig | null> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored) as AccessCodeButtonConfig;
      console.log('Loaded access code button config from localStorage:', config);
      return config;
    }
    
    // Return default config if nothing stored
    console.log('No config found in localStorage, returning default config');
    return defaultConfig;
  } catch (error) {
    console.error("Error loading access code button config from localStorage:", error);
    return defaultConfig;
  }
};

// Update the access code button configuration in localStorage
export const updateAccessCodeButtonConfig = async (config: Partial<AccessCodeButtonConfig>): Promise<AccessCodeButtonConfig | null> => {
  try {
    console.log('Attempting to update button config in localStorage with:', config);
    
    // Get current config or use default
    const currentConfig = await getAccessCodeButtonConfig() || defaultConfig;
    
    // Update with new values
    const updatedConfig: AccessCodeButtonConfig = {
      ...currentConfig,
      ...config,
      id: "main_config", // Always keep the same ID
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    
    console.log('Successfully updated button config in localStorage:', updatedConfig);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('accessCodeButtonConfigChanged', { 
      detail: updatedConfig 
    }));
    
    return updatedConfig;
  } catch (error) {
    console.error("Error updating button config in localStorage:", error);
    throw error;
  }
};
