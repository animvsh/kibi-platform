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
      code_submissions: {
        Row: {
          id: string
          language: string
          module_id: string
          output: string | null
          passed_tests: boolean | null
          source_code: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          language: string
          module_id: string
          output?: string | null
          passed_tests?: boolean | null
          source_code: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          language?: string
          module_id?: string
          output?: string | null
          passed_tests?: boolean | null
          source_code?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_submissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_interactions: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          interaction_type: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_interactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content: Json
          created_at: string
          id: string
          interaction_count: number | null
          is_paid_only: boolean | null
          is_public: boolean | null
          metadata: Json | null
          search_text: unknown | null
          share_token: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          interaction_count?: number | null
          is_paid_only?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          search_text?: unknown | null
          share_token?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          interaction_count?: number | null
          is_paid_only?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          search_text?: unknown | null
          share_token?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          completed: boolean | null
          flipped: number | null
          id: string
          module_id: string
          total_cards: number
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          flipped?: number | null
          id?: string
          module_id: string
          total_cards: number
          user_id: string
        }
        Update: {
          completed?: boolean | null
          flipped?: number | null
          id?: string
          module_id?: string
          total_cards?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_status: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          module_index: number
          module_name: string
          progress_percent: number
          progress_stage: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          module_index: number
          module_name: string
          progress_percent?: number
          progress_stage: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          module_index?: number
          module_name?: string
          progress_percent?: number
          progress_stage?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          content_json: Json
          id: string
          order: number
          subunit_id: string
          title: string
          type: string
        }
        Insert: {
          content_json?: Json
          id?: string
          order: number
          subunit_id: string
          title: string
          type: string
        }
        Update: {
          content_json?: Json
          id?: string
          order?: number
          subunit_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_subunit_id_fkey"
            columns: ["subunit_id"]
            isOneToOne: false
            referencedRelation: "subunits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          correct: boolean | null
          id: string
          module_id: string
          question_text: string
          timestamp: string
          type: string
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          correct?: boolean | null
          id?: string
          module_id: string
          question_text: string
          timestamp?: string
          type: string
          user_answer?: Json | null
          user_id: string
        }
        Update: {
          correct?: boolean | null
          id?: string
          module_id?: string
          question_text?: string
          timestamp?: string
          type?: string
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_uses: {
        Row: {
          created_at: string
          id: string
          referral_id: string
          referred_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_id: string
          referred_user_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_id?: string
          referred_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_uses_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number | null
          referral_code: string
          referrer_id: string
          rewards: Json | null
          uses: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          referral_code: string
          referrer_id: string
          rewards?: Json | null
          uses?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          referral_code?: string
          referrer_id?: string
          rewards?: Json | null
          uses?: number | null
        }
        Relationships: []
      }
      review_summaries: {
        Row: {
          completed: boolean | null
          created_at: string
          feedback_summary: string | null
          id: string
          mastery_score: number | null
          next_module_url: string | null
          strengths: string[] | null
          subunit_id: string
          suggested_reviews: string[] | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          feedback_summary?: string | null
          id?: string
          mastery_score?: number | null
          next_module_url?: string | null
          strengths?: string[] | null
          subunit_id: string
          suggested_reviews?: string[] | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          feedback_summary?: string | null
          id?: string
          mastery_score?: number | null
          next_module_url?: string | null
          strengths?: string[] | null
          subunit_id?: string
          suggested_reviews?: string[] | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "review_summaries_subunit_id_fkey"
            columns: ["subunit_id"]
            isOneToOne: false
            referencedRelation: "subunits"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: number
          name: string
          price: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      subunits: {
        Row: {
          estimated_time: number | null
          id: string
          order: number
          title: string
          unit_id: string
        }
        Insert: {
          estimated_time?: number | null
          id?: string
          order: number
          title: string
          unit_id: string
        }
        Update: {
          estimated_time?: number | null
          id?: string
          order?: number
          title?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subunits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          course_id: string
          id: string
          order: number
          title: string
        }
        Insert: {
          course_id: string
          id?: string
          order: number
          title: string
        }
        Update: {
          course_id?: string
          id?: string
          order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          module_id: string
          responses: Json
          score: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          module_id: string
          responses: Json
          score: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          module_id?: string
          responses?: Json
          score?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          notifications: boolean | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          notifications?: boolean | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: boolean | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_modules: string[] | null
          course_id: string
          current_module_id: string | null
          current_subunit_id: string | null
          current_unit_id: string | null
          id: string
          last_active: string
          subunit_mastery: Json | null
          user_id: string
        }
        Insert: {
          completed_modules?: string[] | null
          course_id: string
          current_module_id?: string | null
          current_subunit_id?: string | null
          current_unit_id?: string | null
          id?: string
          last_active?: string
          subunit_mastery?: Json | null
          user_id: string
        }
        Update: {
          completed_modules?: string[] | null
          course_id?: string
          current_module_id?: string | null
          current_subunit_id?: string | null
          current_unit_id?: string | null
          id?: string
          last_active?: string
          subunit_mastery?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_current_subunit_id_fkey"
            columns: ["current_subunit_id"]
            isOneToOne: false
            referencedRelation: "subunits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_current_unit_id_fkey"
            columns: ["current_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_id: number
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: number
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: number
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
