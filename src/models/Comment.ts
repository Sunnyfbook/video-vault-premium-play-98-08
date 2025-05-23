
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  video_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export const getCommentsByVideoId = async (videoId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading comments:", error);
      return [];
    }
    
    return data as Comment[];
  } catch (error) {
    console.error("Error loading comments:", error);
    return [];
  }
};

export const addComment = async (comment: Omit<Comment, "id" | "created_at">): Promise<Comment | undefined> => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding comment:", error);
      return undefined;
    }
    
    return data as Comment;
  } catch (error) {
    console.error("Error adding comment:", error);
    return undefined;
  }
};

export const deleteComment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting comment:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
