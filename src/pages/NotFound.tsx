
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full">Return to Home</Button>
          </Link>
          <Link to="/login" className="block">
            <Button variant="outline" className="w-full">Go to Admin Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
