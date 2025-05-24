export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ads: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position: string
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          page_views: number | null
          source: string | null
          unique_visitors: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          page_views?: number | null
          source?: string | null
          unique_visitors?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          page_views?: number | null
          source?: string | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_name: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_name: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_name?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      download_config: {
        Row: {
          created_at: string
          download_url: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          download_url?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          download_url?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_config: {
        Row: {
          container_aspect_ratio: string | null
          container_max_width: string | null
          footer_copyright: string | null
          id: string
          site_description: string | null
          site_title: string | null
          updated_at: string | null
        }
        Insert: {
          container_aspect_ratio?: string | null
          container_max_width?: string | null
          footer_copyright?: string | null
          id: string
          site_description?: string | null
          site_title?: string | null
          updated_at?: string | null
        }
        Update: {
          container_aspect_ratio?: string | null
          container_max_width?: string | null
          footer_copyright?: string | null
          id?: string
          site_description?: string | null
          site_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          thumbnail: string | null
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          thumbnail?: string | null
          title: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          thumbnail?: string | null
          title?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          count: number
          id: string
          type: string
          video_id: string
        }
        Insert: {
          count?: number
          id?: string
          type: string
          video_id: string
        }
        Update: {
          count?: number
          id?: string
          type?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string
          id: string
          keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page: string
          title: string
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description: string
          id?: string
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page: string
          title: string
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string
          id?: string
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page?: string
          title?: string
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          password?: string
          username?: string
        }
        Relationships: []
      }
      video_access_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          ad_timing_seconds: number | null
          custom_url: string | null
          date_added: string
          description: string | null
          id: string
          thumbnail: string | null
          title: string
          url: string
          views: number
        }
        Insert: {
          ad_timing_seconds?: number | null
          custom_url?: string | null
          date_added?: string
          description?: string | null
          id?: string
          thumbnail?: string | null
          title: string
          url: string
          views?: number
        }
        Update: {
          ad_timing_seconds?: number | null
          custom_url?: string | null
          date_added?: string
          description?: string | null
          id?: string
          thumbnail?: string | null
          title?: string
          url?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
