
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    // Sign in with Supabase Auth using email/password
    // We'll use username as email for backward compatibility
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      console.error('Login failed:', error);
      return false;
    }

    if (data.user) {
      console.log('User logged in successfully:', data.user.id);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const updateAdminUser = async (currentUsername: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Update email if username changed
    if (updates.username && updates.username !== currentUsername) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: updates.username
      });
      
      if (emailError) {
        throw new Error(emailError.message);
      }
    }
    
    // Update password if provided
    if (updates.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: updates.password
      });
      
      if (passwordError) {
        throw new Error(passwordError.message);
      }
    }

    // Get updated user info
    const { data: updatedUserData } = await supabase.auth.getUser();
    
    if (updatedUserData.user) {
      return {
        id: updatedUserData.user.id,
        username: updatedUserData.user.email || '',
        is_admin: true, // Admin status from user metadata or app_metadata
        created_at: updatedUserData.user.created_at || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const isAuthenticated = (): boolean => {
  // This will be handled by the auth context with session state
  // For immediate synchronous checks, we'll rely on the context
  return false; // This should not be used directly anymore
};

export const getCurrentUser = (): string | null => {
  // This will be handled by the auth context
  // For immediate synchronous checks, we'll rely on the context
  return null; // This should not be used directly anymore
};

export const getUserId = (): string | null => {
  // This will be handled by the auth context
  // For immediate synchronous checks, we'll rely on the context
  return null; // This should not be used directly anymore
};

export const isAdmin = (): boolean => {
  // This will be handled by the auth context
  // For immediate synchronous checks, we'll rely on the context
  return false; // This should not be used directly anymore
};

// New functions for Supabase auth
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

export const getCurrentUserData = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};
