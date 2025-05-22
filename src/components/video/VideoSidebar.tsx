
import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ad } from '@/models/Ad';
import AdsSection from './AdsSection';

interface VideoSidebarProps {
  sidebarAds: Ad[];
  onCopyLink: () => void;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ sidebarAds, onCopyLink }) => {
  return (
    <div className="w-full lg:w-4/12 mt-8 lg:mt-0">
      {/* Sidebar ads - showing in a grid for mobile, stack for desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        <AdsSection ads={sidebarAds} />
      </div>
      
      {/* Additional sidebar content */}
      <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
        <h3 className="font-semibold mb-2">About this video</h3>
        <p className="text-sm text-gray-600 mb-4">
          This premium content is provided by Video Player Pro.
        </p>
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={onCopyLink}
          >
            Copy Link
            <Copy size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={() => window.open('/', '_blank')}
          >
            More Videos
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoSidebar;
