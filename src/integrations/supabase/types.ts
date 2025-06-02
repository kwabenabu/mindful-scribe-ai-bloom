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
      calendar_events: {
        Row: {
          calendar_id: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: number
          source_journal_id: number | null
          start_time: string | null
          status: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: number
          source_journal_id?: number | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          calendar_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: number
          source_journal_id?: number | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_enabled: boolean | null
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_enabled?: boolean | null
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_enabled?: boolean | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      detected_events: {
        Row: {
          calendar_provider: string | null
          confidence_score: number | null
          created_at: string
          duration_minutes: number | null
          event_date: string | null
          event_datetime: string | null
          event_description: string | null
          event_time: string | null
          event_title: string
          external_event_id: string | null
          id: string
          journal_entry_id: number | null
          location: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_provider?: string | null
          confidence_score?: number | null
          created_at?: string
          duration_minutes?: number | null
          event_date?: string | null
          event_datetime?: string | null
          event_description?: string | null
          event_time?: string | null
          event_title: string
          external_event_id?: string | null
          id?: string
          journal_entry_id?: number | null
          location?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_provider?: string | null
          confidence_score?: number | null
          created_at?: string
          duration_minutes?: number | null
          event_date?: string | null
          event_datetime?: string | null
          event_description?: string | null
          event_time?: string | null
          event_title?: string
          external_event_id?: string | null
          id?: string
          journal_entry_id?: number | null
          location?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detected_events_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: number
          last_updated: string | null
          progress: number | null
          status: string | null
          target_frequency: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          last_updated?: string | null
          progress?: number | null
          status?: string | null
          target_frequency?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          last_updated?: string | null
          progress?: number | null
          status?: string | null
          target_frequency?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: number
          user_id: number
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: never
          user_id: number
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: never
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_topic_entries: {
        Row: {
          id: number
          journal_id: number
          relevance_scores: number | null
          topic_id: string | null
        }
        Insert: {
          id?: number
          journal_id: number
          relevance_scores?: number | null
          topic_id?: string | null
        }
        Update: {
          id?: number
          journal_id?: number
          relevance_scores?: number | null
          topic_id?: string | null
        }
        Relationships: []
      }
      journal_topics: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      journals: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          extracted_events: Json | null
          extracted_goals: Json | null
          id: number
          music_album: string | null
          music_apple_music_url: string | null
          music_artist: string | null
          music_cover_art_url: string | null
          music_external_id: string | null
          music_preview_url: string | null
          music_spotify_url: string | null
          music_title: string | null
          sentiment_analysis_date: string | null
          sentiment_keywords: string[] | null
          sentiment_score: number | null
          user_id: string | null
          weekly_goals: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          extracted_events?: Json | null
          extracted_goals?: Json | null
          id?: number
          music_album?: string | null
          music_apple_music_url?: string | null
          music_artist?: string | null
          music_cover_art_url?: string | null
          music_external_id?: string | null
          music_preview_url?: string | null
          music_spotify_url?: string | null
          music_title?: string | null
          sentiment_analysis_date?: string | null
          sentiment_keywords?: string[] | null
          sentiment_score?: number | null
          user_id?: string | null
          weekly_goals?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          extracted_events?: Json | null
          extracted_goals?: Json | null
          id?: number
          music_album?: string | null
          music_apple_music_url?: string | null
          music_artist?: string | null
          music_cover_art_url?: string | null
          music_external_id?: string | null
          music_preview_url?: string | null
          music_spotify_url?: string | null
          music_title?: string | null
          sentiment_analysis_date?: string | null
          sentiment_keywords?: string[] | null
          sentiment_score?: number | null
          user_id?: string | null
          weekly_goals?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_calendar_settings: {
        Row: {
          auto_add_events: boolean | null
          created_at: string
          default_meeting_duration: number | null
          google_calendar_enabled: boolean | null
          id: string
          outlook_calendar_enabled: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_add_events?: boolean | null
          created_at?: string
          default_meeting_duration?: number | null
          google_calendar_enabled?: boolean | null
          id?: string
          outlook_calendar_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_add_events?: boolean | null
          created_at?: string
          default_meeting_duration?: number | null
          google_calendar_enabled?: boolean | null
          id?: string
          outlook_calendar_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string | null
          id: string
          is_first_time: boolean | null
          journaling_purpose: string | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          is_first_time?: boolean | null
          journaling_purpose?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          is_first_time?: boolean | null
          journaling_purpose?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: never
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: never
          username?: string
        }
        Relationships: []
      }
      weekly_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          goal_text: string
          id: string
          is_completed: boolean | null
          source_journal_id: number | null
          updated_at: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          goal_text: string
          id?: string
          is_completed?: boolean | null
          source_journal_id?: number | null
          updated_at?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          goal_text?: string
          id?: string
          is_completed?: boolean | null
          source_journal_id?: number | null
          updated_at?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_goals_source_journal_id_fkey"
            columns: ["source_journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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
