
import React from 'react';
import AdContainer from '@/components/AdContainer';
import { Ad } from '@/models/Ad';

interface AdsSectionProps {
  ads: Ad[];
  className?: string;
}

const AdsSection: React.FC<AdsSectionProps> = ({ ads, className = "" }) => {
  if (ads.length === 0) return null;

  return (
    <div className={`ads-section ${className}`}>
      {ads.map(ad => (
        <AdContainer 
          key={ad.id} 
          adType={ad.type} 
          adCode={ad.code} 
          className={`mb-4 w-full ${ad.position === 'in-video' ? 'in-video-ad shadow-lg rounded-lg overflow-hidden' : ''}`}
        />
      ))}
    </div>
  );
};

export default AdsSection;
