
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoHeaderProps {
  onCopyLink: () => void;
  copied: boolean;
}

const VideoHeader: React.FC<VideoHeaderProps> = ({ onCopyLink, copied }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Link to="/" className="inline-flex items-center text-brand hover:text-brand-accent">
        <ArrowLeft className="mr-2" size={16} />
        Back to home
      </Link>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={onCopyLink}
      >
        {copied ? 'Copied!' : 'Share Video'}
        <Copy size={16} />
      </Button>
    </div>
  );
};

export default VideoHeader;
