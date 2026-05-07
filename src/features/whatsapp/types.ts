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

export type ConversationSource =
  | "Meta Ad"
  | "Outbound"
  | "Manual"
  | "Website"
  | "Referral"
  | "Unknown";

export type ServiceWindowStatus = "open" | "closing_soon" | "closed";

export type MessageDirection = "inbound" | "outbound" | "system";
export type MessageType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "template"
  | "interactive"
  | "ai_draft"
  | "system";
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
  client_id?: string | null;
  campaign_id?: string | null;
  business_name: string;
  contact_name: string;
  phone_number: string;
  source: ConversationSource;
  source_key?: string;
  status?: string;
  stage?: string;
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
  needs_human?: boolean;
  ai_summary?: string | null;
  ai_intent?: string | null;
  ai_temperature?: string | null;
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
  media_url?: string | null;
  media_mime_type?: string | null;
  template_name?: string;
  template_language?: string | null;
  template_params?: Record<string, string>;
  status: MessageStatus;
  sender_type?: "contact" | "human" | "ai" | "system";
  ai_generated?: boolean;
  human_approved?: boolean;
  approval_id?: string | null;
  created_at: string;
  delivered_at?: string | null;
  read_at?: string | null;
  sender_name?: string;
  meta_message_id?: string;
  error_message?: string;
}

export interface WhatsAppReplySuggestion {
  suggestion_id?: string | null;
  suggested_body: string;
  reason: string;
  confidence: number;
}

export type WhatsAppSuggestionStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "used"
  | string;

export interface WhatsAppPendingSuggestion {
  id: string;
  conversation_id: string;
  prospect_id: string | null;
  client_id: string | null;
  suggested_body: string;
  reason: string | null;
  confidence: number | null;
  status: WhatsAppSuggestionStatus;
  provider: string | null;
  model: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  conversation?: {
    id: string;
    contact_name: string | null;
    phone_number: string | null;
    status: string | null;
    stage: string | null;
    last_message_preview: string | null;
    last_message_at: string | null;
    service_window_open_until: string | null;
  } | null;
  prospect?: {
    id: string;
    business_name: string | null;
    owner_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    vertical: string | null;
    city: string | null;
    suburb: string | null;
    pipeline_stage: string | null;
    icp_total_score: number | null;
    status: string | null;
  } | null;
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

export type TemplateCategory =
  | "marketing"
  | "utility"
  | "authentication"
  | string;
export type TemplateStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "paused"
  | "archived"
  | string;

export interface WhatsAppTemplate {
  id: string;
  name: string;
  displayName: string | null;
  category: TemplateCategory;
  language: string;
  body: string;
  variables: string[];
  components: unknown[];
  status: TemplateStatus;
  metaTemplateId: string | null;
  metaStatus: string | null;
  metaQualityRating: string | null;
  whatsappBusinessAccountId: string | null;
  phoneNumberId: string | null;
  usableInsideWindow: boolean;
  usableOutsideWindow: boolean;
  createdBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppTemplateFormInput {
  name: string;
  displayName?: string | null;
  category?: TemplateCategory;
  language?: string;
  body: string;
  variables: string[];
  components?: unknown[];
  status?: TemplateStatus;
  metaTemplateId?: string | null;
  metaStatus?: string | null;
  metaQualityRating?: string | null;
  whatsappBusinessAccountId?: string | null;
  phoneNumberId?: string | null;
  usableInsideWindow?: boolean;
  usableOutsideWindow?: boolean;
  metadata?: Record<string, unknown>;
}

export interface WhatsAppTemplateSyncResult {
  ok: boolean;
  fetched: number;
  inserted: number;
  updated: number;
}

export type WhatsAppAnalyticsRange = "today" | "7d" | "30d" | "all";

export interface WhatsAppBreakdownItem {
  label: string;
  value: number;
}

export interface WhatsAppAnalyticsSummary {
  range: WhatsAppAnalyticsRange;
  totalConversations: number;
  conversationsToday: number;
  openConversations: number;
  conversationsNeedingHuman: number;
  unreadConversations: number;
  activeServiceWindows: number;
  expiredServiceWindows: number;
  inboundMessages: number;
  outboundMessages: number;
  messagesSentToday: number;
  messagesReceivedToday: number;
  failedOutboundMessages: number;
  suppressedNumbers: number;
  activeTemplates: number;
  pendingAiSuggestions: number;
  approvedAiSuggestions: number;
  rejectedAiSuggestions: number;
  campaignAttributedConversations: number | null;
  costPerConversation: number | null;
  costPerQualifiedLead: number | null;
  conversationsBySource: WhatsAppBreakdownItem[];
  conversationsByStage: WhatsAppBreakdownItem[];
  conversationsByCampaign: WhatsAppBreakdownItem[];
  conversationsByClient: WhatsAppBreakdownItem[];
  conversationsByProspectSource: WhatsAppBreakdownItem[];
  messagesByDirection: WhatsAppBreakdownItem[];
  messagesByStatus: WhatsAppBreakdownItem[];
}

export interface WhatsAppCampaignLead {
  id: string;
  conversationId: string;
  campaignId: string;
  campaignName: string;
  campaignStatus: string;
  campaignChannel: string | null;
  clientId: string | null;
  clientName: string | null;
  prospectId: string | null;
  businessName: string;
  contactName: string;
  phoneNumber: string;
  source: string;
  stage: string;
  status: string;
  unreadCount: number;
  needsHuman: boolean;
  lastMessage: string;
  lastMessageAt: string | null;
  serviceWindowOpenUntil: string | null;
  prospectSource: string | null;
  prospectStatus: string | null;
  prospectPipelineStage: string | null;
  leadScore: number | null;
  createdAt: string;
}

export type WhatsAppHealthOverallStatus = "healthy" | "warning" | "error";
export type WhatsAppHealthCheckStatus = "configured" | "missing" | "warning";

export interface WhatsAppHealthCheck {
  key: string;
  label: string;
  status: WhatsAppHealthCheckStatus;
  message: string;
}

export interface WhatsAppIntegrationHealth {
  status: WhatsAppHealthOverallStatus;
  checks: WhatsAppHealthCheck[];
  metrics: {
    projectRef: string;
    conversationTableReadable: boolean;
    messageTableReadable: boolean;
    conversationCount: number;
    messageCount: number;
    lastInboundAt: string | null;
    lastOutboundAt: string | null;
    lastFailedSendAt: string | null;
    lastWebhookEventAt: string | null;
    lastSendEventAt: string | null;
    lastAiSuggestionAt: string | null;
    templateCount: number;
    suppressionCount: number;
    aiSuggestionCount: number;
  };
}

export type SuppressionReason =
  | "manual"
  | "opt_out"
  | "not_interested"
  | "wrong_number"
  | "complaint"
  | "duplicate"
  | "invalid_number"
  | "blocked"
  | "other";

export type SuppressionStatus = "active" | "removed" | string;

export interface WhatsAppSuppressionEntry {
  id: string;
  phoneNumber: string;
  normalizedPhoneNumber: string;
  reason: SuppressionReason;
  source: string;
  status: SuppressionStatus;
  prospectId: string | null;
  conversationId: string | null;
  addedBy: string | null;
  removedBy: string | null;
  removedAt: string | null;
  notes?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type SuppressionRecord = WhatsAppSuppressionEntry;

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
