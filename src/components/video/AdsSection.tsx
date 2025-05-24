
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
    if (ads.length > 0) {
      console.log(`AdsSection: Rendering ${ads.length} ads in ${positionClass || 'unknown'} section`);
    }
  }, [ads, positionClass]);

  if (ads.length === 0) return null;

  return (
    <div className={`${className} ${positionClass} no-spacing`}>
      {ads.map((ad, index) => {
        const delaySeconds = staggerDelay 
          ? baseDelaySeconds + (index * 1.5)
          : baseDelaySeconds;
        
        const uniqueKey = `${ad.id}-${ad.position}-${index}`;
        
        console.log(`Rendering ad: ${ad.name} at position ${ad.position} with delay ${delaySeconds}s`);
        
        return (
          <AdContainer 
            key={uniqueKey}
            adType={ad.type} 
            adCode={ad.code} 
            className="w-full no-spacing"
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
