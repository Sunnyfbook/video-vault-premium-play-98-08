
import React from 'react';
import { Ad } from '@/models/Ad';
import AdsSection from './AdsSection';
import { Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoSidebarProps {
  sidebarAds: Ad[];
  sidebarTopAds?: Ad[];
  sidebarBottomAds?: Ad[];
  onCopyLink: () => void;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ 
  sidebarAds, 
  sidebarTopAds = [],
  sidebarBottomAds = [],
  onCopyLink 
}) => {
  return (
    <div className="lg:w-80 space-y-6">
      {/* Sidebar top ads */}
      {sidebarTopAds.length > 0 && (
        <div className="sidebar-top-ads-container">
          <AdsSection 
            ads={sidebarTopAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={2}
            positionClass="sidebar-top-ads-section" 
          />
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Share this video</h3>
        <div className="space-y-3">
          <Button 
            onClick={onCopyLink}
            variant="outline" 
            className="w-full justify-start"
          >
            <Copy size={16} className="mr-2" />
            Copy Link
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              const shareData = {
                title: 'Check out this video!',
                url: window.location.href
              };
              if (navigator.share) {
                navigator.share(shareData);
              } else {
                onCopyLink();
              }
            }}
          >
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main sidebar ads */}
      {sidebarAds.length > 0 && (
        <div className="sidebar-ads-container">
          <AdsSection 
            ads={sidebarAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={3}
            positionClass="sidebar-ads-section" 
          />
        </div>
      )}

      {/* Sidebar bottom ads */}
      {sidebarBottomAds.length > 0 && (
        <div className="sidebar-bottom-ads-container">
          <AdsSection 
            ads={sidebarBottomAds} 
            className="w-full" 
            staggerDelay={true} 
            baseDelaySeconds={4}
            positionClass="sidebar-bottom-ads-section" 
          />
        </div>
      )}
    </div>
  );
};

export default VideoSidebar;
