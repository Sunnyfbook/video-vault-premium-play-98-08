import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
  delaySeconds?: number;
  position?: 'top' | 'bottom' | 'sidebar' | 'in-video' | 'below-video';
  adId?: string;
  adName?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ 
  adType, 
  adCode, 
  className, 
  delaySeconds = 0,
  position = 'top',
  adId = '',
  adName = ''
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);
  
  const uniqueIdRef = useRef<string>(
    `ad-${adId || Math.random().toString(36).substring(2, 5)}-${position}-${Math.random().toString(36).substring(2, 5)}`
  );

  const loadAd = useCallback(() => {
    if (!adContainerRef.current || !adCode || hasLoadedRef.current) return;
    
    console.log(`Loading ad: ${adName || uniqueIdRef.current} (${adType}) at position ${position}`);
    
    // Clear any existing content
    adContainerRef.current.innerHTML = '';
    
    try {
      if (adCode.includes('<script')) {
        // Handle script tags properly
        adContainerRef.current.innerHTML = adCode;
        
        const scripts = adContainerRef.current.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          const newScript = document.createElement('script');
          
          // Copy all attributes
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          if (script.src) {
            newScript.src = script.src;
            newScript.async = true;
          } else {
            newScript.innerHTML = script.innerHTML;
          }
          
          // Replace the old script with the new one
          script.parentNode?.replaceChild(newScript, script);
        }
      } else {
        // For non-script ad codes (like iframe, div, etc.)
        adContainerRef.current.innerHTML = adCode;
      }
      
      hasLoadedRef.current = true;
      setAdLoaded(true);
      console.log(`Ad ${adName || uniqueIdRef.current} of type ${adType} loaded successfully (position: ${position})`);
      
    } catch (error) {
      console.error(`Error loading ad ${adName || uniqueIdRef.current}:`, error);
    }
  }, [adCode, adType, position, adId, adName]);

  useEffect(() => {
    // Reset loaded state when ad code changes
    hasLoadedRef.current = false;
    setAdLoaded(false);
    
    if (!adCode) return;

    console.log(`Starting to load ad: ${adName || uniqueIdRef.current} at position ${position} with ${delaySeconds}s delay`);

    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    if (delaySeconds > 0) {
      loadTimeoutRef.current = setTimeout(() => {
        loadAd();
      }, delaySeconds * 1000);
    } else {
      loadAd();
    }
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [adCode, delaySeconds, loadAd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible || !adCode) return null;

  // Get position-specific styling
  const getPositionStyles = () => {
    switch (position) {
      case 'sidebar':
        return {
          maxWidth: '300px',
          minHeight: '250px',
        };
      case 'in-video':
        return {
          maxWidth: '400px',
          minHeight: '200px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
        };
      case 'below-video':
        return {
          maxWidth: '728px',
          minHeight: '90px',
        };
      case 'top':
      case 'bottom':
      default:
        return {
          maxWidth: '728px',
          minHeight: '90px',
        };
    }
  };

  const positionStyles = getPositionStyles();

  return (
    <div className={`optimized-ad-container ${position}-ad-position ${className}`}>
      <div 
        ref={adContainerRef} 
        id={uniqueIdRef.current}
        className={`ad-content-wrapper ${
          adType === 'monetag' ? 'monetag-ad' : 'adstera-ad'
        }`}
        data-ad-type={adType}
        data-delay={delaySeconds}
        data-position={position}
        data-ad-id={adId}
        data-ad-name={adName}
        style={{ 
          ...positionStyles,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: position === 'in-video' ? '12px' : '8px',
          overflow: 'hidden',
          boxShadow: position === 'in-video' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      ></div>
    </div>
  );
};

export default AdContainer;
