
import { useState, useEffect, useRef } from 'react';
import { verifyAccessCode } from '@/models/VideoAccess';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAccessCodeVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const realtimeChannelRef = useRef<any>(null);

  // Core verification/check logic
  const checkStoredCode = async () => {
    // If user is logged in as admin, they have access
    if (isLoggedIn) {
      console.log('User is logged in as admin, granting access');
      setIsVerified(true);
      setIsLoading(false);
      return;
    }

    const storedCode = localStorage.getItem('videoAccessCode');
    const verifiedFlag = localStorage.getItem('videoAccessVerified');

    if (verifiedFlag && storedCode) {
      console.log('Checking if stored access code is still valid:', storedCode);

      const isStillValid = await verifyAccessCode(storedCode);

      if (isStillValid) {
        console.log('Stored access code is still valid');
        setIsVerified(true);
        setVerifiedCode(storedCode);
      } else {
        console.log('Stored access code is no longer valid, clearing verification');
        localStorage.removeItem('videoAccessVerified');
        localStorage.removeItem('videoAccessCode');
        setIsVerified(false);
        setVerifiedCode(null);
      }
    } else {
      console.log('No stored access code found');
      setIsVerified(false);
      setVerifiedCode(null);
    }

    setIsLoading(false);
  };

  // Initial verification and setup real-time listener
  useEffect(() => {
    checkStoredCode();

    // Setup real-time listener
    // Listen for all event changes on video_access_codes for this user's current code
    const code = localStorage.getItem('videoAccessCode');
    if (!code) return;

    // Clean up previous channel if existed
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    // Subscribe to real-time changes for this code
    const channel = supabase
      .channel('video-access-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // listen to all (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'video_access_codes',
          filter: `code=eq.${code}`
        },
        async (payload) => {
          console.log('Access code real-time change detected:', payload);
          // Re-check code on any change
          await checkStoredCode();
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const verifyCode = async (code: string): Promise<boolean> => {
    console.log('Verifying access code:', code);
    const isValid = await verifyAccessCode(code);

    if (isValid) {
      console.log('Access code verified successfully');
      localStorage.setItem('videoAccessVerified', 'true');
      localStorage.setItem('videoAccessCode', code);
      setIsVerified(true);
      setVerifiedCode(code);

      // Update real-time channel for new code
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      const channel = supabase
        .channel('video-access-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'video_access_codes',
            filter: `code=eq.${code}`
          },
          async (payload) => {
            console.log('Access code real-time change detected:', payload);
            await checkStoredCode();
          }
        )
        .subscribe();
      realtimeChannelRef.current = channel;

      return true;
    } else {
      console.log('Access code verification failed');
      return false;
    }
  };

  const clearVerification = () => {
    localStorage.removeItem('videoAccessVerified');
    localStorage.removeItem('videoAccessCode');
    setIsVerified(false);
    setVerifiedCode(null);
    // Clean up realtime channel
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  };

  return {
    isVerified,
    isLoading,
    verifyCode,
    clearVerification,
    verifiedCode
  };
};
