
import React from 'react';

interface ErrorOverlayProps {
  errorMessage: string;
  onRetry: () => void;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ errorMessage, onRetry }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-10 p-4">
      <div className="text-white text-lg font-semibold mb-4">{errorMessage}</div>
      <button 
        className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
        onClick={onRetry}
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorOverlay;
