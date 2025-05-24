
import React, { useEffect, useRef, useState } from 'react';

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
  
  // Use the EXACT same unique ID generation as homepage
  const uniqueIdRef = useRef<string>(
    `ad-${adId || Math.random().toString(36).substring(2, 5)}-${position}-${Math.random().toString(36).substring(2, 5)}`
  );

  useEffect(() => {
    if (!adContainerRef.current || !adCode || adLoaded) return;

    console.log(`Starting to load ad: ${adName || uniqueIdRef.current} at position ${position} with ${delaySeconds}s delay`);

    // Use the EXACT same delay mechanism as homepage
    if (delaySeconds > 0) {
      loadTimeoutRef.current = setTimeout(() => {
        loadAd();
        setAdLoaded(true);
      }, delaySeconds * 1000);
      
      return () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    } else {
      loadAd();
      setAdLoaded(true);
    }
    
    function loadAd() {
      if (!adContainerRef.current) return;
      
      console.log(`Loading ad: ${adName || uniqueIdRef.current} (${adType}) at position ${position}`);
      
      // Clear any existing content
      adContainerRef.current.innerHTML = '';
      
      try {
        // Use the EXACT same ad loading mechanism as homepage
        if (adCode.includes('<script')) {
          // For script-based ads, inject directly into container
          adContainerRef.current.innerHTML = adCode;
          
          // Execute scripts manually to ensure they run
          const scripts = adContainerRef.current.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const newScript = document.createElement('script');
            
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.innerHTML = script.innerHTML;
            }
            
            // Replace the old script with new one to trigger execution
            script.parentNode?.replaceChild(newScript, script);
          }
        } else {
          // For non-script ads, just set innerHTML
          adContainerRef.current.innerHTML = adCode;
        }
        
        console.log(`Ad ${adName || uniqueIdRef.current} of type ${adType} loaded successfully (position: ${position})`);
        
      } catch (error) {
        console.error(`Error loading ad ${adName || uniqueIdRef.current}:`, error);
      }
    }
    
    // Cleanup function
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [adCode, adType, delaySeconds, position, adLoaded, adId, adName]);

  if (!isVisible) return null;

  return (
    <div 
      ref={adContainerRef} 
      id={uniqueIdRef.current}
      className={`ad-container rounded-lg overflow-hidden ${className} ${
        adType === 'monetag' ? 'monetag-ad' : 'adstera-ad'
      } position-${position}`}
      data-ad-type={adType}
      data-delay={delaySeconds}
      data-position={position}
      data-ad-id={adId}
      data-ad-name={adName}
      style={{ 
        minHeight: position === 'in-video' ? '100px' : 
                   position === 'below-video' ? '150px' : 
                   position === 'sidebar' ? '200px' : '120px',
        width: '100%'
      }}
    ></div>
  );
};

export default AdContainer;
