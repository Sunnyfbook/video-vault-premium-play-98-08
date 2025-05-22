
import { supabase } from '@/integrations/supabase/client';

export interface HomepageContent {
  id: string;
  type: 'featured' | 'video' | 'image';
  title: string;
  description?: string;
  url: string;  // URL to content or image
  thumbnail?: string;
  order: number;
  created_at: string;
}

export const getHomepageContent = async (): Promise<HomepageContent[]> => {
  const { data, error } = await supabase
    .from('homepage_content')
    .select('*')
    .order('order', { ascending: true });
  
  if (error) {
    console.error('Error fetching homepage content:', error);
    return [];
  }
  
  return data || [];
};

export const getFeaturedContent = async (): Promise<HomepageContent[]> => {
  const { data, error } = await supabase
    .from('homepage_content')
    .select('*')
    .eq('type', 'featured')
    .order('order', { ascending: true });
  
  if (error) {
    console.error('Error fetching featured content:', error);
    return [];
  }
  
  return data || [];
};

export const getVideoContent = async (): Promise<HomepageContent[]> => {
  const { data, error } = await supabase
    .from('homepage_content')
    .select('*')
    .eq('type', 'video')
    .order('order', { ascending: true });
  
  if (error) {
    console.error('Error fetching video content:', error);
    return [];
  }
  
  return data || [];
};

export const getImageContent = async (): Promise<HomepageContent[]> => {
  const { data, error } = await supabase
    .from('homepage_content')
    .select('*')
    .eq('type', 'image')
    .order('order', { ascending: true });
  
  if (error) {
    console.error('Error fetching image content:', error);
    return [];
  }
  
  return data || [];
};

export const addHomepageContent = async (content: Omit<HomepageContent, 'id' | 'created_at'>): Promise<HomepageContent | null> => {
  const { data, error } = await supabase
    .from('homepage_content')
    .insert(content)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding homepage content:', error);
    return null;
  }
  
  return data;
};

export const updateHomepageContent = async (content: Partial<HomepageContent> & { id: string }): Promise<HomepageContent | null> => {
  const { data, error } = await supabase
    .from('homepage_content')
    .update(content)
    .eq('id', content.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating homepage content:', error);
    return null;
  }
  
  return data;
};

export const deleteHomepageContent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('homepage_content')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting homepage content:', error);
    return false;
  }
  
  return true;
};

export const reorderHomepageContent = async (items: { id: string, order: number }[]): Promise<boolean> => {
  try {
    for (const item of items) {
      const { error } = await supabase
        .from('homepage_content')
        .update({ order: item.order })
        .eq('id', item.id);
      
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Error reordering homepage content:', error);
    return false;
  }
};
