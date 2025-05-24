
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ad } from '@/models/Ad';
import AdsSection from './AdsSection';

interface VideoSidebarProps {
  sidebarAds: Ad[];
  onCopyLink: () => void;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ 
  sidebarAds, 
  onCopyLink 
}) => {
  return (
    <aside className="w-full lg:w-64 xl:w-80 shrink-0 space-y-4 md:space-y-6">
      {/* Navigation and Share Actions */}
      <div className="professional-card">
        <div className="space-y-3">
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center gap-2 touch-button text-responsive">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            onClick={onCopyLink}
            className="w-full flex items-center gap-2 text-primary hover:bg-primary/10 touch-button text-responsive"
          >
            <Share2 size={16} />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Sidebar ads */}
      {sidebarAds.length > 0 && (
        <div className="sidebar-ads-container">
          <AdsSection 
            ads={sidebarAds} 
            staggerDelay={true} 
            baseDelaySeconds={3} 
            positionClass="sidebar-ads-section"
          />
        </div>
      )}
    </aside>
  );
};

export default VideoSidebar;
