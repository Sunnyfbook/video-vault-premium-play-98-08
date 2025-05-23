
import React, { useEffect, useRef, useState } from 'react';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
  delaySeconds?: number;
}

const AdContainer: React.FC<AdContainerProps> = ({ adType, adCode, className, delaySeconds = 0 }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  // Generate a truly unique ID for each ad container
  const uniqueIdRef = useRef<string>(`ad-${adType}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`);

  useEffect(() => {
    if (!adContainerRef.current || !adCode || adLoaded) return;

    // If there's a delay, wait before loading the ad
    if (delaySeconds > 0) {
      console.log(`Delaying ad load for ${delaySeconds} seconds for ${uniqueIdRef.current}`);
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
                  newScript.innerHTML = originalScript.innerHTML.replace(/document\.write/g, 
                    `document.getElementById('${uniqueIdRef.current}').innerHTML +=`);
                }
                
                // Set src for external scripts
                if (originalScript.src) {
                  newScript.src = originalScript.src;
                }
                
                // Append to container with a unique wrapper
                if (adContainerRef.current) {
                  // Create a wrapper for the script to isolate its execution context
                  const scriptWrapper = document.createElement('div');
                  scriptWrapper.id = `${uniqueIdRef.current}-wrapper-${index}`;
                  adContainerRef.current.appendChild(scriptWrapper);
                  
                  // Add the script to the document body instead of the container
                  // This helps prevent script conflicts between multiple ad containers
                  document.body.appendChild(newScript);
                  
                  console.log(`Script ${index + 1} loaded for ad container ${uniqueIdRef.current}`);
                }
              }, index * 300); // Increase delay between scripts significantly
            });
          } else {
            // For non-script HTML, just set innerHTML
            adContainerRef.current.innerHTML = modifiedAdCode;
          }
          
          console.log(`Ad of type ${adType} mounted successfully with ID ${uniqueIdRef.current}`);
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
      
      // Clean up any scripts we might have added to document.body
      document.querySelectorAll(`script[id^="${uniqueIdRef.current}-script-"]`).forEach(script => {
        script.remove();
      });
    };
  }, [adCode, adType, delaySeconds, adLoaded]);

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
