
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const HomepageHeader: React.FC = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Premium Video Experience
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mb-8">
          Discover high-quality videos and images, all in one place.
        </p>
        <div className="flex flex-wrap gap-4">
          {isLoggedIn ? (
            <Link to="/admin">
              <Button variant="secondary" size="lg">
                {user === 'admin' ? 'Go to Admin Panel' : 'My Account'}
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          )}
          <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
            Browse Content
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomepageHeader;
