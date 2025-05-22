
import { supabase } from "@/integrations/supabase/client";

export interface SEOSetting {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
}

export const getSEOSettings = async (): Promise<SEOSetting[]> => {
  try {
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*");
    
    if (error) {
      console.error("Error fetching SEO settings:", error);
      return [];
    }
    
    return data as SEOSetting[];
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return [];
  }
};

export const getSEOSettingByPage = async (page: string): Promise<SEOSetting | undefined> => {
  try {
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("page", page)
      .single();
    
    if (error) {
      console.error(`Error fetching SEO settings for page ${page}:`, error);
      return undefined;
    }
    
    return data as SEOSetting;
  } catch (error) {
    console.error(`Error fetching SEO settings for page ${page}:`, error);
    return undefined;
  }
};

export const addSEOSetting = async (seoSetting: Omit<SEOSetting, "id">): Promise<SEOSetting> => {
  try {
    const { data, error } = await supabase
      .from("seo_settings")
      .insert(seoSetting)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding SEO setting:", error);
      throw new Error("Failed to add SEO setting");
    }
    
    return data as SEOSetting;
  } catch (error) {
    console.error("Error adding SEO setting:", error);
    throw new Error("Failed to add SEO setting");
  }
};

export const updateSEOSetting = async (updatedSetting: SEOSetting): Promise<SEOSetting | undefined> => {
  try {
    const { data, error } = await supabase
      .from("seo_settings")
      .update(updatedSetting)
      .eq("id", updatedSetting.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating SEO setting:", error);
      return undefined;
    }
    
    return data as SEOSetting;
  } catch (error) {
    console.error("Error updating SEO setting:", error);
    return undefined;
  }
};

export const deleteSEOSetting = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("seo_settings")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting SEO setting:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting SEO setting:", error);
    return false;
  }
};
