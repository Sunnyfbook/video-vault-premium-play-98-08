
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
    console.log('SEO model: Fetching all SEO settings');
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .order('page', { ascending: true });
    
    if (error) {
      console.error("SEO model: Error fetching SEO settings:", error);
      throw new Error(`Failed to fetch SEO settings: ${error.message}`);
    }
    
    console.log('SEO model: Loaded SEO settings:', data?.length || 0);
    return data as SEOSetting[];
  } catch (error) {
    console.error("SEO model: Error fetching SEO settings:", error);
    throw error;
  }
};

export const getSEOSettingByPage = async (page: string): Promise<SEOSetting | undefined> => {
  try {
    console.log(`SEO model: Fetching SEO setting for page: ${page}`);
    
    if (!page?.trim()) {
      throw new Error('Page parameter is required');
    }
    
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("page", page.trim())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`SEO model: No SEO setting found for page: ${page}`);
        return undefined;
      }
      console.error(`SEO model: Error fetching SEO settings for page ${page}:`, error);
      throw new Error(`Failed to fetch SEO settings for page ${page}: ${error.message}`);
    }
    
    console.log(`SEO model: Found SEO setting for page: ${page}`);
    return data as SEOSetting;
  } catch (error) {
    console.error(`SEO model: Error fetching SEO settings for page ${page}:`, error);
    throw error;
  }
};

export const addSEOSetting = async (seoSetting: Omit<SEOSetting, "id">): Promise<SEOSetting> => {
  try {
    console.log('SEO model: Adding SEO setting for page:', seoSetting.page);
    
    // Validate required fields
    if (!seoSetting.page?.trim()) {
      throw new Error('Page is required');
    }
    if (!seoSetting.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!seoSetting.description?.trim()) {
      throw new Error('Description is required');
    }
    
    const { data, error } = await supabase
      .from("seo_settings")
      .insert({
        page: seoSetting.page.trim(),
        title: seoSetting.title.trim(),
        description: seoSetting.description.trim(),
        keywords: seoSetting.keywords?.trim() || null,
        og_title: seoSetting.og_title?.trim() || null,
        og_description: seoSetting.og_description?.trim() || null,
        og_image: seoSetting.og_image?.trim() || null,
        twitter_card: seoSetting.twitter_card?.trim() || null,
        twitter_title: seoSetting.twitter_title?.trim() || null,
        twitter_description: seoSetting.twitter_description?.trim() || null,
        twitter_image: seoSetting.twitter_image?.trim() || null,
        canonical_url: seoSetting.canonical_url?.trim() || null
      })
      .select()
      .single();
    
    if (error) {
      console.error("SEO model: Error adding SEO setting:", error);
      throw new Error(`Failed to add SEO setting: ${error.message}`);
    }
    
    console.log('SEO model: SEO setting added successfully for page:', data.page);
    return data as SEOSetting;
  } catch (error) {
    console.error("SEO model: Error adding SEO setting:", error);
    throw error;
  }
};

export const updateSEOSetting = async (updatedSetting: SEOSetting): Promise<SEOSetting | undefined> => {
  try {
    console.log('SEO model: Updating SEO setting:', updatedSetting.page);
    
    // Validate required fields
    if (!updatedSetting.id?.trim()) {
      throw new Error('SEO setting ID is required');
    }
    if (!updatedSetting.page?.trim()) {
      throw new Error('Page is required');
    }
    if (!updatedSetting.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!updatedSetting.description?.trim()) {
      throw new Error('Description is required');
    }
    
    const { data, error } = await supabase
      .from("seo_settings")
      .update({
        page: updatedSetting.page.trim(),
        title: updatedSetting.title.trim(),
        description: updatedSetting.description.trim(),
        keywords: updatedSetting.keywords?.trim() || null,
        og_title: updatedSetting.og_title?.trim() || null,
        og_description: updatedSetting.og_description?.trim() || null,
        og_image: updatedSetting.og_image?.trim() || null,
        twitter_card: updatedSetting.twitter_card?.trim() || null,
        twitter_title: updatedSetting.twitter_title?.trim() || null,
        twitter_description: updatedSetting.twitter_description?.trim() || null,
        twitter_image: updatedSetting.twitter_image?.trim() || null,
        canonical_url: updatedSetting.canonical_url?.trim() || null
      })
      .eq("id", updatedSetting.id)
      .select()
      .single();
    
    if (error) {
      console.error("SEO model: Error updating SEO setting:", error);
      throw new Error(`Failed to update SEO setting: ${error.message}`);
    }
    
    console.log('SEO model: SEO setting updated successfully for page:', data.page);
    return data as SEOSetting;
  } catch (error) {
    console.error("SEO model: Error updating SEO setting:", error);
    throw error;
  }
};

export const deleteSEOSetting = async (id: string): Promise<boolean> => {
  try {
    console.log('SEO model: Deleting SEO setting:', id);
    
    if (!id?.trim()) {
      throw new Error('SEO setting ID is required');
    }
    
    const { error } = await supabase
      .from("seo_settings")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("SEO model: Error deleting SEO setting:", error);
      throw new Error(`Failed to delete SEO setting: ${error.message}`);
    }
    
    console.log('SEO model: SEO setting deleted successfully');
    return true;
  } catch (error) {
    console.error("SEO model: Error deleting SEO setting:", error);
    throw error;
  }
};
