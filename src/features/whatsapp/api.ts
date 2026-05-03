import { supabase } from "@/integrations/supabase/client";
import type {
  ConversationSource,
  CrmStage,
  ServiceWindowStatus,
  WhatsAppConversation,
  WhatsAppMessage,
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
  const { data, error } = await (supabase as any)
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

  const { data, error } = await (supabase as any)
    .from("whatsapp_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as WhatsAppMessageRow[]).map(mapMessage);
}
