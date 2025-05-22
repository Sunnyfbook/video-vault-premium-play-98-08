
import { supabase } from "@/integrations/supabase/client";

export interface Ad {
  id: string;
  name: string;
  type: 'monetag' | 'adstera';
  code: string;
  position: 'top' | 'bottom' | 'sidebar' | 'in-video';
  is_active: boolean;
}

// Ad service functions
export const getAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*");
      
    if (error) {
      console.error("Error fetching ads:", error);
      return [];
    }
    
    return data as Ad[];
  } catch (error) {
    console.error("Error fetching ads:", error);
    return [];
  }
};

export const getActiveAds = async (): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true);
      
    if (error) {
      console.error("Error fetching active ads:", error);
      return [];
    }
    
    return data as Ad[];
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return [];
  }
};

export const getAdsByPosition = async (position: Ad['position']): Promise<Ad[]> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("position", position)
      .eq("is_active", true);
      
    if (error) {
      console.error(`Error fetching ads for position ${position}:`, error);
      return [];
    }
    
    return data as Ad[];
  } catch (error) {
    console.error(`Error fetching ads for position ${position}:`, error);
    return [];
  }
};

export const addAd = async (ad: Omit<Ad, "id">): Promise<Ad> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .insert(ad)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding ad:", error);
      throw new Error("Failed to add ad");
    }
    
    return data as Ad;
  } catch (error) {
    console.error("Error adding ad:", error);
    throw new Error("Failed to add ad");
  }
};

export const updateAd = async (updatedAd: Ad): Promise<Ad | undefined> => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .update(updatedAd)
      .eq("id", updatedAd.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating ad:", error);
      return undefined;
    }
    
    return data as Ad;
  } catch (error) {
    console.error("Error updating ad:", error);
    return undefined;
  }
};

export const deleteAd = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting ad:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting ad:", error);
    return false;
  }
};
