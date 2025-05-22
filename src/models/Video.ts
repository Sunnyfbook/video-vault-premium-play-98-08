
import { supabase } from "@/integrations/supabase/client";

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  date_added: string;
  views: number;
}

// Video service functions
export const getVideos = async (): Promise<Video[]> => {
  try {
    const { data, error } = await supabase.from("videos").select("*");
    
    if (error) {
      console.error("Error loading videos:", error);
      return [];
    }
    
    return data as Video[];
  } catch (error) {
    console.error("Error loading videos:", error);
    return [];
  }
};

export const getVideoById = async (id: string): Promise<Video | undefined> => {
  try {
    if (!id) return undefined;
    
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error(`Error finding video with id ${id}:`, error);
      return undefined;
    }
    
    return data as Video;
  } catch (error) {
    console.error(`Error finding video with id ${id}:`, error);
    return undefined;
  }
};

export const addVideo = async (video: Omit<Video, "id" | "date_added" | "views">): Promise<Video> => {
  try {
    const newVideo = {
      ...video,
      views: 0
    };
    
    const { data, error } = await supabase
      .from("videos")
      .insert(newVideo)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding video:", error);
      throw new Error("Failed to add video");
    }
    
    return data as Video;
  } catch (error) {
    console.error("Error adding video:", error);
    throw new Error("Failed to add video");
  }
};

export const updateVideo = async (updatedVideo: Video): Promise<Video | undefined> => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .update(updatedVideo)
      .eq("id", updatedVideo.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating video:", error);
      return undefined;
    }
    
    return data as Video;
  } catch (error) {
    console.error("Error updating video:", error);
    return undefined;
  }
};

export const deleteVideo = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting video:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting video:", error);
    return false;
  }
};

export const incrementViews = async (id: string): Promise<void> => {
  try {
    const { data: video } = await supabase
      .from("videos")
      .select("views")
      .eq("id", id)
      .single();
    
    if (video) {
      const views = video.views + 1;
      await supabase
        .from("videos")
        .update({ views })
        .eq("id", id);
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};
