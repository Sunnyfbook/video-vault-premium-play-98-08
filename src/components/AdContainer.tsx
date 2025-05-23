
import React, { useEffect, useRef } from 'react';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ adType, adCode, className }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current || !adCode) return;

    // Clear any existing content
    adContainerRef.current.innerHTML = '';
    
    try {
      // For JavaScript-based ad codes, create a script element directly
      if (adCode.trim().startsWith('<script') || adCode.indexOf('script') > -1) {
        // First, try direct innerHTML insertion (works for many ad networks)
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = adCode;
        
        // Extract scripts before appending content
        const scripts: HTMLScriptElement[] = [];
        const scriptElements = tempContainer.getElementsByTagName('script');
        for (let i = 0; i < scriptElements.length; i++) {
          scripts.push(scriptElements[i]);
        }
        
        // Remove scripts from the temp container to prevent premature execution
        for (const script of scripts) {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
        
        // Append all non-script elements
        while (tempContainer.firstChild) {
          adContainerRef.current.appendChild(tempContainer.firstChild);
        }
        
        // Now execute scripts separately to ensure they run properly
        scripts.forEach(originalScript => {
          const newScript = document.createElement('script');
          
          // Copy all attributes
          Array.from(originalScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Copy inline script content if present
          if (originalScript.innerHTML) {
            newScript.innerHTML = originalScript.innerHTML;
          }
          
          // For external scripts
          if (originalScript.src) {
            newScript.src = originalScript.src;
          }
          
          // Append to document body to ensure proper execution
          adContainerRef.current.appendChild(newScript);
        });
      } else {
        // For non-script HTML, just set innerHTML
        adContainerRef.current.innerHTML = adCode;
      }
      
      console.log(`Ad of type ${adType} mounted successfully`, { adCode: adCode.substring(0, 50) + '...' });
    } catch (error) {
      console.error('Error rendering ad:', error);
      
      // Fallback: try direct insertion as a last resort
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = adCode;
      }
    }
    
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [adCode, adType]);

  // Add specific styling for in-video ads
  const isInVideo = className?.includes('in-video-ad');

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className} ${
        adType === 'monetag' ? 'monetag-ad' : 'adstera-ad'
      }`}
      data-ad-type={adType}
    ></div>
  );
};

export default AdContainer;
