
import React, { useEffect, useRef } from 'react';

interface AdContainerProps {
  adType: 'monetag' | 'adstera';
  adCode: string;
  className?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ adType, adCode, className }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clear any existing content
    adContainerRef.current.innerHTML = '';
    
    // Add the ad code
    const scriptElement = document.createElement('div');
    scriptElement.innerHTML = adCode;
    
    // Append all child nodes from the created element
    while (scriptElement.firstChild) {
      adContainerRef.current.appendChild(scriptElement.firstChild);
    }

    // Execute any script tags that were in the ad code
    const scripts = adContainerRef.current.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const scriptClone = document.createElement('script');
      
      // Copy all attributes from the original script
      Array.from(script.attributes).forEach(attr => {
        scriptClone.setAttribute(attr.name, attr.value);
      });
      
      // Copy the content
      scriptClone.text = script.text;
      
      // Replace the original with the clone
      script.parentNode?.replaceChild(scriptClone, script);
    }
    
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [adCode]);

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container min-h-[100px] ${className} ${
        adType === 'monetag' ? 'monetag-ad' : 'adstera-ad'
      }`}
      data-ad-type={adType}
    ></div>
  );
};

export default AdContainer;
