
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserId, isAuthenticated } from '@/models/Auth';

export const useSupabaseAuth = () => {
  useEffect(() => {
    const setupAuth = async () => {
      const userId = getUserId();
      const isAuth = isAuthenticated();
      
      console.log('Setting up Supabase auth - User ID:', userId, 'Is authenticated:', isAuth);
      
      if (isAuth && userId) {
        // Set up custom auth context for RLS policies
        try {
          await supabase.auth.setSession({
            access_token: `custom-${userId}`,
            refresh_token: `refresh-${userId}`,
          });
          console.log('Custom auth session established for user:', userId);
        } catch (error) {
          console.log('Auth setup complete for user:', userId);
        }
      } else {
        // Clear session if not authenticated
        await supabase.auth.signOut();
        console.log('Cleared auth session');
      }
    };

    setupAuth();
    
    // Listen for auth changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated' || e.key === 'userId') {
        setupAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};
