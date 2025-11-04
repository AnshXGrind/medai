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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      asha_resource_requests: {
        Row: {
          id: string
          asha_id: string
          resource_type: string
          patient_name: string
          patient_contact: string
          village_name: string
          urgency: string
          status: string
          details: string
          government_id: string | null
          approved_by: string | null
          approved_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asha_id: string
          resource_type: string
          patient_name: string
          patient_contact: string
          village_name: string
          urgency?: string
          status?: string
          details: string
          government_id?: string | null
          approved_by?: string | null
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asha_id?: string
          resource_type?: string
          patient_name?: string
          patient_contact?: string
          village_name?: string
          urgency?: string
          status?: string
          details?: string
          government_id?: string | null
          approved_by?: string | null
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_type: string
          appointment_date: string
          status: string
          consultation_fee: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_type: string
          appointment_date: string
          status?: string
          consultation_fee?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_type?: string
          appointment_date?: string
          status?: string
          consultation_fee?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          ai_analysis: string | null
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          priority: string
          status: string
          symptoms: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          priority?: string
          status?: string
          symptoms: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          priority?: string
          status?: string
          symptoms?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          consultation_fee: number | null
          created_at: string
          id: string
          is_online: boolean | null
          is_verified: boolean | null
          medical_id: string
          specialty: string | null
          user_id: string
        }
        Insert: {
          consultation_fee?: number | null
          created_at?: string
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          medical_id: string
          specialty?: string | null
          user_id: string
        }
        Update: {
          consultation_fee?: number | null
          created_at?: string
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          medical_id?: string
          specialty?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          consultation_id: string | null
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          record_type: string
          title: string
          user_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          record_type: string
          title: string
          user_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          record_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_ids: {
        Row: {
          id: string
          user_id: string | null
          health_id_number: string
          qr_code: string | null
          aadhaar_number_encrypted: string | null
          aadhaar_iv: string | null
          blood_group: string | null
          emergency_contacts: Json | null
          organ_donor: boolean | null
          ice_mode_enabled: boolean | null
          photo_url: string | null
          full_name: string
          date_of_birth: string
          gender: string | null
          address: Json | null
          phone_number: string | null
          email: string | null
          marital_status: string | null
          occupation: string | null
          created_at: string | null
          updated_at: string | null
          verified: boolean | null
          verification_date: string | null
          blockchain_hash: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          health_id_number: string
          qr_code?: string | null
          aadhaar_number_encrypted?: string | null
          aadhaar_iv?: string | null
          blood_group?: string | null
          emergency_contacts?: Json | null
          organ_donor?: boolean | null
          ice_mode_enabled?: boolean | null
          photo_url?: string | null
          full_name: string
          date_of_birth: string
          gender?: string | null
          address?: Json | null
          phone_number?: string | null
          email?: string | null
          marital_status?: string | null
          occupation?: string | null
          created_at?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verification_date?: string | null
          blockchain_hash?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          health_id_number?: string
          qr_code?: string | null
          aadhaar_number_encrypted?: string | null
          aadhaar_iv?: string | null
          blood_group?: string | null
          emergency_contacts?: Json | null
          organ_donor?: boolean | null
          ice_mode_enabled?: boolean | null
          photo_url?: string | null
          full_name?: string
          date_of_birth?: string
          gender?: string | null
          address?: Json | null
          phone_number?: string | null
          email?: string | null
          marital_status?: string | null
          occupation?: string | null
          created_at?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verification_date?: string | null
          blockchain_hash?: string | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor"
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
      app_role: ["patient", "doctor"],
    },
  },
} as const
