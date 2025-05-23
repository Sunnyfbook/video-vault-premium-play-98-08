
import React, { useEffect } from 'react';
import { Copy, ExternalLink, Share2, Home, CheckCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ad } from '@/models/Ad';
import AdsSection from './AdsSection';
import { Link } from 'react-router-dom';

interface VideoSidebarProps {
  sidebarAds: Ad[];
  onCopyLink: () => void;
}

const VideoSidebar: React.FC<VideoSidebarProps> = ({ sidebarAds, onCopyLink }) => {
  const [linkCopied, setLinkCopied] = React.useState(false);

  useEffect(() => {
    // Log sidebar ads count
    console.log(`VideoSidebar: ${sidebarAds.length} sidebar ads available`);
  }, [sidebarAds]);

  const handleCopyLink = () => {
    onCopyLink();
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  }

  return (
    <aside className="w-full lg:w-4/12 mt-6 lg:mt-0 space-y-4 md:space-y-6">
      {/* Sidebar ads - REDUCED SPACING */}
      {sidebarAds.length > 0 && (
        <div className="bg-card p-3 rounded-xl shadow-card video-sidebar-ads-container">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider text-center">Advertisement</h3>
          <AdsSection 
            ads={sidebarAds} 
            className="flex flex-col gap-3" 
            staggerDelay={true}
            baseDelaySeconds={3}
            positionClass="sidebar-ads-section"
          />
        </div>
      )}
      
      {/* Additional sidebar content */}
      <div className="bg-card p-6 rounded-xl shadow-card">
        <div className="flex items-center mb-4">
          <Gift size={24} className="mr-3 text-brand-accent"/>
          <h3 className="text-xl font-semibold text-foreground">More to Explore</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Enjoying the content? Share it with friends or dive back into our extensive library.
        </p>
        <div className="space-y-3">
          <Button 
            variant={linkCopied ? "default" : "outline"}
            className={`w-full justify-center shadow-sm hover:shadow-md transition-all duration-300 ease-in-out 
                        ${linkCopied ? 'bg-green-500 hover:bg-green-600 text-white' 
                                     : 'border-border text-foreground hover:bg-muted dark:hover:bg-slate-700'}`}
            onClick={handleCopyLink}
          >
            {linkCopied ? <CheckCircle size={18} className="mr-2" /> : <Share2 size={18} className="mr-2" />}
            {linkCopied ? 'Link Copied!' : 'Share this Video'}
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className="w-full justify-center text-primary hover:bg-primary/10 hover:text-primary font-medium"
          >
            <Link to="/">
              <Home size={18} className="mr-2" />
              Discover More Videos
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default VideoSidebar;
