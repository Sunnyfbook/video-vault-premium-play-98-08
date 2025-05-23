
import React, { useEffect, useRef } from 'react';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
  delaySeconds?: number;
}

const AdContainer: React.FC<AdContainerProps> = ({ adType, adCode, className, delaySeconds = 0 }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adLoadedRef = useRef<boolean>(false);
  // Generate a unique ID for each ad container
  const uniqueIdRef = useRef<string>(`ad-${adType}-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (!adContainerRef.current || !adCode) return;

    // If there's a delay, wait before loading the ad
    if (delaySeconds > 0 && !adLoadedRef.current) {
      console.log(`Delaying ad load for ${delaySeconds} seconds`);
      const timeoutId = setTimeout(() => {
        loadAd();
        adLoadedRef.current = true;
      }, delaySeconds * 1000);
      
      return () => clearTimeout(timeoutId);
    } else if (!adLoadedRef.current) {
      loadAd();
      adLoadedRef.current = true;
    }
    
    function loadAd() {
      // Clear any existing content
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
        
        try {
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
            
            // Append all non-script elements first
            while (tempContainer.firstChild) {
              adContainerRef.current.appendChild(tempContainer.firstChild);
            }
            
            // Now execute scripts separately with a small delay between them
            scripts.forEach((originalScript, index) => {
              setTimeout(() => {
                const newScript = document.createElement('script');
                
                // Copy all attributes
                Array.from(originalScript.attributes).forEach(attr => {
                  newScript.setAttribute(attr.name, attr.value);
                });
                
                // Set a unique ID for the script if it doesn't have one
                if (!newScript.id) {
                  newScript.id = `${uniqueIdRef.current}-script-${index}`;
                }
                
                // Copy inline script content if present
                if (originalScript.innerHTML) {
                  newScript.innerHTML = originalScript.innerHTML;
                }
                
                // Set src for external scripts
                if (originalScript.src) {
                  newScript.src = originalScript.src;
                }
                
                // Append to container
                if (adContainerRef.current) {
                  adContainerRef.current.appendChild(newScript);
                  console.log(`Script ${index + 1} loaded for ad container ${uniqueIdRef.current}`);
                }
              }, index * 100); // Add a small delay between scripts
            });
          } else {
            // For non-script HTML, just set innerHTML
            adContainerRef.current.innerHTML = modifiedAdCode;
          }
          
          console.log(`Ad of type ${adType} mounted successfully with ID ${uniqueIdRef.current}`);
        } catch (error) {
          console.error('Error rendering ad:', error);
          
          // Fallback: try direct insertion as a last resort
          if (adContainerRef.current) {
            adContainerRef.current.innerHTML = adCode;
          }
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [adCode, adType, delaySeconds]);

  return (
    <div 
      ref={adContainerRef} 
      id={uniqueIdRef.current}
      className={`ad-container ${className} ${
        adType === 'monetag' ? 'monetag-ad' : 'adstera-ad'
      }`}
      data-ad-type={adType}
      data-delay={delaySeconds}
    ></div>
  );
};

export default AdContainer;
