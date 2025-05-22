
import React from 'react';
import { Copy, ExternalLink, Share2, Home } from 'lucide-react'; // Added Share2, Home
import { Button } from '@/components/ui/button';
import { Ad } from '@/models/Ad';
import AdsSection from './AdsSection';
import { Link } from 'react-router-dom'; // Import Link for navigation

interface VideoSidebarProps {
  sidebarAds: Ad[];
  onCopyLink: () => void;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ sidebarAds, onCopyLink }) => {
  return (
    <div className="w-full lg:w-4/12 mt-8 lg:mt-0 space-y-6">
      {/* Sidebar ads */}
      {sidebarAds.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Advertisement</h3>
          <AdsSection ads={sidebarAds} className="grid grid-cols-1 gap-4" />
        </div>
      )}
      
      {/* Additional sidebar content */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">About this video</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          This premium content is brought to you by Video Player Pro. Explore more videos and enjoy high-quality streaming.
        </p>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start shadow-sm hover:shadow-md transition-shadow border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-slate-700"
            onClick={onCopyLink}
          >
            <Share2 size={16} className="mr-2" />
            Copy Video Link
          </Button>
          <Button 
            variant="ghost" 
            asChild // Use asChild to make the button a Link
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-brand dark:hover:text-brand-accent"
          >
            <Link to="/">
              <Home size={16} className="mr-2" />
              More Videos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoSidebar;
