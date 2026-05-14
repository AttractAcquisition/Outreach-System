import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/database.types";
import { normalizePhoneNumber } from "./phone";
import type {
  ConversationSource,
  CrmStage,
  OutreachQueueItem,
  ProspectDetails,
  QueueStatus,
  ServiceWindowStatus,
  SuppressionReason,
  WhatsAppAnalyticsRange,
  WhatsAppAnalyticsSummary,
  WhatsAppBreakdownItem,
  WhatsAppCampaignLead,
  WhatsAppIntegrationHealth,
  WhatsAppTemplate,
  WhatsAppTemplateFormInput,
  WhatsAppTemplateSyncResult,
  WhatsAppSuppressionEntry,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppPendingSuggestion,
  WhatsAppReplySuggestion,
} from "./types";

type ProspectJoin = {
  id: string;
  business_name: string | null;
  owner_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  pipeline_stage: string | null;
  icp_total_score: number | null;
  assigned_to: string | null;
  city: string | null;
  suburb: string | null;
  vertical: string | null;
  created_at: string | null;
  status: string | null;
} | null;

type WhatsAppConversationRow = {
  id: string;
  prospect_id: string | null;
  client_id: string | null;
  campaign_id: string | null;
  phone_number: string;
  contact_name: string | null;
  whatsapp_wa_id: string | null;
  source: string;
  status: string;
  stage: string;
  assigned_to: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  service_window_open_until: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  ai_summary: string | null;
  ai_intent: string | null;
  ai_temperature: string | null;
  needs_human: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  prospects: ProspectJoin;
};

type WhatsAppMessageRow = {
  id: string;
  conversation_id: string;
  prospect_id: string | null;
  client_id: string | null;
  whatsapp_message_id: string | null;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  template_name: string | null;
  template_language: string | null;
  status: string;
  sender_type: "contact" | "human" | "ai" | "system";
  sent_by: string | null;
  ai_generated: boolean;
  human_approved: boolean;
  approval_id: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
};

type SuppressionRow = {
  added_by: string | null;
  conversation_id: string | null;
  created_at: string;
  id: string;
  metadata: Json;
  normalized_phone_number: string;
  notes: string | null;
  phone_number: string;
  prospect_id: string | null;
  reason: string;
  removed_at: string | null;
  removed_by: string | null;
  source: string;
  status: string;
  updated_at: string;
};

type WhatsAppTemplateRow = {
  body: string;
  category: string;
  components: Json;
  created_at: string;
  created_by: string | null;
  display_name: string | null;
  id: string;
  language: string;
  meta_quality_rating: string | null;
  meta_status: string | null;
  meta_template_id: string | null;
  metadata: Json;
  name: string;
  phone_number_id: string | null;
  status: string;
  updated_at: string;
  usable_inside_window: boolean;
  usable_outside_window: boolean;
  variables: Json;
  whatsapp_business_account_id: string | null;
};

type WhatsAppAiSuggestionRow = {
  approved_at: string | null;
  approved_by: string | null;
  client_id: string | null;
  confidence: number | null;
  conversation_id: string;
  created_at: string;
  created_by: string | null;
  id: string;
  metadata: Json;
  model: string | null;
  prospect_id: string | null;
  provider: string | null;
  reason: string | null;
  rejected_at: string | null;
  status: string;
  suggested_body: string;
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
};

type AnalyticsConversationRow = {
  id: string;
  campaign_id: string | null;
  client_id: string | null;
  prospect_id: string | null;
  contact_name: string | null;
  phone_number: string;
  source: string;
  stage: string;
  status: string;
  unread_count: number;
  needs_human: boolean;
  service_window_open_until: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  created_at: string;
  campaigns?: {
    id: string;
    name: string;
    status: string;
    channel: string | null;
  } | null;
  clients?: {
    id: string;
    business_name: string;
  } | null;
  prospects?: {
    id: string;
    business_name: string | null;
    owner_name: string | null;
    data_source: string | null;
    source_list: string | null;
    status: string | null;
    pipeline_stage: string | null;
    icp_total_score: number | null;
  } | null;
};

type AnalyticsMessageRow = {
  id: string;
  direction: string;
  status: string;
  created_at: string;
};

type StatusRow = {
  id: string;
  status: string;
  created_at?: string;
};

export type AddSuppressionEntryInput = {
  phoneNumber: string;
  reason?: SuppressionReason;
  source?: string;
  notes?: string | null;
  prospectId?: string | null;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
};

export type WhatsAppTemplateInput = WhatsAppTemplateFormInput;

function toConversationSource(source: string): ConversationSource {
  switch (source) {
    case "meta_ad":
      return "Meta Ad";
    case "outbound":
      return "Outbound";
    case "manual":
      return "Manual";
    case "website":
      return "Website";
    case "referral":
      return "Referral";
    default:
      return "Unknown";
  }
}

function toCrmStage(stage: string): CrmStage {
  switch (stage) {
    case "needs_reply":
      return "Replied";
    case "qualified":
      return "Qualified";
    case "quoted":
      return "Report Sent";
    case "booked":
      return "Call Booked";
    case "won":
      return "Won";
    case "lost":
      return "Lost";
    case "bad_fit":
      return "Not Interested";
    case "new":
    default:
      return "New";
  }
}

function toServiceWindowStatus(
  serviceWindowOpenUntil: string | null,
): ServiceWindowStatus {
  if (!serviceWindowOpenUntil) return "closed";
  const msLeft = new Date(serviceWindowOpenUntil).getTime() - Date.now();
  if (msLeft <= 0) return "closed";
  if (msLeft < 4 * 60 * 60 * 1000) return "closing_soon";
  return "open";
}

function firstString(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim().length > 0) ?? "";
}

function mapConversation(row: WhatsAppConversationRow): WhatsAppConversation {
  const prospect = row.prospects;
  const contactName = firstString(row.contact_name, prospect?.owner_name);
  const phoneNumber = firstString(row.phone_number, prospect?.whatsapp, prospect?.phone);

  return {
    id: row.id,
    prospect_id: row.prospect_id ?? "",
    client_id: row.client_id,
    campaign_id: row.campaign_id,
    business_name: firstString(prospect?.business_name, contactName, phoneNumber),
    contact_name: contactName || phoneNumber,
    phone_number: phoneNumber,
    source: toConversationSource(row.source),
    source_key: row.source,
    status: row.status,
    stage: row.stage,
    crm_stage: toCrmStage(row.stage),
    lead_score: prospect?.icp_total_score ?? 0,
    assigned_to: row.assigned_to ?? prospect?.assigned_to ?? "",
    last_message: row.last_message_preview ?? "",
    last_message_at: row.last_message_at ?? row.created_at,
    unread_count: row.unread_count,
    last_inbound_at: row.last_inbound_at,
    service_window_expires_at: row.service_window_open_until,
    service_window_status: toServiceWindowStatus(row.service_window_open_until),
    opt_out: row.status === "archived",
    suppressed: row.status === "archived",
    needs_human: row.needs_human,
    ai_summary: row.ai_summary,
    ai_intent: row.ai_intent,
    ai_temperature: row.ai_temperature,
    tags: [row.status, row.stage].filter(Boolean),
    niche: prospect?.vertical ?? undefined,
    location: firstString(prospect?.suburb, prospect?.city) || undefined,
    first_contact_at: row.created_at,
  };
}

export async function getWhatsAppConversations() {
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select(
      `
        *,
        prospects:prospect_id (
          id,
          business_name,
          owner_name,
          phone,
          whatsapp,
          pipeline_stage,
          icp_total_score,
          assigned_to,
          city,
          suburb,
          vertical,
          created_at,
          status
        )
      `,
    )
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as WhatsAppConversationRow[]).map(mapConversation);
}

function toMessageType(type: string): WhatsAppMessage["message_type"] {
  switch (type) {
    case "image":
    case "document":
    case "audio":
    case "video":
    case "template":
    case "interactive":
    case "system":
    case "text":
      return type;
    default:
      return "text";
  }
}

function toMessageStatus(status: string): WhatsAppMessage["status"] {
  switch (status) {
    case "queued":
    case "sent":
    case "delivered":
    case "read":
    case "failed":
    case "received":
      return status;
    default:
      return "received";
  }
}

function mapMessage(row: WhatsAppMessageRow): WhatsAppMessage {
  const messageType = toMessageType(row.message_type);

  return {
    id: row.id,
    conversation_id: row.conversation_id,
    direction: row.sender_type === "system" ? "system" : row.direction,
    message_type: row.ai_generated ? "ai_draft" : messageType,
    body: row.body ?? (row.media_url ? `[${messageType}] ${row.media_url}` : ""),
    media_url: row.media_url,
    media_mime_type: row.media_mime_type,
    template_name: row.template_name ?? undefined,
    template_language: row.template_language,
    status: toMessageStatus(row.status),
    sender_type: row.sender_type,
    ai_generated: row.ai_generated,
    human_approved: row.human_approved,
    approval_id: row.approval_id,
    created_at: row.created_at,
    delivered_at: row.delivered_at,
    read_at: row.read_at,
    meta_message_id: row.whatsapp_message_id ?? undefined,
    error_message: row.error_message ?? undefined,
  };
}

export async function getWhatsAppMessages(conversationId: string) {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as WhatsAppMessageRow[]).map(mapMessage);
}

export async function sendWhatsAppMessage(conversationId: string, body: string) {
  const messageBody = body.trim();

  if (!conversationId) {
    throw new Error("Conversation is required");
  }

  if (!messageBody) {
    throw new Error("Message body is required");
  }

  const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
    body: {
      conversation_id: conversationId,
      body: messageBody,
    },
  });

  if (error) {
    const context = "context" in error ? error.context : null;

    if (context instanceof Response) {
      let functionError: string | null = null;

      try {
        const errorBody = await context.json();
        if (typeof errorBody?.error === "string") {
          functionError = errorBody.error;
        }
      } catch (_parseError) {
        // Fall through to the Supabase Functions error message.
      }

      if (functionError) {
        throw new Error(functionError);
      }
    }

    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.message) {
    throw new Error("WhatsApp message response was empty");
  }

  return mapMessage(data.message as WhatsAppMessageRow);
}

export async function sendWhatsAppTemplateMessage(
  conversationId: string,
  templateId: string,
  parameters: Record<string, string>,
) {
  if (!conversationId) {
    throw new Error("Conversation is required");
  }

  if (!templateId) {
    throw new Error("Template is required");
  }

  const { data, error } = await supabase.functions.invoke(
    "send-whatsapp-template-message",
    {
      body: {
        conversation_id: conversationId,
        template_id: templateId,
        parameters,
      },
    },
  );

  if (error) {
    const functionError = await getFunctionErrorMessage(error);
    throw new Error(functionError ?? error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.message) {
    throw new Error("WhatsApp template message response was empty");
  }

  return mapMessage(data.message as WhatsAppMessageRow);
}

async function getFunctionErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "context" in error &&
    (error as { context?: unknown }).context instanceof Response
  ) {
    try {
      const errorBody = await (error as { context: Response }).context.json();
      if (typeof errorBody?.error === "string") {
        return errorBody.error;
      }
    } catch (_parseError) {
      return null;
    }
  }

  return null;
}

export async function generateWhatsAppReplySuggestion(
  conversationId: string,
): Promise<WhatsAppReplySuggestion> {
  if (!conversationId) {
    throw new Error("Conversation is required");
  }

  const { data, error } = await supabase.functions.invoke(
    "generate-whatsapp-reply-suggestion",
    {
      body: {
        conversation_id: conversationId,
      },
    },
  );

  if (error) {
    const functionError = await getFunctionErrorMessage(error);
    throw new Error(functionError ?? error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.suggested_body) {
    throw new Error("AI suggestion response was empty");
  }

  return {
    suggestion_id: data.suggestion_id ?? null,
    suggested_body: String(data.suggested_body),
    reason: typeof data.reason === "string" ? data.reason : "",
    confidence:
      typeof data.confidence === "number"
        ? data.confidence
        : Number(data.confidence ?? 0),
  };
}

function asRecord(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: Json): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: Json): string[] {
  return asArray(value).filter((item): item is string => typeof item === "string");
}

function getAnalyticsBounds(range: WhatsAppAnalyticsRange) {
  const now = new Date();
  const end = now.toISOString();

  if (range === "all") {
    return { start: null as string | null, end };
  }

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end };
  }

  const days = range === "30d" ? 30 : 7;
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return { start: start.toISOString(), end };
}

function applyCreatedAtRange<T>(
  query: T,
  range: { start: string | null; end: string },
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ranged = query as any;
  if (range.start) {
    ranged = ranged.gte("created_at", range.start);
  }
  return ranged.lte("created_at", range.end) as T;
}

function countBy<T>(
  rows: T[],
  getLabel: (row: T) => string | null | undefined,
): WhatsAppBreakdownItem[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const rawLabel = getLabel(row)?.trim();
    const label = rawLabel || "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function isToday(value: string | null | undefined) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

async function getAnalyticsConversations(
  range: { start: string | null; end: string },
  includeJoins = false,
) {
  const select = includeJoins
    ? `
        id,
        campaign_id,
        client_id,
        prospect_id,
        contact_name,
        phone_number,
        source,
        stage,
        status,
        unread_count,
        needs_human,
        service_window_open_until,
        last_message_preview,
        last_message_at,
        created_at,
        campaigns:campaign_id (
          id,
          name,
          status,
          channel
        ),
        clients:client_id (
          id,
          business_name
        ),
        prospects:prospect_id (
          id,
          business_name,
          owner_name,
          data_source,
          source_list,
          status,
          pipeline_stage,
          icp_total_score
        )
      `
    : "id, campaign_id, client_id, prospect_id, source, stage, status, unread_count, needs_human, service_window_open_until, created_at";

  let query = supabase.from("whatsapp_conversations").select(select);
  query = applyCreatedAtRange(query, range);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AnalyticsConversationRow[];
}

async function getAllAnalyticsConversations() {
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("id, campaign_id, client_id, prospect_id, source, stage, status, unread_count, needs_human, service_window_open_until, created_at");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AnalyticsConversationRow[];
}

async function getAnalyticsMessages(range: { start: string | null; end: string }) {
  let query = supabase
    .from("whatsapp_messages")
    .select("id, direction, status, created_at");
  query = applyCreatedAtRange(query, range);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AnalyticsMessageRow[];
}

async function getStatusRows(
  table:
    | "whatsapp_suppression_list"
    | "whatsapp_templates"
    | "whatsapp_ai_suggestions",
  range?: { start: string | null; end: string },
) {
  let query = supabase.from(table).select("id, status, created_at");
  if (range) {
    query = applyCreatedAtRange(query, range);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StatusRow[];
}

export async function getWhatsAppAnalytics(
  range: WhatsAppAnalyticsRange = "7d",
): Promise<WhatsAppAnalyticsSummary> {
  const bounds = getAnalyticsBounds(range);
  const now = new Date();

  const [
    allConversations,
    rangeConversations,
    messages,
    suppressionRows,
    templateRows,
    suggestionRows,
  ] = await Promise.all([
    getAllAnalyticsConversations(),
    getAnalyticsConversations(bounds, true),
    getAnalyticsMessages(bounds),
    getStatusRows("whatsapp_suppression_list"),
    getStatusRows("whatsapp_templates"),
    getStatusRows("whatsapp_ai_suggestions", bounds),
  ]);

  const inboundMessages = messages.filter((message) => message.direction === "inbound");
  const outboundMessages = messages.filter((message) => message.direction === "outbound");
  const activeServiceWindows = allConversations.filter((conversation) => {
    if (!conversation.service_window_open_until) return false;
    const expiresAt = new Date(conversation.service_window_open_until);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt > now;
  }).length;
  const expiredServiceWindows = allConversations.filter((conversation) => {
    if (!conversation.service_window_open_until) return false;
    const expiresAt = new Date(conversation.service_window_open_until);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt <= now;
  }).length;
  const campaignAttributed = rangeConversations.filter(
    (conversation) => Boolean(conversation.campaign_id),
  );

  return {
    range,
    totalConversations: allConversations.length,
    conversationsToday: allConversations.filter((conversation) =>
      isToday(conversation.created_at),
    ).length,
    openConversations: allConversations.filter(
      (conversation) => conversation.status === "open",
    ).length,
    conversationsNeedingHuman: allConversations.filter(
      (conversation) => conversation.needs_human,
    ).length,
    unreadConversations: allConversations.filter(
      (conversation) => conversation.unread_count > 0,
    ).length,
    activeServiceWindows,
    expiredServiceWindows,
    inboundMessages: inboundMessages.length,
    outboundMessages: outboundMessages.length,
    messagesSentToday: outboundMessages.filter((message) =>
      isToday(message.created_at),
    ).length,
    messagesReceivedToday: inboundMessages.filter((message) =>
      isToday(message.created_at),
    ).length,
    failedOutboundMessages: outboundMessages.filter(
      (message) => message.status === "failed",
    ).length,
    suppressedNumbers: suppressionRows.filter((row) => row.status === "active").length,
    activeTemplates: templateRows.filter((row) => row.status !== "archived").length,
    pendingAiSuggestions: suggestionRows.filter((row) =>
      ["pending_review", "pending"].includes(row.status),
    ).length,
    approvedAiSuggestions: suggestionRows.filter((row) => row.status === "approved")
      .length,
    rejectedAiSuggestions: suggestionRows.filter((row) => row.status === "rejected")
      .length,
    campaignAttributedConversations: campaignAttributed.length,
    costPerConversation: null,
    costPerQualifiedLead: null,
    conversationsBySource: countBy(rangeConversations, (row) => row.source),
    conversationsByStage: countBy(rangeConversations, (row) => row.stage),
    conversationsByCampaign: countBy(
      campaignAttributed,
      (row) => row.campaigns?.name ?? row.campaign_id,
    ),
    conversationsByClient: countBy(
      rangeConversations.filter((row) => Boolean(row.client_id)),
      (row) => row.clients?.business_name ?? row.client_id,
    ),
    conversationsByProspectSource: countBy(
      rangeConversations.filter((row) => Boolean(row.prospect_id)),
      (row) => row.prospects?.data_source ?? row.prospects?.source_list,
    ),
    messagesByDirection: countBy(messages, (row) => row.direction),
    messagesByStatus: countBy(messages, (row) => row.status),
  };
}

function mapCampaignLead(row: AnalyticsConversationRow): WhatsAppCampaignLead {
  const prospect = row.prospects;
  const client = row.clients;
  const campaign = row.campaigns;
  const businessName = firstString(
    prospect?.business_name,
    row.contact_name,
    client?.business_name,
    row.phone_number,
  );
  const contactName = firstString(prospect?.owner_name, row.contact_name, row.phone_number);

  return {
    id: row.id,
    conversationId: row.id,
    campaignId: row.campaign_id ?? "",
    campaignName: campaign?.name ?? row.campaign_id ?? "Unknown campaign",
    campaignStatus: campaign?.status ?? "unknown",
    campaignChannel: campaign?.channel ?? null,
    clientId: row.client_id,
    clientName: client?.business_name ?? null,
    prospectId: row.prospect_id,
    businessName,
    contactName,
    phoneNumber: row.phone_number,
    source: row.source,
    stage: row.stage,
    status: row.status,
    unreadCount: row.unread_count,
    needsHuman: row.needs_human,
    lastMessage: row.last_message_preview ?? "",
    lastMessageAt: row.last_message_at,
    serviceWindowOpenUntil: row.service_window_open_until,
    prospectSource: prospect?.data_source ?? prospect?.source_list ?? null,
    prospectStatus: prospect?.status ?? null,
    prospectPipelineStage: prospect?.pipeline_stage ?? null,
    leadScore: prospect?.icp_total_score ?? null,
    createdAt: row.created_at,
  };
}

export async function getWhatsAppCampaignLeads(
  range: WhatsAppAnalyticsRange = "7d",
) {
  const bounds = getAnalyticsBounds(range);
  const rows = await getAnalyticsConversations(bounds, true);

  return rows
    .filter((row) => Boolean(row.campaign_id))
    .map(mapCampaignLead);
}

export async function getWhatsAppIntegrationHealth() {
  const { data, error } = await supabase.functions.invoke(
    "whatsapp-integration-health",
    { body: {} },
  );

  if (error) {
    const functionError = await getFunctionErrorMessage(error);
    throw new Error(functionError ?? error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as WhatsAppIntegrationHealth;
}

export async function syncWhatsAppTemplates(): Promise<WhatsAppTemplateSyncResult> {
  const { data, error } = await supabase.functions.invoke(
    "sync-whatsapp-templates",
    { body: {} },
  );

  if (error) {
    const functionError = await getFunctionErrorMessage(error);
    throw new Error(functionError ?? error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    ok: Boolean(data?.ok),
    fetched: Number(data?.fetched ?? 0),
    inserted: Number(data?.inserted ?? 0),
    updated: Number(data?.updated ?? 0),
  };
}

function mapPendingSuggestion(
  row: WhatsAppAiSuggestionRow,
): WhatsAppPendingSuggestion {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    prospect_id: row.prospect_id,
    client_id: row.client_id,
    suggested_body: row.suggested_body,
    reason: row.reason,
    confidence: row.confidence,
    status: row.status,
    provider: row.provider,
    model: row.model,
    created_by: row.created_by,
    approved_by: row.approved_by,
    approved_at: row.approved_at,
    rejected_at: row.rejected_at,
    metadata: asRecord(row.metadata),
    created_at: row.created_at,
    updated_at: row.updated_at,
    conversation: row.conversation ?? null,
    prospect: row.prospect ?? null,
  };
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required");
  }

  return user.id;
}

async function getSuggestionMetadata(id: string) {
  const { data, error } = await supabase
    .from("whatsapp_ai_suggestions")
    .select("metadata")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return asRecord(data.metadata);
}

export async function getWhatsAppPendingSuggestions() {
  const { data, error } = await supabase
    .from("whatsapp_ai_suggestions")
    .select(
      `
        *,
        conversation:whatsapp_conversations!whatsapp_ai_suggestions_conversation_id_fkey (
          id,
          contact_name,
          phone_number,
          status,
          stage,
          last_message_preview,
          last_message_at,
          service_window_open_until
        ),
        prospect:prospects!whatsapp_ai_suggestions_prospect_id_fkey (
          id,
          business_name,
          owner_name,
          phone,
          whatsapp,
          vertical,
          city,
          suburb,
          pipeline_stage,
          icp_total_score,
          status
        )
      `,
    )
    .in("status", ["pending_review", "pending"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as WhatsAppAiSuggestionRow[]).map(mapPendingSuggestion);
}

export async function approveWhatsAppSuggestion(id: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("whatsapp_ai_suggestions")
    .update({
      status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
      rejected_at: null,
    })
    .eq("id", id)
    .in("status", ["pending_review", "pending"])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPendingSuggestion(data as WhatsAppAiSuggestionRow);
}

export async function rejectWhatsAppSuggestion(id: string, reason?: string) {
  const metadata = await getSuggestionMetadata(id);
  const rejectionReason = reason?.trim() || null;

  const { data, error } = await supabase
    .from("whatsapp_ai_suggestions")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
      metadata: {
        ...metadata,
        rejection_reason: rejectionReason,
      } as Json,
    })
    .eq("id", id)
    .in("status", ["pending_review", "pending", "approved"])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPendingSuggestion(data as WhatsAppAiSuggestionRow);
}

export async function markWhatsAppSuggestionUsed(id: string) {
  const userId = await getCurrentUserId();
  const metadata = await getSuggestionMetadata(id);
  const usedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("whatsapp_ai_suggestions")
    .update({
      status: "used",
      approved_by: userId,
      approved_at: usedAt,
      metadata: {
        ...metadata,
        used_at: usedAt,
      } as Json,
    })
    .eq("id", id)
    .in("status", ["pending_review", "pending", "approved"])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPendingSuggestion(data as WhatsAppAiSuggestionRow);
}

function mapSuppression(row: SuppressionRow): WhatsAppSuppressionEntry {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    normalizedPhoneNumber: row.normalized_phone_number,
    reason: row.reason as SuppressionReason,
    source: row.source,
    status: row.status,
    prospectId: row.prospect_id,
    conversationId: row.conversation_id,
    addedBy: row.added_by,
    removedBy: row.removed_by,
    removedAt: row.removed_at,
    notes: row.notes ?? undefined,
    metadata: asRecord(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSuppressionList() {
  const { data, error } = await supabase
    .from("whatsapp_suppression_list")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SuppressionRow[]).map(mapSuppression);
}

export async function addSuppressionEntry(input: AddSuppressionEntryInput) {
  const normalizedPhoneNumber = normalizePhoneNumber(input.phoneNumber);

  if (!normalizedPhoneNumber) {
    throw new Error("Phone number is required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("whatsapp_suppression_list")
    .insert({
      phone_number: input.phoneNumber.trim(),
      normalized_phone_number: normalizedPhoneNumber,
      reason: input.reason ?? "manual",
      source: input.source ?? "manual",
      status: "active",
      prospect_id: input.prospectId ?? null,
      conversation_id: input.conversationId ?? null,
      added_by: user?.id ?? null,
      notes: input.notes?.trim() || null,
      metadata: (input.metadata ?? {}) as Json,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSuppression(data as SuppressionRow);
}

export async function removeSuppressionEntry(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("whatsapp_suppression_list")
    .update({
      status: "removed",
      removed_at: new Date().toISOString(),
      removed_by: user?.id ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSuppression(data as SuppressionRow);
}

export async function isPhoneSuppressed(normalizedPhoneNumber: string) {
  if (!normalizedPhoneNumber) return false;

  const { data, error } = await supabase
    .from("whatsapp_suppression_list")
    .select("id")
    .eq("normalized_phone_number", normalizedPhoneNumber)
    .eq("status", "active")
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).length > 0;
}

function mapTemplate(row: WhatsAppTemplateRow): WhatsAppTemplate {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    category: row.category,
    language: row.language,
    body: row.body,
    variables: asStringArray(row.variables),
    components: asArray(row.components),
    status: row.status,
    metaTemplateId: row.meta_template_id,
    metaStatus: row.meta_status,
    metaQualityRating: row.meta_quality_rating,
    whatsappBusinessAccountId: row.whatsapp_business_account_id,
    phoneNumberId: row.phone_number_id,
    usableInsideWindow: row.usable_inside_window,
    usableOutsideWindow: row.usable_outside_window,
    createdBy: row.created_by,
    metadata: asRecord(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildTemplatePayload(input: WhatsAppTemplateInput) {
  return {
    name: input.name.trim(),
    display_name: input.displayName?.trim() || null,
    category: input.category ?? "utility",
    language: input.language?.trim() || "en",
    body: input.body,
    variables: input.variables as Json,
    components: (input.components ?? []) as Json,
    status: input.status ?? "draft",
    meta_template_id: input.metaTemplateId?.trim() || null,
    meta_status: input.metaStatus?.trim() || null,
    meta_quality_rating: input.metaQualityRating?.trim() || null,
    whatsapp_business_account_id: input.whatsappBusinessAccountId?.trim() || null,
    phone_number_id: input.phoneNumberId?.trim() || null,
    usable_inside_window: input.usableInsideWindow ?? true,
    usable_outside_window: input.usableOutsideWindow ?? false,
    metadata: (input.metadata ?? {}) as Json,
  };
}

export async function getWhatsAppTemplates() {
  const { data, error } = await supabase
    .from("whatsapp_templates")
    .select("*")
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as WhatsAppTemplateRow[]).map(mapTemplate);
}

export async function createWhatsAppTemplate(input: WhatsAppTemplateInput) {
  const payload = buildTemplatePayload(input);

  if (!payload.name) {
    throw new Error("Template name is required");
  }

  if (!payload.body.trim()) {
    throw new Error("Template body is required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("whatsapp_templates")
    .insert({
      ...payload,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTemplate(data as WhatsAppTemplateRow);
}

export async function updateWhatsAppTemplate(
  id: string,
  input: Partial<WhatsAppTemplateInput>,
) {
  const payload: Record<string, Json | string | boolean | null> = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.displayName !== undefined) {
    payload.display_name = input.displayName?.trim() || null;
  }
  if (input.category !== undefined) payload.category = input.category;
  if (input.language !== undefined) payload.language = input.language.trim() || "en";
  if (input.body !== undefined) payload.body = input.body;
  if (input.variables !== undefined) payload.variables = input.variables as Json;
  if (input.components !== undefined) payload.components = input.components as Json;
  if (input.status !== undefined) payload.status = input.status;
  if (input.metaTemplateId !== undefined) {
    payload.meta_template_id = input.metaTemplateId?.trim() || null;
  }
  if (input.metaStatus !== undefined) {
    payload.meta_status = input.metaStatus?.trim() || null;
  }
  if (input.metaQualityRating !== undefined) {
    payload.meta_quality_rating = input.metaQualityRating?.trim() || null;
  }
  if (input.whatsappBusinessAccountId !== undefined) {
    payload.whatsapp_business_account_id =
      input.whatsappBusinessAccountId?.trim() || null;
  }
  if (input.phoneNumberId !== undefined) {
    payload.phone_number_id = input.phoneNumberId?.trim() || null;
  }
  if (input.usableInsideWindow !== undefined) {
    payload.usable_inside_window = input.usableInsideWindow;
  }
  if (input.usableOutsideWindow !== undefined) {
    payload.usable_outside_window = input.usableOutsideWindow;
  }
  if (input.metadata !== undefined) payload.metadata = input.metadata as Json;

  if (typeof payload.name === "string" && !payload.name) {
    throw new Error("Template name is required");
  }

  if (typeof payload.body === "string" && !payload.body.trim()) {
    throw new Error("Template body is required");
  }

  const { data, error } = await supabase
    .from("whatsapp_templates")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTemplate(data as WhatsAppTemplateRow);
}

export async function archiveWhatsAppTemplate(id: string) {
  return updateWhatsAppTemplate(id, { status: "archived" });
}

// ─── Outreach queue ───────────────────────────────────────────────

type OutreachQueueRow = {
  id: string;
  prospect_id: string;
  conversation_id: string | null;
  company_name: string | null;
  contact_name: string | null;
  phone_number: string | null;
  drafted_message: string | null;
  quality_score: number | null;
  status: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  metadata: Json;
};

function toQueueStatus(status: string): QueueStatus {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_review":
    case "pending_approval":
      return "Pending Approval";
    case "approved":
      return "Approved";
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    default:
      return "Cancelled";
  }
}

function mapOutreachQueueItem(row: OutreachQueueRow): OutreachQueueItem {
  return {
    id: row.id,
    prospect_id: row.prospect_id,
    business_name: row.company_name ?? "",
    contact_name: row.contact_name ?? "",
    phone_number: row.phone_number ?? "",
    niche: "",
    location: "",
    template_name: "",
    template_params: {},
    draft_preview: row.drafted_message ?? "",
    ai_observation: "",
    risk_score: row.quality_score ?? 0,
    compliance_status: "ok",
    status: toQueueStatus(row.status),
    created_at: row.created_at,
    created_by: "",
    approved_by: row.approved_by ?? undefined,
    approved_at: row.approved_at ?? undefined,
    sent_at: row.sent_at ?? undefined,
    error_message: row.error_message ?? undefined,
  };
}

export async function getOutreachQueue(): Promise<OutreachQueueItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("whatsapp_outreach_queue")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as OutreachQueueRow[]).map(mapOutreachQueueItem);
}

export async function approveOutreachQueueItem(id: string) {
  let userId: string | null = null;
  try {
    userId = await getCurrentUserId();
  } catch {
    // No auth session — proceed with null approved_by
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("whatsapp_outreach_queue")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: userId,
    })
    .eq("id", id)
    .select("conversation_id, drafted_message")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const conversationId = (data as OutreachQueueRow).conversation_id;
  const body = (data as OutreachQueueRow).drafted_message;

  if (conversationId && body) {
    const { error: fnError } = await supabase.functions.invoke(
      "send-whatsapp-message",
      { body: { conversation_id: conversationId, body } },
    );

    if (fnError) {
      const msg = await getFunctionErrorMessage(fnError);
      throw new Error(msg ?? fnError.message);
    }
  }
}

export async function rejectOutreachQueueItem(id: string, reason?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("whatsapp_outreach_queue")
    .update({
      status: "rejected",
      ...(reason?.trim() ? { metadata: { rejection_reason: reason.trim() } } : {}),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── CRM stage ────────────────────────────────────────────────────

function fromCrmStage(stage: CrmStage): string {
  switch (stage) {
    case "Replied":
      return "needs_reply";
    case "Qualified":
      return "qualified";
    case "Report Requested":
    case "Report Sent":
      return "quoted";
    case "Call Booked":
    case "Proof Sprint Offered":
      return "booked";
    case "Won":
      return "won";
    case "Lost":
      return "lost";
    case "Not Interested":
    case "Do Not Contact":
      return "bad_fit";
    default:
      return "new";
  }
}

function crmStageToProspectStatus(stage: CrmStage): string {
  switch (stage) {
    case "Won":
      return "won";
    case "Lost":
      return "lost";
    case "Not Interested":
      return "not_interested";
    case "Do Not Contact":
      return "do_not_contact";
    case "Qualified":
      return "qualified";
    case "Call Booked":
    case "Proof Sprint Offered":
      return "booked";
    default:
      return "active";
  }
}

export async function updateConversationStage(
  conversationId: string,
  stage: CrmStage,
) {
  const dbStage = fromCrmStage(stage);

  const { data: conv, error: convError } = await supabase
    .from("whatsapp_conversations")
    .update({ stage: dbStage })
    .eq("id", conversationId)
    .select("prospect_id")
    .single();

  if (convError) {
    throw new Error(convError.message);
  }

  if (conv.prospect_id) {
    // Route through AICOS Edge Function — Outreach-System must not write to prospects directly
    await supabase.functions.invoke("update-prospect-from-conversation", {
      body: { conversation_id: conversationId, stage: dbStage },
    });
  }
}

// ─── Do Not Contact ───────────────────────────────────────────────

export async function markProspectDoNotContact(
  prospectId: string,
  phone: string,
  reason = "manual",
) {
  const normalizedPhone = normalizePhoneNumber(phone);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: suppressError } = await supabase
    .from("whatsapp_suppression_list")
    .insert({
      phone_number: phone.trim(),
      normalized_phone_number: normalizedPhone || phone.trim(),
      reason: reason as SuppressionReason,
      source: "ui",
      status: "active",
      prospect_id: prospectId,
      added_by: user?.id ?? null,
      metadata: {} as Json,
    });

  if (suppressError) {
    throw new Error(suppressError.message);
  }

  // Prospect status is set to 'do_not_contact' automatically via the
  // handle_suppression_insert DB trigger — no direct write needed here.
}

// ─── Internal notes ───────────────────────────────────────────────

export async function saveConversationNote(
  conversationId: string,
  note: string,
) {
  const userId = await getCurrentUserId();

  const { data: existing, error: fetchError } = await supabase
    .from("whatsapp_conversations")
    .select("metadata")
    .eq("id", conversationId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const metadata = asRecord(existing.metadata as Json);
  const existingNotes = Array.isArray(metadata.internal_notes)
    ? (metadata.internal_notes as unknown[])
    : [];

  const newNote = {
    text: note.trim(),
    created_at: new Date().toISOString(),
    created_by: userId,
  };

  const { error: updateError } = await supabase
    .from("whatsapp_conversations")
    .update({
      metadata: {
        ...metadata,
        internal_notes: [...existingNotes, newNote],
      } as Json,
    })
    .eq("id", conversationId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

// ─── Prospect ─────────────────────────────────────────────────────

export async function getProspect(prospectId: string): Promise<ProspectDetails> {
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", prospectId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    business_name: data.business_name,
    contact_name: data.owner_name ?? "",
    phone_number: data.whatsapp ?? data.phone ?? "",
    location: firstString(data.suburb, data.city),
    niche: data.vertical ?? "",
    source: "Unknown" as ConversationSource,
    assigned_owner: data.assigned_to ?? "",
    first_contact_at: data.created_at,
    last_inbound_at: null,
    qualification: {
      google_listing: "unknown",
      instagram_active: Boolean(data.instagram_handle),
      meta_ads_running: data.meta_ads_running,
      website_quality: "average",
      reviews_count: data.google_review_count ?? 0,
      reviews_rating: data.google_rating ?? 0,
      main_gap: "",
      suggested_angle: "",
    },
    compliance: {
      opt_out: false,
      suppressed: false,
      consent_note: "",
    },
    internal_notes: "",
  };
}
