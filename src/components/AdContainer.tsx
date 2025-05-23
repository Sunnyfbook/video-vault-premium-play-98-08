
import React, { useEffect, useRef, useState } from 'react';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
  delaySeconds?: number;
  position?: 'top' | 'bottom' | 'sidebar' | 'in-video';
}

const AdContainer: React.FC<AdContainerProps> = ({ 
  adType, 
  adCode, 
  className, 
  delaySeconds = 0,
  position = 'top' 
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adRendered, setAdRendered] = useState(false);
  const [adHeight, setAdHeight] = useState<number | null>(null);
  
  // Generate a truly unique ID for each ad container
  const uniqueIdRef = useRef<string>(`ad-${adType}-${position}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`);

  useEffect(() => {
    if (!adContainerRef.current || !adCode || adLoaded) return;

    // If there's a delay, wait before loading the ad
    if (delaySeconds > 0) {
      console.log(`Delaying ad load for ${delaySeconds} seconds for ${uniqueIdRef.current} (position: ${position})`);
      const timeoutId = setTimeout(() => {
        loadAd();
        setAdLoaded(true);
      }, delaySeconds * 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      loadAd();
      setAdLoaded(true);
    }
    
    function loadAd() {
      // Clear any existing content
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
        
        try {
          // Create a containing element for the ad that will be positioned correctly
          const adWrapper = document.createElement('div');
          adWrapper.className = `ad-wrapper position-${position}`;
          adWrapper.style.width = '100%';
          adWrapper.style.height = '100%';
          adWrapper.style.position = 'relative';
          adWrapper.style.display = 'flex';
          adWrapper.style.justifyContent = 'center';
          adWrapper.style.alignItems = 'center';
          adWrapper.id = `${uniqueIdRef.current}-wrapper`;
          
          adContainerRef.current.appendChild(adWrapper);
          
          // Replace any placeholder IDs in the ad code with our unique ID
          const modifiedAdCode = adCode.replace(/id="[^"]*"/g, `id="${uniqueIdRef.current}"`);
          
          // For JavaScript-based ad codes, create script elements directly
          if (modifiedAdCode.trim().startsWith('<script') || modifiedAdCode.indexOf('script') > -1) {
            // First, create a temporary container to parse the ad code
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = modifiedAdCode;
            
            // Extract scripts before appending content
            const scripts: HTMLScriptElement[] = [];
            const scriptElements = tempContainer.getElementsByTagName('script');
            
            // Convert the HTMLCollection to an array to avoid live collection issues
            for (let i = 0; i < scriptElements.length; i++) {
              scripts.push(scriptElements[i]);
            }
            
            // Remove scripts from the temp container
            for (const script of scripts) {
              if (script.parentNode) {
                script.parentNode.removeChild(script);
              }
            }
            
            // Append all non-script elements first to the wrapper
            while (tempContainer.firstChild) {
              adWrapper.appendChild(tempContainer.firstChild);
            }
            
            // Now execute scripts separately with an increasing delay between them
            scripts.forEach((originalScript, index) => {
              setTimeout(() => {
                const newScript = document.createElement('script');
                
                // Copy all attributes
                Array.from(originalScript.attributes).forEach(attr => {
                  newScript.setAttribute(attr.name, attr.value);
                });
                
                // Set a unique ID for the script
                const scriptId = `${uniqueIdRef.current}-script-${index}-${Date.now()}`;
                newScript.id = scriptId;
                
                // Copy inline script content if present
                if (originalScript.innerHTML) {
                  newScript.innerHTML = originalScript.innerHTML
                    .replace(/document\.write/g, `document.getElementById('${uniqueIdRef.current}-wrapper').innerHTML +=`)
                    .replace(/document\.getElementById\(['"](.*?)['"]/, `document.getElementById('${uniqueIdRef.current}-wrapper')`);
                }
                
                // Set src for external scripts
                if (originalScript.src) {
                  newScript.src = originalScript.src;
                }
                
                // Append the script to the target container to ensure proper positioning
                adWrapper.appendChild(newScript);
                console.log(`Script ${index + 1} loaded for ad container ${uniqueIdRef.current} (position: ${position})`);
              }, index * 500); // Increase delay between scripts significantly
            });
          } else {
            // For non-script HTML, just set innerHTML of the wrapper
            adWrapper.innerHTML = modifiedAdCode;
          }
          
          console.log(`Ad of type ${adType} mounted successfully with ID ${uniqueIdRef.current} (position: ${position})`);
          
          // After a short delay, check for the actual content height
          setTimeout(() => {
            if (adContainerRef.current) {
              const actualHeight = adContainerRef.current.scrollHeight;
              if (actualHeight > 0) {
                setAdHeight(actualHeight);
                setAdRendered(true);
              }
            }
          }, 1000);
          
        } catch (error) {
          console.error('Error rendering ad:', error);
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
      
      // Clean up any scripts we might have added
      document.querySelectorAll(`script[id^="${uniqueIdRef.current}-script-"]`).forEach(script => {
        script.remove();
      });
    };
  }, [adCode, adType, delaySeconds, position, adLoaded]);

  const getMinHeight = () => {
    if (adRendered && adHeight) {
      return `${adHeight}px`;
    }
    
    // Default minimum heights based on position
    switch (position) {
      case 'in-video':
        return '120px';
      case 'sidebar':
        return '250px';
      case 'top':
      case 'bottom':
      default:
        return '150px';
    }
  };

  return (
    <div 
      ref={adContainerRef} 
      id={uniqueIdRef.current}
      className={`ad-container ${className} ${
        adType === 'monetag' ? 'monetag-ad' : 'adstera-ad'
      } position-${position}`}
      data-ad-type={adType}
      data-delay={delaySeconds}
      data-position={position}
      style={{ 
        position: 'relative', 
        minHeight: getMinHeight(),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        transition: 'min-height 0.3s ease'
      }}
    ></div>
  );
};

export default AdContainer;
