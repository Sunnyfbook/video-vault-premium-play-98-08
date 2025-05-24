import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  username: string;
  password?: string;
  is_admin: boolean;
  created_at: string;
}

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    // First, get the user from the users table to verify admin status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // Note: In production, you should hash passwords
      .single();

    if (userError || !userData) {
      console.error('Login failed:', userError);
      return false;
    }

    // Store user session in localStorage for now
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', username);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('isAdmin', userData.is_admin.toString());
    
    // Set up Supabase auth session for RLS
    try {
      await supabase.auth.setSession({
        access_token: `custom-${userData.id}`,
        refresh_token: `refresh-${userData.id}`,
      });
      console.log('Auth session established for:', username);
    } catch (error) {
      console.log('Login successful for:', username);
    }
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const updateAdminUser = async (currentUsername: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const updateData: any = {};
    
    if (updates.username && updates.username !== currentUsername) {
      updateData.username = updates.username;
    }
    
    if (updates.password) {
      updateData.password = updates.password;
    }

    // Only proceed if there are actual updates
    if (Object.keys(updateData).length === 0) {
      // Return current user data if no updates
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', currentUsername)
        .single();
      
      if (error) throw error;
      return data as User;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', currentUsername)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin user:', error);
      throw new Error(error.message);
    }

    return data as User;
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  
  // Clear Supabase session
  supabase.auth.signOut();
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem('currentUser');
};

export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};

export const isAdmin = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true';
};
