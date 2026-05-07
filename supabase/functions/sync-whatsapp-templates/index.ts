import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

type MetaTemplate = {
  id?: string;
  name?: string;
  language?: string;
  status?: string;
  category?: string;
  components?: Array<JsonRecord>;
  quality_score?: JsonRecord;
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

function textValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function titleizeName(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractBody(components: Array<JsonRecord> | undefined) {
  const body = components?.find((component) => component.type === "BODY");
  return textValue(body?.text) ?? "";
}

function inferVariables(template: MetaTemplate) {
  const variables = new Set<string>();
  const components = template.components ?? [];

  for (const component of components) {
    const text = textValue(component.text);
    if (!text) continue;

    for (const match of text.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
}

function metaQuality(template: MetaTemplate) {
  const quality = template.quality_score;
  return (
    textValue(quality?.score) ??
    textValue(quality?.date) ??
    textValue(quality?.status) ??
    null
  );
}

async function logIntegrationEvent(
  supabase: ReturnType<typeof createClient>,
  status: "success" | "failed",
  payload: JsonRecord,
  errorMessage: string | null = null,
) {
  await supabase.from("integration_events").insert({
    integration_name: "whatsapp_cloud_api",
    event_type: "sync_whatsapp_templates",
    source_system: "meta_whatsapp_cloud_api",
    target_system: "aa-outreach-auto",
    status,
    error_message: errorMessage,
    payload,
    processed_at: new Date().toISOString(),
  });
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
  const businessAccountId = Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID");
  const graphApiVersion =
    Deno.env.get("WHATSAPP_GRAPH_API_VERSION")?.trim() || "v23.0";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase backend secrets are not configured" }, 500);
  }

  if (!whatsappAccessToken || !businessAccountId) {
    return jsonResponse({ error: "WhatsApp template sync secrets are not configured" }, 500);
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

  const fields = [
    "id",
    "name",
    "language",
    "status",
    "category",
    "components",
    "quality_score",
  ].join(",");
  const url = `https://graph.facebook.com/${graphApiVersion}/${businessAccountId}/message_templates?fields=${encodeURIComponent(fields)}&limit=100`;

  let templates: MetaTemplate[] = [];

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${whatsappAccessToken}` },
    });
    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ?? "Could not fetch WhatsApp templates from Meta";
      await logIntegrationEvent(adminClient, "failed", { businessAccountId }, errorMessage)
        .catch(() => null);
      return jsonResponse({ error: errorMessage }, 502);
    }

    templates = Array.isArray(data?.data) ? data.data : [];
  } catch (_err) {
    const errorMessage = "Could not reach Meta Graph API";
    await logIntegrationEvent(adminClient, "failed", { businessAccountId }, errorMessage)
      .catch(() => null);
    return jsonResponse({ error: errorMessage }, 502);
  }

  let inserted = 0;
  let updated = 0;

  for (const template of templates) {
    const metaTemplateId = textValue(template.id);
    const name = textValue(template.name);
    const language = textValue(template.language) ?? "en";

    if (!name) continue;

    const metaStatus = textValue(template.status);
    const normalizedStatus = (metaStatus ?? "draft").toLowerCase();
    const isApproved = normalizedStatus === "approved";
    const payload = {
      name,
      display_name: titleizeName(name),
      category: (textValue(template.category) ?? "utility").toLowerCase(),
      language,
      body: extractBody(template.components),
      components: (template.components ?? []) as unknown,
      variables: inferVariables(template) as unknown,
      status: normalizedStatus,
      meta_template_id: metaTemplateId,
      meta_status: metaStatus,
      meta_quality_rating: metaQuality(template),
      whatsapp_business_account_id: businessAccountId,
      usable_inside_window: true,
      usable_outside_window: isApproved,
      metadata: {
        source: "meta_whatsapp_cloud_api",
        synced_at: new Date().toISOString(),
        meta_template: template,
      },
    };

    const existingQuery = metaTemplateId
      ? adminClient
          .from("whatsapp_templates")
          .select("id")
          .eq("meta_template_id", metaTemplateId)
          .limit(1)
      : adminClient
          .from("whatsapp_templates")
          .select("id")
          .eq("name", name)
          .eq("language", language)
          .limit(1);

    const { data: existingRows, error: existingError } = await existingQuery;
    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingId = existingRows?.[0]?.id;

    if (existingId) {
      const { error } = await adminClient
        .from("whatsapp_templates")
        .update(payload)
        .eq("id", existingId);
      if (error) throw new Error(error.message);
      updated += 1;
    } else {
      const { error } = await adminClient
        .from("whatsapp_templates")
        .insert({ ...payload, created_by: user.id });
      if (error) throw new Error(error.message);
      inserted += 1;
    }
  }

  await logIntegrationEvent(adminClient, "success", {
    businessAccountId,
    fetched: templates.length,
    inserted,
    updated,
  }).catch(() => null);

  return jsonResponse({
    ok: true,
    fetched: templates.length,
    inserted,
    updated,
  });
});
