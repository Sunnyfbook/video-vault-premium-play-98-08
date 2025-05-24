
import { supabase } from "@/integrations/supabase/client";

export interface VideoAccessCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to ensure admin context is properly set
const ensureAdminContext = async () => {
  const userId = localStorage.getItem('userId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  console.log('Setting admin context:', { userId, isAdmin });
  
  if (!userId || !isAdmin) {
    throw new Error('Admin access required');
  }

  // Set the custom auth context for RLS policies
  const { data, error } = await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId,
    is_local: true
  });

  if (error) {
    console.error('Error setting auth context:', error);
    throw error;
  }

  console.log('Auth context set successfully:', data);
  return true;
};

// Get all access codes (for admin panel)
export const getAccessCodes = async (): Promise<VideoAccessCode[]> => {
  try {
    await ensureAdminContext();

    const { data, error } = await supabase
      .from("video_access_codes")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading access codes:", error);
      return [];
    }
    
    console.log('Loaded access codes:', data);
    return data as VideoAccessCode[];
  } catch (error) {
    console.error("Error loading access codes:", error);
    return [];
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
    await ensureAdminContext();

    const { data, error } = await supabase
      .from("video_access_codes")
      .insert({ code })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding access code:", error);
      return null;
    }
    
    console.log('Added access code:', data);
    return data as VideoAccessCode;
  } catch (error) {
    console.error("Error adding access code:", error);
    return null;
  }
};

// Update an access code
export const updateAccessCode = async (accessCode: VideoAccessCode): Promise<VideoAccessCode | null> => {
  try {
    await ensureAdminContext();

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
      return null;
    }
    
    return data as VideoAccessCode;
  } catch (error) {
    console.error("Error updating access code:", error);
    return null;
  }
};

// Delete an access code
export const deleteAccessCode = async (id: string): Promise<boolean> => {
  try {
    await ensureAdminContext();

    const { error } = await supabase
      .from("video_access_codes")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting access code:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting access code:", error);
    return false;
  }
};
