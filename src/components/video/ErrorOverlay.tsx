
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorOverlayProps {
  errorMessage: string;
  onRetry: () => void;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ errorMessage, onRetry }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-10 p-4">
      <div className="text-white text-lg font-semibold mb-4">{errorMessage}</div>
      <Button 
        onClick={onRetry}
        variant="default"
      >
        Try Again
      </Button>
    </div>
  );
};

export default ErrorOverlay;
