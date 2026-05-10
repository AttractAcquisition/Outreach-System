import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

type SendTemplateRequest = {
  conversation_id?: string;
  template_id?: string;
  parameters?: Record<string, string>;
};

type ConversationRow = {
  id: string;
  prospect_id: string | null;
  client_id: string | null;
  phone_number: string;
  service_window_open_until: string | null;
};

type TemplateRow = {
  id: string;
  name: string;
  language: string;
  body: string;
  variables: unknown;
  status: string;
  meta_status: string | null;
  usable_inside_window: boolean;
  usable_outside_window: boolean;
};

type MetaMessageResponse = {
  messaging_product?: string;
  contacts?: Array<JsonRecord>;
  messages?: Array<{ id?: string; message_status?: string }>;
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function replaceTemplateVariables(body: string, parameters: Record<string, string>) {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    return parameters[key] ?? "";
  });
}

function buildTemplateComponents(
  variables: string[],
  parameters: Record<string, string>,
) {
  if (variables.length === 0) return undefined;

  return [
    {
      type: "body",
      parameters: variables.map((variable) => ({
        type: "text",
        text: parameters[variable] ?? "",
      })),
    },
  ];
}

function safeMetaMetadata(metaResponse: MetaMessageResponse) {
  return {
    messaging_product: metaResponse.messaging_product ?? "whatsapp",
    contacts: metaResponse.contacts ?? [],
    messages: metaResponse.messages ?? [],
  };
}

async function logEvents(input: {
  supabase: ReturnType<typeof createClient>;
  userId: string | null;
  status: "success" | "failed";
  conversationId: string;
  whatsappMessageId: string | null;
  templateName: string;
  errorMessage?: string;
}) {
  const payload = {
    conversation_id: input.conversationId,
    whatsapp_message_id: input.whatsappMessageId,
    template_name: input.templateName,
  };

  await Promise.allSettled([
    input.supabase.from("integration_events").insert({
      integration_name: "whatsapp_cloud_api",
      event_type: "send_whatsapp_template_message",
      source_system: "aa-outreach-auto",
      target_system: "meta_whatsapp_cloud_api",
      status: input.status,
      error_message: input.errorMessage ?? null,
      triggered_by_profile_id: input.userId,
      payload,
      processed_at: new Date().toISOString(),
    }),
    input.supabase.from("audit_events").insert({
      action:
        input.status === "success"
          ? "whatsapp_template_message_sent"
          : "whatsapp_template_message_send_failed",
      entity_type: "whatsapp_conversation",
      entity_id: input.conversationId,
      actor_profile_id: input.userId,
      metadata: {
        ...payload,
        status: input.status,
      },
      old_data: null,
      new_data: null,
    }),
  ]);
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

  // Auth is non-blocking — the app has no login flow.
  // Try to resolve a user from the Authorization header; fall back to null.
  let userId: string | null = null;
  const authorization = req.headers.get("Authorization") ?? "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: { user } } = await userClient.auth.getUser();
    userId = user?.id ?? null;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let body: SendTemplateRequest;
  try {
    body = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const conversationId = body.conversation_id?.trim() ?? "";
  const templateId = body.template_id?.trim() ?? "";
  const parameters = body.parameters ?? {};

  if (!conversationId || !isUuid(conversationId)) {
    return jsonResponse({ error: "Valid conversation_id is required" }, 400);
  }

  if (!templateId || !isUuid(templateId)) {
    return jsonResponse({ error: "Valid template_id is required" }, 400);
  }

  const { data: conversation, error: conversationError } = await adminClient
    .from("whatsapp_conversations")
    .select("id, prospect_id, client_id, phone_number, service_window_open_until")
    .eq("id", conversationId)
    .single();

  if (conversationError || !conversation) {
    return jsonResponse({ error: "Conversation not found" }, 404);
  }

  const { data: template, error: templateError } = await adminClient
    .from("whatsapp_templates")
    .select("id, name, language, body, variables, status, meta_status, usable_inside_window, usable_outside_window")
    .eq("id", templateId)
    .single();

  if (templateError || !template) {
    return jsonResponse({ error: "Template not found" }, 404);
  }

  const conversationRow = conversation as ConversationRow;
  const templateRow = template as TemplateRow;
  const normalizedPhoneNumber = normalizePhoneNumber(conversationRow.phone_number);

  if (!normalizedPhoneNumber || normalizedPhoneNumber === "+") {
    return jsonResponse({ error: "Conversation phone number is invalid" }, 400);
  }

  const normalizedTemplateStatus = (
    templateRow.meta_status ||
    templateRow.status ||
    ""
  ).toLowerCase();

  if (normalizedTemplateStatus !== "approved") {
    return jsonResponse({ error: "Template is not approved for WhatsApp sending" }, 400);
  }

  const serviceWindowEnd = conversationRow.service_window_open_until
    ? new Date(conversationRow.service_window_open_until)
    : null;
  const serviceWindowOpen =
    serviceWindowEnd !== null &&
    !Number.isNaN(serviceWindowEnd.getTime()) &&
    serviceWindowEnd > new Date();

  if (serviceWindowOpen && !templateRow.usable_inside_window) {
    return jsonResponse({ error: "Template is not usable inside the service window" }, 400);
  }

  if (!serviceWindowOpen && !templateRow.usable_outside_window) {
    return jsonResponse({ error: "Template is not usable outside the service window" }, 400);
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

  const variables = asStringArray(templateRow.variables);
  const components = buildTemplateComponents(variables, parameters);
  const renderedBody = replaceTemplateVariables(templateRow.body, parameters);
  const metaPayload: JsonRecord = {
    messaging_product: "whatsapp",
    to: normalizedPhoneNumber,
    type: "template",
    template: {
      name: templateRow.name,
      language: { code: templateRow.language },
      ...(components ? { components } : {}),
    },
  };

  const metaEndpoint = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
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
        metaResponse.error?.message ?? "WhatsApp Cloud API template send failed";

      try {
        await adminClient.from("whatsapp_messages").insert({
          conversation_id: conversationRow.id,
          prospect_id: conversationRow.prospect_id,
          client_id: conversationRow.client_id,
          direction: "outbound",
          message_type: "template",
          body: renderedBody,
          status: "failed",
          sender_type: "human",
          sent_by: userId,
          human_approved: true,
          template_name: templateRow.name,
          template_language: templateRow.language,
          error_message: errorMessage,
          metadata: {
            provider: "whatsapp_cloud_api",
            failure_stage: "template_send",
            parameters,
          },
        });
      } catch (_insertErr) {
        // Best-effort failure ledger only. The provider error is still returned.
      }
      await logEvents({
        supabase: adminClient,
        userId: userId,
        status: "failed",
        conversationId: conversationRow.id,
        whatsappMessageId: null,
        templateName: templateRow.name,
        errorMessage,
      });

      return jsonResponse({ error: errorMessage }, 502);
    }
  } catch (_err) {
    const errorMessage = "Could not reach WhatsApp Cloud API";
    await logEvents({
      supabase: adminClient,
      userId: userId,
      status: "failed",
      conversationId: conversationRow.id,
      whatsappMessageId: null,
      templateName: templateRow.name,
      errorMessage,
    });
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
      message_type: "template",
      body: renderedBody,
      status: "sent",
      sender_type: "human",
      sent_by: userId,
      human_approved: true,
      whatsapp_message_id: whatsappMessageId,
      template_name: templateRow.name,
      template_language: templateRow.language,
      metadata: {
        provider: "whatsapp_cloud_api",
        template_id: templateRow.id,
        parameters,
        response: safeMetaMetadata(metaResponse),
      },
    })
    .select("*")
    .single();

  if (insertError) {
    await logEvents({
      supabase: adminClient,
      userId: userId,
      status: "failed",
      conversationId: conversationRow.id,
      whatsappMessageId,
      templateName: templateRow.name,
      errorMessage: insertError.message,
    });
    return jsonResponse({ error: "Template sent but could not be recorded" }, 500);
  }

  await adminClient
    .from("whatsapp_conversations")
    .update({
      last_message_preview: renderedBody,
      last_message_at: new Date().toISOString(),
      last_outbound_at: new Date().toISOString(),
    })
    .eq("id", conversationRow.id);

  await logEvents({
    supabase: adminClient,
    userId: userId,
    status: "success",
    conversationId: conversationRow.id,
    whatsappMessageId,
    templateName: templateRow.name,
  });

  return jsonResponse({
    ok: true,
    message: insertedMessage,
    meta: safeMetaMetadata(metaResponse),
  });
});
