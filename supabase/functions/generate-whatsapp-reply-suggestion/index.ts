import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

type RequestBody = {
  conversation_id?: string;
};

type ConversationRow = {
  id: string;
  prospect_id: string | null;
  client_id: string | null;
  campaign_id: string | null;
  contact_name: string | null;
  phone_number: string;
  status: string;
  stage: string;
  ai_summary: string | null;
  ai_intent: string | null;
  ai_temperature: string | null;
  service_window_open_until: string | null;
  metadata: JsonRecord | null;
};

type MessageRow = {
  id: string;
  direction: string;
  sender_type: string;
  message_type: string;
  body: string | null;
  status: string;
  created_at: string;
};

type ProspectRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  city: string | null;
  suburb: string | null;
  vertical: string | null;
  pipeline_stage: string | null;
  icp_total_score: number | null;
  status: string;
  reply_classification: string | null;
};

type ClientRow = {
  id: string;
  business_name: string;
  owner_name: string;
  niche: string | null;
  status: string;
  tier: string;
  notes: string | null;
};

type SuggestionResult = {
  suggested_body: string;
  reason: string;
  confidence: number;
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed;
}

function confidenceToNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return 0.6;
  return Math.max(0, Math.min(1, numberValue));
}

function safeContextSummary(context: unknown) {
  const record = asRecord(context);
  const allowedKeys = [
    "brand_voice",
    "offer",
    "positioning",
    "target_customer",
    "tone",
    "proof_points",
    "faq",
    "objections",
    "constraints",
  ];
  const summary: JsonRecord = {};

  for (const key of allowedKeys) {
    if (record[key] !== undefined) {
      summary[key] = record[key];
    }
  }

  return Object.keys(summary).length > 0 ? summary : null;
}

function buildPrompt(input: {
  conversation: ConversationRow;
  messages: MessageRow[];
  prospect: ProspectRow | null;
  client: ClientRow | null;
  clientContext: JsonRecord | null;
}) {
  const messageLines = input.messages.map((message) => {
    const speaker =
      message.direction === "inbound" || message.sender_type === "contact"
        ? "Contact"
        : "Operator";
    const body = truncate(message.body, 700) ?? `[${message.message_type}]`;
    return `${message.created_at} ${speaker}: ${body}`;
  });

  return [
    "You are drafting a WhatsApp reply for a human operator. Return only valid JSON with keys: suggested_body, reason, confidence.",
    "",
    "Rules:",
    "- Write like a helpful human WhatsApp operator.",
    "- Keep the reply concise and natural for WhatsApp.",
    "- Ask one clear question if more information is needed.",
    "- Do not invent facts.",
    "- Do not promise pricing, dates, availability, guarantees, or results unless the context explicitly proves them.",
    "- Escalate sensitive messages by suggesting a careful human follow-up, not a definitive answer.",
    "- Do not be aggressive.",
    "- Do not auto-close deals or pressure the contact.",
    "- Do not include markdown, signatures, or internal notes in suggested_body.",
    "",
    "Conversation:",
    JSON.stringify({
      id: input.conversation.id,
      status: input.conversation.status,
      stage: input.conversation.stage,
      contact_name: input.conversation.contact_name,
      ai_summary: truncate(input.conversation.ai_summary, 500),
      ai_intent: input.conversation.ai_intent,
      ai_temperature: input.conversation.ai_temperature,
      service_window_open_until: input.conversation.service_window_open_until,
    }),
    "",
    "Prospect:",
    JSON.stringify(input.prospect
      ? {
          business_name: input.prospect.business_name,
          owner_name: input.prospect.owner_name,
          location: [input.prospect.suburb, input.prospect.city].filter(Boolean).join(", "),
          vertical: input.prospect.vertical,
          pipeline_stage: input.prospect.pipeline_stage,
          icp_total_score: input.prospect.icp_total_score,
          status: input.prospect.status,
          reply_classification: input.prospect.reply_classification,
        }
      : null),
    "",
    "Client:",
    JSON.stringify(input.client
      ? {
          business_name: input.client.business_name,
          owner_name: input.client.owner_name,
          niche: input.client.niche,
          status: input.client.status,
          tier: input.client.tier,
          notes: truncate(input.client.notes, 500),
        }
      : null),
    "",
    "Client AI context, safe excerpt:",
    JSON.stringify(input.clientContext),
    "",
    "Last messages, oldest to newest:",
    messageLines.join("\n"),
  ].join("\n");
}

function extractJsonObject(text: string): JsonRecord {
  try {
    return asRecord(JSON.parse(text));
  } catch (_err) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return asRecord(JSON.parse(match[0]));
    } catch (_nestedErr) {
      return {};
    }
  }
}

function parseSuggestion(rawText: string): SuggestionResult {
  const parsed = extractJsonObject(rawText);
  const suggestedBody = typeof parsed.suggested_body === "string"
    ? parsed.suggested_body.trim()
    : "";
  const reason = typeof parsed.reason === "string"
    ? parsed.reason.trim()
    : "Generated from recent WhatsApp conversation context.";

  if (!suggestedBody) {
    throw new Error("AI response did not include a suggested_body");
  }

  return {
    suggested_body: suggestedBody,
    reason,
    confidence: confidenceToNumber(parsed.confidence),
  };
}

async function callOpenAI(prompt: string, model: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You draft concise WhatsApp replies for human review. You never send messages.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "OpenAI request failed");
  }

  return String(data?.choices?.[0]?.message?.content ?? "");
}

async function callAnthropic(prompt: string, model: string) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      temperature: 0.4,
      system:
        "You draft concise WhatsApp replies for human review. You never send messages. Return only valid JSON.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Anthropic request failed");
  }

  return String(
    data?.content?.find((item: JsonRecord) => item?.type === "text")?.text ?? "",
  );
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

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (_err) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const conversationId = body.conversation_id?.trim() ?? "";
  if (!conversationId || !isUuid(conversationId)) {
    return jsonResponse({ error: "Valid conversation_id is required" }, 400);
  }

  const startedAt = Date.now();
  const logAiTask = async (
    status: "success" | "failed",
    inputSummary: string,
    outputSummary: string,
  ) => {
    await adminClient.from("ai_task_log").insert({
      sop_id: "generate-whatsapp-reply-suggestion",
      sop_name: "Generate WhatsApp Reply Suggestion",
      tool_called: "generate-whatsapp-reply-suggestion",
      status,
      input_summary: inputSummary,
      output_summary: outputSummary,
      duration_ms: Date.now() - startedAt,
    });
  };

  try {
    const { data: conversation, error: conversationError } = await adminClient
      .from("whatsapp_conversations")
      .select(
        "id, prospect_id, client_id, campaign_id, contact_name, phone_number, status, stage, ai_summary, ai_intent, ai_temperature, service_window_open_until, metadata",
      )
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      return jsonResponse({ error: "Conversation not found" }, 404);
    }

    const conversationRow = conversation as ConversationRow;

    if (conversationRow.client_id) {
      const { data: canAccess, error: accessError } = await userClient.rpc(
        "aa_can_access_client",
        { target_client_id: conversationRow.client_id },
      );

      if (accessError || canAccess === false) {
        return jsonResponse({ error: "Conversation access denied" }, 403);
      }
    }

    const { data: messages } = await adminClient
      .from("whatsapp_messages")
      .select("id, direction, sender_type, message_type, body, status, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(20);

    const messageRows = ((messages ?? []) as MessageRow[]).reverse();

    const [{ data: prospect }, { data: client }, { data: clientContexts }] =
      await Promise.all([
        conversationRow.prospect_id
          ? adminClient
              .from("prospects")
              .select(
                "id, business_name, owner_name, city, suburb, vertical, pipeline_stage, icp_total_score, status, reply_classification",
              )
              .eq("id", conversationRow.prospect_id)
              .single()
          : Promise.resolve({ data: null }),
        conversationRow.client_id
          ? adminClient
              .from("clients")
              .select("id, business_name, owner_name, niche, status, tier, notes")
              .eq("id", conversationRow.client_id)
              .single()
          : Promise.resolve({ data: null }),
        conversationRow.client_id
          ? adminClient
              .from("client_ai_context")
              .select("context_json, context_version, last_assembled_at")
              .eq("client_id", conversationRow.client_id)
              .order("last_assembled_at", { ascending: false })
              .limit(1)
          : Promise.resolve({ data: [] }),
      ]);

    const safeClientContext = safeContextSummary(
      Array.isArray(clientContexts) && clientContexts[0]
        ? asRecord(clientContexts[0]).context_json
        : null,
    );
    const prompt = buildPrompt({
      conversation: conversationRow,
      messages: messageRows,
      prospect: prospect as ProspectRow | null,
      client: client as ClientRow | null,
      clientContext: safeClientContext,
    });

    const provider = (Deno.env.get("AI_PROVIDER") ?? "").toLowerCase().trim();
    const useAnthropic =
      provider === "anthropic" ||
      (!provider && Boolean(Deno.env.get("ANTHROPIC_API_KEY")));
    const model =
      Deno.env.get("AI_MODEL")?.trim() ||
      (useAnthropic ? "claude-3-5-sonnet-latest" : "gpt-4o-mini");

    const rawAiText = useAnthropic
      ? await callAnthropic(prompt, model)
      : await callOpenAI(prompt, model);
    const suggestion = parseSuggestion(rawAiText);

    const { data: storedSuggestion, error: suggestionError } = await adminClient
      .from("whatsapp_ai_suggestions")
      .insert({
        conversation_id: conversationRow.id,
        prospect_id: conversationRow.prospect_id,
        client_id: conversationRow.client_id,
        suggested_body: suggestion.suggested_body,
        reason: suggestion.reason,
        confidence: suggestion.confidence,
        status: "pending_review",
        provider: useAnthropic ? "anthropic" : "openai",
        model,
        created_by: user.id,
        metadata: {
          campaign_id: conversationRow.campaign_id,
          messages_used: messageRows.length,
          client_context_used: Boolean(safeClientContext),
        },
      })
      .select("id")
      .single();

    if (suggestionError) {
      throw new Error(`Could not store AI suggestion: ${suggestionError.message}`);
    }

    await logAiTask(
      "success",
      `conversation=${conversationId}; messages=${messageRows.length}; client_context=${Boolean(safeClientContext)}`,
      `suggestion=${storedSuggestion?.id ?? "unknown"}; confidence=${suggestion.confidence}`,
    ).catch(() => null);

    return jsonResponse({
      ...suggestion,
      suggestion_id: storedSuggestion?.id ?? null,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "AI suggestion failed";
    await logAiTask(
      "failed",
      `conversation=${conversationId}`,
      truncate(errorMessage, 500) ?? "AI suggestion failed",
    ).catch(() => null);

    return jsonResponse({ error: errorMessage }, 500);
  }
});
