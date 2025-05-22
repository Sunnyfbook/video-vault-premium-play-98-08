
import { useEffect, useRef, useState } from 'react';
import { extractInstagramPostId, getAppropriateEmbedUrl } from '@/utils/instagramUtils';
import { Instagram } from 'lucide-react';

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
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <Instagram className="w-10 h-10 text-pink-500 mb-2" />
        <p className="text-sm text-red-500">Invalid Instagram URL</p>
      </div>
    );
  }
  
  const embedUrl = getAppropriateEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <Instagram className="w-10 h-10 text-pink-500 mb-2" />
        <p className="text-sm text-red-500">Unable to process Instagram URL</p>
      </div>
    );
  }
  
  return (
    <div className={`instagram-embed-container ${className} overflow-hidden rounded-xl relative`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center">
            <Instagram className="w-10 h-10 text-pink-500 animate-pulse mb-2" />
            <div className="w-8 h-8 border-4 border-t-brand-accent rounded-full animate-spin"></div>
          </div>
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
        onLoad={() => setLoading(false)}
      ></iframe>
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900 p-4">
          <div className="flex flex-col items-center">
            <Instagram className="w-10 h-10 text-pink-500 mb-2" />
            <p className="text-red-600 dark:text-red-300 text-center">
              Failed to load Instagram content
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramEmbed;
