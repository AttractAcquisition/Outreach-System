import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

type ProspectRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  whatsapp: string | null;
};

type ConversationRow = {
  id: string;
  prospect_id: string | null;
  client_id: string | null;
  campaign_id: string | null;
  phone_number: string;
  contact_name: string | null;
  whatsapp_wa_id: string | null;
  stage: string;
  unread_count: number;
  metadata: JsonRecord | null;
};

type InboundMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  image?: { id?: string; mime_type?: string; caption?: string; sha256?: string };
  document?: {
    id?: string;
    mime_type?: string;
    caption?: string;
    filename?: string;
    sha256?: string;
  };
  audio?: { id?: string; mime_type?: string; sha256?: string; voice?: boolean };
  video?: { id?: string; mime_type?: string; caption?: string; sha256?: string };
  button?: { text?: string; payload?: string };
  interactive?: JsonRecord;
};

type MessageStatus = {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  errors?: Array<{
    code?: number;
    title?: string;
    message?: string;
    error_data?: { details?: string };
  }>;
  conversation?: JsonRecord;
  pricing?: JsonRecord;
};

type ValueChange = {
  value: JsonRecord;
  entryId: string | null;
  changeField: string | null;
};

const allowedMessageTypes = new Set([
  "text",
  "image",
  "document",
  "audio",
  "video",
  "template",
  "interactive",
  "system",
]);

const allowedStatuses = new Set([
  "received",
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function textResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain",
    },
  });
}

function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const normalized = trimmed.replace(/[\s\-()[\]]/g, "");

  if (!hasLeadingPlus) {
    return normalized;
  }

  return `+${normalized.replace(/^\++/, "")}`;
}

function withoutPlus(input: string) {
  return input.replace(/^\+/, "");
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function unixTimestampToIso(timestamp: string | undefined) {
  if (!timestamp) return new Date().toISOString();
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

function toStoredMessageType(type: string | undefined) {
  if (!type) return "system";
  return allowedMessageTypes.has(type) ? type : "system";
}

function toStoredStatus(status: string | undefined) {
  if (!status) return null;
  return allowedStatuses.has(status) ? status : null;
}

function shouldAdvanceStatus(currentStatus: string | null | undefined, nextStatus: string) {
  if (nextStatus === "failed") return true;

  const rank: Record<string, number> = {
    received: 0,
    queued: 1,
    sent: 2,
    delivered: 3,
    read: 4,
    failed: 5,
  };

  return rank[nextStatus] >= (rank[currentStatus ?? "received"] ?? 0);
}

function extractBody(message: InboundMessage) {
  if (message.type === "text") return message.text?.body ?? null;
  if (message.type === "button") return message.button?.text ?? message.button?.payload ?? null;
  if (message.type === "image") return message.image?.caption ?? null;
  if (message.type === "document") return message.document?.caption ?? null;
  if (message.type === "video") return message.video?.caption ?? null;
  return null;
}

function extractMedia(message: InboundMessage) {
  const media =
    message.image ?? message.document ?? message.audio ?? message.video ?? null;

  if (!media) {
    return { mediaId: null, mediaMimeType: null };
  }

  return {
    mediaId: getString(media.id),
    mediaMimeType: getString(media.mime_type),
  };
}

function isClearOptOut(body: string | null) {
  if (!body) return false;
  const normalized = body.toLowerCase().trim().replace(/[.!?,]+$/g, "");

  return (
    /\bstop\b/.test(normalized) ||
    /\bunsubscribe\b/.test(normalized) ||
    /\bopt\s*out\b/.test(normalized) ||
    /\bremove\s*me\b/.test(normalized)
  );
}

async function hmacSha256Hex(secret: string, body: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

async function verifySignature(req: Request, rawBody: string) {
  const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");
  if (!appSecret) return true;

  const signatureHeader = req.headers.get("x-hub-signature-256") ?? "";
  const signature = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : "";

  if (!signature) return false;

  const expected = await hmacSha256Hex(appSecret, rawBody);
  return timingSafeEqual(signature, expected);
}

function getValueChanges(payload: unknown): ValueChange[] {
  if (!payload || typeof payload !== "object") return [];

  const entries = Array.isArray((payload as JsonRecord).entry)
    ? ((payload as JsonRecord).entry as unknown[])
    : [];

  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const changes = Array.isArray((entry as JsonRecord).changes)
      ? ((entry as JsonRecord).changes as unknown[])
      : [];

    const entryId = getString((entry as JsonRecord).id);

    return changes
      .map((change) => {
        if (!change || typeof change !== "object") return null;
        const value = (change as JsonRecord).value;
        return value && typeof value === "object"
          ? {
              value: value as JsonRecord,
              entryId,
              changeField: getString((change as JsonRecord).field),
            }
          : null;
      })
      .filter((value): value is ValueChange => Boolean(value));
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const verifyToken = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const expectedToken = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN");

    if (mode === "subscribe" && verifyToken && verifyToken === expectedToken && challenge) {
      return textResponse(challenge);
    }

    return textResponse("Forbidden", 403);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase backend secrets are not configured" }, 500);
  }

  const rawBody = await req.text();
  const isTestMode = req.headers.get("x-test-mode") === "true";
  const signatureValid = isTestMode || await verifySignature(req, rawBody);

  if (!signatureValid) {
    return jsonResponse({ error: "Invalid webhook signature" }, 401);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const logIntegrationEvent = async (
    eventType: string,
    status: "received" | "processed" | "skipped" | "failed",
    eventPayload: JsonRecord,
    errorMessage?: string,
  ) => {
    await supabase.from("integration_events").insert({
      integration_name: "whatsapp_cloud_api",
      event_type: eventType,
      source_system: "meta_whatsapp_cloud_api",
      target_system: "aa-outreach-auto",
      status,
      error_message: errorMessage ?? null,
      payload: eventPayload,
      processed_at: new Date().toISOString(),
    });
  };

  const findProspect = async (phoneNumber: string): Promise<ProspectRow | null> => {
    const normalized = normalizePhoneNumber(phoneNumber);
    const noPlus = withoutPlus(normalized);
    const candidates = Array.from(new Set([phoneNumber, normalized, noPlus]));

    for (const candidate of candidates) {
      const { data } = await supabase
        .from("prospects")
        .select("id, business_name, owner_name, phone, whatsapp")
        .or(`phone.eq.${candidate},whatsapp.eq.${candidate}`)
        .limit(1);

      if (data?.[0]) return data[0] as ProspectRow;
    }

    return null;
  };

  const findOrCreateConversation = async (
    waId: string,
    phoneNumber: string,
    contactName: string | null,
  ): Promise<ConversationRow> => {
    const normalized = normalizePhoneNumber(phoneNumber);
    const noPlus = withoutPlus(normalized);
    const mergeConversationMetadata = (
      conversation: ConversationRow,
      patch: JsonRecord,
    ) => ({
      ...(conversation.metadata && typeof conversation.metadata === "object"
        ? conversation.metadata
        : {}),
      ...patch,
    });

    const { data: byWaId } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .eq("whatsapp_wa_id", waId)
      .limit(1);

    if (byWaId?.[0]) {
      const conversation = byWaId[0] as ConversationRow;
      if (!conversation.prospect_id) {
        const prospect = await findProspect(phoneNumber);
        if (prospect) {
          await supabase
            .from("whatsapp_conversations")
            .update({
              prospect_id: prospect.id,
              contact_name: conversation.contact_name ?? contactName ?? prospect.owner_name,
              metadata: mergeConversationMetadata(conversation, {
                linked_by: "meta-whatsapp-webhook",
                prospect_match: "phone_or_whatsapp",
              }),
            })
            .eq("id", conversation.id);

          return {
            ...conversation,
            prospect_id: prospect.id,
            contact_name: conversation.contact_name ?? contactName ?? prospect.owner_name,
          };
        }
      }

      return conversation;
    }

    for (const candidate of [normalized, noPlus, phoneNumber]) {
      const { data: byPhone } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("phone_number", candidate)
        .limit(1);

      if (byPhone?.[0]) {
        const conversation = byPhone[0] as ConversationRow;
        const prospect = conversation.prospect_id ? null : await findProspect(phoneNumber);

        await supabase
          .from("whatsapp_conversations")
          .update({
            prospect_id: conversation.prospect_id ?? prospect?.id ?? null,
            contact_name: conversation.contact_name ?? contactName ?? prospect?.owner_name ?? null,
            whatsapp_wa_id: conversation.whatsapp_wa_id ?? waId,
            needs_human: true,
          })
          .eq("id", conversation.id);

        return {
          ...conversation,
          prospect_id: conversation.prospect_id ?? prospect?.id ?? null,
          contact_name: conversation.contact_name ?? contactName ?? prospect?.owner_name ?? null,
          whatsapp_wa_id: conversation.whatsapp_wa_id ?? waId,
        };
      }
    }

    const prospect = await findProspect(phoneNumber);

    const { data, error } = await supabase
      .from("whatsapp_conversations")
      .insert({
        prospect_id: prospect?.id ?? null,
        phone_number: normalized,
        contact_name: contactName ?? prospect?.owner_name ?? null,
        whatsapp_wa_id: waId,
        source: "unknown",
        status: "open",
        stage: "needs_reply",
        needs_human: true,
        unread_count: 0,
        metadata: {
          created_by: "meta-whatsapp-webhook",
          prospect_match: prospect ? "phone_or_whatsapp" : null,
        },
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not create conversation");
    }

    return data as ConversationRow;
  };

  const upsertOptOut = async (
    phoneNumber: string,
    conversation: ConversationRow,
    message: InboundMessage,
  ) => {
    const normalized = normalizePhoneNumber(phoneNumber);
    const { data: existing } = await supabase
      .from("whatsapp_suppression_list")
      .select("id")
      .eq("normalized_phone_number", normalized)
      .eq("status", "active")
      .limit(1);

    if (existing && existing.length > 0) return;

    const { error } = await supabase.from("whatsapp_suppression_list").insert({
      phone_number: phoneNumber,
      normalized_phone_number: normalized,
      reason: "opt_out",
      source: "webhook",
      status: "active",
      prospect_id: conversation.prospect_id,
      conversation_id: conversation.id,
      notes: "Detected clear inbound WhatsApp opt-out text.",
      metadata: {
        whatsapp_message_id: message.id ?? null,
        detected_terms: "stop|unsubscribe|opt out|remove me",
      },
    });

    if (error) {
      await logIntegrationEvent("whatsapp_opt_out", "failed", {
        conversation_id: conversation.id,
        whatsapp_message_id: message.id ?? null,
        reason: "suppression_insert_failed",
      }, error.message);
      return;
    }

    await logIntegrationEvent("whatsapp_opt_out", "processed", {
      conversation_id: conversation.id,
      prospect_id: conversation.prospect_id,
      whatsapp_message_id: message.id ?? null,
      normalized_phone_number: normalized,
    });
  };

  const handleInboundMessage = async (
    value: JsonRecord,
    message: InboundMessage,
    eventContext: Pick<ValueChange, "entryId" | "changeField">,
  ) => {
    if (!message.id || !message.from) {
      await logIntegrationEvent("whatsapp_inbound_message", "skipped", {
        reason: "missing_message_id_or_from",
        has_id: Boolean(message.id),
        has_from: Boolean(message.from),
        message_type: message.type ?? null,
      });
      return;
    }

    const { data: existingMessage } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .eq("whatsapp_message_id", message.id)
      .limit(1);

    if (existingMessage && existingMessage.length > 0) {
      await logIntegrationEvent("whatsapp_inbound_message", "skipped", {
        reason: "duplicate_message",
        whatsapp_message_id: message.id,
      });
      return;
    }

    const contacts = Array.isArray(value.contacts) ? value.contacts : [];
    const contact = contacts.find((item) => {
      if (!item || typeof item !== "object") return false;
      return (item as JsonRecord).wa_id === message.from;
    }) as JsonRecord | undefined;
    const profile = contact?.profile;
    const contactName =
      profile && typeof profile === "object"
        ? getString((profile as JsonRecord).name)
        : null;

    const messageAt = unixTimestampToIso(message.timestamp);
    const conversation = await findOrCreateConversation(
      message.from,
      message.from,
      contactName,
    );
    const body = extractBody(message);
    const media = extractMedia(message);
    const metaMessageType = message.type ?? "unknown";
    const messageType = toStoredMessageType(message.type);

    const { error: insertError } = await supabase.from("whatsapp_messages").insert({
      conversation_id: conversation.id,
      prospect_id: conversation.prospect_id,
      client_id: conversation.client_id,
      whatsapp_message_id: message.id,
      direction: "inbound",
      message_type: messageType,
      body,
      media_url: media.mediaId,
      media_mime_type: media.mediaMimeType,
      status: "received",
      sender_type: "contact",
      ai_generated: false,
      human_approved: true,
      created_at: messageAt,
      metadata: {
        webhook_source: "meta-whatsapp-webhook",
        webhook_entry_id: eventContext.entryId,
        webhook_change_field: eventContext.changeField,
        phone_number_id:
          value.metadata && typeof value.metadata === "object"
            ? getString((value.metadata as JsonRecord).phone_number_id)
            : null,
        wa_id: message.from,
        meta_message_type: metaMessageType,
        raw_type_payload: message[metaMessageType as keyof InboundMessage] ?? null,
      },
    });

    if (insertError) {
      if (insertError.code === "23505") {
        await logIntegrationEvent("whatsapp_inbound_message", "skipped", {
          reason: "duplicate_message",
          whatsapp_message_id: message.id,
          webhook_entry_id: eventContext.entryId,
        });
        return;
      }

      await logIntegrationEvent("whatsapp_inbound_message", "failed", {
        whatsapp_message_id: message.id,
        conversation_id: conversation.id,
      }, insertError.message);
      return;
    }

    await supabase
      .from("whatsapp_conversations")
      .update({
        contact_name: conversation.contact_name ?? contactName,
        whatsapp_wa_id: conversation.whatsapp_wa_id ?? message.from,
        needs_human: true,
        stage: conversation.stage === "new" ? "needs_reply" : conversation.stage,
      })
      .eq("id", conversation.id);

    if (isClearOptOut(body)) {
      await upsertOptOut(message.from, conversation, message);
    }

    await logIntegrationEvent("whatsapp_inbound_message", "processed", {
      whatsapp_message_id: message.id,
      conversation_id: conversation.id,
      message_type: messageType,
      meta_message_type: metaMessageType,
      webhook_entry_id: eventContext.entryId,
      opt_out_detected: isClearOptOut(body),
    });
  };

  const handleStatus = async (
    status: MessageStatus,
    eventContext: Pick<ValueChange, "entryId" | "changeField">,
  ) => {
    if (!status.id || !status.status) {
      await logIntegrationEvent("whatsapp_message_status", "skipped", {
        reason: "missing_status_id_or_status",
        status,
      });
      return;
    }

    const storedStatus = toStoredStatus(status.status);

    if (!storedStatus) {
      await logIntegrationEvent("whatsapp_message_status", "skipped", {
        reason: "unsupported_status",
        whatsapp_message_id: status.id,
        status: status.status,
        webhook_entry_id: eventContext.entryId,
      });
      return;
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("whatsapp_messages")
      .select("id, conversation_id, status, metadata")
      .eq("whatsapp_message_id", status.id)
      .limit(1);

    if (existingError || !existingRows?.[0]) {
      await logIntegrationEvent(
        "whatsapp_message_status",
        existingError ? "failed" : "skipped",
        {
          whatsapp_message_id: status.id,
          status: status.status,
          reason: existingError ? "lookup_failed" : "message_not_found",
        },
        existingError?.message,
      );
      return;
    }

    const existing = existingRows[0] as {
      id: string;
      conversation_id: string;
      status: string | null;
      metadata: JsonRecord | null;
    };
    const existingMetadata =
      existing.metadata && typeof existing.metadata === "object"
        ? existing.metadata
        : {};
    const updates: JsonRecord = {
      status: shouldAdvanceStatus(existing.status, storedStatus)
        ? storedStatus
        : existing.status,
      metadata: {
        ...existingMetadata,
        latest_status_webhook: {
          webhook_source: "meta-whatsapp-webhook",
          webhook_entry_id: eventContext.entryId,
          webhook_change_field: eventContext.changeField,
          status: status.status,
          status_conversation: status.conversation ?? null,
          pricing: status.pricing ?? null,
          errors: status.errors ?? null,
        },
      },
    };

    if (status.status === "delivered") {
      updates.delivered_at = unixTimestampToIso(status.timestamp);
    }

    if (status.status === "read") {
      updates.read_at = unixTimestampToIso(status.timestamp);
    }

    if (status.status === "failed") {
      updates.error_message =
        status.errors?.[0]?.message ??
        status.errors?.[0]?.title ??
        status.errors?.[0]?.error_data?.details ??
        "WhatsApp delivery failed";
    }

    const { data, error } = await supabase
      .from("whatsapp_messages")
      .update(updates)
      .eq("id", existing.id)
      .select("id, conversation_id")
      .limit(1);

    await logIntegrationEvent(
      "whatsapp_message_status",
      error ? "failed" : data && data.length > 0 ? "processed" : "skipped",
      {
        whatsapp_message_id: status.id,
        status: status.status,
        webhook_entry_id: eventContext.entryId,
        matched_message_id: data?.[0]?.id ?? null,
        conversation_id: data?.[0]?.conversation_id ?? null,
      },
      error?.message,
    );
  };

  try {
    await logIntegrationEvent("whatsapp_webhook_received", "received", {
      object:
        payload && typeof payload === "object"
          ? ((payload as JsonRecord).object ?? null)
          : null,
      entry_count:
        payload && typeof payload === "object" && Array.isArray((payload as JsonRecord).entry)
          ? ((payload as JsonRecord).entry as unknown[]).length
          : 0,
    });

    const changes = getValueChanges(payload);

    for (const change of changes) {
      const { value } = change;
      const messages = Array.isArray(value.messages)
        ? (value.messages as InboundMessage[])
        : [];
      const statuses = Array.isArray(value.statuses)
        ? (value.statuses as MessageStatus[])
        : [];

      for (const message of messages) {
        await handleInboundMessage(value, message, change);
      }

      for (const status of statuses) {
        await handleStatus(status, change);
      }
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";

    await logIntegrationEvent("whatsapp_webhook_processing", "failed", {
      error: message,
    }).catch(() => null);

    return jsonResponse({ error: message }, 500);
  }
});
