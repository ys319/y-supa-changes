export type Database = {
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
