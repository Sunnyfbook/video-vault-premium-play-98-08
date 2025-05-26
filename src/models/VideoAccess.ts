
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
    console.log('VideoAccess model: Fetching all access codes');
    const { data, error } = await supabase
      .from("video_access_codes")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("VideoAccess model: Error loading access codes:", error);
      throw new Error(`Failed to load access codes: ${error.message}`);
    }
    
    console.log('VideoAccess model: Loaded access codes:', data?.length || 0);
    return data as VideoAccessCode[];
  } catch (error) {
    console.error("VideoAccess model: Error loading access codes:", error);
    throw error;
  }
};

// Verify if a code is valid and active (public function, no admin required)
export const verifyAccessCode = async (code: string): Promise<boolean> => {
  try {
    console.log('VideoAccess model: Verifying access code');
    
    if (!code?.trim()) {
      console.log('VideoAccess model: No code provided');
      return false;
    }
    
    const { data, error } = await supabase
      .from("video_access_codes")
      .select("id, is_active")
      .eq("code", code.trim())
      .eq("is_active", true)
      .single();
    
    if (error || !data) {
      console.log('VideoAccess model: Invalid or inactive access code');
      return false;
    }
    
    console.log('VideoAccess model: Access code verified successfully');
    return true;
  } catch (error) {
    console.error("VideoAccess model: Error verifying access code:", error);
    return false;
  }
};

// Add a new access code
export const addAccessCode = async (code: string): Promise<VideoAccessCode | null> => {
  try {
    console.log('VideoAccess model: Adding access code');
    
    if (!code?.trim()) {
      throw new Error('Access code is required');
    }
    
    // Check if code already exists
    const { data: existing } = await supabase
      .from("video_access_codes")
      .select("id")
      .eq("code", code.trim())
      .single();
      
    if (existing) {
      throw new Error('Access code already exists');
    }
    
    const { data, error } = await supabase
      .from("video_access_codes")
      .insert({ 
        code: code.trim(),
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error("VideoAccess model: Error adding access code:", error);
      throw new Error(`Failed to add access code: ${error.message}`);
    }
    
    console.log('VideoAccess model: Access code added successfully:', data.code);
    return data as VideoAccessCode;
  } catch (error) {
    console.error("VideoAccess model: Error adding access code:", error);
    throw error;
  }
};

// Update an access code
export const updateAccessCode = async (accessCode: VideoAccessCode): Promise<VideoAccessCode | null> => {
  try {
    console.log('VideoAccess model: Updating access code:', accessCode.code);
    
    if (!accessCode.id?.trim()) {
      throw new Error('Access code ID is required');
    }
    if (!accessCode.code?.trim()) {
      throw new Error('Access code is required');
    }
    
    const { data, error } = await supabase
      .from("video_access_codes")
      .update({
        code: accessCode.code.trim(),
        is_active: accessCode.is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", accessCode.id)
      .select()
      .single();
    
    if (error) {
      console.error("VideoAccess model: Error updating access code:", error);
      throw new Error(`Failed to update access code: ${error.message}`);
    }
    
    console.log('VideoAccess model: Access code updated successfully:', data.code);
    return data as VideoAccessCode;
  } catch (error) {
    console.error("VideoAccess model: Error updating access code:", error);
    throw error;
  }
};

// Delete an access code
export const deleteAccessCode = async (id: string): Promise<boolean> => {
  try {
    console.log('VideoAccess model: Deleting access code:', id);
    
    if (!id?.trim()) {
      throw new Error('Access code ID is required');
    }
    
    const { error } = await supabase
      .from("video_access_codes")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("VideoAccess model: Error deleting access code:", error);
      throw new Error(`Failed to delete access code: ${error.message}`);
    }
    
    console.log('VideoAccess model: Access code deleted successfully');
    return true;
  } catch (error) {
    console.error("VideoAccess model: Error deleting access code:", error);
    throw error;
  }
};
