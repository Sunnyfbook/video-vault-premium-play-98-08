
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  errorMessage?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage }) => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Video not found</h1>
      <p className="mb-8">{errorMessage || "The video you're looking for doesn't exist or has been removed."}</p>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
};

export default ErrorState;
