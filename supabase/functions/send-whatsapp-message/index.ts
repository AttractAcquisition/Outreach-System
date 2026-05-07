import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ConversationRow = {
  id: string;
  prospect_id: string | null;
  client_id: string | null;
  phone_number: string;
  service_window_open_until: string | null;
};

type SendRequest = {
  conversation_id?: string;
  body?: string;
};

type MetaMessageResponse = {
  messaging_product?: string;
  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;
  messages?: Array<{
    id?: string;
    message_status?: string;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const normalized = trimmed.replace(/[\s\-()[\]]/g, "");

  if (!hasLeadingPlus) {
    return normalized;
  }

  return `+${normalized.replace(/^\++/, "")}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function safeMetaMetadata(metaResponse: MetaMessageResponse) {
  return {
    messaging_product: metaResponse.messaging_product ?? "whatsapp",
    contacts: metaResponse.contacts ?? [],
    messages: metaResponse.messages ?? [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const graphApiVersion =
    Deno.env.get("WHATSAPP_GRAPH_API_VERSION")?.trim() || "v23.0";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase backend secrets are not configured" }, 500);
  }

  if (!whatsappAccessToken || !phoneNumberId) {
    return jsonResponse({ error: "WhatsApp API secrets are not configured" }, 500);
  }

  const authorization = req.headers.get("Authorization") ?? "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  let body: SendRequest;

  try {
    body = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const conversationId = body.conversation_id?.trim() ?? "";
  const messageBody = body.body?.trim() ?? "";

  if (!conversationId || !isUuid(conversationId)) {
    return jsonResponse({ error: "Valid conversation_id is required" }, 400);
  }

  if (!messageBody) {
    return jsonResponse({ error: "Message body is required" }, 400);
  }

  const { data: conversation, error: conversationError } = await adminClient
    .from("whatsapp_conversations")
    .select("id, prospect_id, client_id, phone_number, service_window_open_until")
    .eq("id", conversationId)
    .single();

  if (conversationError || !conversation) {
    return jsonResponse({ error: "Conversation not found" }, 404);
  }

  const conversationRow = conversation as ConversationRow;
  const normalizedPhoneNumber = normalizePhoneNumber(conversationRow.phone_number);

  if (!normalizedPhoneNumber || normalizedPhoneNumber === "+") {
    return jsonResponse({ error: "Conversation phone number is invalid" }, 400);
  }

  const { data: suppressionRows, error: suppressionError } = await adminClient
    .from("whatsapp_suppression_list")
    .select("id")
    .eq("normalized_phone_number", normalizedPhoneNumber)
    .eq("status", "active")
    .limit(1);

  if (suppressionError) {
    return jsonResponse({ error: "Could not verify suppression status" }, 500);
  }

  if ((suppressionRows ?? []).length > 0) {
    return jsonResponse({ error: "Recipient is suppressed" }, 403);
  }

  if (!conversationRow.service_window_open_until) {
    return jsonResponse(
      { error: "Outside WhatsApp service window. Use an approved template." },
      403,
    );
  }

  const serviceWindowEnd = new Date(conversationRow.service_window_open_until);

  if (Number.isNaN(serviceWindowEnd.getTime()) || serviceWindowEnd <= new Date()) {
    return jsonResponse(
      { error: "Outside WhatsApp service window. Use an approved template." },
      403,
    );
  }

  const metaEndpoint = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
  const metaPayload = {
    messaging_product: "whatsapp",
    to: normalizedPhoneNumber,
    type: "text",
    text: { body: messageBody },
  };

  const insertFailedMessage = async (errorMessage: string) => {
    await adminClient.from("whatsapp_messages").insert({
      conversation_id: conversationRow.id,
      prospect_id: conversationRow.prospect_id,
      client_id: conversationRow.client_id,
      direction: "outbound",
      message_type: "text",
      body: messageBody,
      status: "failed",
      sender_type: "human",
      sent_by: user.id,
      ai_generated: false,
      human_approved: true,
      error_message: errorMessage,
      metadata: {
        provider: "whatsapp_cloud_api",
        failure_stage: "send",
      },
    }).throwOnError();
  };

  const insertEvents = async (
    status: "success" | "failed",
    messageId: string | null,
    errorMessage?: string,
  ) => {
    const eventPayload = {
      conversation_id: conversationRow.id,
      whatsapp_message_id: messageId,
      phone_number: normalizedPhoneNumber,
    };

    await Promise.allSettled([
      adminClient.from("integration_events").insert({
        integration_name: "whatsapp_cloud_api",
        event_type: "send_whatsapp_message",
        source_system: "aa-outreach-auto",
        target_system: "meta_whatsapp_cloud_api",
        status,
        error_message: errorMessage ?? null,
        triggered_by_profile_id: user.id,
        payload: eventPayload,
        processed_at: new Date().toISOString(),
      }),
      adminClient.from("audit_events").insert({
        action:
          status === "success"
            ? "whatsapp_message_sent"
            : "whatsapp_message_send_failed",
        entity_type: "whatsapp_conversation",
        entity_id: conversationRow.id,
        actor_profile_id: user.id,
        metadata: {
          ...eventPayload,
          status,
        },
        old_data: null,
        new_data: null,
      }),
    ]);
  };

  let metaResponse: MetaMessageResponse;

  try {
    const response = await fetch(metaEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    });

    metaResponse = await response.json();

    if (!response.ok) {
      const errorMessage =
        metaResponse.error?.message ?? "WhatsApp Cloud API send failed";

      await insertFailedMessage(errorMessage).catch(() => null);
      await insertEvents("failed", null, errorMessage);

      return jsonResponse({ error: errorMessage }, 502);
    }
  } catch (_err) {
    const errorMessage = "Could not reach WhatsApp Cloud API";

    await insertFailedMessage(errorMessage).catch(() => null);
    await insertEvents("failed", null, errorMessage);

    return jsonResponse({ error: errorMessage }, 502);
  }

  const whatsappMessageId = metaResponse.messages?.[0]?.id ?? null;

  const { data: insertedMessage, error: insertError } = await adminClient
    .from("whatsapp_messages")
    .insert({
      conversation_id: conversationRow.id,
      prospect_id: conversationRow.prospect_id,
      client_id: conversationRow.client_id,
      direction: "outbound",
      message_type: "text",
      body: messageBody,
      status: "sent",
      sender_type: "human",
      sent_by: user.id,
      ai_generated: false,
      human_approved: true,
      whatsapp_message_id: whatsappMessageId,
      metadata: {
        provider: "whatsapp_cloud_api",
        response: safeMetaMetadata(metaResponse),
      },
    })
    .select("*")
    .single();

  if (insertError) {
    await insertEvents("failed", whatsappMessageId, insertError.message);
    return jsonResponse({ error: "Message sent but could not be recorded" }, 500);
  }

  await adminClient
    .from("whatsapp_conversations")
    .update({
      last_message_preview: messageBody,
      last_message_at: new Date().toISOString(),
      last_outbound_at: new Date().toISOString(),
    })
    .eq("id", conversationRow.id);

  await insertEvents("success", whatsappMessageId);

  return jsonResponse({
    ok: true,
    message: insertedMessage,
    meta: safeMetaMetadata(metaResponse),
  });
});
