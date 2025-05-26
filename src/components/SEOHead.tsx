
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { SEOSetting } from '@/models/SEO';

interface SEOHeadProps {
  seoSettings?: SEOSetting;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  videoUrl?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  seoSettings,
  title,
  description,
  url,
  image,
  type = 'website',
  videoUrl
}) => {
  // Use provided props or fall back to SEO settings, with proper defaults
  const pageTitle = title || seoSettings?.title || 'Video Player Pro';
  const pageDescription = description || seoSettings?.description || 'Professional video hosting with monetization';
  const canonicalUrl = url || seoSettings?.canonical_url || (typeof window !== 'undefined' ? window.location.href : '');
  const ogImage = image || seoSettings?.og_image || 'https://lovable.dev/opengraph-image-p98pqg.png';

  // More aggressive meta tag updates - directly manipulate DOM as well as using Helmet
  useEffect(() => {
    console.log('SEOHead: Aggressively updating meta tags for better crawler detection');
    
    // Update title directly
    if (typeof document !== 'undefined') {
      document.title = pageTitle;
      
      // Helper function to update or create meta tag
      const updateMetaTag = (selector: string, content: string, property?: string) => {
        let metaTag = document.querySelector(selector) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement('meta');
          if (property) {
            metaTag.setAttribute(property, selector.replace(/\[|\]|"/g, '').split('=')[1]);
          } else {
            metaTag.setAttribute('name', selector.replace(/\[|\]|"/g, '').split('=')[1]);
          }
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      };
      
      // Update basic meta tags
      updateMetaTag('meta[name="description"]', pageDescription);
      if (seoSettings?.keywords) {
        updateMetaTag('meta[name="keywords"]', seoSettings.keywords);
      }
      
      // Update Open Graph tags
      updateMetaTag('meta[property="og:title"]', seoSettings?.og_title || pageTitle, 'property');
      updateMetaTag('meta[property="og:description"]', seoSettings?.og_description || pageDescription, 'property');
      updateMetaTag('meta[property="og:image"]', ogImage, 'property');
      updateMetaTag('meta[property="og:url"]', canonicalUrl, 'property');
      updateMetaTag('meta[property="og:type"]', type, 'property');
      updateMetaTag('meta[property="og:site_name"]', 'Video Player Pro', 'property');
      
      // Update Twitter Card tags
      updateMetaTag('meta[name="twitter:title"]', seoSettings?.twitter_title || pageTitle);
      updateMetaTag('meta[name="twitter:description"]', seoSettings?.twitter_description || pageDescription);
      updateMetaTag('meta[name="twitter:image"]', seoSettings?.twitter_image || ogImage);
      updateMetaTag('meta[name="twitter:card"]', seoSettings?.twitter_card || 'summary_large_image');
      
      // Update canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
      
      // Add video-specific meta tags if video URL exists
      if (videoUrl) {
        updateMetaTag('meta[property="og:video"]', videoUrl, 'property');
        updateMetaTag('meta[property="og:video:secure_url"]', videoUrl, 'property');
        updateMetaTag('meta[property="og:video:type"]', 'video/mp4', 'property');
      }
      
      console.log('SEOHead: Direct DOM manipulation completed');
      console.log('SEOHead: Updated title to:', pageTitle);
      console.log('SEOHead: Updated description to:', pageDescription);
    }
  }, [pageTitle, pageDescription, canonicalUrl, ogImage, seoSettings, type, videoUrl]);

  // Debug logging
  useEffect(() => {
    console.log('SEOHead: Component rendered with props:', {
      seoSettings,
      title,
      description,
      url,
      image,
      type,
      videoUrl
    });
    console.log('SEOHead: Computed values:', {
      pageTitle,
      pageDescription,
      canonicalUrl,
      ogImage
    });
    
    // Log what's actually in the DOM after a short delay
    setTimeout(() => {
      const titleEl = document.querySelector('title');
      const descEl = document.querySelector('meta[name="description"]');
      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      const ogDescEl = document.querySelector('meta[property="og:description"]');
      
      console.log('SEOHead: Final DOM state:');
      console.log('  - Title:', titleEl?.textContent);
      console.log('  - Description:', descEl?.getAttribute('content'));
      console.log('  - OG Title:', ogTitleEl?.getAttribute('content'));
      console.log('  - OG Description:', ogDescEl?.getAttribute('content'));
      
      // Log all meta tags for debugging
      const allMetaTags = document.querySelectorAll('meta');
      console.log('SEOHead: All meta tags count:', allMetaTags.length);
      allMetaTags.forEach((meta, index) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          console.log(`  ${index + 1}. ${name}: ${content}`);
        }
      });
    }, 200);
  }, [seoSettings, title, description, url, image, type, videoUrl, pageTitle, pageDescription, canonicalUrl, ogImage]);

  return (
    <Helmet>
      {/* Basic SEO - Always set these first */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {seoSettings?.keywords && <meta name="keywords" content={seoSettings.keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph - Use SEO settings if available, otherwise fall back to computed values */}
      <meta property="og:title" content={seoSettings?.og_title || pageTitle} />
      <meta property="og:description" content={seoSettings?.og_description || pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Video Player Pro" />
      {videoUrl && <meta property="og:video" content={videoUrl} />}
      {videoUrl && <meta property="og:video:secure_url" content={videoUrl} />}
      {videoUrl && <meta property="og:video:type" content="video/mp4" />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={seoSettings?.twitter_card || "summary_large_image"} />
      <meta name="twitter:site" content="@vidplayerpro" />
      <meta name="twitter:title" content={seoSettings?.twitter_title || pageTitle} />
      <meta name="twitter:description" content={seoSettings?.twitter_description || pageDescription} />
      <meta name="twitter:image" content={seoSettings?.twitter_image || ogImage} />
      
      {/* Additional SEO meta tags for better ranking */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Video Player Pro" />
      <meta name="revisit-after" content="1 days" />
      <meta name="language" content="English" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Structured data for videos */}
      {videoUrl && type === 'video.movie' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": pageTitle,
            "description": pageDescription,
            "thumbnailUrl": ogImage,
            "contentUrl": videoUrl,
            "uploadDate": new Date().toISOString(),
            "duration": "PT0M0S",
            "publisher": {
              "@type": "Organization",
              "name": "Video Player Pro",
              "logo": {
                "@type": "ImageObject",
                "url": "https://lovable.dev/opengraph-image-p98pqg.png"
              }
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
