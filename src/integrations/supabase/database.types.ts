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
      aa_scene_plans: {
        Row: {
          created_at: string
          duration_sec: number | null
          id: string
          is_approved: boolean
          plan_json: Json
          script_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_sec?: number | null
          id?: string
          is_approved?: boolean
          plan_json: Json
          script_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_sec?: number | null
          id?: string
          is_approved?: boolean
          plan_json?: Json
          script_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aa_scene_plans_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "aa_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      aa_scripts: {
        Row: {
          created_at: string
          id: string
          script: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          script: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          script?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aa_video_renders: {
        Row: {
          created_at: string
          error: string | null
          id: string
          plan_id: string
          renderer_job_id: string | null
          script_id: string
          status: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          plan_id: string
          renderer_job_id?: string | null
          script_id: string
          status?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          plan_id?: string
          renderer_job_id?: string | null
          script_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aa_video_renders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "aa_scene_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aa_video_renders_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "aa_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creative_briefs: {
        Row: {
          ad_creative_ai_pack_url: string | null
          approval_queue_id: string | null
          asset_id: string | null
          campaign_objective: string
          client_id: string
          created_at: string
          created_by: string | null
          cta_copy: string
          cycle_id: string | null
          headline_variants: Json
          id: string
          placement: string | null
          primary_text: string
          status: string
          updated_at: string
          variant_index: number
          visual_direction: string
        }
        Insert: {
          ad_creative_ai_pack_url?: string | null
          approval_queue_id?: string | null
          asset_id?: string | null
          campaign_objective: string
          client_id: string
          created_at?: string
          created_by?: string | null
          cta_copy: string
          cycle_id?: string | null
          headline_variants: Json
          id?: string
          placement?: string | null
          primary_text: string
          status?: string
          updated_at?: string
          variant_index?: number
          visual_direction: string
        }
        Update: {
          ad_creative_ai_pack_url?: string | null
          approval_queue_id?: string | null
          asset_id?: string | null
          campaign_objective?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          cta_copy?: string
          cycle_id?: string | null
          headline_variants?: Json
          id?: string
          placement?: string | null
          primary_text?: string
          status?: string
          updated_at?: string
          variant_index?: number
          visual_direction?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creative_briefs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "proof_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creative_briefs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creative_briefs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "ad_creative_briefs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_set_performance_logs: {
        Row: {
          adset_id: string
          adset_name: string | null
          campaign_id: string | null
          clicks: number | null
          client_name: string | null
          cpl: number | null
          cpl_target: number | null
          date: string
          id: string
          impressions: number | null
          spend: number | null
          sprint_id: string | null
          synced_at: string
        }
        Insert: {
          adset_id: string
          adset_name?: string | null
          campaign_id?: string | null
          clicks?: number | null
          client_name?: string | null
          cpl?: number | null
          cpl_target?: number | null
          date: string
          id?: string
          impressions?: number | null
          spend?: number | null
          sprint_id?: string | null
          synced_at?: string
        }
        Update: {
          adset_id?: string
          adset_name?: string | null
          campaign_id?: string | null
          clicks?: number | null
          client_name?: string | null
          cpl?: number | null
          cpl_target?: number | null
          date?: string
          id?: string
          impressions?: number | null
          spend?: number | null
          sprint_id?: string | null
          synced_at?: string
        }
        Relationships: []
      }
      ai_alerts: {
        Row: {
          category: string
          client_name: string | null
          created_at: string
          id: string
          message: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          sop_id: string | null
          suggested_action: string
        }
        Insert: {
          category: string
          client_name?: string | null
          created_at?: string
          id?: string
          message: string
          resolved?: boolean
          resolved_at?: string | null
          severity: string
          sop_id?: string | null
          suggested_action?: string
        }
        Update: {
          category?: string
          client_name?: string | null
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          sop_id?: string | null
          suggested_action?: string
        }
        Relationships: []
      }
      ai_task_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          input_summary: string
          output_summary: string
          sop_id: string
          sop_name: string
          status: string
          tool_called: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          input_summary?: string
          output_summary?: string
          sop_id: string
          sop_name: string
          status: string
          tool_called: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          input_summary?: string
          output_summary?: string
          sop_id?: string
          sop_name?: string
          status?: string
          tool_called?: string
        }
        Relationships: []
      }
      approval_logs: {
        Row: {
          approval_type: string
          created_at: string
          decided_at: string | null
          entity_id: string
          entity_type: string
          id: string
          requested_by_profile_id: string | null
          review_notes: string | null
          reviewed_by_profile_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approval_type: string
          created_at?: string
          decided_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          requested_by_profile_id?: string | null
          review_notes?: string | null
          reviewed_by_profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approval_type?: string
          created_at?: string
          decided_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          requested_by_profile_id?: string | null
          review_notes?: string | null
          reviewed_by_profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_logs_requested_by_profile_id_fkey"
            columns: ["requested_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "approval_logs_requested_by_profile_id_fkey"
            columns: ["requested_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_logs_reviewed_by_profile_id_fkey"
            columns: ["reviewed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "approval_logs_reviewed_by_profile_id_fkey"
            columns: ["reviewed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_queue: {
        Row: {
          approval_readiness_score: number | null
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          brand_voice_score: number | null
          client_id: string
          content: Json
          content_id: string
          content_type: string
          created_at: string
          cta_present: boolean | null
          cycle_id: string | null
          funnel_alignment_check: boolean | null
          id: string
          line_comments: Json | null
          priority: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          reviewer_type: string | null
          revision_notes: string | null
          sop_id: string | null
          sop_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approval_readiness_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          brand_voice_score?: number | null
          client_id: string
          content?: Json
          content_id: string
          content_type: string
          created_at?: string
          cta_present?: boolean | null
          cycle_id?: string | null
          funnel_alignment_check?: boolean | null
          id?: string
          line_comments?: Json | null
          priority?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          reviewer_type?: string | null
          revision_notes?: string | null
          sop_id?: string | null
          sop_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approval_readiness_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          brand_voice_score?: number | null
          client_id?: string
          content?: Json
          content_id?: string
          content_type?: string
          created_at?: string
          cta_present?: boolean | null
          cycle_id?: string | null
          funnel_alignment_check?: boolean | null
          id?: string
          line_comments?: Json | null
          priority?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          reviewer_type?: string | null
          revision_notes?: string | null
          sop_id?: string | null
          sop_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_queue_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "approval_queue_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "approval_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_queue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          associated_entity_id: string | null
          associated_entity_type: string
          bucket_name: string
          created_at: string
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          metadata: Json
          updated_at: string
          uploaded_by: string | null
          uploaded_by_profile_id: string | null
        }
        Insert: {
          associated_entity_id?: string | null
          associated_entity_type?: string
          bucket_name?: string
          created_at?: string
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_profile_id?: string | null
        }
        Update: {
          associated_entity_id?: string | null
          associated_entity_type?: string
          bucket_name?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "assets_uploaded_by_profile_id_fkey"
            columns: ["uploaded_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "audit_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          created_at: string
          id: string
          input_url: string | null
          notes: string | null
          output_content_item_id: string | null
          requester_handle: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_url?: string | null
          notes?: string | null
          output_content_item_id?: string | null
          requester_handle?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_url?: string | null
          notes?: string | null
          output_content_item_id?: string | null
          requester_handle?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audits_output_content_item_id_fkey"
            columns: ["output_content_item_id"]
            isOneToOne: false
            referencedRelation: "content_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_intelligence: {
        Row: {
          avg_job_value_zar: number | null
          brand_voice_descriptors: string[] | null
          business_name: string | null
          client_id: string
          competitor_references: string[] | null
          conversion_objective: string | null
          created_at: string
          differentiation_notes: string | null
          font_selection: string | null
          icp_demographics: Json | null
          icp_psychology: Json | null
          id: string
          location: string | null
          logo_url: string | null
          primary_hex: string | null
          sample_copy: string | null
          secondary_hex: string | null
          sector: string | null
          service_radius_km: number | null
          testimonials: Json | null
          trade_type: string | null
          updated_at: string
          version: number
        }
        Insert: {
          avg_job_value_zar?: number | null
          brand_voice_descriptors?: string[] | null
          business_name?: string | null
          client_id: string
          competitor_references?: string[] | null
          conversion_objective?: string | null
          created_at?: string
          differentiation_notes?: string | null
          font_selection?: string | null
          icp_demographics?: Json | null
          icp_psychology?: Json | null
          id?: string
          location?: string | null
          logo_url?: string | null
          primary_hex?: string | null
          sample_copy?: string | null
          secondary_hex?: string | null
          sector?: string | null
          service_radius_km?: number | null
          testimonials?: Json | null
          trade_type?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          avg_job_value_zar?: number | null
          brand_voice_descriptors?: string[] | null
          business_name?: string | null
          client_id?: string
          competitor_references?: string[] | null
          conversion_objective?: string | null
          created_at?: string
          differentiation_notes?: string | null
          font_selection?: string | null
          icp_demographics?: Json | null
          icp_psychology?: Json | null
          id?: string
          location?: string | null
          logo_url?: string | null
          primary_hex?: string | null
          sample_copy?: string | null
          secondary_hex?: string | null
          sector?: string | null
          service_radius_km?: number | null
          testimonials?: Json | null
          trade_type?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_intelligence_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_presets: {
        Row: {
          created_at: string
          font_primary: string | null
          font_secondary: string | null
          id: string
          logo_secondary_url: string | null
          logo_url: string | null
          preset_json: Json | null
          prompt_rules: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_primary?: string | null
          font_secondary?: string | null
          id?: string
          logo_secondary_url?: string | null
          logo_url?: string | null
          preset_json?: Json | null
          prompt_rules?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_primary?: string | null
          font_secondary?: string | null
          id?: string
          logo_secondary_url?: string | null
          logo_url?: string | null
          preset_json?: Json | null
          prompt_rules?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_settings: {
        Row: {
          brand_assets: Json
          created_at: string | null
          naming_convention: string | null
          palette: Json
          rules: Json
          typography: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_assets?: Json
          created_at?: string | null
          naming_convention?: string | null
          palette?: Json
          rules?: Json
          typography?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_assets?: Json
          created_at?: string | null
          naming_convention?: string | null
          palette?: Json
          rules?: Json
          typography?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget: number | null
          channel: string | null
          client_id: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          notes: string | null
          prospect_id: string | null
          sprint_id: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          channel?: string | null
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          prospect_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          channel?: string | null
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          prospect_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      client_ai_context: {
        Row: {
          client_id: string
          context_json: Json
          context_version: number
          id: string
          last_assembled_at: string
        }
        Insert: {
          client_id: string
          context_json: Json
          context_version?: number
          id?: string
          last_assembled_at?: string
        }
        Update: {
          client_id?: string
          context_json?: Json
          context_version?: number
          id?: string
          last_assembled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_ai_context_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_manager: string | null
          account_manager_name: string | null
          business_name: string
          churn_risk_flag: boolean
          client_delivery_va: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          delivery_owner_profile_id: string | null
          distribution_owner_profile_id: string | null
          email: string | null
          id: string
          last_results_meeting: string | null
          meta_ad_account_id: string | null
          meta_pixel_id: string | null
          monthly_ad_spend: number | null
          monthly_retainer: number | null
          notes: string | null
          owner_name: string
          phone: string | null
          prospect_id: string | null
          setup_fee: number | null
          status: string
          tier: string
          updated_at: string
          upsell_ready_flag: boolean
          whatsapp: string | null
        }
        Insert: {
          account_manager?: string | null
          account_manager_name?: string | null
          business_name: string
          churn_risk_flag?: boolean
          client_delivery_va?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          delivery_owner_profile_id?: string | null
          distribution_owner_profile_id?: string | null
          email?: string | null
          id?: string
          last_results_meeting?: string | null
          meta_ad_account_id?: string | null
          meta_pixel_id?: string | null
          monthly_ad_spend?: number | null
          monthly_retainer?: number | null
          notes?: string | null
          owner_name: string
          phone?: string | null
          prospect_id?: string | null
          setup_fee?: number | null
          status?: string
          tier?: string
          updated_at?: string
          upsell_ready_flag?: boolean
          whatsapp?: string | null
        }
        Update: {
          account_manager?: string | null
          account_manager_name?: string | null
          business_name?: string
          churn_risk_flag?: boolean
          client_delivery_va?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          delivery_owner_profile_id?: string | null
          distribution_owner_profile_id?: string | null
          email?: string | null
          id?: string
          last_results_meeting?: string | null
          meta_ad_account_id?: string | null
          meta_pixel_id?: string | null
          monthly_ad_spend?: number | null
          monthly_retainer?: number | null
          notes?: string | null
          owner_name?: string
          phone?: string | null
          prospect_id?: string | null
          setup_fee?: number | null
          status?: string
          tier?: string
          updated_at?: string
          upsell_ready_flag?: boolean
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_delivery_owner_profile_id_fkey"
            columns: ["delivery_owner_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "clients_delivery_owner_profile_id_fkey"
            columns: ["delivery_owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_distribution_owner_profile_id_fkey"
            columns: ["distribution_owner_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "clients_distribution_owner_profile_id_fkey"
            columns: ["distribution_owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: true
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_bundles: {
        Row: {
          audience: string | null
          caption: string | null
          content_type: string | null
          created_at: string
          cta: string | null
          design_image_urls: Json | null
          design_prompts: Json | null
          export_urls: Json | null
          hook: string | null
          id: string
          one_pager_export_png_url: string | null
          one_pager_layout_json: Json | null
          published_at: string | null
          scheduled_at: string | null
          script: string | null
          series: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          caption?: string | null
          content_type?: string | null
          created_at?: string
          cta?: string | null
          design_image_urls?: Json | null
          design_prompts?: Json | null
          export_urls?: Json | null
          hook?: string | null
          id?: string
          one_pager_export_png_url?: string | null
          one_pager_layout_json?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          script?: string | null
          series?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          caption?: string | null
          content_type?: string | null
          created_at?: string
          cta?: string | null
          design_image_urls?: Json | null
          design_prompts?: Json | null
          export_urls?: Json | null
          hook?: string | null
          id?: string
          one_pager_export_png_url?: string | null
          one_pager_layout_json?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          script?: string | null
          series?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_calendar_entries: {
        Row: {
          client_id: string
          content_id: string
          content_type: string
          created_at: string
          cycle_id: string
          format: string | null
          funnel_layer: string | null
          id: string
          platform: string
          publish_status: string
          scheduled_date: string | null
          scheduled_time: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          content_id: string
          content_type: string
          created_at?: string
          cycle_id: string
          format?: string | null
          funnel_layer?: string | null
          id?: string
          platform?: string
          publish_status?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          content_id?: string
          content_type?: string
          created_at?: string
          cycle_id?: string
          format?: string | null
          funnel_layer?: string | null
          id?: string
          platform?: string
          publish_status?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_entries_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_runs: {
        Row: {
          brief_json: Json | null
          content_type: string
          created_at: string
          hook: string | null
          id: string
          idempotency_key: string | null
          last_error: string | null
          one_pager_error: string | null
          one_pager_json: Json | null
          one_pager_status: string | null
          one_pager_text: string | null
          script_json: Json | null
          script_text: string | null
          series: string
          status: string
          target_audience: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brief_json?: Json | null
          content_type: string
          created_at?: string
          hook?: string | null
          id?: string
          idempotency_key?: string | null
          last_error?: string | null
          one_pager_error?: string | null
          one_pager_json?: Json | null
          one_pager_status?: string | null
          one_pager_text?: string | null
          script_json?: Json | null
          script_text?: string | null
          series: string
          status?: string
          target_audience: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brief_json?: Json | null
          content_type?: string
          created_at?: string
          hook?: string | null
          id?: string
          idempotency_key?: string | null
          last_error?: string | null
          one_pager_error?: string | null
          one_pager_json?: Json | null
          one_pager_status?: string | null
          one_pager_text?: string | null
          script_json?: Json | null
          script_text?: string | null
          series?: string
          status?: string
          target_audience?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cron_schedule: {
        Row: {
          avg_duration_ms: number | null
          cron_expression: string
          domain: string
          id: string
          is_active: boolean
          last_error: string | null
          last_run: string | null
          last_status: string | null
          next_run: string
          run_count: number
          schedule_label: string
          sop_id: string
          sop_name: string
        }
        Insert: {
          avg_duration_ms?: number | null
          cron_expression: string
          domain: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_run?: string | null
          last_status?: string | null
          next_run: string
          run_count?: number
          schedule_label: string
          sop_id: string
          sop_name: string
        }
        Update: {
          avg_duration_ms?: number | null
          cron_expression?: string
          domain?: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_run?: string | null
          last_status?: string | null
          next_run?: string
          run_count?: number
          schedule_label?: string
          sop_id?: string
          sop_name?: string
        }
        Relationships: []
      }
      cycles: {
        Row: {
          client_id: string
          completion_report: Json | null
          created_at: string
          cycle_number: number
          end_date: string
          id: string
          start_date: string
          status: string
          week1_status: string
          week2_status: string
        }
        Insert: {
          client_id: string
          completion_report?: Json | null
          created_at?: string
          cycle_number: number
          end_date: string
          id?: string
          start_date: string
          status?: string
          week1_status?: string
          week2_status?: string
        }
        Update: {
          client_id?: string
          completion_report?: Json | null
          created_at?: string
          cycle_number?: number
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          week1_status?: string
          week2_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefings: {
        Row: {
          briefing: Json
          generated_at: string
          id: string
        }
        Insert: {
          briefing: Json
          generated_at?: string
          id?: string
        }
        Update: {
          briefing?: Json
          generated_at?: string
          id?: string
        }
        Relationships: []
      }
      deliverable_items: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_completed: boolean
          notes: string
          position: number
          sprint_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_completed?: boolean
          notes?: string
          position: number
          sprint_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          notes?: string
          position?: number
          sprint_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_metrics: {
        Row: {
          appointments_booked: number | null
          cash_collected: number | null
          client_id: string | null
          created_at: string
          date_key: string
          dms_started: number | null
          id: string
          manager_id: string | null
          notes: string | null
          profile_visits: number | null
          qualified_followers: number | null
          updated_at: string
        }
        Insert: {
          appointments_booked?: number | null
          cash_collected?: number | null
          client_id?: string | null
          created_at?: string
          date_key: string
          dms_started?: number | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          profile_visits?: number | null
          qualified_followers?: number | null
          updated_at?: string
        }
        Update: {
          appointments_booked?: number | null
          cash_collected?: number | null
          client_id?: string | null
          created_at?: string
          date_key?: string
          dms_started?: number | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          profile_visits?: number | null
          qualified_followers?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_metrics_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "delivery_metrics_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          date_key: string
          frequency: string
          id: string
          is_completed: boolean
          manager_id: string
          notes: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date_key: string
          frequency: string
          id?: string
          is_completed?: boolean
          manager_id: string
          notes?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date_key?: string
          frequency?: string
          id?: string
          is_completed?: boolean
          manager_id?: string
          notes?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_progress_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "delivery_progress_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      designs: {
        Row: {
          content_item_id: string
          created_at: string | null
          design_json: Json | null
          format: string | null
          id: string
          rendered_asset_id: string | null
          template_id: string | null
        }
        Insert: {
          content_item_id: string
          created_at?: string | null
          design_json?: Json | null
          format?: string | null
          id?: string
          rendered_asset_id?: string | null
          template_id?: string | null
        }
        Update: {
          content_item_id?: string
          created_at?: string | null
          design_json?: Json | null
          format?: string | null
          id?: string
          rendered_asset_id?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designs_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designs_rendered_asset_id_fkey"
            columns: ["rendered_asset_id"]
            isOneToOne: false
            referencedRelation: "app_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designs_rendered_asset_id_fkey"
            columns: ["rendered_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_metrics: {
        Row: {
          calls_booked: number | null
          created_at: string
          date_key: string
          followups_sent: number | null
          id: string
          manager_id: string
          mjrs_built: number | null
          mjrs_sent: number | null
          notes: string | null
          outreach_sent: number | null
          prospects_enriched: number | null
          prospects_scraped: number | null
          updated_at: string
        }
        Insert: {
          calls_booked?: number | null
          created_at?: string
          date_key: string
          followups_sent?: number | null
          id?: string
          manager_id: string
          mjrs_built?: number | null
          mjrs_sent?: number | null
          notes?: string | null
          outreach_sent?: number | null
          prospects_enriched?: number | null
          prospects_scraped?: number | null
          updated_at?: string
        }
        Update: {
          calls_booked?: number | null
          created_at?: string
          date_key?: string
          followups_sent?: number | null
          id?: string
          manager_id?: string
          mjrs_built?: number | null
          mjrs_sent?: number | null
          notes?: string | null
          outreach_sent?: number | null
          prospects_enriched?: number | null
          prospects_scraped?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_metrics_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "distribution_metrics_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          date_key: string
          frequency: string
          id: string
          is_completed: boolean
          manager_id: string
          notes: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date_key: string
          frequency: string
          id?: string
          is_completed?: boolean
          manager_id: string
          notes?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date_key?: string
          frequency?: string
          id?: string
          is_completed?: boolean
          manager_id?: string
          notes?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_progress_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "distribution_progress_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          contact_handle: string | null
          contact_name: string | null
          created_at: string
          id: string
          keyword: string | null
          notes: string | null
          occurred_at: string
          platform: string | null
          post_id: string | null
          related_event_id: string | null
          type: string
          user_id: string
          value: number | null
        }
        Insert: {
          contact_handle?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          notes?: string | null
          occurred_at?: string
          platform?: string | null
          post_id?: string | null
          related_event_id?: string | null
          type: string
          user_id: string
          value?: number | null
        }
        Update: {
          contact_handle?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          notes?: string | null
          occurred_at?: string
          platform?: string | null
          post_id?: string | null
          related_event_id?: string | null
          type?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      exception_logs: {
        Row: {
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          reported_by_profile_id: string | null
          resolved_at: string | null
          resolved_by_profile_id: string | null
          severity: string | null
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          reported_by_profile_id?: string | null
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
          severity?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          reported_by_profile_id?: string | null
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
          severity?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exception_logs_reported_by_profile_id_fkey"
            columns: ["reported_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "exception_logs_reported_by_profile_id_fkey"
            columns: ["reported_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exception_logs_resolved_by_profile_id_fkey"
            columns: ["resolved_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "exception_logs_resolved_by_profile_id_fkey"
            columns: ["resolved_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          asset_id: string | null
          content_item_id: string | null
          created_at: string
          filename: string | null
          format: string
          id: string
          kind: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          content_item_id?: string | null
          created_at?: string
          filename?: string | null
          format: string
          id?: string
          kind: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          content_item_id?: string | null
          created_at?: string
          filename?: string | null
          format?: string
          id?: string
          kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "app_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_snapshots: {
        Row: {
          active_client_count: number | null
          ad_infrastructure_costs: number | null
          cash_reserves: number | null
          created_at: string
          gross_mrr: number | null
          id: string
          month: string
          net_profit: number | null
          notes: string | null
          other_costs: number | null
          personal_cash_balance: number | null
          principal_draw: number | null
          profit_margin: number | null
          schedule_d_mrr_target: number | null
          setup_fees_collected: number | null
          software_costs: number | null
          total_expenses: number | null
          trust_balance_end: number | null
          trust_balance_start: number | null
          trust_deployment: number | null
          updated_at: string
          va_costs: number | null
        }
        Insert: {
          active_client_count?: number | null
          ad_infrastructure_costs?: number | null
          cash_reserves?: number | null
          created_at?: string
          gross_mrr?: number | null
          id?: string
          month: string
          net_profit?: number | null
          notes?: string | null
          other_costs?: number | null
          personal_cash_balance?: number | null
          principal_draw?: number | null
          profit_margin?: number | null
          schedule_d_mrr_target?: number | null
          setup_fees_collected?: number | null
          software_costs?: number | null
          total_expenses?: number | null
          trust_balance_end?: number | null
          trust_balance_start?: number | null
          trust_deployment?: number | null
          updated_at?: string
          va_costs?: number | null
        }
        Update: {
          active_client_count?: number | null
          ad_infrastructure_costs?: number | null
          cash_reserves?: number | null
          created_at?: string
          gross_mrr?: number | null
          id?: string
          month?: string
          net_profit?: number | null
          notes?: string | null
          other_costs?: number | null
          personal_cash_balance?: number | null
          principal_draw?: number | null
          profit_margin?: number | null
          schedule_d_mrr_target?: number | null
          setup_fees_collected?: number | null
          software_costs?: number | null
          total_expenses?: number | null
          trust_balance_end?: number | null
          trust_balance_start?: number | null
          trust_deployment?: number | null
          updated_at?: string
          va_costs?: number | null
        }
        Relationships: []
      }
      growth_metrics_daily: {
        Row: {
          booked_calls: number | null
          created_at: string
          date: string
          followers: number | null
          id: string
          inbound_dms: number | null
          link_clicks: number | null
          profile_visits: number | null
          user_id: string
        }
        Insert: {
          booked_calls?: number | null
          created_at?: string
          date: string
          followers?: number | null
          id?: string
          inbound_dms?: number | null
          link_clicks?: number | null
          profile_visits?: number | null
          user_id: string
        }
        Update: {
          booked_calls?: number | null
          created_at?: string
          date?: string
          followers?: number | null
          id?: string
          inbound_dms?: number | null
          link_clicks?: number | null
          profile_visits?: number | null
          user_id?: string
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string | null
          id: string
          integration_name: string
          payload: Json
          processed_at: string | null
          source_system: string | null
          status: string
          target_system: string | null
          triggered_by_profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          integration_name: string
          payload?: Json
          processed_at?: string | null
          source_system?: string | null
          status?: string
          target_system?: string | null
          triggered_by_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          integration_name?: string
          payload?: Json
          processed_at?: string | null
          source_system?: string | null
          status?: string
          target_system?: string | null
          triggered_by_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_triggered_by_profile_id_fkey"
            columns: ["triggered_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "integration_events_triggered_by_profile_id_fkey"
            columns: ["triggered_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          metadata: Json
          tags: string[]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          tags?: string[]
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          content_hash: string | null
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json
          updated_at: string
        }
        Insert: {
          chunk_index: number
          content: string
          content_hash?: string | null
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          content_hash?: string | null
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "aa_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          body: string | null
          created_at: string
          created_by_profile_id: string | null
          file_path: string | null
          id: string
          indexed_at: string | null
          metadata: Json
          slug: string | null
          source_path: string | null
          source_type: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          file_path?: string | null
          id?: string
          indexed_at?: string | null
          metadata?: Json
          slug?: string | null
          source_path?: string | null
          source_type: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          file_path?: string | null
          id?: string
          indexed_at?: string | null
          metadata?: Json
          slug?: string | null
          source_path?: string | null
          source_type?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "knowledge_documents_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_queries: {
        Row: {
          answer_text: string | null
          citations: Json
          created_at: string
          id: string
          model_name: string | null
          query_text: string
          response_meta: Json
          retrieved_chunk_ids: string[]
          updated_at: string
          user_profile_id: string | null
        }
        Insert: {
          answer_text?: string | null
          citations?: Json
          created_at?: string
          id?: string
          model_name?: string | null
          query_text: string
          response_meta?: Json
          retrieved_chunk_ids?: string[]
          updated_at?: string
          user_profile_id?: string | null
        }
        Update: {
          answer_text?: string | null
          citations?: Json
          created_at?: string
          id?: string
          model_name?: string | null
          query_text?: string
          response_meta?: Json
          retrieved_chunk_ids?: string[]
          updated_at?: string
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_queries_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "knowledge_queries_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          category: string
          client_id: string | null
          client_name: string | null
          created_at: string
          created_by_profile_id: string | null
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          reconciled_at: string | null
          status: string
          tags: string[]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          reconciled_at?: string | null
          status?: string
          tags?: string[]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          reconciled_at?: string | null
          status?: string
          tags?: string[]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          id: string
          manager_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          manager_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          manager_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_reviews_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "manager_reviews_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      one_pagers: {
        Row: {
          blocks: Json | null
          content_item_id: string
          created_at: string | null
          id: string
          markdown: string | null
        }
        Insert: {
          blocks?: Json | null
          content_item_id: string
          created_at?: string | null
          id?: string
          markdown?: string | null
        }
        Update: {
          blocks?: Json | null
          content_item_id?: string
          created_at?: string | null
          id?: string
          markdown?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_pagers_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: true
            referencedRelation: "content_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      one_pagers_v2: {
        Row: {
          created_at: string
          export_png_url: string | null
          id: string
          layout_json: Json
          source_script_id: string | null
          tags: string[] | null
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          export_png_url?: string | null
          id?: string
          layout_json: Json
          source_script_id?: string | null
          tags?: string[] | null
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          export_png_url?: string | null
          id?: string
          layout_json?: Json
          source_script_id?: string | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_pagers_v2_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      organic_posts: {
        Row: {
          approval_queue_id: string | null
          asset_ids: string[] | null
          body_copy: string | null
          brand_voice_score: number | null
          caption: string | null
          carousel_slides: Json | null
          client_id: string
          content_format: string
          created_at: string
          created_by: string | null
          cta_text: string | null
          cycle_id: string | null
          funnel_layer: string
          hashtag_set: string[] | null
          hook_variants: Json | null
          id: string
          published_at: string | null
          reel_script: Json | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approval_queue_id?: string | null
          asset_ids?: string[] | null
          body_copy?: string | null
          brand_voice_score?: number | null
          caption?: string | null
          carousel_slides?: Json | null
          client_id: string
          content_format: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cycle_id?: string | null
          funnel_layer: string
          hashtag_set?: string[] | null
          hook_variants?: Json | null
          id?: string
          published_at?: string | null
          reel_script?: Json | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approval_queue_id?: string | null
          asset_ids?: string[] | null
          body_copy?: string | null
          brand_voice_score?: number | null
          caption?: string | null
          carousel_slides?: Json | null
          client_id?: string
          content_format?: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cycle_id?: string | null
          funnel_layer?: string
          hashtag_set?: string[] | null
          hook_variants?: Json | null
          id?: string
          published_at?: string | null
          reel_script?: Json | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organic_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organic_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "organic_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_documents: {
        Row: {
          bucket_name: string
          client_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          manager_id: string | null
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          bucket_name?: string
          client_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          manager_id?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket_name?: string
          client_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          manager_id?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_documents_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "portal_documents_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_messages: {
        Row: {
          client_id: string
          created_at: string
          id: string
          manager_id: string | null
          message_text: string
          sender_id: string | null
          sender_kind: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          manager_id?: string | null
          message_text: string
          sender_id?: string | null
          sender_kind?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          manager_id?: string | null
          message_text?: string
          sender_id?: string | null
          sender_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_messages_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "portal_messages_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_tasks: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          manager_id: string | null
          notes: string | null
          priority: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          manager_id?: string | null
          notes?: string | null
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_tasks_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "portal_tasks_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      positioning_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_id: string
          content: Json
          created_at: string
          created_by: string | null
          cycle_id: string | null
          doc_type: string
          id: string
          narrative_arc: string | null
          objection_stack: Json | null
          proof_point_ranking: Json | null
          psychological_triggers: Json | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          content: Json
          created_at?: string
          created_by?: string | null
          cycle_id?: string | null
          doc_type: string
          id?: string
          narrative_arc?: string | null
          objection_stack?: Json | null
          proof_point_ranking?: Json | null
          psychological_triggers?: Json | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          cycle_id?: string | null
          doc_type?: string
          id?: string
          narrative_arc?: string | null
          objection_stack?: Json | null
          proof_point_ranking?: Json | null
          psychological_triggers?: Json | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "positioning_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "positioning_documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positioning_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positioning_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "positioning_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_builds: {
        Row: {
          approval_queue_id: string | null
          bio_copy: string | null
          bio_cta: string | null
          client_id: string
          created_at: string
          highlights_plan: Json | null
          id: string
          link_in_bio_button_label: string | null
          link_in_bio_destination: string | null
          link_in_bio_headline: string | null
          pinned_post_brief: Json | null
          profile_conversion_funnel_map: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          approval_queue_id?: string | null
          bio_copy?: string | null
          bio_cta?: string | null
          client_id: string
          created_at?: string
          highlights_plan?: Json | null
          id?: string
          link_in_bio_button_label?: string | null
          link_in_bio_destination?: string | null
          link_in_bio_headline?: string | null
          pinned_post_brief?: Json | null
          profile_conversion_funnel_map?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          approval_queue_id?: string | null
          bio_copy?: string | null
          bio_cta?: string | null
          client_id?: string
          created_at?: string
          highlights_plan?: Json | null
          id?: string
          link_in_bio_button_label?: string | null
          link_in_bio_destination?: string | null
          link_in_bio_headline?: string | null
          pinned_post_brief?: Json | null
          profile_conversion_funnel_map?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_builds_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_assets: {
        Row: {
          ai_caption: string | null
          alt_text: string | null
          approval_status: string
          approx_job_value_zar: number | null
          asset_tag: string | null
          client_id: string
          content_use_suggestion: string | null
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          job_location: string | null
          job_type: string | null
          pair_asset_id: string | null
          proof_score: number | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          ai_caption?: string | null
          alt_text?: string | null
          approval_status?: string
          approx_job_value_zar?: number | null
          asset_tag?: string | null
          client_id: string
          content_use_suggestion?: string | null
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          job_location?: string | null
          job_type?: string | null
          pair_asset_id?: string | null
          proof_score?: number | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          ai_caption?: string | null
          alt_text?: string | null
          approval_status?: string
          approx_job_value_zar?: number | null
          asset_tag?: string | null
          client_id?: string
          content_use_suggestion?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          job_location?: string | null
          job_type?: string | null
          pair_asset_id?: string | null
          proof_score?: number | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_assets_pair_asset_id_fkey"
            columns: ["pair_asset_id"]
            isOneToOne: false
            referencedRelation: "proof_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_cards: {
        Row: {
          asset_id: string | null
          claim: string
          client_name: string | null
          created_at: string
          id: string
          metric: string | null
          proof_id: string | null
          proof_type: string
          timeframe: string | null
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          claim: string
          client_name?: string | null
          created_at?: string
          id?: string
          metric?: string | null
          proof_id?: string | null
          proof_type?: string
          timeframe?: string | null
          user_id: string
        }
        Update: {
          asset_id?: string | null
          claim?: string
          client_name?: string | null
          created_at?: string
          id?: string
          metric?: string | null
          proof_id?: string | null
          proof_type?: string
          timeframe?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_cards_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "app_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_cards_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_cards_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_acceleration_reports: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_acceleration_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_ad_variants: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_ad_variants_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_assets: {
        Row: {
          approved: boolean | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          locked: boolean
          mime_type: string | null
          notes: string | null
          position: number
          sprint_id: string
          tag: string
          updated_at: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          locked?: boolean
          mime_type?: string | null
          notes?: string | null
          position?: number
          sprint_id: string
          tag?: string
          updated_at?: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          locked?: boolean
          mime_type?: string | null
          notes?: string | null
          position?: number
          sprint_id?: string
          tag?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_assets_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_master"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_business_intelligence: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_business_intelligence_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_campaign_specs: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_campaign_specs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_client_data: {
        Row: {
          c1_campaign_id: string | null
          c2_campaign_id: string | null
          client_id: string
          client_reported_bookings_total: number | null
          client_reported_dms_total: number | null
          client_reported_notes: string | null
          client_reported_qualified_total: number | null
          client_reported_revenue: number | null
          client_whatsapp: string | null
          created_at: string
          created_by: string | null
          d10_cleared: boolean
          d11_action_list_confirmed: boolean
          d14_locked: boolean
          deliverable_key: string
          id: string
          input_json: Json
          meta_access_token_ref: string | null
          openclaw_agent_id: string | null
          operator_whatsapp: string | null
          running_totals_json: Json
          sprint_day_current: number | null
          sprint_go_live_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          c1_campaign_id?: string | null
          c2_campaign_id?: string | null
          client_id: string
          client_reported_bookings_total?: number | null
          client_reported_dms_total?: number | null
          client_reported_notes?: string | null
          client_reported_qualified_total?: number | null
          client_reported_revenue?: number | null
          client_whatsapp?: string | null
          created_at?: string
          created_by?: string | null
          d10_cleared?: boolean
          d11_action_list_confirmed?: boolean
          d14_locked?: boolean
          deliverable_key?: string
          id?: string
          input_json?: Json
          meta_access_token_ref?: string | null
          openclaw_agent_id?: string | null
          operator_whatsapp?: string | null
          running_totals_json?: Json
          sprint_day_current?: number | null
          sprint_go_live_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          c1_campaign_id?: string | null
          c2_campaign_id?: string | null
          client_id?: string
          client_reported_bookings_total?: number | null
          client_reported_dms_total?: number | null
          client_reported_notes?: string | null
          client_reported_qualified_total?: number | null
          client_reported_revenue?: number | null
          client_whatsapp?: string | null
          created_at?: string
          created_by?: string | null
          d10_cleared?: boolean
          d11_action_list_confirmed?: boolean
          d14_locked?: boolean
          deliverable_key?: string
          id?: string
          input_json?: Json
          meta_access_token_ref?: string | null
          openclaw_agent_id?: string | null
          operator_whatsapp?: string | null
          running_totals_json?: Json
          sprint_day_current?: number | null
          sprint_go_live_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_client_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_client_updates: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_client_updates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_closeouts: {
        Row: {
          artifact_paths: string[]
          client_id: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string
          delivery_receipt_portal: string | null
          delivery_receipt_wa: string | null
          demand_determination: string
          deposit_credit_confirmed: boolean
          error_message: string | null
          id: string
          input_json: Json
          output_json: Json
          proof_brand_proceed: boolean
          status: string
          updated_at: string
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          delivery_receipt_portal?: string | null
          delivery_receipt_wa?: string | null
          demand_determination?: string
          deposit_credit_confirmed?: boolean
          error_message?: string | null
          id?: string
          input_json?: Json
          output_json?: Json
          proof_brand_proceed?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          delivery_receipt_portal?: string | null
          delivery_receipt_wa?: string | null
          demand_determination?: string
          deposit_credit_confirmed?: boolean
          error_message?: string | null
          id?: string
          input_json?: Json
          output_json?: Json
          proof_brand_proceed?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_closeouts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_daily_metrics: {
        Row: {
          blended_cost_per_result: number
          blended_total_spend: number
          c1_cost_per_message: number
          c1_cpm: number
          c1_ctr: number
          c1_dms_started: number
          c1_spend: number
          c2_cost_per_lead: number
          c2_cpm: number
          c2_ctr: number
          c2_leads_generated: number
          c2_spend: number
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          kill_alerts_json: Json
          log_date: string
          raw_api_response: Json
          scale_alerts_json: Json
          sprint_day: number
          stabilisation_phase: boolean
          status: string
          updated_at: string
        }
        Insert: {
          blended_cost_per_result?: number
          blended_total_spend?: number
          c1_cost_per_message?: number
          c1_cpm?: number
          c1_ctr?: number
          c1_dms_started?: number
          c1_spend?: number
          c2_cost_per_lead?: number
          c2_cpm?: number
          c2_ctr?: number
          c2_leads_generated?: number
          c2_spend?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kill_alerts_json?: Json
          log_date: string
          raw_api_response?: Json
          scale_alerts_json?: Json
          sprint_day: number
          stabilisation_phase?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          blended_cost_per_result?: number
          blended_total_spend?: number
          c1_cost_per_message?: number
          c1_cpm?: number
          c1_ctr?: number
          c1_dms_started?: number
          c1_spend?: number
          c2_cost_per_lead?: number
          c2_cpm?: number
          c2_ctr?: number
          c2_leads_generated?: number
          c2_spend?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kill_alerts_json?: Json
          log_date?: string
          raw_api_response?: Json
          scale_alerts_json?: Json
          sprint_day?: number
          stabilisation_phase?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_daily_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_deliverables: {
        Row: {
          created_at: string
          file_path: string | null
          format: string
          id: string
          sprint_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          format?: string
          id?: string
          sprint_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          format?: string
          id?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_deliverables_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_master"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_deliveries: {
        Row: {
          channel: string
          deliverable_id: string | null
          id: string
          notes: string | null
          recipient: string | null
          sent_at: string
          sprint_id: string
        }
        Insert: {
          channel?: string
          deliverable_id?: string | null
          id?: string
          notes?: string | null
          recipient?: string | null
          sent_at?: string
          sprint_id: string
        }
        Update: {
          channel?: string
          deliverable_id?: string | null
          id?: string
          notes?: string | null
          recipient?: string | null
          sent_at?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_deliveries_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_sprint_deliveries_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_master"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_demand_proof_documents: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_demand_proof_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_documents: {
        Row: {
          content: Json
          created_at: string
          doc_type: string
          edited: boolean
          id: string
          sprint_id: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          doc_type: string
          edited?: boolean
          id?: string
          sprint_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          doc_type?: string
          edited?: boolean
          id?: string
          sprint_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_documents_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_master"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_final_data_locks: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_final_data_locks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_generations: {
        Row: {
          created_at: string
          error: string | null
          gen_type: string
          id: string
          output_urls: Json
          source_refs: Json
          sprint_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          gen_type: string
          id?: string
          output_urls?: Json
          source_refs?: Json
          sprint_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          gen_type?: string
          id?: string
          output_urls?: Json
          source_refs?: Json
          sprint_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_generations_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_master"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_lead_magnets: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_lead_magnets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_manychat_flows: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_manychat_flows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_master: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          current_day: number
          id: string
          positioning_json: Json
          sprint_status: string
          transcript_raw: string | null
          updated_at: string
          variables_json: Json
        }
        Insert: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          current_day?: number
          id?: string
          positioning_json?: Json
          sprint_status?: string
          transcript_raw?: string | null
          updated_at?: string
          variables_json?: Json
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          current_day?: number
          id?: string
          positioning_json?: Json
          sprint_status?: string
          transcript_raw?: string | null
          updated_at?: string
          variables_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_master_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_optimisation_reports: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_optimisation_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_prompt_templates: {
        Row: {
          active: boolean
          created_at: string
          cron_day: number | null
          cron_time_sast: string | null
          deliverable_key: string
          id: string
          notes: string | null
          openclaw_required: boolean
          output_tables: string[]
          prompt_key: string
          system_prompt: string
          title: string
          updated_at: string
          upstream_dependencies: string[]
          user_prompt_template: string | null
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cron_day?: number | null
          cron_time_sast?: string | null
          deliverable_key: string
          id?: string
          notes?: string | null
          openclaw_required?: boolean
          output_tables?: string[]
          prompt_key: string
          system_prompt: string
          title: string
          updated_at?: string
          upstream_dependencies?: string[]
          user_prompt_template?: string | null
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cron_day?: number | null
          cron_time_sast?: string | null
          deliverable_key?: string
          id?: string
          notes?: string | null
          openclaw_required?: boolean
          output_tables?: string[]
          prompt_key?: string
          system_prompt?: string
          title?: string
          updated_at?: string
          upstream_dependencies?: string[]
          user_prompt_template?: string | null
          version?: string
        }
        Relationships: []
      }
      proof_sprint_proof_ads: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_proof_ads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_stabilisation_reports: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_stabilisation_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_variables: {
        Row: {
          created_at: string
          id: string
          source_text: string | null
          sprint_id: string
          updated_at: string
          variable_key: string
          variable_value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          source_text?: string | null
          sprint_id: string
          updated_at?: string
          variable_key: string
          variable_value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          source_text?: string | null
          sprint_id?: string
          updated_at?: string
          variable_key?: string
          variable_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_variables_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprint_master"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprint_whatsapp_scripts: {
        Row: {
          artifact_paths: string[]
          client_id: string
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          output_json: Json
          output_md: string | null
          prompt_key: string | null
          run_id: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_paths?: string[]
          client_id: string
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_paths?: string[]
          client_id?: string
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          output_json?: Json
          output_md?: string | null
          prompt_key?: string | null
          run_id?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprint_whatsapp_scripts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_agent_artifacts: {
        Row: {
          artifact_kind: string | null
          bucket: string | null
          client_id: string | null
          created_at: string
          deliverable_key: string | null
          id: string
          job_id: string | null
          metadata_json: Json
          object_path: string | null
          public_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          artifact_kind?: string | null
          bucket?: string | null
          client_id?: string | null
          created_at?: string
          deliverable_key?: string | null
          id?: string
          job_id?: string | null
          metadata_json?: Json
          object_path?: string | null
          public_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          artifact_kind?: string | null
          bucket?: string | null
          client_id?: string | null
          created_at?: string
          deliverable_key?: string | null
          id?: string
          job_id?: string | null
          metadata_json?: Json
          object_path?: string | null
          public_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_agent_artifacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_sprints_agent_artifacts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints_agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_agent_events: {
        Row: {
          client_id: string | null
          created_at: string
          event_json: Json
          event_type: string
          id: string
          job_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          event_json?: Json
          event_type: string
          id?: string
          job_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          event_json?: Json
          event_type?: string
          id?: string
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_agent_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_sprints_agent_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints_agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_agent_jobs: {
        Row: {
          callback_target: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string
          expected_output_type: string
          id: string
          idempotency_key: string
          input_artifact_paths: string[]
          last_error: string | null
          max_retries: number
          openclaw_agent_id: string | null
          payload_json: Json
          prompt_key: string
          prompt_version: string | null
          receipt_json: Json
          required_apps: string[]
          retry_allowed: boolean
          status: string
          telegram_chat_id: string | null
          telegram_message_id: string | null
          updated_at: string
        }
        Insert: {
          callback_target?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          expected_output_type?: string
          id?: string
          idempotency_key: string
          input_artifact_paths?: string[]
          last_error?: string | null
          max_retries?: number
          openclaw_agent_id?: string | null
          payload_json?: Json
          prompt_key: string
          prompt_version?: string | null
          receipt_json?: Json
          required_apps?: string[]
          retry_allowed?: boolean
          status?: string
          telegram_chat_id?: string | null
          telegram_message_id?: string | null
          updated_at?: string
        }
        Update: {
          callback_target?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          expected_output_type?: string
          id?: string
          idempotency_key?: string
          input_artifact_paths?: string[]
          last_error?: string | null
          max_retries?: number
          openclaw_agent_id?: string | null
          payload_json?: Json
          prompt_key?: string
          prompt_version?: string | null
          receipt_json?: Json
          required_apps?: string[]
          retry_allowed?: boolean
          status?: string
          telegram_chat_id?: string | null
          telegram_message_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_agent_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_alert_events: {
        Row: {
          alert_json: Json
          alert_type: string
          client_id: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string | null
          id: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          alert_json?: Json
          alert_type: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          alert_json?: Json
          alert_type?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_alert_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_content_logs: {
        Row: {
          artifact_kind: string | null
          bucket: string
          client_id: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string | null
          id: string
          metadata_json: Json
          mime_type: string | null
          object_path: string
          status: string
          updated_at: string
        }
        Insert: {
          artifact_kind?: string | null
          bucket: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          metadata_json?: Json
          mime_type?: string | null
          object_path: string
          status?: string
          updated_at?: string
        }
        Update: {
          artifact_kind?: string | null
          bucket?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          metadata_json?: Json
          mime_type?: string | null
          object_path?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_content_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_delivery_runs: {
        Row: {
          channel: string
          client_id: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string | null
          id: string
          message_json: Json
          receipt_json: Json
          recipient: string | null
          status: string
          updated_at: string
        }
        Insert: {
          channel: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          message_json?: Json
          receipt_json?: Json
          recipient?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          message_json?: Json
          receipt_json?: Json
          recipient?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_delivery_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_external_receipts: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string | null
          id: string
          provider: string
          receipt_json: Json
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          provider: string
          receipt_json?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string | null
          id?: string
          provider?: string
          receipt_json?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_external_receipts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_sprints_prompt_runs: {
        Row: {
          agent_job_id: string | null
          blocked_by: string[]
          client_id: string | null
          created_at: string
          created_by: string | null
          deliverable_key: string
          error_message: string | null
          id: string
          input_json: Json
          model: string | null
          openclaw_required: boolean
          output_json: Json
          output_md: string | null
          output_tables: string[]
          prompt_key: string
          prompt_version: string | null
          status: string
          updated_at: string
          upstream_dependencies: string[]
        }
        Insert: {
          agent_job_id?: string | null
          blocked_by?: string[]
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          openclaw_required?: boolean
          output_json?: Json
          output_md?: string | null
          output_tables?: string[]
          prompt_key: string
          prompt_version?: string | null
          status?: string
          updated_at?: string
          upstream_dependencies?: string[]
        }
        Update: {
          agent_job_id?: string | null
          blocked_by?: string[]
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_key?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          model?: string | null
          openclaw_required?: boolean
          output_json?: Json
          output_md?: string | null
          output_tables?: string[]
          prompt_key?: string
          prompt_version?: string | null
          status?: string
          updated_at?: string
          upstream_dependencies?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "proof_sprints_prompt_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          created_at: string | null
          happened_at: string | null
          headline: string
          id: string
          industry: string | null
          is_blurred: boolean
          metric: string | null
          score: number | null
          screenshot_asset_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          happened_at?: string | null
          headline: string
          id?: string
          industry?: string | null
          is_blurred?: boolean
          metric?: string | null
          score?: number | null
          screenshot_asset_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          happened_at?: string | null
          headline?: string
          id?: string
          industry?: string | null
          is_blurred?: boolean
          metric?: string | null
          score?: number | null
          screenshot_asset_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proofs_screenshot_asset_id_fkey"
            columns: ["screenshot_asset_id"]
            isOneToOne: false
            referencedRelation: "app_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_screenshot_asset_id_fkey"
            columns: ["screenshot_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          address: string | null
          apify_run_id: string | null
          assigned_to: string | null
          assigned_to_profile_id: string | null
          business_name: string
          city: string | null
          created_at: string
          data_source: string | null
          email: string | null
          google_rating: number | null
          google_review_count: number | null
          has_meta_ads: boolean
          icp_tier: string | null
          icp_total_score: number | null
          id: string
          ig_follower_count: number | null
          instagram_handle: string | null
          is_archived: boolean
          last_scraped_at: string | null
          meta_ads_running: boolean
          mjr_delivered_at: string | null
          mjr_link: string | null
          mjr_missed_revenue: number | null
          mjr_notes: string | null
          msg_1_sent: boolean
          msg_2_sent: boolean
          msg_3_sent: boolean
          msg_4_sent: boolean
          msg_5_sent: boolean
          outreach_attempted: boolean
          owner_name: string | null
          phone: string | null
          pipeline_stage: string
          priority_cohort: string | null
          q_high_ticket: boolean
          q_owner_op: boolean
          q_referral: boolean
          q_visual: boolean
          q_weak_digital: boolean
          score_digital_weakness: number | null
          score_growth_hunger: number | null
          score_owner_accessibility: number | null
          score_ticket_size: number | null
          score_visual_transformability: number | null
          source_payload: Json
          spoa_delivered_at: string | null
          status: string
          suburb: string | null
          target_date: string | null
          updated_at: string
          vertical: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          apify_run_id?: string | null
          assigned_to?: string | null
          assigned_to_profile_id?: string | null
          business_name: string
          city?: string | null
          created_at?: string
          data_source?: string | null
          email?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          has_meta_ads?: boolean
          icp_tier?: string | null
          icp_total_score?: number | null
          id?: string
          ig_follower_count?: number | null
          instagram_handle?: string | null
          is_archived?: boolean
          last_scraped_at?: string | null
          meta_ads_running?: boolean
          mjr_delivered_at?: string | null
          mjr_link?: string | null
          mjr_missed_revenue?: number | null
          mjr_notes?: string | null
          msg_1_sent?: boolean
          msg_2_sent?: boolean
          msg_3_sent?: boolean
          msg_4_sent?: boolean
          msg_5_sent?: boolean
          outreach_attempted?: boolean
          owner_name?: string | null
          phone?: string | null
          pipeline_stage?: string
          priority_cohort?: string | null
          q_high_ticket?: boolean
          q_owner_op?: boolean
          q_referral?: boolean
          q_visual?: boolean
          q_weak_digital?: boolean
          score_digital_weakness?: number | null
          score_growth_hunger?: number | null
          score_owner_accessibility?: number | null
          score_ticket_size?: number | null
          score_visual_transformability?: number | null
          source_payload?: Json
          spoa_delivered_at?: string | null
          status?: string
          suburb?: string | null
          target_date?: string | null
          updated_at?: string
          vertical?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          apify_run_id?: string | null
          assigned_to?: string | null
          assigned_to_profile_id?: string | null
          business_name?: string
          city?: string | null
          created_at?: string
          data_source?: string | null
          email?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          has_meta_ads?: boolean
          icp_tier?: string | null
          icp_total_score?: number | null
          id?: string
          ig_follower_count?: number | null
          instagram_handle?: string | null
          is_archived?: boolean
          last_scraped_at?: string | null
          meta_ads_running?: boolean
          mjr_delivered_at?: string | null
          mjr_link?: string | null
          mjr_missed_revenue?: number | null
          mjr_notes?: string | null
          msg_1_sent?: boolean
          msg_2_sent?: boolean
          msg_3_sent?: boolean
          msg_4_sent?: boolean
          msg_5_sent?: boolean
          outreach_attempted?: boolean
          owner_name?: string | null
          phone?: string | null
          pipeline_stage?: string
          priority_cohort?: string | null
          q_high_ticket?: boolean
          q_owner_op?: boolean
          q_referral?: boolean
          q_visual?: boolean
          q_weak_digital?: boolean
          score_digital_weakness?: number | null
          score_growth_hunger?: number | null
          score_owner_accessibility?: number | null
          score_ticket_size?: number | null
          score_visual_transformability?: number | null
          source_payload?: Json
          spoa_delivered_at?: string | null
          status?: string
          suburb?: string | null
          target_date?: string | null
          updated_at?: string
          vertical?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "prospects_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_assignment_history: {
        Row: {
          changed_by_profile_id: string | null
          created_at: string
          id: string
          new_role: string
          previous_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by_profile_id?: string | null
          created_at?: string
          id?: string
          new_role: string
          previous_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by_profile_id?: string | null
          created_at?: string
          id?: string
          new_role?: string
          previous_role?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_assignment_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "role_assignment_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          asset_ids: string[] | null
          caption: string | null
          content_item_id: string | null
          created_at: string | null
          error: string | null
          id: string
          media_url: string | null
          notes: string | null
          platform: string | null
          platform_post_id: string | null
          post_type: string
          proof_card_id: string | null
          scheduled_for: string
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_ids?: string[] | null
          caption?: string | null
          content_item_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          media_url?: string | null
          notes?: string | null
          platform?: string | null
          platform_post_id?: string | null
          post_type: string
          proof_card_id?: string | null
          scheduled_for: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_ids?: string[] | null
          caption?: string | null
          content_item_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          media_url?: string | null
          notes?: string | null
          platform?: string | null
          platform_post_id?: string | null
          post_type?: string
          proof_card_id?: string | null
          scheduled_for?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_proof_card_id_fkey"
            columns: ["proof_card_id"]
            isOneToOne: false
            referencedRelation: "proof_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      script_pack_exports: {
        Row: {
          client_id: string
          created_at: string
          cycle_id: string | null
          export_url: string | null
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          cycle_id?: string | null
          export_url?: string | null
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          cycle_id?: string | null
          export_url?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_pack_exports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          body_text: string | null
          client_id: string
          content_type: string
          created_at: string
          cta_text: string | null
          cycle_id: string | null
          hook_text: string
          id: string
          objective: string
          platform: string | null
          psychological_alignment_score: number | null
          status: string
          tone_variant: string | null
          updated_at: string
          version: number
        }
        Insert: {
          body_text?: string | null
          client_id: string
          content_type: string
          created_at?: string
          cta_text?: string | null
          cycle_id?: string | null
          hook_text: string
          id?: string
          objective: string
          platform?: string | null
          psychological_alignment_score?: number | null
          status?: string
          tone_variant?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          body_text?: string | null
          client_id?: string
          content_type?: string
          created_at?: string
          cta_text?: string | null
          cycle_id?: string | null
          hook_text?: string
          id?: string
          objective?: string
          platform?: string | null
          psychological_alignment_score?: number | null
          status?: string
          tone_variant?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scripts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          body: string | null
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          files: Json
          id: string
          last_reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_profile_id: string | null
          sop_number: number
          status: string
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          files?: Json
          id?: string
          last_reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_profile_id?: string | null
          sop_number: number
          status?: string
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          body?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          files?: Json
          id?: string
          last_reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_profile_id?: string | null
          sop_number?: number
          status?: string
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sops_reviewed_by_profile_id_fkey"
            columns: ["reviewed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "sops_reviewed_by_profile_id_fkey"
            columns: ["reviewed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_daily_logs: {
        Row: {
          created_at: string
          day_number: number | null
          id: string
          impressions: number | null
          leads: number | null
          link_clicks: number | null
          log_date: string
          notes: string | null
          reach: number | null
          spend: number | null
          sprint_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          link_clicks?: number | null
          log_date: string
          notes?: string | null
          reach?: number | null
          spend?: number | null
          sprint_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          link_clicks?: number | null
          log_date?: string
          notes?: string | null
          reach?: number | null
          spend?: number | null
          sprint_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_daily_logs_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_daily_logs_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_logs: {
        Row: {
          client_name: string
          cpl: number | null
          cpl_target: number | null
          day_number: number | null
          health_status: string
          id: string
          leads_generated: number | null
          leads_target: number | null
          logged_at: string
          notes: string | null
          roas: number | null
          roas_target: number | null
          spend: number | null
          sprint_id: string
        }
        Insert: {
          client_name: string
          cpl?: number | null
          cpl_target?: number | null
          day_number?: number | null
          health_status: string
          id?: string
          leads_generated?: number | null
          leads_target?: number | null
          logged_at?: string
          notes?: string | null
          roas?: number | null
          roas_target?: number | null
          spend?: number | null
          sprint_id: string
        }
        Update: {
          client_name?: string
          cpl?: number | null
          cpl_target?: number | null
          day_number?: number | null
          health_status?: string
          id?: string
          leads_generated?: number | null
          leads_target?: number | null
          logged_at?: string
          notes?: string | null
          roas?: number | null
          roas_target?: number | null
          spend?: number | null
          sprint_id?: string
        }
        Relationships: []
      }
      sprint_reports: {
        Row: {
          body: string | null
          created_at: string
          file_path: string | null
          generated_at: string | null
          generated_by_profile_id: string | null
          id: string
          report_type: string
          sprint_id: string
          status: string
          summary: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          file_path?: string | null
          generated_at?: string | null
          generated_by_profile_id?: string | null
          id?: string
          report_type: string
          sprint_id: string
          status?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          file_path?: string | null
          generated_at?: string | null
          generated_by_profile_id?: string | null
          id?: string
          report_type?: string
          sprint_id?: string
          status?: string
          summary?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_reports_generated_by_profile_id_fkey"
            columns: ["generated_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "sprint_reports_generated_by_profile_id_fkey"
            columns: ["generated_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_reports_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_reports_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          actual_ad_spend: number | null
          bookings_from_sprint: number | null
          clicks: number | null
          client_ad_budget: number | null
          client_id: string
          client_name: string | null
          close_notes: string | null
          content_pieces: Json
          created_at: string
          day7_notes: string | null
          day7_sentiment: string | null
          end_date: string | null
          id: string
          impressions: number | null
          last_meta_sync_at: string | null
          leads_generated: number | null
          link_clicks: number | null
          meta_campaign_id: string | null
          meta_sync_status: string | null
          prospect_id: string | null
          report_file_path: string | null
          report_status: string
          results_meeting_date: string | null
          results_meeting_outcome: string | null
          revenue_attributed: number | null
          sprint_number: number
          sprint_type: string
          start_date: string
          status: string
          talking_points: string | null
          total_impressions: number | null
          total_reach: number | null
          updated_at: string
          vertical: string | null
        }
        Insert: {
          actual_ad_spend?: number | null
          bookings_from_sprint?: number | null
          clicks?: number | null
          client_ad_budget?: number | null
          client_id: string
          client_name?: string | null
          close_notes?: string | null
          content_pieces?: Json
          created_at?: string
          day7_notes?: string | null
          day7_sentiment?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          last_meta_sync_at?: string | null
          leads_generated?: number | null
          link_clicks?: number | null
          meta_campaign_id?: string | null
          meta_sync_status?: string | null
          prospect_id?: string | null
          report_file_path?: string | null
          report_status?: string
          results_meeting_date?: string | null
          results_meeting_outcome?: string | null
          revenue_attributed?: number | null
          sprint_number?: number
          sprint_type?: string
          start_date: string
          status?: string
          talking_points?: string | null
          total_impressions?: number | null
          total_reach?: number | null
          updated_at?: string
          vertical?: string | null
        }
        Update: {
          actual_ad_spend?: number | null
          bookings_from_sprint?: number | null
          clicks?: number | null
          client_ad_budget?: number | null
          client_id?: string
          client_name?: string | null
          close_notes?: string | null
          content_pieces?: Json
          created_at?: string
          day7_notes?: string | null
          day7_sentiment?: string | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          last_meta_sync_at?: string | null
          leads_generated?: number | null
          link_clicks?: number | null
          meta_campaign_id?: string | null
          meta_sync_status?: string | null
          prospect_id?: string | null
          report_file_path?: string | null
          report_status?: string
          results_meeting_date?: string | null
          results_meeting_outcome?: string | null
          revenue_attributed?: number | null
          sprint_number?: number
          sprint_type?: string
          start_date?: string
          status?: string
          talking_points?: string | null
          total_impressions?: number | null
          total_reach?: number | null
          updated_at?: string
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to_profile_id: string | null
          category: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_milestone: boolean
          milestone_label: string | null
          month_key: string
          notes: string | null
          priority: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_profile_id?: string | null
          category?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_milestone?: boolean
          milestone_label?: string | null
          month_key: string
          notes?: string | null
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_profile_id?: string | null
          category?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_milestone?: boolean
          milestone_label?: string | null
          month_key?: string
          notes?: string | null
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string | null
          char_count: number | null
          content: string | null
          created_at: string
          id: string
          last_edited_by: string | null
          last_edited_by_profile_id: string | null
          status: string
          title: string
          updated_at: string
          variables: string[]
          version: string | null
        }
        Insert: {
          category?: string | null
          char_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          last_edited_by?: string | null
          last_edited_by_profile_id?: string | null
          status?: string
          title: string
          updated_at?: string
          variables?: string[]
          version?: string | null
        }
        Update: {
          category?: string | null
          char_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          last_edited_by?: string | null
          last_edited_by_profile_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          variables?: string[]
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_last_edited_by_profile_id_fkey"
            columns: ["last_edited_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "templates_last_edited_by_profile_id_fkey"
            columns: ["last_edited_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          audio_mime: string | null
          audio_path: string | null
          bucket: string
          bytes: number | null
          created_at: string
          description: string | null
          has_audio: boolean | null
          id: string
          mime: string | null
          path: string
          platform: string | null
          title: string
          user_id: string
        }
        Insert: {
          audio_mime?: string | null
          audio_path?: string | null
          bucket?: string
          bytes?: number | null
          created_at?: string
          description?: string | null
          has_audio?: boolean | null
          id?: string
          mime?: string | null
          path: string
          platform?: string | null
          title: string
          user_id: string
        }
        Update: {
          audio_mime?: string | null
          audio_path?: string | null
          bucket?: string
          bytes?: number | null
          created_at?: string
          description?: string | null
          has_audio?: boolean | null
          id?: string
          mime?: string | null
          path?: string
          platform?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      aa_chunks: {
        Row: {
          chunk_index: number | null
          content: string | null
          content_hash: string | null
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string | null
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          chunk_index?: number | null
          content?: string | null
          content_hash?: string | null
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number | null
          content?: string | null
          content_hash?: string | null
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "aa_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      aa_documents: {
        Row: {
          body: string | null
          created_at: string | null
          created_by_profile_id: string | null
          file_path: string | null
          id: string | null
          indexed_at: string | null
          metadata: Json | null
          slug: string | null
          source_path: string | null
          source_type: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          created_by_profile_id?: string | null
          file_path?: string | null
          id?: string | null
          indexed_at?: string | null
          metadata?: Json | null
          slug?: string | null
          source_path?: string | null
          source_type?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          created_by_profile_id?: string | null
          file_path?: string | null
          id?: string | null
          indexed_at?: string | null
          metadata?: Json | null
          slug?: string | null
          source_path?: string | null
          source_type?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "knowledge_documents_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aa_queries: {
        Row: {
          answer_text: string | null
          citations: Json | null
          created_at: string | null
          id: string | null
          model_name: string | null
          query_text: string | null
          response_meta: Json | null
          retrieved_chunk_ids: string[] | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          answer_text?: string | null
          citations?: Json | null
          created_at?: string | null
          id?: string | null
          model_name?: string | null
          query_text?: string | null
          response_meta?: Json | null
          retrieved_chunk_ids?: string[] | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          answer_text?: string | null
          citations?: Json | null
          created_at?: string | null
          id?: string | null
          model_name?: string | null
          query_text?: string | null
          response_meta?: Json | null
          retrieved_chunk_ids?: string[] | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_queries_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "knowledge_queries_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_files: {
        Row: {
          associated_sop_id: string | null
          created_at: string | null
          file_name: string | null
          file_path: string | null
          file_type: string | null
          id: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          associated_sop_id?: string | null
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          associated_sop_id?: string | null
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      client_deliverables: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string | null
          is_completed: boolean | null
          notes: string | null
          position: number | null
          sprint_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string | null
          is_completed?: boolean | null
          notes?: string | null
          position?: number | null
          sprint_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string | null
          is_completed?: boolean | null
          notes?: string | null
          position?: number | null
          sprint_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      distro_metrics: {
        Row: {
          calls_booked: number | null
          created_at: string | null
          date_key: string | null
          followups_sent: number | null
          id: string | null
          manager_id: string | null
          mjrs_built: number | null
          mjrs_sent: number | null
          notes: string | null
          outreach_sent: number | null
          prospects_enriched: number | null
          prospects_scraped: number | null
          updated_at: string | null
        }
        Insert: {
          calls_booked?: number | null
          created_at?: string | null
          date_key?: string | null
          followups_sent?: number | null
          id?: string | null
          manager_id?: string | null
          mjrs_built?: number | null
          mjrs_sent?: number | null
          notes?: string | null
          outreach_sent?: number | null
          prospects_enriched?: number | null
          prospects_scraped?: number | null
          updated_at?: string | null
        }
        Update: {
          calls_booked?: number | null
          created_at?: string | null
          date_key?: string | null
          followups_sent?: number | null
          id?: string | null
          manager_id?: string | null
          mjrs_built?: number | null
          mjrs_sent?: number | null
          notes?: string | null
          outreach_sent?: number | null
          prospects_enriched?: number | null
          prospects_scraped?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_metrics_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "distribution_metrics_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger: {
        Row: {
          amount: number | null
          category: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          created_by_profile_id: string | null
          date: string | null
          description: string | null
          id: string | null
          is_recurring: boolean | null
          reconciled_at: string | null
          status: string | null
          tags: string[] | null
          type: Database["public"]["Enums"]["transaction_type"] | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by_profile_id?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          is_recurring?: boolean | null
          reconciled_at?: string | null
          status?: string | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["transaction_type"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by_profile_id?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          is_recurring?: boolean | null
          reconciled_at?: string | null
          status?: string | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["transaction_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "ops_manager_status"
            referencedColumns: ["manager_id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_revenue: {
        Row: {
          active_client_count: number | null
          ad_infrastructure_costs: number | null
          cash_reserves: number | null
          created_at: string | null
          gross_mrr: number | null
          id: string | null
          month: string | null
          net_profit: number | null
          notes: string | null
          other_costs: number | null
          personal_cash_balance: number | null
          principal_draw: number | null
          profit_margin: number | null
          schedule_d_mrr_target: number | null
          setup_fees_collected: number | null
          software_costs: number | null
          total_expenses: number | null
          trust_balance_end: number | null
          trust_balance_start: number | null
          trust_deployment: number | null
          updated_at: string | null
          va_costs: number | null
        }
        Insert: {
          active_client_count?: number | null
          ad_infrastructure_costs?: number | null
          cash_reserves?: number | null
          created_at?: string | null
          gross_mrr?: number | null
          id?: string | null
          month?: string | null
          net_profit?: number | null
          notes?: string | null
          other_costs?: number | null
          personal_cash_balance?: number | null
          principal_draw?: number | null
          profit_margin?: number | null
          schedule_d_mrr_target?: number | null
          setup_fees_collected?: number | null
          software_costs?: number | null
          total_expenses?: number | null
          trust_balance_end?: number | null
          trust_balance_start?: number | null
          trust_deployment?: number | null
          updated_at?: string | null
          va_costs?: number | null
        }
        Update: {
          active_client_count?: number | null
          ad_infrastructure_costs?: number | null
          cash_reserves?: number | null
          created_at?: string | null
          gross_mrr?: number | null
          id?: string | null
          month?: string | null
          net_profit?: number | null
          notes?: string | null
          other_costs?: number | null
          personal_cash_balance?: number | null
          principal_draw?: number | null
          profit_margin?: number | null
          schedule_d_mrr_target?: number | null
          setup_fees_collected?: number | null
          software_costs?: number | null
          total_expenses?: number | null
          trust_balance_end?: number | null
          trust_balance_start?: number | null
          trust_deployment?: number | null
          updated_at?: string | null
          va_costs?: number | null
        }
        Relationships: []
      }
      ops_manager_status: {
        Row: {
          last_active: string | null
          manager_id: string | null
          name: string | null
          role: string | null
          tasks_completed: number | null
          total_tasks_assigned: number | null
        }
        Relationships: []
      }
      proof_sprints: {
        Row: {
          actual_ad_spend: number | null
          bookings_from_sprint: number | null
          client_ad_budget: number | null
          client_id: string | null
          client_name: string | null
          close_notes: string | null
          content_pieces: Json | null
          created_at: string | null
          day7_notes: string | null
          day7_sentiment: string | null
          end_date: string | null
          id: string | null
          leads_generated: number | null
          link_clicks: number | null
          prospect_id: string | null
          report_file_path: string | null
          report_status: string | null
          results_meeting_date: string | null
          results_meeting_outcome: string | null
          revenue_attributed: number | null
          sprint_number: number | null
          sprint_type: string | null
          start_date: string | null
          status: string | null
          talking_points: string | null
          total_impressions: number | null
          total_reach: number | null
          updated_at: string | null
          vertical: string | null
        }
        Insert: {
          actual_ad_spend?: number | null
          bookings_from_sprint?: number | null
          client_ad_budget?: number | null
          client_id?: string | null
          client_name?: string | null
          close_notes?: string | null
          content_pieces?: Json | null
          created_at?: string | null
          day7_notes?: string | null
          day7_sentiment?: string | null
          end_date?: string | null
          id?: string | null
          leads_generated?: number | null
          link_clicks?: number | null
          prospect_id?: string | null
          report_file_path?: string | null
          report_status?: string | null
          results_meeting_date?: string | null
          results_meeting_outcome?: string | null
          revenue_attributed?: number | null
          sprint_number?: number | null
          sprint_type?: string | null
          start_date?: string | null
          status?: string | null
          talking_points?: string | null
          total_impressions?: number | null
          total_reach?: number | null
          updated_at?: string | null
          vertical?: string | null
        }
        Update: {
          actual_ad_spend?: number | null
          bookings_from_sprint?: number | null
          client_ad_budget?: number | null
          client_id?: string | null
          client_name?: string | null
          close_notes?: string | null
          content_pieces?: Json | null
          created_at?: string | null
          day7_notes?: string | null
          day7_sentiment?: string | null
          end_date?: string | null
          id?: string | null
          leads_generated?: number | null
          link_clicks?: number | null
          prospect_id?: string | null
          report_file_path?: string | null
          report_status?: string | null
          results_meeting_date?: string | null
          results_meeting_outcome?: string | null
          revenue_attributed?: number | null
          sprint_number?: number | null
          sprint_type?: string | null
          start_date?: string | null
          status?: string | null
          talking_points?: string | null
          total_impressions?: number | null
          total_reach?: number | null
          updated_at?: string | null
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_daily_log: {
        Row: {
          created_at: string | null
          day_number: number | null
          id: string | null
          impressions: number | null
          leads: number | null
          link_clicks: number | null
          log_date: string | null
          notes: string | null
          reach: number | null
          spend: number | null
          sprint_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_number?: number | null
          id?: string | null
          impressions?: number | null
          leads?: number | null
          link_clicks?: number | null
          log_date?: string | null
          notes?: string | null
          reach?: number | null
          spend?: number | null
          sprint_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_number?: number | null
          id?: string | null
          impressions?: number | null
          leads?: number | null
          link_clicks?: number | null
          log_date?: string | null
          notes?: string | null
          reach?: number | null
          spend?: number | null
          sprint_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprint_daily_logs_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "proof_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_daily_logs_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      aa_can_access_client: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      aa_can_access_content: {
        Args: { target_run_id: string }
        Returns: boolean
      }
      aa_can_access_user: { Args: { target_user_id: string }; Returns: boolean }
      aa_is_staff: { Args: never; Returns: boolean }
      auth_role: { Args: never; Returns: string }
      can_access_client: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      can_access_sprint: {
        Args: { target_sprint_id: string }
        Returns: boolean
      }
      check_is_staff: { Args: never; Returns: boolean }
      get_monthly_stats: {
        Args: { month_date: string }
        Returns: {
          net_profit: number
          total_expense: number
          total_income: number
        }[]
      }
      get_my_client_id: { Args: never; Returns: string }
      get_my_metadata_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      get_ops_manager_status: {
        Args: never
        Returns: {
          last_active: string
          manager_id: string
          name: string
          role: string
          tasks_completed: number
          total_tasks_assigned: number
        }[]
      }
    }
    Enums: {
      transaction_type: "income" | "expense"
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
      transaction_type: ["income", "expense"],
    },
  },
} as const
