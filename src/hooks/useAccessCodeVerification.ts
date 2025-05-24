
import { useState, useEffect } from 'react';
import { verifyAccessCode } from '@/models/VideoAccess';

export const useAccessCodeVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStoredCode = async () => {
      const verifiedCode = localStorage.getItem('videoAccessVerified');
      const storedCode = localStorage.getItem('videoAccessCode');
      
      if (verifiedCode && storedCode) {
        console.log('Checking if stored access code is still valid:', storedCode);
        
        // Verify the stored code is still active in the database
        const isStillValid = await verifyAccessCode(storedCode);
        
        if (isStillValid) {
          console.log('Stored access code is still valid');
          setIsVerified(true);
        } else {
          console.log('Stored access code is no longer valid, clearing verification');
          localStorage.removeItem('videoAccessVerified');
          localStorage.removeItem('videoAccessCode');
          setIsVerified(false);
        }
      } else {
        console.log('No stored access code found');
        setIsVerified(false);
      }
      
      setIsLoading(false);
    };

    checkStoredCode();
  }, []);

  const verifyCode = async (code: string): Promise<boolean> => {
    console.log('Verifying access code:', code);
    const isValid = await verifyAccessCode(code);
    
    if (isValid) {
      console.log('Access code verified successfully');
      localStorage.setItem('videoAccessVerified', 'true');
      localStorage.setItem('videoAccessCode', code);
      setIsVerified(true);
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
  };

  return {
    isVerified,
    isLoading,
    verifyCode,
    clearVerification
  };
};
