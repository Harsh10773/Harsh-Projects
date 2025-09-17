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
      components: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      customer_auth: {
        Row: {
          email: string
          id: string
          last_sign_in: string | null
        }
        Insert: {
          email: string
          id: string
          last_sign_in?: string | null
        }
        Update: {
          email?: string
          id?: string
          last_sign_in?: string | null
        }
        Relationships: []
      }
      customer_ordered_components: {
        Row: {
          component_category: string | null
          component_details: Json | null
          component_id: string | null
          component_name: string
          created_at: string
          id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          component_category?: string | null
          component_details?: Json | null
          component_id?: string | null
          component_name: string
          created_at?: string
          id?: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          component_category?: string | null
          component_details?: Json | null
          component_id?: string | null
          component_name?: string
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_ordered_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ordered_components_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          state: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          component_id: string | null
          component_name: string
          created_at: string
          id: string
          order_id: string
          price_at_time: number
          quantity: number
        }
        Insert: {
          component_id?: string | null
          component_name: string
          created_at?: string
          id?: string
          order_id: string
          price_at_time: number
          quantity: number
        }
        Update: {
          component_id?: string | null
          component_name?: string
          created_at?: string
          id?: string
          order_id?: string
          price_at_time?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_updates: {
        Row: {
          id: string
          message: string
          order_id: string
          status: string
          update_date: string
        }
        Insert: {
          id?: string
          message: string
          order_id: string
          status: string
          update_date?: string
        }
        Update: {
          id?: string
          message?: string
          order_id?: string
          status?: string
          update_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          build_charge: number | null
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          estimated_delivery: string
          grand_total: number | null
          gst_amount: number | null
          id: string
          order_date: string
          shipping_charge: number | null
          status: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          build_charge?: number | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          estimated_delivery: string
          grand_total?: number | null
          gst_amount?: number | null
          id?: string
          order_date?: string
          shipping_charge?: number | null
          status: string
          tracking_id: string
          updated_at?: string
        }
        Update: {
          build_charge?: number | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          estimated_delivery?: string
          grand_total?: number | null
          gst_amount?: number | null
          id?: string
          order_date?: string
          shipping_charge?: number | null
          status?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracking_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          order_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          order_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_builds: {
        Row: {
          build_id: string
          component_type: string
          created_at: string
          id: string
          model_name: string
          price: number | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          build_id: string
          component_type: string
          created_at?: string
          id?: string
          model_name: string
          price?: number | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          build_id?: string
          component_type?: string
          created_at?: string
          id?: string
          model_name?: string
          price?: number | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: []
      }
      vendor_auth: {
        Row: {
          email: string
          id: string
          last_sign_in: string | null
        }
        Insert: {
          email: string
          id: string
          last_sign_in?: string | null
        }
        Update: {
          email?: string
          id?: string
          last_sign_in?: string | null
        }
        Relationships: []
      }
      vendor_component_quotations_history: {
        Row: {
          component_name: string
          created_at: string
          id: string
          order_id: string
          order_item_id: string
          quantity: number
          quoted_price: number
          status: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          component_name: string
          created_at?: string
          id?: string
          order_id: string
          order_item_id: string
          quantity?: number
          quoted_price: number
          status?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          component_name?: string
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string
          quantity?: number
          quoted_price?: number
          status?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_component_quotations_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_component_quotations_history_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_component_quotes: {
        Row: {
          created_at: string
          id: string
          order_id: string
          order_item_id: string
          quoted_price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          order_item_id: string
          quoted_price: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string
          quoted_price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_component_quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_component_quotes_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_orders: {
        Row: {
          created_at: string
          id: string
          order_id: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          created_at: string
          id: string
          store_address: string | null
          store_name: string
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          created_at?: string
          id: string
          store_address?: string | null
          store_name: string
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          store_address?: string | null
          store_name?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      vendor_quotations: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          status: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          status?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          status?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_stats: {
        Row: {
          orders_lost: number
          orders_won: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          orders_lost?: number
          orders_won?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          orders_lost?: number
          orders_won?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_vendor_orders: {
        Args: { vendor_id_param: string }
        Returns: number
      }
      get_vendor_processed_orders: {
        Args: { vendor_id_param: string }
        Returns: string[]
      }
      get_vendor_quotations_with_details: {
        Args: { vendor_id_param: string }
        Returns: {
          id: string
          order_id: string
          price: number
          status: string
          created_at: string
          order_details: Json
        }[]
      }
      insert_component_quote: {
        Args: {
          vendor_id_param: string
          order_id_param: string
          order_item_id_param: string
          quoted_price_param: number
        }
        Returns: undefined
      }
      insert_component_quote_history: {
        Args: {
          vendor_id_param: string
          order_id_param: string
          order_item_id_param: string
          component_name_param: string
          quoted_price_param: number
          quantity_param?: number
        }
        Returns: string
      }
      reject_vendor_order: {
        Args: { vendor_id_param: string; order_id_param: string }
        Returns: undefined
      }
      submit_vendor_quotation: {
        Args: {
          vendor_id_param: string
          order_id_param: string
          price_param: number
        }
        Returns: undefined
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
