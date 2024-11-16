export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hubspot_accounts: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          portal_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          portal_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string
          portal_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      page_metadata: {
        Row: {
          id: string
          hubspot_id: string
          account_id: string
          name: string
          url: string
          template: string
          last_modified: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hubspot_id: string
          account_id: string
          name: string
          url: string
          template: string
          last_modified: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hubspot_id?: string
          account_id?: string
          name?: string
          url?: string
          template?: string
          last_modified?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}