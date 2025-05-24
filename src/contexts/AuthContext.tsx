
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, isAuthenticated, getCurrentUser } from '@/models/Auth';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

type AuthContextType = {
  isLoggedIn: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);

  // Set up Supabase auth integration
  useSupabaseAuth();

  useEffect(() => {
    // Check auth status when the component mounts
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      setUser(getCurrentUser());
    };

    checkAuth();
    
    // Listen for storage events (for multi-tab logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (username: string, password: string) => {
    const success = await authLogin(username, password);
    if (success) {
      setIsLoggedIn(true);
      setUser(username);
    }
    return success;
  };

  const logout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
