
import { useEffect, useRef, useState } from 'react';
import { extractInstagramPostId, getAppropriateEmbedUrl } from '@/utils/instagramUtils';

interface InstagramEmbedProps {
  url: string;
  title: string;
  className?: string;
}

const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ url, title, className = '' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [height, setHeight] = useState(450);
  
  // Extract the post ID from the URL
  const postId = extractInstagramPostId(url);
  
  useEffect(() => {
    const onLoad = () => {
      setLoading(false);
      
      // Attempt to adjust height to remove extra space
      try {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${height}px`;
        }
      } catch (e) {
        console.error("Error adjusting iframe height:", e);
      }
    };
    
    const onError = () => {
      setLoading(false);
      setError(true);
    };
    
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', onLoad);
      iframeRef.current.addEventListener('error', onError);
    }
    
    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', onLoad);
        iframeRef.current.removeEventListener('error', onError);
      }
    };
  }, [height]);
  
  if (!postId) {
    return <div className="p-4 bg-red-100 text-red-600 rounded">Invalid Instagram URL</div>;
  }
  
  const embedUrl = getAppropriateEmbedUrl(url);
  
  if (!embedUrl) {
    return <div className="p-4 bg-red-100 text-red-600 rounded">Unable to process Instagram URL</div>;
  }
  
  return (
    <div className={`instagram-embed-container ${className} overflow-hidden rounded-xl relative`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-10 h-10 border-4 border-t-brand-accent rounded-full animate-spin"></div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full border-0 rounded-xl"
        title={title}
        loading="lazy"
        scrolling="no"
        allowTransparency={true}
        frameBorder="0"
      ></iframe>
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900 p-4">
          <p className="text-red-600 dark:text-red-300">
            Failed to load Instagram content
          </p>
        </div>
      )}
    </div>
  );
};

export default InstagramEmbed;
