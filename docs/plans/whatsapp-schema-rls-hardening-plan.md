# WhatsApp Schema and RLS Hardening Plan

Plan date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

This is a planning document only. No migrations, RLS policies, tables, functions, or application code were changed.

## Current State Summary

Existing generated schema includes:

- `whatsapp_conversations`
- `whatsapp_messages`
- `prospects`
- `clients`
- `campaigns`
- `approval_queue`
- `approval_logs`
- `audit_events`
- `integration_events`
- `templates`
- `proof_sprint_whatsapp_scripts`
- `ad_set_performance_logs`

Local migrations currently define `whatsapp_conversations` and `whatsapp_messages`, but remote migration history previously showed those two local migrations as not recorded remotely while generated types already include the tables. Before any schema migration is written or pushed, reconcile migration history with the shared Supabase backend.

## Existing Schema Risks

| Area | Risk | Production impact |
| --- | --- | --- |
| `whatsapp_conversations` RLS | Broad authenticated select/insert/update/delete policies | Any authenticated browser user can create, alter, or delete conversation state |
| `whatsapp_messages` RLS | Broad authenticated select/insert/update/delete policies | Browser could insert fake messages, alter statuses, or delete audit-critical message records |
| Message send path | No backend-only send function contract in schema | Frontend may be tempted to write outbound rows directly |
| Webhook idempotency | `whatsapp_messages.whatsapp_message_id` is unique, but no general webhook event ledger/idempotency key columns | Status/inbound webhook replay handling may be incomplete |
| Suppression | No `whatsapp_suppression_list` | Cannot enforce opt-out/DNC consistently in send function |
| Official templates | Generic `templates` exists, but no `whatsapp_templates` | Cannot represent Meta template approval, language, category, quality, and component payloads safely |
| AI drafts | No dedicated AI suggestion table and `approval_queue` mapping is not specified | AI draft provenance, approval, and audit path is ambiguous |
| Settings/status | No non-secret WhatsApp settings/status source | Frontend has no safe way to display connection health without exposing secrets |
| Attribution | `campaigns` and `ad_set_performance_logs` exist, but no WhatsApp conversation attribution object | Click-to-WhatsApp analytics may require brittle JSON parsing or manual joins |

## RLS Principles

- Browser reads should be limited to authenticated operators and, later, client/role ownership rules.
- Browser writes should be narrow and non-destructive.
- Browser must not insert or delete messages/conversations in production.
- Edge Functions should perform privileged writes using server-side credentials and explicit authorization checks.
- Audit-critical records should be append-only from the browser perspective.
- Service role bypasses RLS, so Edge Functions must enforce application authorization before using privileged writes.

Long-term role helpers should be centralized. If the shared backend already has helper functions such as `can_access_client` or `aa_can_access_client`, reuse them rather than inventing duplicate authorization logic.

## Existing Object Hardening

### `whatsapp_conversations`

Purpose: conversation-level WhatsApp inbox state, assignment, prospect/client/campaign linkage, service window, AI summary, unread count, and lifecycle stage.

Current columns:

- `id uuid primary key`
- `prospect_id uuid references prospects(id)`
- `client_id uuid references clients(id)`
- `campaign_id uuid references campaigns(id)`
- `phone_number text not null`
- `contact_name text`
- `whatsapp_wa_id text`
- `source text`
- `status text`
- `stage text`
- `assigned_to uuid references auth.users(id)`
- `last_message_preview text`
- `last_message_at timestamptz`
- `unread_count integer`
- `service_window_open_until timestamptz`
- `last_inbound_at timestamptz`
- `last_outbound_at timestamptz`
- `ai_summary text`
- `ai_intent text`
- `ai_temperature text`
- `needs_human boolean`
- `metadata jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Recommended additional columns:

| Column | Type | Purpose |
| --- | --- | --- |
| `business_phone_number_id` | `text` | WhatsApp Cloud API phone number ID, non-secret identifier |
| `waba_id` | `text` | WhatsApp Business Account ID, non-secret identifier |
| `phone_number_e164` | `text` | Normalized recipient phone for uniqueness and suppression joins |
| `last_webhook_event_id` | `text` | Last inbound/status event processed for traceability |
| `last_status_at` | `timestamptz` | Latest provider status update time |
| `closed_at` | `timestamptz` | Lifecycle closure timestamp |
| `closed_reason` | `text` | Human/system reason for closure |
| `suppressed_at` | `timestamptz` | Snapshot of suppression state for inbox filtering |
| `opted_out_at` | `timestamptz` | Convenience denormalization from suppression table |

Recommended constraints:

- Keep existing status/stage/unread checks.
- Add `phone_number_e164` format check if a stable normalization convention exists.
- Add a unique partial index on `(business_phone_number_id, whatsapp_wa_id)` where both are not null.
- Add a unique partial index on `(business_phone_number_id, phone_number_e164)` where both are not null.

Recommended indexes:

- Existing FK/status/stage/timestamp indexes should remain.
- Add `(client_id, last_message_at desc)`.
- Add `(assigned_to, needs_human, last_message_at desc)`.
- Add `(business_phone_number_id, phone_number_e164)`.
- Add `(source, campaign_id, created_at desc)`.

RLS model:

| Operation | Browser permission | Backend/Edge Function permission |
| --- | --- | --- |
| Select | Authenticated operators who can access the linked client or assigned conversation | Service role/server functions can read after internal auth checks |
| Insert | No direct browser inserts | Inbound webhook, send function, manual-create backend function |
| Update | Narrow browser updates only for `assigned_to`, `stage`, `status`, `needs_human` where allowed; no provider/status/window fields | Webhook/send functions update all operational fields |
| Delete | No browser deletes | Avoid hard delete; backend-only archival preferred |

Recommended browser update path:

- Prefer RPC/Edge Function for conversation state changes so column-level restrictions can be enforced.
- If direct table update is retained, create a narrow policy and consider a trigger that blocks browser changes to provider-controlled columns.

Edge Function interactions:

- `whatsapp-webhook` creates or updates conversations from inbound messages.
- `send-whatsapp-message` updates `last_outbound_at`, service-window relevant metadata, and assignment if needed.
- `whatsapp-status-webhook` updates status summary fields only after validating event idempotency.
- `handle-whatsapp-opt-out` sets opt-out/suppression denormalized fields after writing suppression record.

Required audit/integration events:

- `audit_events`: `whatsapp.conversation.created`, `whatsapp.conversation.assigned`, `whatsapp.conversation.stage_changed`, `whatsapp.conversation.closed`, `whatsapp.opt_out.recorded`.
- `integration_events`: webhook received/processed/failed, send requested/sent/failed, status received/processed.

### `whatsapp_messages`

Purpose: append-oriented message ledger for inbound, outbound, template, media, AI/system, and provider status details.

Current columns:

- `id uuid primary key`
- `conversation_id uuid references whatsapp_conversations(id)`
- `prospect_id uuid references prospects(id)`
- `client_id uuid references clients(id)`
- `whatsapp_message_id text unique`
- `direction text`
- `message_type text`
- `body text`
- `media_url text`
- `media_mime_type text`
- `template_name text`
- `template_language text`
- `status text`
- `sender_type text`
- `sent_by uuid references auth.users(id)`
- `ai_generated boolean`
- `human_approved boolean`
- `approval_id uuid references approval_queue(id)`
- `error_message text`
- `metadata jsonb`
- `created_at timestamptz`
- `delivered_at timestamptz`
- `read_at timestamptz`

Recommended additional columns:

| Column | Type | Purpose |
| --- | --- | --- |
| `business_phone_number_id` | `text` | Non-secret sender phone ID for multi-number support |
| `waba_id` | `text` | Non-secret business account ID |
| `provider_status` | `text` | Raw/latest Meta status separate from UI status if needed |
| `status_updated_at` | `timestamptz` | Last provider status update time |
| `failed_at` | `timestamptz` | Failure timestamp |
| `queued_at` | `timestamptz` | Queue/send lifecycle timestamp |
| `sent_at` | `timestamptz` | Provider accepted timestamp |
| `template_parameters` | `jsonb` | Template variable payload used for send |
| `interactive_payload` | `jsonb` | Button/list/reply payloads |
| `webhook_event_id` | `text` | Idempotency key for inbound/status event when available |
| `in_reply_to_message_id` | `uuid references whatsapp_messages(id)` | Thread/reply relationship |

Recommended constraints:

- Keep existing direction/message_type/status/sender_type checks.
- Add check that outbound template messages include `template_name`.
- Add check that `direction = inbound` generally has `sender_type = contact`, unless system imports require otherwise.
- Use unique index on `whatsapp_message_id` where not null; existing unique column already does this, but future migration should verify remote definition.
- Add unique partial index on `webhook_event_id` where not null.

Recommended indexes:

- Existing `(conversation_id, created_at)` should remain.
- Add `(client_id, created_at desc)`.
- Add `(prospect_id, created_at desc)`.
- Add `(status, created_at desc)`.
- Add `(approval_id)` if not already implied by FK index.
- Add `(template_name, template_language, created_at desc)`.

RLS model:

| Operation | Browser permission | Backend/Edge Function permission |
| --- | --- | --- |
| Select | Authenticated operators who can access linked conversation/client | Service role/server functions can read after internal auth checks |
| Insert | No direct browser inserts | Send/webhook/system functions only |
| Update | No broad browser updates; optional narrow RPC to mark messages read, but prefer conversation-level read state | Status webhook/send functions update delivery/read/failure fields |
| Delete | No browser deletes | Avoid hard delete; backend-only retention process if legally required |

Edge Function interactions:

- `whatsapp-webhook` inserts inbound rows idempotently.
- `send-whatsapp-message` inserts queued/outbound rows, calls Meta, then updates provider ID/status.
- `whatsapp-status-webhook` updates status timestamps and errors.
- `generate-whatsapp-reply-suggestion` may read messages and create either an AI suggestion or an approval queue item, but should not insert a real outbound message until approved/sent.

Required audit/integration events:

- `audit_events`: `whatsapp.message.sent`, `whatsapp.message.failed`, `whatsapp.message.read_by_operator`, `whatsapp.message.ai_draft_approved`.
- `integration_events`: Meta send request/response, inbound webhook, status webhook, provider error.

## Required New Objects

### `whatsapp_suppression_list`

Purpose: durable opt-out and do-not-contact enforcement for phone numbers, prospects, clients, and WhatsApp identities.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Record ID |
| `phone_number_e164` | `text not null` | Normalized recipient phone |
| `whatsapp_wa_id` | `text` | Meta WhatsApp user ID if known |
| `prospect_id` | `uuid references prospects(id) on delete set null` | Optional prospect link |
| `client_id` | `uuid references clients(id) on delete set null` | Optional client context |
| `conversation_id` | `uuid references whatsapp_conversations(id) on delete set null` | Source conversation |
| `scope` | `text not null default 'global'` | `global`, `client`, `campaign` |
| `reason` | `text not null` | `opt_out`, `manual_dnc`, `invalid_number`, `blocked`, `complaint`, `other` |
| `source` | `text not null` | `inbound_keyword`, `manual`, `webhook`, `import`, `system` |
| `status` | `text not null default 'active'` | `active`, `lifted` |
| `notes` | `text` | Internal note |
| `created_by` | `uuid references auth.users(id) on delete set null` | Human/system actor if available |
| `created_at` | `timestamptz not null default now()` | Created time |
| `lifted_at` | `timestamptz` | If suppression is removed |
| `lifted_by` | `uuid references auth.users(id) on delete set null` | Actor |
| `metadata` | `jsonb not null default '{}'::jsonb` | Provider/raw context |

Foreign keys:

- `prospect_id -> prospects.id`
- `client_id -> clients.id`
- `conversation_id -> whatsapp_conversations.id`
- `created_by/lifted_by -> auth.users.id`

Indexes:

- Unique partial `(phone_number_e164, coalesce(client_id, '00000000-0000-0000-0000-000000000000'::uuid)) where status = 'active'` if scoped uniqueness is needed.
- `(phone_number_e164)`.
- `(whatsapp_wa_id)`.
- `(prospect_id)`.
- `(client_id, status)`.
- `(status, created_at desc)`.

Constraints:

- `status in ('active', 'lifted')`.
- `reason in ('opt_out', 'manual_dnc', 'invalid_number', 'blocked', 'complaint', 'other')`.
- `source in ('inbound_keyword', 'manual', 'webhook', 'import', 'system')`.
- Require `lifted_at is not null` when status is `lifted`.

RLS model:

| Operation | Browser permission | Backend-only permission |
| --- | --- | --- |
| Select | Authenticated operators can read records they can access by client/conversation | Full |
| Insert | Prefer Edge Function/RPC only; optional manual suppression function from UI | Webhook opt-out and send guard |
| Update | No direct update; use backend function to lift suppression with audit | Full |
| Delete | Never from browser; avoid hard delete | Backend only for retention/legal process |

Edge Function interactions:

- Send function must check active suppression before calling Meta.
- Webhook function must detect opt-out keywords and insert active suppression.
- Manual suppression UI should call a backend function, not direct insert/update.

Audit/integration events:

- `audit_events`: `whatsapp.suppression.created`, `whatsapp.suppression.lifted`, `whatsapp.send.blocked_suppressed`.
- `integration_events`: opt-out webhook processed, suppression import processed.

### `whatsapp_templates`

Purpose: official WhatsApp Cloud API template metadata and local usage configuration. This must not be confused with generic AA `templates`.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Local ID |
| `meta_template_id` | `text` | Meta template ID if available |
| `waba_id` | `text not null` | WhatsApp Business Account ID |
| `business_phone_number_id` | `text` | Optional phone number scope |
| `name` | `text not null` | Meta template name |
| `language` | `text not null` | e.g. `en_US` |
| `category` | `text not null` | Meta category |
| `status` | `text not null` | Meta approval status |
| `quality_rating` | `text` | Meta quality |
| `components` | `jsonb not null` | Meta components payload |
| `variables` | `jsonb not null default '[]'::jsonb` | Parsed variables |
| `body_text` | `text` | Renderable preview |
| `sample_values` | `jsonb not null default '{}'::jsonb` | Example values |
| `local_use_case` | `text` | Internal classification |
| `generic_template_id` | `uuid references templates(id) on delete set null` | Optional link to AA copy template |
| `created_at` | `timestamptz not null default now()` | Local row time |
| `updated_at` | `timestamptz not null default now()` | Local update time |
| `last_synced_at` | `timestamptz` | Meta sync time |
| `metadata` | `jsonb not null default '{}'::jsonb` | Raw provider payload |

Foreign keys:

- `generic_template_id -> templates.id`

Indexes:

- Unique `(waba_id, name, language)`.
- `(status, category)`.
- `(business_phone_number_id)`.
- `(last_synced_at desc)`.

Constraints:

- `status in ('approved', 'pending', 'rejected', 'paused', 'disabled', 'unknown')`.
- `category in ('marketing', 'utility', 'authentication', 'service', 'unknown')` or match Meta values exactly.
- `components` must be JSON object/array according to sync payload convention.

RLS model:

| Operation | Browser permission | Backend-only permission |
| --- | --- | --- |
| Select | Authenticated operators can read approved/usable metadata and previews | Full |
| Insert | No direct browser insert | Template sync/create Edge Functions |
| Update | No direct browser update except optional local display fields through backend function | Sync/create functions |
| Delete | No browser delete | Backend-only if needed; prefer status sync |

Edge Function interactions:

- `sync-whatsapp-templates` pulls Meta templates and upserts rows.
- `create-whatsapp-template` submits to Meta, records pending metadata, logs integration event.
- `send-whatsapp-message` validates template status/language before sending outside service window.

Audit/integration events:

- `audit_events`: `whatsapp.template.created`, `whatsapp.template.updated`, `whatsapp.template.linked_generic_template`.
- `integration_events`: template sync started/succeeded/failed, template create submitted/rejected/approved.

### AI Drafts: `whatsapp_ai_suggestions` or `approval_queue` Mapping

Recommendation: use both, with clear ownership.

- `whatsapp_ai_suggestions` stores generated draft provenance and model metadata.
- `approval_queue` stores human approval workflow items when a draft is intended for outbound send.

#### `whatsapp_ai_suggestions`

Purpose: auditable AI reply suggestions tied to a conversation/message context before human approval or discard.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Suggestion ID |
| `conversation_id` | `uuid not null references whatsapp_conversations(id) on delete cascade` | Conversation |
| `prospect_id` | `uuid references prospects(id) on delete set null` | Prospect snapshot link |
| `client_id` | `uuid references clients(id) on delete set null` | Client context |
| `source_message_id` | `uuid references whatsapp_messages(id) on delete set null` | Message that prompted suggestion |
| `approval_queue_id` | `uuid references approval_queue(id) on delete set null` | Approval item if promoted |
| `suggestion_text` | `text not null` | Draft text |
| `rationale` | `text` | Optional model rationale summary |
| `model` | `text` | Model name |
| `prompt_version` | `text` | Prompt/version key |
| `input_summary` | `text` | Redacted input summary |
| `risk_score` | `numeric` | Compliance/brand risk |
| `status` | `text not null default 'draft'` | `draft`, `queued_for_approval`, `approved`, `rejected`, `discarded`, `sent` |
| `created_by` | `uuid references auth.users(id) on delete set null` | Requesting user |
| `created_at` | `timestamptz not null default now()` | Created time |
| `reviewed_by` | `uuid references auth.users(id) on delete set null` | Reviewer |
| `reviewed_at` | `timestamptz` | Review time |
| `metadata` | `jsonb not null default '{}'::jsonb` | Provider/raw data |

Indexes:

- `(conversation_id, created_at desc)`.
- `(client_id, status, created_at desc)`.
- `(approval_queue_id)`.
- `(source_message_id)`.

Constraints:

- `status in ('draft', 'queued_for_approval', 'approved', 'rejected', 'discarded', 'sent')`.
- `risk_score between 0 and 1` if normalized.

RLS model:

| Operation | Browser permission | Backend-only permission |
| --- | --- | --- |
| Select | Authenticated operators with conversation access | Full |
| Insert | Prefer via AI Edge Function only | AI function inserts |
| Update | No direct update except backend review/discard function | Approval/send functions update status |
| Delete | No browser delete | Backend retention only |

Approval queue mapping:

- Use `approval_queue.content_type = 'whatsapp_ai_reply'` or `whatsapp_outbound_message`.
- Use `approval_queue.content_id = whatsapp_ai_suggestions.id`.
- Store send target in `approval_queue.content` JSON: `conversation_id`, `prospect_id`, `client_id`, `template_name`, `body`, `risk_score`, `service_window_open_until`, `suppression_checked_at`.
- Approved items are sent through `send-whatsapp-message`, not by direct table insert.

Audit/integration events:

- `audit_events`: `whatsapp.ai_suggestion.created`, `whatsapp.ai_suggestion.queued`, `whatsapp.ai_suggestion.approved`, `whatsapp.ai_suggestion.rejected`, `whatsapp.ai_suggestion.sent`.
- `integration_events`: AI provider request/response/failure, redacted.

### WhatsApp Settings and Status Source

Recommendation: create a non-secret table or read-only security-definer RPC for display settings, and keep secrets in Supabase Edge Function secrets/Railway.

Table option: `whatsapp_settings`

Purpose: display non-secret connection, phone, behavior, and policy settings in the frontend.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Setting row |
| `client_id` | `uuid references clients(id) on delete cascade` | Optional client scope |
| `waba_id` | `text` | Non-secret WhatsApp Business Account ID |
| `business_phone_number_id` | `text not null` | Non-secret phone number ID |
| `display_phone_number` | `text` | Human-readable number |
| `display_name` | `text` | WhatsApp profile display |
| `webhook_status` | `text not null default 'unknown'` | `healthy`, `degraded`, `failing`, `unknown` |
| `last_webhook_at` | `timestamptz` | Last inbound/status event |
| `last_template_sync_at` | `timestamptz` | Template sync |
| `business_hours` | `jsonb not null default '{}'::jsonb` | Non-secret schedule |
| `send_policy` | `jsonb not null default '{}'::jsonb` | Service-window/template rules |
| `ai_policy` | `jsonb not null default '{}'::jsonb` | Non-secret AI toggles |
| `is_active` | `boolean not null default true` | Active number |
| `created_at` | `timestamptz not null default now()` | Created |
| `updated_at` | `timestamptz not null default now()` | Updated |

Do not store:

- Meta access tokens.
- Webhook verify tokens.
- App secrets.
- Supabase service role keys.
- AI provider keys.

Indexes:

- Unique `(business_phone_number_id)`.
- `(client_id, is_active)`.
- `(webhook_status)`.

RLS model:

| Operation | Browser permission | Backend-only permission |
| --- | --- | --- |
| Select | Authenticated operators can read non-secret status for accessible clients | Full |
| Insert | No browser insert | Admin/setup function |
| Update | No direct browser update except maybe non-secret preferences via backend function | Admin/sync functions |
| Delete | No browser delete | Backend/admin only |

Alternative:

- Use an RPC such as `get_whatsapp_connection_status()` that returns only non-secret fields assembled from settings and recent `integration_events`.
- This can avoid exposing raw settings rows and can be easier to secure.

Audit/integration events:

- `audit_events`: `whatsapp.settings.updated`, `whatsapp.phone.enabled`, `whatsapp.phone.disabled`.
- `integration_events`: webhook health check, template sync, send function health.

### Campaign Attribution Object

Recommendation: create a table if webhook/click metadata needs durable attribution; add views/RPCs for analytics.

Table option: `whatsapp_campaign_attribution`

Purpose: link WhatsApp conversations/messages/prospects to Meta campaign/ad/adset IDs and AA campaign rows for click-to-WhatsApp lead attribution.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | Attribution row |
| `conversation_id` | `uuid not null references whatsapp_conversations(id) on delete cascade` | Conversation |
| `message_id` | `uuid references whatsapp_messages(id) on delete set null` | Initial inbound/click message |
| `prospect_id` | `uuid references prospects(id) on delete set null` | Prospect |
| `client_id` | `uuid references clients(id) on delete set null` | Client |
| `campaign_id` | `uuid references campaigns(id) on delete set null` | AA campaign |
| `meta_campaign_id` | `text` | Meta campaign ID |
| `meta_campaign_name` | `text` | Snapshot name |
| `meta_adset_id` | `text` | Meta ad set ID |
| `meta_adset_name` | `text` | Snapshot name |
| `meta_ad_id` | `text` | Meta ad ID |
| `meta_ad_name` | `text` | Snapshot name |
| `source_url` | `text` | Optional referral/source |
| `ctwa_clid` | `text` | Click-to-WhatsApp click ID if available |
| `source_payload` | `jsonb not null default '{}'::jsonb` | Raw webhook/referral payload |
| `first_touch_at` | `timestamptz not null default now()` | Attribution time |
| `created_at` | `timestamptz not null default now()` | Created |

Indexes:

- Unique partial `(conversation_id)` for primary attribution if one attribution per conversation.
- `(meta_campaign_id)`.
- `(meta_adset_id)`.
- `(meta_ad_id)`.
- `(client_id, first_touch_at desc)`.
- `(campaign_id, first_touch_at desc)`.
- `(ctwa_clid)` if available.

Constraints:

- At least one of `meta_campaign_id`, `meta_adset_id`, `meta_ad_id`, `ctwa_clid`, or `campaign_id` should be present.

RLS model:

| Operation | Browser permission | Backend-only permission |
| --- | --- | --- |
| Select | Authenticated operators with client/campaign access | Full |
| Insert | No direct browser insert | Webhook/sync functions only |
| Update | No direct browser update | Backend attribution reconciliation only |
| Delete | No browser delete | Backend/admin only |

Views/RPCs:

- `whatsapp_campaign_performance_daily`: join attribution, conversations, messages, and `ad_set_performance_logs`.
- `whatsapp_funnel_by_campaign`: conversations, replies, qualified, booked, won by campaign.
- `whatsapp_cost_per_conversation`: spend divided by attributed conversations.
- `whatsapp_cost_per_qualified_lead`: spend divided by qualified/booked/won conversations.

Audit/integration events:

- `integration_events`: attribution created/updated, Meta sync mismatch, campaign match failed.
- `audit_events`: manual attribution override if any manual correction is allowed.

## Production RLS Changes for Existing Broad Policies

Current local migrations create these broad policies:

- Authenticated users can read/insert/update/delete WhatsApp conversations.
- Authenticated users can read/insert/update/delete WhatsApp messages.

Production replacement plan:

### `whatsapp_conversations`

Browser can read:

- Conversations linked to accessible clients, or
- Conversations assigned to the current user, or
- Conversations where role helper grants WhatsApp operations access.

Browser can update:

- Prefer no direct table update.
- If direct update is necessary, only low-risk operator workflow fields:
  - `assigned_to`
  - `stage`
  - `status` for non-provider lifecycle values
  - `needs_human`
  - possibly `ai_summary` only through AI/backend function, not manual browser update

Browser must not:

- Insert conversations.
- Delete conversations.
- Update `phone_number`, `phone_number_e164`, `whatsapp_wa_id`, provider IDs, service window fields, message preview/timestamps, suppression fields, campaign/client/prospect FKs except through backend-controlled linking functions.

Edge Functions should handle:

- Insert/update from inbound webhooks.
- Conversation creation for outbound sends.
- Provider/service-window fields.
- Opt-out propagation.
- Audit/integration event writes.

### `whatsapp_messages`

Browser can read:

- Messages in conversations the user can access.

Browser can update:

- Prefer no direct update.
- Optional read-state action should update conversation-level operator state via RPC/function, not mutate message delivery status.

Browser must not:

- Insert messages.
- Delete messages.
- Update `direction`, `body`, `status`, provider IDs, status timestamps, approval links, AI flags, media/template fields, or metadata directly.

Edge Functions should handle:

- Outbound message insert/update.
- Inbound message insert.
- Status update.
- Failure/error update.
- AI draft promotion to outbound message only after approval and send.

## Edge Function Contract Summary

| Function | Required table interactions |
| --- | --- |
| `send-whatsapp-message` | Reads conversation/prospect/client/suppression/template; inserts or updates `whatsapp_messages`; updates conversation timestamps; writes `audit_events` and `integration_events` |
| `whatsapp-webhook` | Verifies Meta webhook; upserts conversation; inserts inbound messages idempotently; handles opt-out keywords; writes integration/audit events |
| `whatsapp-status-webhook` | Verifies Meta webhook; updates message status/timestamps idempotently; writes integration events |
| `generate-whatsapp-reply-suggestion` | Reads conversation/messages/client AI context; inserts `whatsapp_ai_suggestions`; optionally creates `approval_queue` item; logs AI task/integration/audit events |
| `sync-whatsapp-templates` | Calls Meta API; upserts `whatsapp_templates`; writes integration events |
| `create-whatsapp-template` | Submits template to Meta; inserts/updates `whatsapp_templates`; writes audit/integration events |
| `handle-whatsapp-opt-out` | Inserts or updates `whatsapp_suppression_list`; updates denormalized conversation fields; writes audit events |
| `process-outreach-queue` | Reads approved `approval_queue` WhatsApp items; checks suppression/templates/window; calls send function or shared send helper |

## Suggested Migration Sequence

Do not implement this sequence until remote migration history is reconciled.

1. Migration reconciliation or baseline repair.
2. Add helper authorization functions or confirm existing shared helpers.
3. Harden `whatsapp_conversations` and `whatsapp_messages` RLS by replacing broad CRUD policies.
4. Add `whatsapp_suppression_list`.
5. Add `whatsapp_templates`.
6. Add `whatsapp_ai_suggestions` and approval queue mapping conventions.
7. Add `whatsapp_settings` or status RPC.
8. Add `whatsapp_campaign_attribution` plus read-only analytics views/RPCs.
9. Regenerate Supabase types from `fgyvcyksgbivhrqoxkmj`.
10. Build Edge Functions and then wire frontend modules.

## First Migration Recommendation

First migration to implement after migration-history reconciliation:

`harden_whatsapp_conversations_messages_rls`

Scope:

- Drop the broad authenticated insert/update/delete policies on `whatsapp_conversations`.
- Drop the broad authenticated insert/update/delete policies on `whatsapp_messages`.
- Replace read policies with role/client/conversation access rules.
- Add narrow update path for conversation workflow state only, or require RPC/Edge Function for all updates.
- Ensure messages are read-only to browser users.

Reason:

The current broad CRUD policies are the highest production risk. New tables should not be added until the existing message/conversation ledgers are protected from direct browser mutation.

## Open Questions Before Implementation

- What role/profile helper should define WhatsApp operator access: existing `can_access_client`, `aa_can_access_client`, profile roles, or a new shared role table?
- Which repo owns migration history repair: `aa-operator`, `aa-outreach-auto`, or a shared backend repo/process?
- Should `whatsapp_ai_suggestions` be mandatory, or should all AI drafts go directly through `approval_queue`?
- Is WhatsApp operated under one WABA/phone number or multiple client-scoped phone numbers?
- What retention policy applies to WhatsApp message bodies and media URLs?
- Should campaign attribution be a physical table, a view over webhook payloads, or both?

