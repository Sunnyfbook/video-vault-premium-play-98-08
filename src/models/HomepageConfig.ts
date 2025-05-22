
import { supabase } from "@/integrations/supabase/client";

export interface HomepageConfig {
  id: string; // Should be a fixed value like 'main_config' for the single row
  site_title?: string | null;
  site_description?: string | null;
  footer_copyright?: string | null;
  updated_at?: string;
}

export const defaultConfig: HomepageConfig = {
  id: "main_config",
  site_title: "Video Player Pro",
  site_description: "Immerse yourself in our curated collection of high-definition videos and breathtaking featured images. Experience content like never before.",
  footer_copyright: `© ${new Date().getFullYear()} Video Player Pro. All rights reserved.`,
};

// Ensure this function creates the row if it doesn't exist, or fetches it.
export const getHomepageConfig = async (): Promise<HomepageConfig> => {
  const { data, error } = await supabase
    .from("homepage_config")
    .select("*")
    .eq("id", defaultConfig.id)
    .maybeSingle(); // Use maybeSingle to handle case where row might not exist yet

  if (error) {
    console.error("Error fetching homepage config:", error);
    // Return default config or throw error, for now, return default on error
    return defaultConfig;
  }
  if (!data) {
    // If no data, this is the first time, potentially insert default
    // For simplicity, we'll just return the default.
    // A more robust solution would be to insert defaults if not present.
    console.warn("Homepage config not found, returning default. Consider seeding initial data.");
    return defaultConfig;
  }
  return data as HomepageConfig;
};

export const updateHomepageConfig = async (
  config: Partial<Omit<HomepageConfig, "id" | "updated_at">>
): Promise<HomepageConfig | null> => {
  const { data, error } = await supabase
    .from("homepage_config")
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq("id", defaultConfig.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating homepage config:", error);
    // Check if the error is because the row doesn't exist (e.g., PGRST116 for "0 rows")
    // This can happen with .update().eq().single() if the row isn't there.
    // A more robust approach is upsert.
    if (error.code === 'PGRST116' || error.message.includes("0 rows")) { 
        // Row doesn't exist, so let's insert it
        const { data: insertData, error: insertError } = await supabase
            .from("homepage_config")
            .insert([{ ...defaultConfig, ...config, id: defaultConfig.id, updated_at: new Date().toISOString() }])
            .select()
            .single();
        if (insertError) {
            console.error("Error inserting homepage config after failed update:", insertError);
            return null;
        }
        return insertData as HomepageConfig;
    }
    return null;
  }
  return data as HomepageConfig;
};

// You might want a function to initialize/seed the default config if it doesn't exist.
// This could be called on app startup or admin page load.
export const ensureHomepageConfigExists = async (): Promise<HomepageConfig> => {
  let config = await getHomepageConfig();
  if (config.site_title === defaultConfig.site_title && !config.updated_at) { // A way to check if it's truly default or just uninitialized
    // Attempt to insert if it seems uninitialized
    console.log("Attempting to initialize homepage_config with default values...");
    const { data: upsertData, error: upsertError } = await supabase
      .from('homepage_config')
      .upsert({ ...defaultConfig, id: defaultConfig.id, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting default homepage config:', upsertError.message);
      return defaultConfig; // return default if upsert fails
    }
    console.log("Homepage config initialized/upserted.");
    return upsertData as HomepageConfig;
  }
  return config;
};

