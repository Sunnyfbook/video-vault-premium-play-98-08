
import { useState, useEffect, useCallback } from 'react';

interface UsePerformantAdLoadingProps {
  adCode: string;
  delaySeconds: number;
  adName: string;
}

export function usePerformantAdLoading({ 
  adCode, 
  delaySeconds, 
  adName 
}: UsePerformantAdLoadingProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Use Intersection Observer to load ads only when they're about to be visible
  const observeElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before the ad becomes visible
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Load ad with optimal timing
  useEffect(() => {
    if (!isVisible || !adCode) return;

    const loadAd = () => {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setShouldLoad(true);
        });
      } else {
        setTimeout(() => {
          setShouldLoad(true);
        }, 0);
      }
    };

    if (delaySeconds > 0) {
      setTimeout(loadAd, delaySeconds * 1000);
    } else {
      loadAd();
    }
  }, [isVisible, adCode, delaySeconds]);

  return {
    shouldLoad,
    isVisible,
    observeElement
  };
}
