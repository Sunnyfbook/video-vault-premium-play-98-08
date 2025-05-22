
/**
 * Instagram Utils - Helper functions for handling Instagram content
 */

/**
 * Extracts Instagram post ID from a URL
 */
export const extractInstagramPostId = (url: string): string | null => {
  try {
    // Handle different Instagram URL formats
    // Examples:
    // https://www.instagram.com/p/C1a2b3cDeFg/
    // https://instagram.com/p/C1a2b3cDeFg
    // https://www.instagram.com/reel/C1a2b3cDeFg
    const regex = /instagram\.com\/(p|reel)\/([^/?]+)/i;
    const match = url.match(regex);
    
    if (match && match[2]) {
      return match[2];
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting Instagram post ID:", error);
    return null;
  }
};

/**
 * Validates if a URL is a valid Instagram post URL
 */
export const isInstagramPostUrl = (url: string): boolean => {
  return !!extractInstagramPostId(url);
};

/**
 * Gets the embed URL for an Instagram post
 */
export const getInstagramEmbedUrl = (postId: string): string => {
  return `https://www.instagram.com/p/${postId}/embed/captioned/`;
};

/**
 * Gets the embed URL for an Instagram post without captions
 */
export const getInstagramEmbedUrlNoCaptions = (postId: string): string => {
  return `https://www.instagram.com/p/${postId}/embed/`;
};
