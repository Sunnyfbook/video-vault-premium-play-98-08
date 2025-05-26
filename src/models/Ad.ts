
import { supabase } from "@/integrations/supabase/client";

export interface Ad {
  id: string;
  name: string;
  type: 'monetag' | 'adstera';
  code: string;
  position: 'top' | 'bottom' | 'sidebar' | 'in-video' | 'below-video';
  is_active: boolean;
}

// Ad service functions
export const getAds = async (): Promise<Ad[]> => {
  try {
    console.log('Ad model: Fetching all ads');
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order('name', { ascending: true });
      
    if (error) {
      console.error("Ad model: Error fetching ads:", error);
      throw new Error(`Failed to fetch ads: ${error.message}`);
    }
    
    console.log('Ad model: Loaded ads:', data?.length || 0);
    return data as Ad[];
  } catch (error) {
    console.error("Ad model: Error fetching ads:", error);
    throw error;
  }
};

export const getActiveAds = async (): Promise<Ad[]> => {
  try {
    console.log('Ad model: Fetching active ads');
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order('name', { ascending: true });
      
    if (error) {
      console.error("Ad model: Error fetching active ads:", error);
      throw new Error(`Failed to fetch active ads: ${error.message}`);
    }
    
    console.log('Ad model: Loaded active ads:', data?.length || 0);
    return data as Ad[];
  } catch (error) {
    console.error("Ad model: Error fetching active ads:", error);
    throw error;
  }
};

export const getAdsByPosition = async (position: Ad['position']): Promise<Ad[]> => {
  try {
    console.log(`Ad model: Fetching ads for position: ${position}`);
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("position", position)
      .eq("is_active", true)
      .order('name', { ascending: true });
      
    if (error) {
      console.error(`Ad model: Error fetching ads for position ${position}:`, error);
      throw new Error(`Failed to fetch ads for position ${position}: ${error.message}`);
    }
    
    console.log(`Ad model: Loaded ${data?.length || 0} ads for position ${position}`);
    return data as Ad[];
  } catch (error) {
    console.error(`Ad model: Error fetching ads for position ${position}:`, error);
    throw error;
  }
};

export const addAd = async (ad: Omit<Ad, "id">): Promise<Ad> => {
  try {
    console.log('Ad model: Adding ad:', ad.name);
    
    // Validate required fields
    if (!ad.name?.trim()) {
      throw new Error('Ad name is required');
    }
    if (!ad.code?.trim()) {
      throw new Error('Ad code is required');
    }
    if (!ad.type) {
      throw new Error('Ad type is required');
    }
    if (!ad.position) {
      throw new Error('Ad position is required');
    }
    
    const { data, error } = await supabase
      .from("ads")
      .insert({
        name: ad.name.trim(),
        type: ad.type,
        code: ad.code.trim(),
        position: ad.position,
        is_active: ad.is_active ?? true
      })
      .select()
      .single();
    
    if (error) {
      console.error("Ad model: Error adding ad:", error);
      throw new Error(`Failed to add ad: ${error.message}`);
    }
    
    console.log('Ad model: Ad added successfully:', data.name);
    return data as Ad;
  } catch (error) {
    console.error("Ad model: Error adding ad:", error);
    throw error;
  }
};

export const updateAd = async (updatedAd: Ad): Promise<Ad | undefined> => {
  try {
    console.log('Ad model: Updating ad:', updatedAd.name);
    
    // Validate required fields
    if (!updatedAd.name?.trim()) {
      throw new Error('Ad name is required');
    }
    if (!updatedAd.code?.trim()) {
      throw new Error('Ad code is required');
    }
    if (!updatedAd.id?.trim()) {
      throw new Error('Ad ID is required');
    }
    
    const { data, error } = await supabase
      .from("ads")
      .update({
        name: updatedAd.name.trim(),
        type: updatedAd.type,
        code: updatedAd.code.trim(),
        position: updatedAd.position,
        is_active: updatedAd.is_active
      })
      .eq("id", updatedAd.id)
      .select()
      .single();
    
    if (error) {
      console.error("Ad model: Error updating ad:", error);
      throw new Error(`Failed to update ad: ${error.message}`);
    }
    
    console.log('Ad model: Ad updated successfully:', data.name);
    return data as Ad;
  } catch (error) {
    console.error("Ad model: Error updating ad:", error);
    throw error;
  }
};

export const deleteAd = async (id: string): Promise<boolean> => {
  try {
    console.log('Ad model: Deleting ad:', id);
    
    if (!id?.trim()) {
      throw new Error('Ad ID is required');
    }
    
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Ad model: Error deleting ad:", error);
      throw new Error(`Failed to delete ad: ${error.message}`);
    }
    
    console.log('Ad model: Ad deleted successfully');
    return true;
  } catch (error) {
    console.error("Ad model: Error deleting ad:", error);
    throw error;
  }
};
