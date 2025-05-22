
/**
 * Instagram Utils - Helper functions for handling Instagram content
 */

/**
 * Extracts Instagram post ID from a URL
 */
export const extractInstagramPostId = (url: string): string | null => {
  try {
    if (!url) return null;
    
    // Handle different Instagram URL formats
    // Examples:
    // https://www.instagram.com/p/C1a2b3cDeFg/
    // https://instagram.com/p/C1a2b3cDeFg
    // https://www.instagram.com/reel/C1a2b3cDeFg
    // https://www.instagram.com/reels/C1a2b3cDeFg
    const regex = /instagram\.com\/(p|reel|reels)\/([^/?#]+)/i;
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
  if (!url) return false;
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

/**
 * Gets the embed URL for an Instagram reel
 */
export const getInstagramReelEmbedUrl = (postId: string): string => {
  return `https://www.instagram.com/reel/${postId}/embed/`;
};

/**
 * Determines if a URL is for a reel or a post and returns appropriate embed URL
 */
export const getAppropriateEmbedUrl = (url: string): string | null => {
  const postId = extractInstagramPostId(url);
  if (!postId) return null;
  
  // Check if it's a reel or post
  if (url.includes('/reel/') || url.includes('/reels/')) {
    return getInstagramReelEmbedUrl(postId);
  }
  return getInstagramEmbedUrl(postId); // Using captioned version for better display
};
