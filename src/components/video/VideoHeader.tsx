
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoHeaderProps {
  onCopyLink: () => void;
  copied: boolean;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ onCopyLink, copied }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-4">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors group touch-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1 text-primary" />
        <span className="text-responsive">Back to Home</span>
      </Link>
      <Button 
        variant={copied ? "default" : "outline"}
        size="sm"
        className={`shadow-card hover:shadow-card-hover transition-all duration-300 ease-in-out touch-button w-full sm:w-auto
                    ${copied ? 'bg-green-500 hover:bg-green-600 text-white' 
                             : 'border-border dark:border-gray-700 text-foreground dark:text-gray-200 hover:bg-muted dark:hover:bg-slate-700'}`}
        onClick={onCopyLink}
      >
        {copied ? (
          <>
            <CheckCircle size={16} className="mr-2" /> 
            <span className="text-responsive">Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={16} className="mr-2" /> 
            <span className="text-responsive">Share Video</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoHeader;
