
import React from 'react';
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
  // Use provided props or fall back to SEO settings
  const pageTitle = title || seoSettings?.title || 'Video Player Pro';
  const pageDescription = description || seoSettings?.description || 'Professional video hosting with monetization';
  const canonicalUrl = url || seoSettings?.canonical_url || window.location.href;
  const ogImage = image || seoSettings?.og_image || 'https://lovable.dev/opengraph-image-p98pqg.png';

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {seoSettings?.keywords && <meta name="keywords" content={seoSettings.keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
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
