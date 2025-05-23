
import React from 'react';
import AdContainer from '@/components/AdContainer';
import { Ad } from '@/models/Ad';

interface AdsSectionProps {
  ads: Ad[];
  className?: string;
  staggerDelay?: boolean;
  baseDelaySeconds?: number;
  positionClass?: string; // Added position class prop
}

const AdsSection: React.FC<AdsSectionProps> = ({ 
  ads, 
  className = "", 
  staggerDelay = false, 
  baseDelaySeconds = 0,
  positionClass = "" // Default to empty string
}) => {
  if (ads.length === 0) return null;

  return (
    <div className={`ads-section ${className} ${positionClass}`}>
      {ads.map((ad, index) => {
        // Calculate delay based on index if staggering is enabled
        // Use a larger staggering delay to prevent conflicts
        const delaySeconds = staggerDelay 
          ? baseDelaySeconds + (index * 4) // Increased to 4 second delay between ads
          : baseDelaySeconds;
        
        // Generate a truly unique key that includes timestamp and position
        const uniqueKey = `${ad.id}-${ad.position}-${index}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
        
        return (
          <AdContainer 
            key={uniqueKey}
            adType={ad.type} 
            adCode={ad.code} 
            className={`mb-4 w-full ${ad.position}-ad ${ad.position === 'in-video' ? 'in-video-ad' : ''}`}
            delaySeconds={delaySeconds}
          />
        );
      })}
    </div>
  );
};

export default AdsSection;
