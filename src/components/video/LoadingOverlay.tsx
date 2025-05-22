
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingOverlay;
