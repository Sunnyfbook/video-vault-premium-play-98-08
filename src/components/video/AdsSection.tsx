
import React, { useEffect } from 'react';
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
  useEffect(() => {
    // Log ads to be rendered for debugging
    if (ads.length > 0) {
      console.log(`AdsSection: Rendering ${ads.length} ads in ${positionClass || 'unknown'} section`);
    }
  }, [ads, positionClass]);

  if (ads.length === 0) return null;

  return (
    <div className={`ads-section ${className} ${positionClass}`}>
      {ads.map((ad, index) => {
        // Calculate delay based on index if staggering is enabled
        // Match exactly what's in the homepage - use the same delay calculation
        const delaySeconds = staggerDelay 
          ? baseDelaySeconds + (index * 0.5) // Reduced delay between ads for faster loading
          : baseDelaySeconds;
        
        // Generate a more reliable unique key using ad ID and position
        const uniqueKey = `ad-${ad.id}-${ad.position}-${index}-${positionClass}-${Math.random().toString(36).substring(2, 5)}`;
        
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
            forceBrowserRender={true} // Force browser to render the ad
          />
        );
      })}
    </div>
  );
};

export default AdsSection;
