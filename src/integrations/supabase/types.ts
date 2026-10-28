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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          instructions: string
          max_context_items: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          instructions?: string
          max_context_items?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          instructions?: string
          max_context_items?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_events: {
        Row: {
          conversation_id: string | null
          created_at: string
          event_type: string
          id: string
          model: string | null
          tokens_used: number
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          model?: string | null
          tokens_used?: number
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          model?: string | null
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          page: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          page?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          page?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_links: {
        Row: {
          business_id: string
          content_item_id: string | null
          created_at: string
          id: string
          label: string | null
          product_id: string | null
          sort_order: number
        }
        Insert: {
          business_id: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          label?: string | null
          product_id?: string | null
          sort_order?: number
        }
        Update: {
          business_id?: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          label?: string | null
          product_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_links_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_links_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          logo_url: string | null
          mission: string | null
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
          video_url: string | null
          vision: string | null
          website: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          mission?: string | null
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          video_url?: string | null
          vision?: string | null
          website?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          mission?: string | null
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
          video_url?: string | null
          vision?: string | null
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          issued_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          body: string | null
          category_id: string | null
          content_url: string | null
          created_at: string
          description: string | null
          download_url: string | null
          gallery: string[]
          id: string
          is_premium: boolean
          platforms: string | null
          price: number
          release_notes: string | null
          status: string
          thumbnail_url: string | null
          title: string
          transparent_thumbnail: boolean
          type: string
          updated_at: string
          version: string | null
          video_url: string | null
        }
        Insert: {
          body?: string | null
          category_id?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          gallery?: string[]
          id?: string
          is_premium?: boolean
          platforms?: string | null
          price?: number
          release_notes?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          transparent_thumbnail?: boolean
          type?: string
          updated_at?: string
          version?: string | null
          video_url?: string | null
        }
        Update: {
          body?: string | null
          category_id?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          download_url?: string | null
          gallery?: string[]
          id?: string
          is_premium?: boolean
          platforms?: string | null
          price?: number
          release_notes?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          transparent_thumbnail?: boolean
          type?: string
          updated_at?: string
          version?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          new_users: number
          page_views: number
          revenue: number
          total_sales: number
          total_users: number
          unique_visitors: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          new_users?: number
          page_views?: number
          revenue?: number
          total_sales?: number
          total_users?: number
          unique_visitors?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          new_users?: number
          page_views?: number
          revenue?: number
          total_sales?: number
          total_users?: number
          unique_visitors?: number
          updated_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          bucket: string
          content_id: string | null
          created_at: string
          id: string
          mime_type: string | null
          name: string
          path: string
          size_bytes: number | null
          type: string
          url: string
          user_id: string
        }
        Insert: {
          bucket: string
          content_id?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          name: string
          path: string
          size_bytes?: number | null
          type: string
          url: string
          user_id: string
        }
        Update: {
          bucket?: string
          content_id?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          name?: string
          path?: string
          size_bytes?: number | null
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      manual_payment_reviews: {
        Row: {
          confidence: number | null
          created_at: string
          detected_amount: number | null
          detected_reference: string | null
          expected_amount: number | null
          expected_reference: string | null
          extracted_data: Json
          id: string
          notes: string | null
          proof_file_id: string | null
          purchase_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          detected_amount?: number | null
          detected_reference?: string | null
          expected_amount?: number | null
          expected_reference?: string | null
          extracted_data?: Json
          id?: string
          notes?: string | null
          proof_file_id?: string | null
          purchase_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          detected_amount?: number | null
          detected_reference?: string | null
          expected_amount?: number | null
          expected_reference?: string | null
          extracted_data?: Json
          id?: string
          notes?: string | null
          proof_file_id?: string | null
          purchase_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean
          created_at: string
          email: string
          id: string
          name: string | null
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_backups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          label: string
          payload: Json
          restored_at: string | null
          scope: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          label: string
          payload?: Json
          restored_at?: string | null
          scope?: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          label?: string
          payload?: Json
          restored_at?: string | null
          scope?: string
          status?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          community_discord: string | null
          community_telegram: string | null
          community_whatsapp: string | null
          created_at: string
          email_from: string | null
          enable_ai: boolean
          enable_blog: boolean
          enable_payments: boolean
          id: string
          payment_account_name: string | null
          payment_iban: string | null
          platform_name: string
          resend_enabled: boolean
          sponsorship_message: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          community_discord?: string | null
          community_telegram?: string | null
          community_whatsapp?: string | null
          created_at?: string
          email_from?: string | null
          enable_ai?: boolean
          enable_blog?: boolean
          enable_payments?: boolean
          id?: string
          payment_account_name?: string | null
          payment_iban?: string | null
          platform_name?: string
          resend_enabled?: boolean
          sponsorship_message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          community_discord?: string | null
          community_telegram?: string | null
          community_whatsapp?: string | null
          created_at?: string
          email_from?: string | null
          enable_ai?: boolean
          enable_blog?: boolean
          enable_payments?: boolean
          id?: string
          payment_account_name?: string | null
          payment_iban?: string | null
          platform_name?: string
          resend_enabled?: boolean
          sponsorship_message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      post_links: {
        Row: {
          created_at: string
          id: string
          post_id: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_links_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_resources: {
        Row: {
          created_at: string
          file_url: string
          id: string
          post_id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          post_id: string
          title: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          post_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_resources_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          access_level: string
          author_id: string
          category_id: string | null
          content: string
          content_type: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          access_level?: string
          author_id: string
          category_id?: string | null
          content?: string
          content_type?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          access_level?: string
          author_id?: string
          category_id?: string | null
          content?: string
          content_type?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          checkout_url: string | null
          created_at: string
          currency: string
          description: string | null
          gallery: string[]
          id: string
          image_url: string | null
          is_active: boolean
          linked_content_id: string | null
          name: string
          payment_metadata: Json
          price: number
          type: string
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          gallery?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          linked_content_id?: string | null
          name: string
          payment_metadata?: Json
          price?: number
          type?: string
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          checkout_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          gallery?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          linked_content_id?: string | null
          name?: string
          payment_metadata?: Json
          price?: number
          type?: string
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          deactivated_at: string | null
          display_name: string | null
          id: string
          last_seen_at: string | null
          notify_new_posts: boolean
          notify_payments: boolean
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          id?: string
          last_seen_at?: string | null
          notify_new_posts?: boolean
          notify_payments?: boolean
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          id?: string
          last_seen_at?: string | null
          notify_new_posts?: boolean
          notify_payments?: boolean
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          product_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          product_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_profile: {
        Row: {
          bio: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          full_name: string
          headline: string | null
          id: string
          location: string | null
          photos: string[]
          privacy_text: string | null
          social_links: Json
          terms_text: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string
          headline?: string | null
          id?: string
          location?: string | null
          photos?: string[]
          privacy_text?: string | null
          social_links?: Json
          terms_text?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          full_name?: string
          headline?: string | null
          id?: string
          location?: string | null
          photos?: string[]
          privacy_text?: string | null
          social_links?: Json
          terms_text?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          link: string | null
          name: string
          sort_order: number
          tier: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          link?: string | null
          name: string
          sort_order?: number
          tier?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          link?: string | null
          name?: string
          sort_order?: number
          tier?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string | null
          actor_id: string | null
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          metadata: Json
          payload: Json
          severity: string
          status: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action?: string | null
          actor_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json
          payload?: Json
          severity?: string
          status?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string | null
          actor_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          payload?: Json
          severity?: string
          status?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      user_content_access: {
        Row: {
          content_id: string
          granted_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          granted_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          granted_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_access_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
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
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_audit_log: {
        Args: {
          _action: string
          _actor_id: string
          _metadata?: Json
          _severity?: string
          _target_id?: string
          _target_type?: string
        }
        Returns: string
      }
      aggregate_daily_metrics: {
        Args: { _target_date?: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _link?: string
          _message: string
          _metadata?: Json
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: string
      }
      global_search: {
        Args: { _query: string; _type?: string }
        Returns: {
          description: string
          id: string
          rank: number
          title: string
          type: string
          url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      notify_event: {
        Args: { _event_type: string; _payload: Json }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      set_user_status: {
        Args: { _status: string; _target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const
