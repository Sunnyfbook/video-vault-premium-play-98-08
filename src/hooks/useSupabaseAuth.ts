import { useEffect } from 'react';

export const useSupabaseAuth = () => {
  useEffect(() => {
    // This hook is now deprecated as auth is handled by AuthContext
    // Keep for backward compatibility but functionality moved to AuthContext
    console.log('Supabase auth is now handled by AuthContext');
  }, []);
};
