
import { supabase } from "@/integrations/supabase/client";

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
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
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
