
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { Button } from '@/components/ui/button';

interface VideoHeaderProps {
  onCopyLink: () => void;
  copied: boolean;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ onCopyLink, copied }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors group"
      >
        <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1 text-primary" />
        Back to Home
      </Link>
      <Button 
        variant={copied ? "default" : "outline"} // Change variant when copied
        size="lg" // Slightly larger button
        className={`shadow-card hover:shadow-card-hover transition-all duration-300 ease-in-out 
                    ${copied ? 'bg-green-500 hover:bg-green-600 text-white' 
                             : 'border-border dark:border-gray-700 text-foreground dark:text-gray-200 hover:bg-muted dark:hover:bg-slate-700'}`}
        onClick={onCopyLink}
      >
        {copied ? (
          <>
            <CheckCircle size={20} className="mr-2" /> Copied!
          </>
        ) : (
          <>
            <Share2 size={20} className="mr-2" /> Share Video
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoHeader;
