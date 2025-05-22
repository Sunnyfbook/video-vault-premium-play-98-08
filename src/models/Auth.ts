
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
