
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
    console.log(`Ad code preview: ${adCode.substring(0, 100)}...`);
    
    try {
      // Clear any existing content
      adContainerRef.current.innerHTML = '';
      
      if (adCode.includes('<script')) {
        // Handle script tags properly
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adCode;
        
        // Move all content to the actual container
        while (tempDiv.firstChild) {
          adContainerRef.current.appendChild(tempDiv.firstChild);
        }
        
        // Find and execute scripts
        const scripts = adContainerRef.current.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          
          // Copy attributes
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = true;
            newScript.onload = () => {
              console.log(`Script loaded for ad: ${adName || uniqueIdRef.current}`);
            };
            newScript.onerror = (error) => {
              console.error(`Script error for ad: ${adName || uniqueIdRef.current}`, error);
            };
          } else {
            newScript.textContent = oldScript.textContent;
          }
          
          // Replace old script with new one
          if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript);
          }
        });
      } else {
        // For non-script ad codes (like iframe, div, etc.)
        adContainerRef.current.innerHTML = adCode;
      }
      
      hasLoadedRef.current = true;
      setAdLoaded(true);
      
      // Add a small delay to check if content was actually added
      setTimeout(() => {
        if (adContainerRef.current) {
          const hasContent = adContainerRef.current.children.length > 0 || 
                           adContainerRef.current.textContent?.trim().length > 0;
          
          if (!hasContent) {
            console.warn(`Ad ${adName || uniqueIdRef.current} loaded but no visible content detected`);
            // Try to add fallback content for debugging
            adContainerRef.current.innerHTML = `
              <div style="padding: 20px; text-align: center; background: rgba(0,0,0,0.1); border: 1px dashed #ccc; color: #666;">
                <p>Ad: ${adName || 'Unknown'} (${adType})</p>
                <small>Position: ${position}</small>
              </div>
            `;
          } else {
            console.log(`Ad ${adName || uniqueIdRef.current} content confirmed visible`);
          }
        }
      }, 500);
      
      console.log(`Ad ${adName || uniqueIdRef.current} of type ${adType} loaded successfully (position: ${position})`);
      
    } catch (error) {
      console.error(`Error loading ad ${adName || uniqueIdRef.current}:`, error);
      
      // Add error fallback
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = `
          <div style="padding: 20px; text-align: center; background: rgba(255,0,0,0.1); border: 1px dashed #f00; color: #d00;">
            <p>Ad Load Error: ${adName || 'Unknown'}</p>
            <small>Error: ${error.message}</small>
          </div>
        `;
      }
    }
  }, [adCode, adType, position, adId, adName]);

  useEffect(() => {
    // Reset loaded state when ad code changes
    hasLoadedRef.current = false;
    setAdLoaded(false);
    
    if (!adCode) {
      console.warn(`No ad code provided for ${adName || uniqueIdRef.current}`);
      return;
    }

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

  if (!isVisible || !adCode) {
    console.log(`Ad ${adName || uniqueIdRef.current} not visible or no code`);
    return null;
  }

  // Get position-specific styling
  const getPositionStyles = () => {
    switch (position) {
      case 'sidebar':
        return {
          width: '100%',
          maxWidth: '300px',
          minHeight: '250px',
        };
      case 'in-video':
        return {
          width: '100%',
          maxWidth: '400px',
          minHeight: '200px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
        };
      case 'below-video':
        return {
          width: '100%',
          maxWidth: '728px',
          minHeight: '90px',
        };
      case 'top':
      case 'bottom':
      default:
        return {
          width: '100%',
          maxWidth: '728px',
          minHeight: '90px',
        };
    }
  };

  const positionStyles = getPositionStyles();

  return (
    <div className={`optimized-ad-container ${position}-ad-position ${className}`}>
      <div 
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
          display: 'block',
          borderRadius: position === 'in-video' ? '12px' : '8px',
          overflow: 'hidden',
          boxShadow: position === 'in-video' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div 
          ref={adContainerRef} 
          id={uniqueIdRef.current}
          style={{ 
            width: '100%',
            height: '100%',
            minHeight: 'inherit',
          }}
        />
      </div>
    </div>
  );
};

export default AdContainer;
