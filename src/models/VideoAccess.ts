
import { supabase } from "@/integrations/supabase/client";

export interface VideoAccessCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get all access codes (for admin panel)
export const getAccessCodes = async (): Promise<VideoAccessCode[]> => {
  try {
    const { data, error } = await supabase
      .from("video_access_codes")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading access codes:", error);
      throw new Error(`Failed to load access codes: ${error.message}`);
    }
    
    console.log('Loaded access codes:', data);
    return data as VideoAccessCode[];
  } catch (error) {
    console.error("Error loading access codes:", error);
    throw error;
  }
};

// Verify if a code is valid and active (public function, no admin required)
export const verifyAccessCode = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("video_access_codes")
      .select("id")
      .eq("code", code)
      .eq("is_active", true)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error verifying access code:", error);
    return false;
  }
};

// Add a new access code
export const addAccessCode = async (code: string): Promise<VideoAccessCode | null> => {
  try {
    const { data, error } = await supabase
      .from("video_access_codes")
      .insert({ code })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding access code:", error);
      throw new Error(`Failed to add access code: ${error.message}`);
    }
    
    console.log('Added access code:', data);
    return data as VideoAccessCode;
  } catch (error) {
    console.error("Error adding access code:", error);
    throw error;
  }
};

// Update an access code
export const updateAccessCode = async (accessCode: VideoAccessCode): Promise<VideoAccessCode | null> => {
  try {
    const { data, error } = await supabase
      .from("video_access_codes")
      .update({
        code: accessCode.code,
        is_active: accessCode.is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", accessCode.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating access code:", error);
      throw new Error(`Failed to update access code: ${error.message}`);
    }
    
    return data as VideoAccessCode;
  } catch (error) {
    console.error("Error updating access code:", error);
    throw error;
  }
};

// Delete an access code
export const deleteAccessCode = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("video_access_codes")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting access code:", error);
      throw new Error(`Failed to delete access code: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting access code:", error);
    throw error;
  }
};
