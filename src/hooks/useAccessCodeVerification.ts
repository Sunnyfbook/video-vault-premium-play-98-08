
import { useState, useEffect } from 'react';
import { verifyAccessCode } from '@/models/VideoAccess';
import { useAuth } from '@/contexts/AuthContext';

export const useAccessCodeVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
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
        
        // Verify the stored code is still active in the database
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

    checkStoredCode();
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
  };

  return {
    isVerified,
    isLoading,
    verifyCode,
    clearVerification,
    verifiedCode
  };
};
