
import { supabase } from "@/integrations/supabase/client";

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  date_added: string;
  views: number;
  custom_url?: string;
  ad_timing_seconds?: number;
}

// Helper function to generate a slug from a title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 50) // Limit length
    + '-' + Math.random().toString(36).substring(2, 7); // Add random string for uniqueness
};

// Video service functions
export const getVideos = async (): Promise<Video[]> => {
  try {
    console.log('Video model: Fetching all videos');
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order('date_added', { ascending: false });
    
    if (error) {
      console.error("Video model: Error loading videos:", error);
      throw new Error(`Failed to load videos: ${error.message}`);
    }
    
    console.log('Video model: Loaded videos:', data?.length || 0);
    return data as Video[];
  } catch (error) {
    console.error("Video model: Error loading videos:", error);
    throw error;
  }
};

export const getVideoById = async (id: string): Promise<Video | undefined> => {
  try {
    if (!id) {
      console.log('Video model: No ID provided');
      return undefined;
    }
    
    console.log('Video model: Fetching video by ID:', id);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error(`Video model: Error finding video with id ${id}:`, error);
      return undefined;
    }
    
    console.log('Video model: Found video by ID:', data?.title);
    return data as Video;
  } catch (error) {
    console.error(`Video model: Error finding video with id ${id}:`, error);
    return undefined;
  }
};

export const getVideoByCustomUrl = async (customUrl: string): Promise<Video | undefined> => {
  try {
    if (!customUrl) {
      console.log('Video model: No custom URL provided');
      return undefined;
    }
    
    console.log('Video model: Fetching video by custom URL:', customUrl);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("custom_url", customUrl)
      .single();
    
    if (error) {
      console.error(`Video model: Error finding video with custom URL ${customUrl}:`, error);
      return undefined;
    }
    
    console.log('Video model: Found video by custom URL:', data?.title);
    return data as Video;
  } catch (error) {
    console.error(`Video model: Error finding video with custom URL ${customUrl}:`, error);
    return undefined;
  }
};

export const addVideo = async (video: Omit<Video, "id" | "date_added" | "views" | "custom_url">): Promise<Video> => {
  try {
    console.log('Video model: Adding video:', video.title);
    
    // Validate required fields
    if (!video.title?.trim()) {
      throw new Error('Video title is required');
    }
    if (!video.url?.trim()) {
      throw new Error('Video URL is required');
    }
    
    // Generate custom URL from title
    const customUrl = generateSlug(video.title);
    
    const newVideo = {
      ...video,
      custom_url: customUrl,
      views: 0,
      ad_timing_seconds: video.ad_timing_seconds || 10
    };
    
    const { data, error } = await supabase
      .from("videos")
      .insert(newVideo)
      .select()
      .single();
    
    if (error) {
      console.error("Video model: Error adding video:", error);
      throw new Error(`Failed to add video: ${error.message}`);
    }
    
    console.log('Video model: Video added successfully:', data.title);
    return data as Video;
  } catch (error) {
    console.error("Video model: Error adding video:", error);
    throw error;
  }
};

export const updateVideo = async (updatedVideo: Video): Promise<Video | undefined> => {
  try {
    console.log('Video model: Updating video:', updatedVideo.title);
    
    // Validate required fields
    if (!updatedVideo.title?.trim()) {
      throw new Error('Video title is required');
    }
    if (!updatedVideo.url?.trim()) {
      throw new Error('Video URL is required');
    }
    
    // If no custom_url exists, generate one
    if (!updatedVideo.custom_url) {
      updatedVideo.custom_url = generateSlug(updatedVideo.title);
    }
    
    const { data, error } = await supabase
      .from("videos")
      .update({
        title: updatedVideo.title,
        description: updatedVideo.description,
        url: updatedVideo.url,
        thumbnail: updatedVideo.thumbnail,
        custom_url: updatedVideo.custom_url,
        ad_timing_seconds: updatedVideo.ad_timing_seconds || 10
      })
      .eq("id", updatedVideo.id)
      .select()
      .single();
    
    if (error) {
      console.error("Video model: Error updating video:", error);
      throw new Error(`Failed to update video: ${error.message}`);
    }
    
    console.log('Video model: Video updated successfully:', data.title);
    return data as Video;
  } catch (error) {
    console.error("Video model: Error updating video:", error);
    throw error;
  }
};

export const deleteVideo = async (id: string): Promise<boolean> => {
  try {
    console.log('Video model: Deleting video:', id);
    
    if (!id?.trim()) {
      throw new Error('Video ID is required');
    }
    
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Video model: Error deleting video:", error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
    
    console.log('Video model: Video deleted successfully');
    return true;
  } catch (error) {
    console.error("Video model: Error deleting video:", error);
    throw error;
  }
};

export const incrementViews = async (id: string): Promise<void> => {
  try {
    console.log('Video model: Incrementing views for video:', id);
    
    if (!id?.trim()) {
      throw new Error('Video ID is required');
    }
    
    const { data: video, error: fetchError } = await supabase
      .from("videos")
      .select("views")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      console.error('Video model: Error fetching video for view increment:', fetchError);
      return;
    }
    
    if (video) {
      const views = (video.views || 0) + 1;
      const { error: updateError } = await supabase
        .from("videos")
        .update({ views })
        .eq("id", id);
        
      if (updateError) {
        console.error('Video model: Error updating views:', updateError);
        return;
      }
      
      console.log('Video model: Views incremented to:', views);
    }
  } catch (error) {
    console.error("Video model: Error incrementing views:", error);
  }
};
