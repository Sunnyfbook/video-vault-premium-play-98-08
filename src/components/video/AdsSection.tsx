
import React from 'react';
import AdContainer from '@/components/AdContainer';
import { Ad } from '@/models/Ad';

interface AdsSectionProps {
  ads: Ad[];
  className?: string;
  staggerDelay?: boolean;
  baseDelaySeconds?: number;
}

const AdsSection: React.FC<AdsSectionProps> = ({ 
  ads, 
  className = "", 
  staggerDelay = false, 
  baseDelaySeconds = 0 
}) => {
  if (ads.length === 0) return null;

  return (
    <div className={`ads-section ${className}`}>
      {ads.map((ad, index) => {
        // Calculate delay based on index if staggering is enabled
        const delaySeconds = staggerDelay 
          ? baseDelaySeconds + (index * 2) // Increased to 2 second delay between ads
          : baseDelaySeconds;
        
        return (
          <AdContainer 
            key={`${ad.id}-${index}-${Math.random().toString(36).substring(2, 9)}`} // Enhanced uniqueness
            adType={ad.type} 
            adCode={ad.code} 
            className={`mb-4 w-full ${ad.position === 'in-video' ? 'in-video-ad' : ''}`}
            delaySeconds={delaySeconds}
          />
        );
      })}
    </div>
  );
};

export default AdsSection;
