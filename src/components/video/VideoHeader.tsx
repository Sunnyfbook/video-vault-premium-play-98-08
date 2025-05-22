
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Share2 } from 'lucide-react'; // Added Share2
import { Button } from '@/components/ui/button';

interface VideoHeaderProps {
  onCopyLink: () => void;
  copied: boolean;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ onCopyLink, copied }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-accent transition-colors group"
      >
        <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>
      <Button 
        variant="outline" 
        className="shadow-sm hover:shadow-md transition-shadow border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-slate-700" 
        onClick={onCopyLink}
      >
        {copied ? (
          <>
            <Copy size={18} className="mr-2 text-green-500" /> Copied!
          </>
        ) : (
          <>
            <Share2 size={18} className="mr-2" /> Share Video
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoHeader;
