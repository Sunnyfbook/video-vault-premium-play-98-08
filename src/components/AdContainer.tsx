import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAdContainerSizes } from '@/hooks/useAdContainerSizes';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
  delaySeconds?: number;
  position?: 'top' | 'bottom' | 'sidebar' | 'in-video' | 'below-video' | 'before-video' | 'after-video' | 'sidebar-top' | 'sidebar-bottom';
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
  const { sizes } = useAdContainerSizes();
  
  const uniqueIdRef = useRef<string>(
    `ad-${adId || Math.random().toString(36).substring(2, 5)}-${position}-${Math.random().toString(36).substring(2, 5)}`
  );

  // Add CSS styles to ensure ad content fits within container with better sizing
  useEffect(() => {
    const containerId = uniqueIdRef.current;
    const existingStyle = document.getElementById(`${containerId}-style`);
    
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = `${containerId}-style`;
      style.textContent = `
        #${containerId} {
          overflow: hidden !important;
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        #${containerId} * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        
        #${containerId} iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        #${containerId} img {
          width: 100% !important;
          height: auto !important;
          max-height: 100% !important;
          object-fit: contain !important;
          display: block !important;
          margin: 0 auto !important;
        }
        
        #${containerId} div {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Handle script-generated content */
        #${containerId} > div {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Target common ad wrapper classes */
        #${containerId} [id*="ad"],
        #${containerId} [class*="ad"],
        #${containerId} [id*="banner"],
        #${containerId} [class*="banner"] {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Force Monetag ads to fill container properly */
        #${containerId} [id*="monetag"],
        #${containerId} [class*="monetag"] {
          width: 100% !important;
          height: 100% !important;
          min-height: 100% !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const styleElement = document.getElementById(`${containerId}-style`);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  // Monitor and adjust iframe dimensions after load
  useEffect(() => {
    if (!adLoaded || !adContainerRef.current) return;

    const monitorAdContent = () => {
      const container = adContainerRef.current;
      if (!container) return;

      // Force all iframes to fill container
      const iframes = container.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.minHeight = '100%';
        iframe.style.display = 'block';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.style.border = 'none';
      });

      // Force all divs to fill container properly
      const allDivs = container.querySelectorAll('div');
      allDivs.forEach((div) => {
        div.style.width = '100%';
        div.style.margin = '0';
        div.style.padding = '0';
        
        // For direct children of the ad container
        if (div.parentElement === container) {
          div.style.height = '100%';
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.style.justifyContent = 'center';
        }
      });
    };

    // Monitor immediately and then periodically
    monitorAdContent();
    const interval = setInterval(monitorAdContent, 1000);

    return () => clearInterval(interval);
  }, [adLoaded]);

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
          } else {
            console.log(`Ad ${adName || uniqueIdRef.current} content confirmed visible`);
          }
        }
      }, 500);
      
      console.log(`Ad ${adName || uniqueIdRef.current} of type ${adType} loaded successfully (position: ${position})`);
      
    } catch (error) {
      console.error(`Error loading ad ${adName || uniqueIdRef.current}:`, error);
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

  // Get position-specific styling with better defaults
  const getPositionStyles = () => {
    // Default sizes that work well for most ad networks
    const defaultSizes = {
      'in-video': { width: 320, height: 50 },
      'before-video': { width: 728, height: 90 },
      'after-video': { width: 728, height: 90 },
      'video-top': { width: 728, height: 90 },
      'video-middle': { width: 728, height: 90 },
      'video-bottom': { width: 728, height: 90 },
      'video-left': { width: 160, height: 600 },
      'video-right': { width: 160, height: 600 },
      top: { width: 728, height: 90 },
      'below-video': { width: 320, height: 100 },
      bottom: { width: 728, height: 90 },
      sidebar: { width: 300, height: 250 },
      'sidebar-top': { width: 300, height: 250 },
      'sidebar-bottom': { width: 300, height: 250 }
    };

    let width = defaultSizes[position]?.width || 320;
    let height = defaultSizes[position]?.height || 90;

    if (sizes) {
      switch (position) {
        case 'in-video':
          width = sizes.in_video_width;
          height = sizes.in_video_height;
          break;
        case 'top':
        case 'before-video':
        case 'after-video':
        case 'video-top':
        case 'video-middle':
        case 'video-bottom':
          width = sizes.top_width;
          height = sizes.top_height;
          break;
        case 'video-left':
        case 'video-right':
          width = Math.min(sizes.sidebar_width, 200);
          height = sizes.sidebar_height * 2;
          break;
        case 'below-video':
          width = sizes.below_video_width;
          height = sizes.below_video_height;
          break;
        case 'bottom':
          width = sizes.bottom_width;
          height = sizes.bottom_height;
          break;
        case 'sidebar':
        case 'sidebar-top':
        case 'sidebar-bottom':
          width = sizes.sidebar_width;
          height = sizes.sidebar_height;
          break;
      }
    }

    const baseStyles = {
      width: `${width}px`,
      maxWidth: `${width}px`,
      minWidth: `${width}px`,
      height: `${height}px`,
      maxHeight: `${height}px`,
      minHeight: `${height}px`,
      overflow: 'hidden',
      display: 'block',
    };

    if (position === 'in-video') {
      return {
        ...baseStyles,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
      };
    }

    return baseStyles;
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
          position: 'relative',
          backgroundColor: position === 'in-video' ? 'transparent' : '#f8f9fa',
        }}
      >
        <div 
          ref={adContainerRef} 
          id={uniqueIdRef.current}
          style={{ 
            width: '100%',
            height: '100%',
            minHeight: 'inherit',
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </div>
    </div>
  );
};

export default AdContainer;
