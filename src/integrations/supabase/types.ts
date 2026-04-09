export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      auto_claim_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_price: number
          region: string | null
          updated_at: string
          user_id: string
          vertical: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_price: number
          region?: string | null
          updated_at?: string
          user_id: string
          vertical?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_price?: number
          region?: string | null
          updated_at?: string
          user_id?: string
          vertical?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          id: string
          merchant_id: string | null
          paid_amount: number | null
          paid_upfront: boolean
          slot_id: string
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id?: string | null
          paid_amount?: number | null
          paid_upfront?: boolean
          slot_id: string
          source?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string | null
          paid_amount?: number | null
          paid_upfront?: boolean
          slot_id?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          booking_id: string
          created_at: string
          gross_amount: number
          id: string
          merchant_id: string
          merchant_payout: number
          platform_fee: number
          platform_fee_pct: number
          status: string
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          gross_amount: number
          id?: string
          merchant_id: string
          merchant_payout: number
          platform_fee: number
          platform_fee_pct?: number
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          gross_amount?: number
          id?: string
          merchant_id?: string
          merchant_payout?: number
          platform_fee?: number
          platform_fee_pct?: number
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      merchant_leads: {
        Row: {
          business_name: string
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          logo_url: string | null
          notes: string | null
          outreach_sent_at: string | null
          phone: string | null
          region: string | null
          scraped_data: Json | null
          status: string
          updated_at: string
          vertical: string | null
          website_url: string | null
        }
        Insert: {
          business_name: string
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          notes?: string | null
          outreach_sent_at?: string | null
          phone?: string | null
          region?: string | null
          scraped_data?: Json | null
          status?: string
          updated_at?: string
          vertical?: string | null
          website_url?: string | null
        }
        Update: {
          business_name?: string
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          notes?: string | null
          outreach_sent_at?: string | null
          phone?: string | null
          region?: string | null
          scraped_data?: Json | null
          status?: string
          updated_at?: string
          vertical?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      merchants: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          is_verified: boolean
          location: string
          logo_url: string | null
          name: string
          region: string
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string
          user_id: string | null
          vertical: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          location: string
          logo_url?: string | null
          name: string
          region: string
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id?: string | null
          vertical: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          location?: string
          logo_url?: string | null
          name?: string
          region?: string
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id?: string | null
          vertical?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          commission_ids: string[]
          created_at: string
          id: string
          merchant_id: string
          status: string
          stripe_payout_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          commission_ids?: string[]
          created_at?: string
          id?: string
          merchant_id: string
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          commission_ids?: string[]
          created_at?: string
          id?: string
          merchant_id?: string
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_price: number
          region: string | null
          updated_at: string
          user_id: string
          vertical: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_price: number
          region?: string | null
          updated_at?: string
          user_id: string
          vertical?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_price?: number
          region?: string | null
          updated_at?: string
          user_id?: string
          vertical?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_name: string
          slot_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_name?: string
          slot_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_name?: string
          slot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_slots: {
        Row: {
          created_at: string
          id: string
          slot_data: Json
          slot_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          slot_data?: Json
          slot_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          slot_data?: Json
          slot_id?: string
          user_id?: string
        }
        Relationships: []
      }
      slots: {
        Row: {
          created_at: string
          current_price: number
          expires_at: string
          id: string
          is_live: boolean
          location: string
          merchant_id: string | null
          merchant_name: string
          original_price: number
          region: string
          source: string
          time_description: string
          time_left: number
          updated_at: string
          urgency: Database["public"]["Enums"]["slot_urgency"]
          vertical: string
        }
        Insert: {
          created_at?: string
          current_price: number
          expires_at?: string
          id?: string
          is_live?: boolean
          location: string
          merchant_id?: string | null
          merchant_name: string
          original_price: number
          region: string
          source?: string
          time_description: string
          time_left?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["slot_urgency"]
          vertical: string
        }
        Update: {
          created_at?: string
          current_price?: number
          expires_at?: string
          id?: string
          is_live?: boolean
          location?: string
          merchant_id?: string | null
          merchant_name?: string
          original_price?: number
          region?: string
          source?: string
          time_description?: string
          time_left?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["slot_urgency"]
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_slots_merchant"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_slots_merchant"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_trust_scores: {
        Row: {
          cancellations: number
          completed_bookings: number
          created_at: string
          id: string
          no_shows: number
          score: number
          total_bookings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancellations?: number
          completed_bookings?: number
          created_at?: string
          id?: string
          no_shows?: number
          score?: number
          total_bookings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancellations?: number
          completed_bookings?: number
          created_at?: string
          id?: string
          no_shows?: number
          score?: number
          total_bookings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      merchants_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          name: string | null
          region: string | null
          updated_at: string | null
          vertical: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          region?: string | null
          updated_at?: string | null
          vertical?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          region?: string | null
          updated_at?: string | null
          vertical?: string | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          reviewer_name: string | null
          slot_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          reviewer_name?: string | null
          slot_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          reviewer_name?: string | null
          slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_slot: {
        Args: {
          _paid_amount?: number
          _paid_upfront?: boolean
          _slot_id: string
          _user_id: string
        }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_recent_claims: {
        Args: { claim_limit?: number }
        Returns: {
          created_at: string
          deal: string
          display_name: string
          location: string
          region: string
          savings: number
          vertical: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      slot_urgency: "critical" | "high" | "medium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      slot_urgency: ["critical", "high", "medium"],
    },
  },
} as const
