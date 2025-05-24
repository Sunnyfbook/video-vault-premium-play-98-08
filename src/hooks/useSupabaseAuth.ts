
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserId, isAuthenticated } from '@/models/Auth';

export const useSupabaseAuth = () => {
  useEffect(() => {
    const setupAuth = async () => {
      const userId = getUserId();
      const isAuth = isAuthenticated();
      
      if (isAuth && userId) {
        // Set up RLS context by setting auth.uid()
        await supabase.rpc('set_claim', {
          uid: userId,
          claim: 'sub',
          value: userId
        }).catch(() => {
          // If the function doesn't exist, we'll handle auth differently
          console.log('Custom auth setup');
        });
      }
    };

    setupAuth();
  }, []);
};
