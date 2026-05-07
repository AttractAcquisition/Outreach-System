import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CheckStatus = "configured" | "missing" | "warning";
type OverallStatus = "healthy" | "warning" | "error";

type HealthCheck = {
  key: string;
  label: string;
  status: CheckStatus;
  message: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function hasEnv(name: string) {
  return Boolean(Deno.env.get(name)?.trim());
}

function secretCheck(key: string, label: string, envName: string): HealthCheck {
  const configured = hasEnv(envName);
  return {
    key,
    label,
    status: configured ? "configured" : "missing",
    message: configured ? "Configured" : "Missing",
  };
}

function warningCheck(
  key: string,
  label: string,
  ok: boolean,
  okMessage: string,
  warningMessage: string,
): HealthCheck {
  return {
    key,
    label,
    status: ok ? "configured" : "warning",
    message: ok ? okMessage : warningMessage,
  };
}

function mostRecent<T extends Record<string, unknown>>(
  rows: T[] | null,
  field: keyof T,
) {
  const value = rows?.[0]?.[field];
  return typeof value === "string" ? value : null;
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

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase backend secrets are not configured" }, 500);
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

  const [
    conversationResult,
    messageResult,
    inboundResult,
    outboundResult,
    failedResult,
    templateResult,
    suppressionResult,
    webhookEventResult,
    sendEventResult,
    aiSuggestionResult,
    aiTaskResult,
  ] = await Promise.all([
    adminClient.from("whatsapp_conversations").select("id", { count: "exact", head: true }),
    adminClient.from("whatsapp_messages").select("id", { count: "exact", head: true }),
    adminClient
      .from("whatsapp_messages")
      .select("created_at")
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1),
    adminClient
      .from("whatsapp_messages")
      .select("created_at")
      .eq("direction", "outbound")
      .order("created_at", { ascending: false })
      .limit(1),
    adminClient
      .from("whatsapp_messages")
      .select("created_at")
      .eq("direction", "outbound")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(1),
    adminClient.from("whatsapp_templates").select("id", { count: "exact", head: true }),
    adminClient
      .from("whatsapp_suppression_list")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    adminClient
      .from("integration_events")
      .select("created_at, processed_at, status")
      .eq("integration_name", "whatsapp_cloud_api")
      .eq("event_type", "meta_whatsapp_webhook")
      .order("created_at", { ascending: false })
      .limit(1),
    adminClient
      .from("integration_events")
      .select("created_at, processed_at, status")
      .eq("integration_name", "whatsapp_cloud_api")
      .eq("event_type", "send_whatsapp_message")
      .order("created_at", { ascending: false })
      .limit(1),
    adminClient.from("whatsapp_ai_suggestions").select("id", { count: "exact", head: true }),
    adminClient
      .from("ai_task_log")
      .select("created_at, status")
      .eq("tool_called", "generate-whatsapp-reply-suggestion")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const aiConfigured = hasEnv("ANTHROPIC_API_KEY") || hasEnv("OPENAI_API_KEY");
  const checks: HealthCheck[] = [
    secretCheck("whatsapp_access_token", "WhatsApp Access Token", "WHATSAPP_ACCESS_TOKEN"),
    secretCheck("whatsapp_phone_number_id", "WhatsApp Phone Number ID", "WHATSAPP_PHONE_NUMBER_ID"),
    secretCheck("whatsapp_webhook_verify_token", "Webhook Verify Token", "WHATSAPP_WEBHOOK_VERIFY_TOKEN"),
    secretCheck("whatsapp_app_secret", "WhatsApp App Secret", "WHATSAPP_APP_SECRET"),
    secretCheck("supabase_service_role_key", "Supabase Service Role Key", "SUPABASE_SERVICE_ROLE_KEY"),
    {
      key: "ai_provider_key",
      label: "AI Provider Key",
      status: aiConfigured ? "configured" : "missing",
      message: aiConfigured ? "Configured" : "Missing ANTHROPIC_API_KEY or OPENAI_API_KEY",
    },
    warningCheck(
      "conversation_table_read",
      "Conversation Table Read",
      !conversationResult.error,
      "Readable",
      conversationResult.error?.message ?? "Could not read conversations",
    ),
    warningCheck(
      "message_table_read",
      "Message Table Read",
      !messageResult.error,
      "Readable",
      messageResult.error?.message ?? "Could not read messages",
    ),
    warningCheck(
      "send_function_activity",
      "WhatsApp Send Function",
      Boolean(sendEventResult.data?.length || outboundResult.data?.length),
      "Recent send activity found",
      "No outbound send activity found yet",
    ),
    warningCheck(
      "webhook_activity",
      "Webhook Activity",
      Boolean(webhookEventResult.data?.length || inboundResult.data?.length),
      "Recent inbound/webhook activity found",
      "No inbound webhook activity found yet",
    ),
    warningCheck(
      "template_records",
      "WhatsApp Templates",
      (templateResult.count ?? 0) > 0,
      "Templates found",
      "No templates found",
    ),
    warningCheck(
      "suppression_records",
      "Suppression List",
      !suppressionResult.error,
      "Readable",
      suppressionResult.error?.message ?? "Could not read suppression list",
    ),
    warningCheck(
      "ai_suggestion_activity",
      "AI Suggestions",
      Boolean((aiSuggestionResult.count ?? 0) > 0 || aiTaskResult.data?.length),
      "AI suggestion activity found",
      "No AI suggestion activity found yet",
    ),
  ];

  const missingRequired = checks.some((check) => check.status === "missing");
  const warnings = checks.some((check) => check.status === "warning");
  const status: OverallStatus = missingRequired ? "error" : warnings ? "warning" : "healthy";

  return jsonResponse({
    status,
    checks,
    metrics: {
      projectRef: "fgyvcyksgbivhrqoxkmj",
      conversationTableReadable: !conversationResult.error,
      messageTableReadable: !messageResult.error,
      conversationCount: conversationResult.count ?? 0,
      messageCount: messageResult.count ?? 0,
      lastInboundAt: mostRecent(inboundResult.data, "created_at"),
      lastOutboundAt: mostRecent(outboundResult.data, "created_at"),
      lastFailedSendAt: mostRecent(failedResult.data, "created_at"),
      lastWebhookEventAt:
        mostRecent(webhookEventResult.data, "processed_at") ??
        mostRecent(webhookEventResult.data, "created_at"),
      lastSendEventAt:
        mostRecent(sendEventResult.data, "processed_at") ??
        mostRecent(sendEventResult.data, "created_at"),
      lastAiSuggestionAt: mostRecent(aiTaskResult.data, "created_at"),
      templateCount: templateResult.count ?? 0,
      suppressionCount: suppressionResult.count ?? 0,
      aiSuggestionCount: aiSuggestionResult.count ?? 0,
    },
  });
});
