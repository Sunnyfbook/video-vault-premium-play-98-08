
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, login, logout, getCurrentUser } from '../models/Auth';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);
    
    if (authStatus) {
      setUsername(getCurrentUser());
    }
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    const success = login(username, password);
    
    if (success) {
      setIsLoggedIn(true);
      setUsername(username);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
    
    return success;
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUsername(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const value = {
    isLoggedIn,
    username,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
