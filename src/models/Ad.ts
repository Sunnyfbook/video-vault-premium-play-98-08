
export interface Ad {
  id: string;
  name: string;
  type: 'monetag' | 'adstera';
  code: string;
  position: 'top' | 'bottom' | 'sidebar' | 'in-video';
  isActive: boolean;
}

// Mock data store for ads
export const ads: Ad[] = [
  {
    id: '1',
    name: 'Top Banner',
    type: 'monetag',
    code: '<div class="ad-placeholder">Monetag Ad Placeholder</div>',
    position: 'top',
    isActive: true
  },
  {
    id: '2',
    name: 'Bottom Banner',
    type: 'adstera',
    code: '<div class="ad-placeholder">Adstera Ad Placeholder</div>',
    position: 'bottom',
    isActive: true
  }
];

// Ad service functions
export const getAds = (): Ad[] => {
  const storedAds = localStorage.getItem('ads');
  if (storedAds) {
    return JSON.parse(storedAds);
  }
  // Initialize with mock data if nothing exists
  localStorage.setItem('ads', JSON.stringify(ads));
  return ads;
};

export const getActiveAds = (): Ad[] => {
  const ads = getAds();
  return ads.filter(ad => ad.isActive);
};

export const getAdsByPosition = (position: Ad['position']): Ad[] => {
  const ads = getAds();
  return ads.filter(ad => ad.position === position && ad.isActive);
};

export const addAd = (ad: Omit<Ad, 'id'>): Ad => {
  const ads = getAds();
  const newAd: Ad = {
    ...ad,
    id: Date.now().toString()
  };
  
  ads.push(newAd);
  localStorage.setItem('ads', JSON.stringify(ads));
  return newAd;
};

export const updateAd = (updatedAd: Ad): Ad | undefined => {
  const ads = getAds();
  const index = ads.findIndex(a => a.id === updatedAd.id);
  
  if (index !== -1) {
    ads[index] = updatedAd;
    localStorage.setItem('ads', JSON.stringify(ads));
    return updatedAd;
  }
  
  return undefined;
};

export const deleteAd = (id: string): boolean => {
  const ads = getAds();
  const filteredAds = ads.filter(a => a.id !== id);
  
  if (filteredAds.length < ads.length) {
    localStorage.setItem('ads', JSON.stringify(filteredAds));
    return true;
  }
  
  return false;
};
