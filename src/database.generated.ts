export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public:{
    Tables: {
      [_ in never]: never
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
  y_supa_changes: {
    Tables: {
      rooms: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          name: string
          yjs_compress: Database["y_supa_changes"]["Enums"]["yjs_compress"]
          yjs_encoding: Database["y_supa_changes"]["Enums"]["yjs_encoding"]
          yjs_version: Database["y_supa_changes"]["Enums"]["yjs_version"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted: boolean
          name: string
          yjs_compress?: Database["y_supa_changes"]["Enums"]["yjs_compress"]
          yjs_encoding?: Database["y_supa_changes"]["Enums"]["yjs_encoding"]
          yjs_version?: Database["y_supa_changes"]["Enums"]["yjs_version"]
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          name?: string
          yjs_compress?: Database["y_supa_changes"]["Enums"]["yjs_compress"]
          yjs_encoding?: Database["y_supa_changes"]["Enums"]["yjs_encoding"]
          yjs_version?: Database["y_supa_changes"]["Enums"]["yjs_version"]
        }
        Relationships: []
      }
      updates: {
        Row: {
          checkpoint: boolean
          id: number
          room_id: string
          update: string
        }
        Insert: {
          checkpoint?: boolean
          id?: number
          room_id: string
          update: string
        }
        Update: {
          checkpoint?: boolean
          id?: number
          room_id?: string
          update?: string
        }
        Relationships: [
          {
            foreignKeyName: "updates_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rooms: {
        Row: {
          created_at: string
          id: number
          permission: Database["y_supa_changes"]["Enums"]["room_permission"]
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          permission?: Database["y_supa_changes"]["Enums"]["room_permission"]
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          permission?: Database["y_supa_changes"]["Enums"]["room_permission"]
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_permission: {
        Args: {
          room_id: string
        }
        Returns: string
      }
    }
    Enums: {
      room_permission: "read" | "write"
      yjs_compress: "none" | "gzip" | "deflate"
      yjs_encoding: "ascii85" | "base64"
      yjs_version: "v1" | "v2"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
