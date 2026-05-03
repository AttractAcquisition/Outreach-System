export type CrmStage =
  | "New"
  | "Contacted"
  | "Replied"
  | "Interested"
  | "Qualified"
  | "Report Requested"
  | "Report Sent"
  | "Call Booked"
  | "Proof Sprint Offered"
  | "Won"
  | "Lost"
  | "Not Interested"
  | "Do Not Contact";

export type ConversationSource = "Meta Ad" | "Outbound" | "Manual" | "Website";

export type ServiceWindowStatus = "open" | "closing_soon" | "closed";

export type MessageDirection = "inbound" | "outbound" | "system";
export type MessageType = "text" | "template" | "ai_draft" | "system";
export type MessageStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "received";

export interface WhatsAppConversation {
  id: string;
  prospect_id: string;
  business_name: string;
  contact_name: string;
  phone_number: string;
  source: ConversationSource;
  crm_stage: CrmStage;
  lead_score: number;
  assigned_to: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  last_inbound_at: string | null;
  service_window_expires_at: string | null;
  service_window_status: ServiceWindowStatus;
  opt_out: boolean;
  suppressed: boolean;
  tags: string[];
  niche?: string;
  location?: string;
  first_contact_at?: string;
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  message_type: MessageType;
  body: string;
  template_name?: string;
  template_params?: Record<string, string>;
  status: MessageStatus;
  created_at: string;
  sender_name?: string;
  meta_message_id?: string;
  error_message?: string;
}

export type QueueStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Sent"
  | "Failed"
  | "Cancelled";

export interface OutreachQueueItem {
  id: string;
  prospect_id: string;
  business_name: string;
  contact_name: string;
  phone_number: string;
  niche: string;
  location: string;
  template_name: string;
  template_params: Record<string, string>;
  draft_preview: string;
  ai_observation: string;
  risk_score: number;
  compliance_status: "ok" | "warning" | "blocked";
  status: QueueStatus;
  created_at: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  sent_at?: string;
  error_message?: string;
}

export type TemplateCategory = "Marketing" | "Utility" | "Authentication";
export type TemplateStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Paused";

export interface WhatsAppTemplate {
  id: string;
  template_name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  body: string;
  variables: string[];
  use_case: string;
  last_used_at: string | null;
  sent_count: number;
  reply_rate: number;
  opt_out_rate: number;
  notes?: string;
}

export type SuppressionReason =
  | "Opted out"
  | "Not interested"
  | "Wrong number"
  | "Complaint"
  | "Manual block"
  | "Duplicate";

export interface SuppressionRecord {
  id: string;
  phone_number: string;
  business_name: string;
  reason: SuppressionReason;
  source: string;
  created_at: string;
  created_by: string;
  notes?: string;
}

export interface CampaignLead {
  id: string;
  conversation_id: string;
  phone_number: string;
  business_name: string;
  contact_name: string;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  initial_message: string;
  received_at: string;
  lead_status: "New" | "Assigned" | "Qualified" | "Booked" | "Closed";
  service_window_expires_at: string;
  assigned_to?: string;
  niche?: string;
  location?: string;
}

export interface ProspectDetails {
  id: string;
  business_name: string;
  contact_name: string;
  phone_number: string;
  location: string;
  niche: string;
  source: ConversationSource;
  assigned_owner: string;
  first_contact_at: string;
  last_inbound_at: string | null;
  qualification: {
    google_listing: "claimed" | "unclaimed" | "unknown";
    instagram_active: boolean;
    meta_ads_running: boolean;
    website_quality: "weak" | "average" | "strong";
    reviews_count: number;
    reviews_rating: number;
    main_gap: string;
    suggested_angle: string;
  };
  compliance: {
    opt_out: boolean;
    suppressed: boolean;
    consent_note: string;
    last_template_sent?: string;
    last_outbound_at?: string;
  };
  internal_notes: string;
}
