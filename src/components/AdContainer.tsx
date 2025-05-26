
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAdContainerSizes } from '@/hooks/useAdContainerSizes';

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
  const { sizes } = useAdContainerSizes();
  
  const uniqueIdRef = useRef<string>(
    `ad-${adId || Math.random().toString(36).substring(2, 5)}-${position}-${Math.random().toString(36).substring(2, 5)}`
  );

  // Optimized CSS styles with better performance
  useEffect(() => {
    const containerId = uniqueIdRef.current;
    const existingStyle = document.getElementById(`${containerId}-style`);
    
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = `${containerId}-style`;
      style.textContent = `
        #${containerId} {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          contain: layout size style !important;
          transform: translateZ(0) !important;
        }
        
        #${containerId} * {
          max-width: 100% !important;
          max-height: 100% !important;
          box-sizing: border-box !important;
        }
        
        #${containerId} iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          display: block !important;
          transform: translateZ(0) !important;
        }
        
        #${containerId} img {
          width: 100% !important;
          height: auto !important;
          max-height: 100% !important;
          object-fit: contain !important;
          display: block !important;
          transform: translateZ(0) !important;
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
  }, [position]);

  // Optimized content monitoring
  useEffect(() => {
    if (!adLoaded || !adContainerRef.current) return;

    const monitorAdContent = () => {
      const container = adContainerRef.current;
      if (!container) return;

      // Force dimensions on all content with minimal reflows
      const allElements = container.querySelectorAll('*');
      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (htmlElement.style.maxWidth !== '100%') {
          htmlElement.style.maxWidth = '100%';
          htmlElement.style.maxHeight = '100%';
        }
      });
    };

    monitorAdContent();
    const interval = setInterval(monitorAdContent, 2000); // Reduced frequency

    return () => clearInterval(interval);
  }, [adLoaded]);

  const loadAd = useCallback(() => {
    if (!adContainerRef.current || !adCode || hasLoadedRef.current) return;
    
    try {
      adContainerRef.current.innerHTML = '';
      
      if (adCode.includes('<script')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adCode;
        
        while (tempDiv.firstChild) {
          adContainerRef.current.appendChild(tempDiv.firstChild);
        }
        
        const scripts = adContainerRef.current.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = true;
            newScript.defer = true; // Add defer for better performance
          } else {
            newScript.textContent = oldScript.textContent;
          }
          
          if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript);
          }
        });
      } else {
        adContainerRef.current.innerHTML = adCode;
      }
      
      hasLoadedRef.current = true;
      setAdLoaded(true);
      
    } catch (error) {
      console.error(`Error loading ad ${adName || uniqueIdRef.current}:`, error);
    }
  }, [adCode, adType, position, adId, adName]);

  useEffect(() => {
    hasLoadedRef.current = false;
    setAdLoaded(false);
    
    if (!adCode) return;

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    if (delaySeconds > 0) {
      loadTimeoutRef.current = setTimeout(() => {
        loadAd();
      }, delaySeconds * 1000);
    } else {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadAd);
      } else {
        setTimeout(loadAd, 0);
      }
    }
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [adCode, delaySeconds, loadAd]);

  if (!isVisible || !adCode) {
    return null;
  }

  // Optimized position-specific styling with fixed dimensions
  const getPositionStyles = () => {
    const defaultSizes = {
      'in-video': { width: 320, height: 50 },
      top: { width: 320, height: 50 },
      'below-video': { width: 320, height: 50 },
      bottom: { width: 300, height: 250 },
      sidebar: { width: 300, height: 250 }
    };

    let width = defaultSizes[position]?.width || 320;
    let height = defaultSizes[position]?.height || 50;

    if (sizes) {
      switch (position) {
        case 'in-video':
          width = sizes.in_video_width;
          height = sizes.in_video_height;
          break;
        case 'top':
          width = sizes.top_width;
          height = sizes.top_height;
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
          width = sizes.sidebar_width;
          height = sizes.sidebar_height;
          break;
      }
    }

    const baseStyles = {
      width: `${width}px`,
      maxWidth: `${width}px`,
      height: `${height}px`,
      maxHeight: `${height}px`,
      minHeight: `${height}px`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Performance optimizations
      contain: 'layout size style' as const,
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden' as const,
    };

    return baseStyles;
  };

  const positionStyles = getPositionStyles();

  return (
    <div className={`optimized-ad-container ${position}-ad-container ${className}`}>
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
          borderRadius: position === 'in-video' ? '12px' : '8px',
          boxShadow: position === 'in-video' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          position: 'relative',
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
            contain: 'layout size style',
            transform: 'translateZ(0)',
          }}
        />
      </div>
    </div>
  );
};

export default AdContainer;
