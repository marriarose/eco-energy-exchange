export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      energy_offers: {
        Row: {
          expires_at: string
          home_id: string
          id: string
          offered_kwh: number
          price_per_kwh: number | null
          status: Database["public"]["Enums"]["energy_status"]
          timestamp: string
        }
        Insert: {
          expires_at?: string
          home_id: string
          id?: string
          offered_kwh: number
          price_per_kwh?: number | null
          status?: Database["public"]["Enums"]["energy_status"]
          timestamp?: string
        }
        Update: {
          expires_at?: string
          home_id?: string
          id?: string
          offered_kwh?: number
          price_per_kwh?: number | null
          status?: Database["public"]["Enums"]["energy_status"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_offers_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_requests: {
        Row: {
          expires_at: string
          home_id: string
          id: string
          price_per_kwh: number | null
          requested_kwh: number
          status: Database["public"]["Enums"]["energy_status"]
          timestamp: string
        }
        Insert: {
          expires_at?: string
          home_id: string
          id?: string
          price_per_kwh?: number | null
          requested_kwh: number
          status?: Database["public"]["Enums"]["energy_status"]
          timestamp?: string
        }
        Update: {
          expires_at?: string
          home_id?: string
          id?: string
          price_per_kwh?: number | null
          requested_kwh?: number
          status?: Database["public"]["Enums"]["energy_status"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_requests_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
        ]
      }
      homes: {
        Row: {
          created_at: string
          current_consumption_kwh: number
          current_generation_kwh: number
          id: string
          last_updated: string
          location: string
          name: string
          solar_capacity_kw: number
          surplus_kwh: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_consumption_kwh?: number
          current_generation_kwh?: number
          id?: string
          last_updated?: string
          location: string
          name: string
          solar_capacity_kw?: number
          surplus_kwh?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_consumption_kwh?: number
          current_generation_kwh?: number
          id?: string
          last_updated?: string
          location?: string
          name?: string
          solar_capacity_kw?: number
          surplus_kwh?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          completed_at: string | null
          energy_kwh: number
          id: string
          offer_id: string | null
          price_per_kwh: number
          provider_id: string
          receiver_id: string
          request_id: string | null
          timestamp: string
          total_amount: number | null
        }
        Insert: {
          completed_at?: string | null
          energy_kwh: number
          id?: string
          offer_id?: string | null
          price_per_kwh: number
          provider_id: string
          receiver_id: string
          request_id?: string | null
          timestamp?: string
          total_amount?: number | null
        }
        Update: {
          completed_at?: string | null
          energy_kwh?: number
          id?: string
          offer_id?: string | null
          price_per_kwh?: number
          provider_id?: string
          receiver_id?: string
          request_id?: string | null
          timestamp?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "energy_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "homes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "energy_requests"
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
      energy_status: "pending" | "matched" | "completed" | "cancelled"
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
      energy_status: ["pending", "matched", "completed", "cancelled"],
    },
  },
} as const
