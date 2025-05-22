
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
    
    try {
      // Create a parser to handle the HTML string
      const parser = new DOMParser();
      const doc = parser.parseFromString(adCode, 'text/html');
      
      // Get all elements from the parsed document
      const elements = Array.from(doc.body.children);
      
      // Append each element to our container
      elements.forEach(element => {
        adContainerRef.current?.appendChild(document.importNode(element, true));
      });
      
      // Find and execute scripts separately
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        
        // Copy script attributes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy script content
        newScript.textContent = script.textContent;
        
        // Append to document body to ensure it runs
        document.body.appendChild(newScript);
      });
      
      console.log(`Ad of type ${adType} mounted successfully`);
    } catch (error) {
      console.error('Error rendering ad:', error);
    }
    
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [adCode, adType]);

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
