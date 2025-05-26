
import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { incrementPageView, incrementUniqueVisitor } from '@/models/Analytics';

// Import pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import VideoPage from '@/pages/VideoPage';
import Videos from '@/pages/Videos';
import NotFound from '@/pages/NotFound';

const App: React.FC = () => {
  // Use the authentication context
  const { isLoggedIn } = useAuth();
  
  // Track visit
  useEffect(() => {
    // Track page view
    incrementPageView();
    
    // Track unique visitor using session storage instead of localStorage
    // This is more privacy-friendly and resets per session
    const hasVisitedBefore = sessionStorage.getItem('hasVisited');
    if (!hasVisitedBefore) {
      incrementUniqueVisitor();
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Create a router
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
      errorElement: <NotFound />
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/admin",
      element: isLoggedIn ? <Admin /> : <NavigateToLogin />,
    },
    {
      path: "/videos",
      element: <Videos />,
    },
    {
      path: "/video/:id",
      element: <VideoPage />,
    },
    // Add a route for custom URLs
    {
      path: "/v/:customUrl",
      element: <VideoPage />,
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
};

// Create a simple component that navigates to the login page
const NavigateToLogin: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/login');
  }, [navigate]);
  
  return null;
};

export default App;
