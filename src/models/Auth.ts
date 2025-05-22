
import { supabase } from "@/integrations/supabase/client";

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
}

// Get users from the database
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");
    
    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }
    
    return data.map(user => ({
      username: user.username,
      password: user.password,
      isAdmin: user.is_admin
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Authenticate against Supabase
export const authenticate = async (username: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .eq("is_admin", true)
      .single();
    
    if (error || !data) {
      console.error("Authentication error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const login = async (username: string, password: string): Promise<boolean> => {
  const isValid = await authenticate(username, password);
  if (isValid) {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', username);
  }
  return isValid;
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('currentUser');
};

// Update admin user
export const updateAdminUser = async (
  currentUsername: string,
  updates: Partial<User>
): Promise<User | null> => {
  try {
    // First, get the user to update
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", currentUsername)
      .eq("is_admin", true)
      .single();
    
    if (userError) {
      console.error("Error finding admin user:", userError);
      throw new Error("Admin user not found");
    }
    
    // Prepare update data
    const updateData: any = {};
    if (updates.username) updateData.username = updates.username;
    if (updates.password) updateData.password = updates.password;
    
    // Update the user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating admin user:", updateError);
      throw new Error("Failed to update admin credentials");
    }
    
    return {
      username: updatedUser.username,
      password: updatedUser.password,
      isAdmin: updatedUser.is_admin
    };
  } catch (error: any) {
    console.error("Error in updateAdminUser:", error);
    throw error;
  }
};

// Setup real-time subscription to user changes
export const setupUserSubscription = (onUpdate: () => void) => {
  const channel = supabase
    .channel('admin_user_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users', filter: 'is_admin=eq.true' },
      () => {
        onUpdate();
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
