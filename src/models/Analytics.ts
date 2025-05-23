
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  id: string;
  page_views: number;
  unique_visitors: number;
  date: string;
  source?: string;
  created_at: string;
}

export const getAnalyticsData = async (days: number = 7): Promise<AnalyticsData[]> => {
  try {
    // Calculate date for filtering
    const date = new Date();
    date.setDate(date.getDate() - days);
    const filterDate = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .gte("date", filterDate)
      .order("date", { ascending: false });
    
    if (error) {
      console.error("Error loading analytics data:", error);
      return [];
    }
    
    return data as AnalyticsData[];
  } catch (error) {
    console.error("Error loading analytics data:", error);
    return [];
  }
};

export const incrementPageView = async (source?: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if entry for today exists
    const { data: existingData } = await supabase
      .from("analytics")
      .select("*")
      .eq("date", today)
      .single();
    
    if (existingData) {
      // Update existing entry
      await supabase
        .from("analytics")
        .update({
          page_views: existingData.page_views + 1,
          source: source || existingData.source
        })
        .eq("id", existingData.id);
    } else {
      // Create new entry
      await supabase
        .from("analytics")
        .insert({
          page_views: 1,
          unique_visitors: 1,
          date: today,
          source: source
        });
    }
  } catch (error) {
    console.error("Error incrementing page view:", error);
  }
};

export const incrementUniqueVisitor = async (source?: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if entry for today exists
    const { data: existingData } = await supabase
      .from("analytics")
      .select("*")
      .eq("date", today)
      .single();
    
    if (existingData) {
      // Update existing entry
      await supabase
        .from("analytics")
        .update({
          unique_visitors: existingData.unique_visitors + 1,
          source: source || existingData.source
        })
        .eq("id", existingData.id);
    } else {
      // Create new entry
      await supabase
        .from("analytics")
        .insert({
          page_views: 0,
          unique_visitors: 1,
          date: today,
          source: source
        });
    }
  } catch (error) {
    console.error("Error incrementing unique visitor:", error);
  }
};
