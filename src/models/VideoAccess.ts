
import { supabase } from "@/integrations/supabase/client";

export interface VideoAccessCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Function to set user context for admin operations
const setAdminContext = async () => {
  const userId = localStorage.getItem('userId');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  console.log('Setting admin context - userId:', userId, 'isAdmin:', isAdmin);
  
  if (!userId || !isAdmin) {
    throw new Error('Admin access required');
  }
  
  // Execute a simple SQL to set the config
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id', 
      setting_value: userId,
      is_local: true
    });
  } catch (error) {
    console.log('set_config function not available, using alternative approach');
    // Alternative: just proceed since we've verified admin status
  }
};

// Get all access codes (for admin panel)
export const getAccessCodes = async (): Promise<VideoAccessCode[]> => {
  try {
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    console.log('getAccessCodes - checking admin status:', { userId, isAdmin });
    
    if (!userId || !isAdmin) {
      console.log('Not admin, returning empty array');
      return [];
    }

    await setAdminContext();
    
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
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    console.log('addAccessCode - checking admin status:', { userId, isAdmin });
    
    if (!userId || !isAdmin) {
      throw new Error('Admin access required');
    }

    await setAdminContext();
    
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
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!userId || !isAdmin) {
      throw new Error('Admin access required');
    }

    await setAdminContext();
    
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
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!userId || !isAdmin) {
      throw new Error('Admin access required');
    }

    await setAdminContext();
    
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
