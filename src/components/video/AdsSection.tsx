
import React from 'react';
import AdContainer from '@/components/AdContainer';
import { Ad } from '@/models/Ad';

interface AdsSectionProps {
  ads: Ad[];
  className?: string;
  staggerDelay?: boolean;
  baseDelaySeconds?: number;
  positionClass?: string;
}

const AdsSection: React.FC<AdsSectionProps> = ({ 
  ads, 
  className = "", 
  staggerDelay = false, 
  baseDelaySeconds = 0,
  positionClass = ""
}) => {
  if (ads.length === 0) return null;

  return (
    <div className={`ads-section ${className} ${positionClass}`}>
      {ads.map((ad, index) => {
        // Calculate delay based on index if staggering is enabled
        // Use a larger staggering delay to prevent conflicts
        const delaySeconds = staggerDelay 
          ? baseDelaySeconds + (index * 2) // Reduced to 2 seconds delay between ads for faster loading
          : baseDelaySeconds;
        
        // Generate a more reliable unique key using ad ID and position
        const uniqueKey = `ad-${ad.id}-${ad.position}-${index}`;
        
        console.log(`Rendering ad: ${ad.name} at position ${ad.position} with delay ${delaySeconds}s`);
        
        return (
          <AdContainer 
            key={uniqueKey}
            adType={ad.type} 
            adCode={ad.code} 
            className={`mb-4 w-full ads-position-${ad.position} ${ad.position === 'in-video' ? 'in-video-ad' : ''}`}
            delaySeconds={delaySeconds}
            position={ad.position}
            adId={ad.id}
            adName={ad.name}
          />
        );
      })}
    </div>
  );
};

export default AdsSection;
