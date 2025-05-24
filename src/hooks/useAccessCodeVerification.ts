
import { useState, useEffect } from 'react';
import { verifyAccessCode } from '@/models/VideoAccess';

export const useAccessCodeVerification = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user has already verified an access code
    const verifiedCode = localStorage.getItem('videoAccessVerified');
    if (verifiedCode) {
      console.log('Access code already verified from localStorage');
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);

  const verifyCode = async (code: string): Promise<boolean> => {
    console.log('Verifying access code:', code);
    const isValid = await verifyAccessCode(code);
    
    if (isValid) {
      console.log('Access code verified successfully');
      localStorage.setItem('videoAccessVerified', 'true');
      setIsVerified(true);
      return true;
    } else {
      console.log('Access code verification failed');
      return false;
    }
  };

  const clearVerification = () => {
    localStorage.removeItem('videoAccessVerified');
    setIsVerified(false);
  };

  return {
    isVerified,
    isLoading,
    verifyCode,
    clearVerification
  };
};
