# AA Shared Supabase WhatsApp Backend Audit

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`  
Supabase URL: `https://fgyvcyksgbivhrqoxkmj.supabase.co`

This is a discovery audit only. No application code, migrations, RLS policies, Edge Functions, Railway workflows, or backend schema were changed.

## Phase 1 - Local Repo Context

| Area | Finding |
| --- | --- |
| Framework | Vite + React 18 + TypeScript + Tailwind + shadcn/Radix UI |
| Package manager | npm; `package-lock.json` is present and scripts use npm |
| Supabase client | `src/integrations/supabase/client.ts` |
| Generated types | `src/integrations/supabase/database.types.ts` |
| WhatsApp feature root | `src/features/whatsapp` |
| WhatsApp frontend files | `api.ts`, `hooks.ts`, `types.ts`, and components for inbox, conversation thread, reply composer, AI suggestions, outreach queue, templates, suppression, campaign leads, analytics, settings |
| Migration folder | `supabase/migrations` |
| Local Edge Functions folder | Not present; `supabase/functions` does not exist |
| Supabase link status | `supabase/.temp/project-ref` and `supabase/.temp/linked-project.json` point at `fgyvcyksgbivhrqoxkmj` |
| `.env.example` | Added in project hygiene cleanup with placeholders only |
| `.env.local` | Contains the correct Supabase URL and anon key for `fgyvcyksgbivhrqoxkmj`; do not expose service role secrets in Vite env |
| README | Updated in project hygiene cleanup with setup and Supabase guidance |
| Wrong old ref | Previous incorrect project ref was replaced in docs during project hygiene cleanup |

## Phase 2 - Generated Supabase Schema Inventory

`src/integrations/supabase/database.types.ts` is present and non-empty. It includes `PostgrestVersion: "14.5"` and includes the local WhatsApp tables `whatsapp_conversations` and `whatsapp_messages`, which means the generated type currently proves those tables exist in the linked Supabase schema at generation time.

Known requested tables:

| Table | Present | Notes |
| --- | --- | --- |
| `prospects` | Yes | Core prospect/source and outreach status table |
| `clients` | Yes | Core client table with Meta account fields and WhatsApp/phone fields |
| `campaigns` | Yes | Core campaign table with client/prospect/sprint links |
| `templates` | Yes | Generic AA template table, not WhatsApp Cloud API template metadata |
| `approval_queue` | Yes | Core AA content approval queue |
| `approval_logs` | Yes | Generic approval audit trail |
| `audit_events` | Yes | Generic compliance/audit event table |
| `integration_events` | Yes | Generic integration event ledger |
| `ai_task_log` | Yes | Generic AI task execution log |
| `ai_alerts` | Yes | Generic AI alert table |
| `client_ai_context` | Yes | Per-client AI context JSON |
| `proof_sprint_whatsapp_scripts` | Yes | Proof sprint generated WhatsApp scripts |
| `ad_set_performance_logs` | Yes | Meta/ad set performance log style table |
| `distribution_metrics` | Yes | Outreach/distribution metrics |
| `growth_metrics_daily` | Yes | Daily growth metrics |
| `whatsapp_conversations` | Yes | Direct WhatsApp conversation table |
| `whatsapp_messages` | Yes | Direct WhatsApp message table |
| `whatsapp_suppression_list` | No | Required for production opt-out/suppression workflows |
| `whatsapp_templates` | No | Required for WhatsApp Cloud API template metadata |
| `whatsapp_ai_suggestions` | No | Optional but useful for auditable AI draft suggestions |
| `whatsapp_settings` | No | Public/non-secret settings table or secure status endpoint needed |

### Relevant Table Details

| Table | Purpose inferred from columns | Key columns and FKs | Backend area | `aa-outreach-auto` access | Likely `aa-operator` ownership | Safe to integrate now | Missing WhatsApp frontend needs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `whatsapp_conversations` | Conversation-level WhatsApp inbox state, service window, AI summary/intent, assignment, unread count, prospect/client/campaign linking | `id`, `phone_number`, `prospect_id -> prospects.id`, `client_id -> clients.id`, `campaign_id -> campaigns.id`, `assigned_to -> auth.users`, `last_message_at`, `service_window_open_until`, `needs_human`, `metadata` | WhatsApp operations | Read now; update narrowly for UI state after RLS review; writes should usually be via Edge Functions/webhooks | Shared; WhatsApp domain should own conversation state, operator can display | Partially safe: proven schema exists, but RLS is broad and send/webhook flows are absent locally | Need opt-out/consent fields or FK to suppression, status webhook fields, Meta business account/phone number linkage, channel/account identifiers |
| `whatsapp_messages` | Message ledger for inbound/outbound WhatsApp messages and status updates | `id`, `conversation_id -> whatsapp_conversations.id`, `prospect_id -> prospects.id`, `client_id -> clients.id`, `approval_id -> approval_queue.id`, `whatsapp_message_id unique`, `direction`, `message_type`, `status`, `sender_type`, `sent_by`, timestamps | WhatsApp operations | Read now; front-end should not insert production sends directly; outbound writes should go through send Edge Function | Shared; WhatsApp send/webhook layer owns writes, operator can audit/display | Partially safe: proven schema exists; direct insert policies need hardening before production | Need provider error/status history, template parameter payloads, webhook event IDs/idempotency keys, reaction/interactive payload support if needed |
| `prospects` | AA prospect CRM and enrichment source, including phone/WhatsApp, scoring, pipeline stage, Apify run, outreach flags | `id`, `business_name`, `phone`, `whatsapp`, `pipeline_stage`, `icp_total_score`, `assigned_to_profile_id -> profiles/ops_manager_status`, `apify_run_id`, `source_payload` | Core AA operations | Read for side panels and linking; update only defined CRM fields via approved backend/RLS | `aa-operator` likely owns sourcing, enrichment, scoring, lifecycle | Safe to read once RLS is reviewed | Need consent/opt-out source, WhatsApp-specific last-contact fields, normalized phone/WA ID if not stored in conversation table |
| `clients` | Client/account master record with owner, delivery/distribution owners, Meta account IDs, phone/WhatsApp | `id`, `business_name`, `owner_name`, `meta_ad_account_id`, `meta_pixel_id`, `prospect_id -> prospects.id`, owner profile FKs | Core AA operations | Read for client labels, attribution, filters; avoid broad writes | `aa-operator` owns client lifecycle | Safe to read after RLS review | Need WhatsApp Business Account/phone number mapping in secure backend/settings, not secret-bearing client rows |
| `campaigns` | Campaign metadata linking client/prospect/sprint, channel, dates, budget/status | `id`, `client_id -> clients.id`, `prospect_id -> prospects.id`, `sprint_id -> proof_sprints/sprints`, `channel`, `budget`, `status` | Shared campaign infrastructure | Read/display; link conversations/campaign leads if IDs align | `aa-operator` likely owns campaign creation/performance workflow | Safe to read if campaign semantics match WhatsApp | Need Meta campaign/ad/adset/ad IDs for click-to-WhatsApp attribution or a dedicated attribution table/view |
| `templates` | Generic AA content templates, status/version/category/variables | `id`, `title`, `content`, `variables`, `last_edited_by_profile_id -> profiles/ops_manager_status` | Core AA content/template infrastructure | Display only if explicitly used as copy templates; not enough for official WhatsApp templates | `aa-operator` likely owns generic templates | Not sufficient for WhatsApp Cloud API template sending | Need `whatsapp_templates` with Meta template name, language, category, status, components, variables, quality/rating, namespace/account IDs |
| `approval_queue` | Generic human approval queue for AA content | `id`, `client_id -> clients.id`, `content_id`, `content_type`, `content` JSON, `status`, reviewer/approver FKs, readiness scores | Shared approval infrastructure | Read/write only for WhatsApp approval items after workflow contract is defined | `aa-operator` likely owns generic approval workflow | Reusable with caution | Need clear `content_type` values for WhatsApp drafts/templates, send intent, target conversation/prospect IDs, compliance state |
| `approval_logs` | Generic approval request/decision history | `entity_type`, `entity_id`, `approval_type`, status, requested/reviewed profile FKs | Shared audit/approval infrastructure | Display as audit trail; insert via backend workflow | `aa-operator` likely owns generic logs | Safe to display; writes should be backend-owned | Need convention for WhatsApp entity types and linking to messages/conversations |
| `audit_events` | Generic immutable-ish audit event ledger | `entity_type`, `entity_id`, `action`, actor profile FK, old/new data, metadata | Shared compliance/audit infrastructure | Display compliance logs; writes should be through secure backend | Shared/backend-owned | Safe to display after RLS review | Need standard WhatsApp event actions for send, opt-out, webhook received, status changed, AI draft approved |
| `integration_events` | Generic integration event ledger for external systems | `integration_name`, `event_type`, `source_system`, `target_system`, `payload`, `status`, `error_message` | Shared integration infrastructure | Display operational status; writes by webhooks/sync functions | Shared/backend-owned | Safe to display after RLS review | Need WhatsApp/Meta idempotency keys, webhook event IDs, retry metadata if not kept in payload |
| `ai_task_log` | Generic AI execution log with tool/SOP/status/input/output summaries | `id`, `sop_id`, `sop_name`, `tool_called`, `status`, `duration_ms` | AI operations | Display AI activity; do not write from browser | `aa-operator` owns AI task execution | Safe to display if non-sensitive summaries | Need client/prospect/conversation/message FKs for WhatsApp-specific traceability |
| `ai_alerts` | Generic AI-generated operational alerts | `category`, `severity`, `message`, `suggested_action`, `resolved` | AI operations | Display relevant alerts; resolve only with defined permissions | `aa-operator` owns alert workflow | Safe to display after RLS review | Need entity links for WhatsApp conversations/prospects |
| `client_ai_context` | Per-client AI context payload and version | `client_id -> clients.id`, `context_json`, `context_version`, `last_assembled_at` | AI/shared context | Read for AI prompt context only through backend; avoid direct front-end exposure if sensitive | `aa-operator` likely owns assembly | Use through Edge Functions, not directly in browser prompts | Need WhatsApp prompt subset or redaction rules |
| `proof_sprint_whatsapp_scripts` | Generated WhatsApp script artifacts for proof sprint workflows | `client_id -> clients.id`, `deliverable_key`, `input_json`, `output_json`, `output_md`, `prompt_key`, `model`, `run_id`, `status` | Core proof sprint/AI deliverables | Display/copy approved scripts only if workflow needs it | `aa-operator` likely owns generation | Safe to display after RLS and status filtering | Need mapping from script output to official WhatsApp template or outbound draft workflow |
| `ad_set_performance_logs` | Ad set performance rows by date/adset/campaign/client | `adset_id`, `campaign_id`, `date`, `spend`, `clicks`, `impressions`, `cpl`, `client_name`, `sprint_id` | Campaign/ad analytics | Read for analytics and attribution if campaign IDs align | `aa-operator`/backend sync owns ingestion | Safe to display after source validation | Need click-to-WhatsApp conversation attribution, cost per conversation/qualified lead joins |
| `distribution_metrics` | Daily distribution/outreach manager metrics | `manager_id -> profiles/ops_manager_status`, `date_key`, `outreach_sent`, `followups_sent`, `calls_booked`, `prospects_scraped/enriched` | Core AA operations metrics | Display high-level metrics only | `aa-operator` owns | Safe to display if aligned | Need WhatsApp-specific send/reply metrics or view |
| `growth_metrics_daily` | Daily growth/social metrics | `user_id`, `date`, `inbound_dms`, `link_clicks`, `booked_calls` | Growth analytics | Maybe display if relevant; not WhatsApp-specific | `aa-operator` owns | Not primary for WhatsApp | Need WhatsApp channel-specific metrics |

## Phase 3 - Migration Inventory

Local migrations present:

| Filename | Objects created/changed | Category | WhatsApp impact | Safe to push? | Conflict risk with `aa-operator` backend |
| --- | --- | --- | --- | --- | --- |
| `20260503190000_create_whatsapp_conversations.sql` | Creates `public.whatsapp_conversations`, indexes, `public.set_updated_at()` if missing, `set_whatsapp_conversations_updated_at` trigger, enables RLS, adds broad authenticated CRUD policies | WhatsApp table, RLS, trigger | Directly creates conversation backend used by inbox | Likely already represented in generated types; do not push without checking remote migration history | Medium: broad CRUD policies and shared `set_updated_at` function name may overlap with existing backend conventions |
| `20260503200000_create_whatsapp_messages.sql` | Creates `public.whatsapp_messages`, indexes, `public.sync_whatsapp_conversation_from_message()`, insert trigger to update conversation preview/window/unread count, enables RLS, broad authenticated CRUD policies | WhatsApp table, RLS, trigger/function | Directly creates message ledger and conversation sync behavior | Likely already represented in generated types; do not push without checking remote migration history | Medium: broad CRUD policies and trigger behavior may conflict with webhook/send flows if those already exist elsewhere |

Requested migration categories:

| Category | Local finding |
| --- | --- |
| WhatsApp-related migrations | The two local migrations above |
| Prospect-related migrations | None local in this repo; `prospects` exists in generated types from shared backend |
| Approval queue migrations | None local in this repo; `approval_queue` and `approval_logs` exist in generated types |
| AI-related migrations | None local in this repo; `ai_task_log`, `ai_alerts`, and `client_ai_context` exist in generated types |
| Campaign/ad migrations | None local in this repo; `campaigns`, `ad_set_performance_logs`, `distribution_metrics`, and `growth_metrics_daily` exist in generated types |
| Audit/integration migrations | None local in this repo; `audit_events` and `integration_events` exist in generated types |
| RLS migrations | Both local WhatsApp migrations add broad authenticated CRUD policies |
| Trigger/function migrations | Both local WhatsApp migrations add triggers/functions |
| Created in `aa-outreach-auto` but not pushed | Cannot prove from local files alone. Because generated types include `whatsapp_conversations` and `whatsapp_messages`, the schema existed in the project when types were generated. Confirm with Supabase migration history before any `db push`. |

## Phase 4 - Local Supabase Edge Functions

`supabase/functions` is absent in `aa-outreach-auto`.

No local Edge Functions were found for:

- `send-whatsapp-message`
- `generate-whatsapp-reply-suggestion`
- `whatsapp-webhook`
- `whatsapp-status-webhook`
- `meta-webhook`
- `enrich-prospect`
- `approve-outreach`
- `process-outreach-queue`
- `sync-meta-ads`
- `create-whatsapp-template`

No local code was found calling Meta Graph API, WhatsApp Cloud API, Claude, Anthropic, OpenAI, or Apify.

Implication: `aa-outreach-auto` currently has schema-backed read access for conversations/messages, but no proven local backend functions for sending, webhook ingestion, AI reply generation, template sync, suppression handling, or approval-driven send processing.

## Phase 5 - Frontend Backend Dependency Inventory

| File | Purpose | Backend dependency | Exists? | Status |
| --- | --- | --- | --- | --- |
| `src/integrations/supabase/client.ts` | Browser Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` | Supabase project URL and anon key | Yes locally | Connected |
| `src/features/whatsapp/api.ts` | Reads conversations and messages from Supabase and maps database rows to UI types | `whatsapp_conversations`, `whatsapp_messages`, joined `prospects` | Yes in generated types | Connected for reads |
| `src/features/whatsapp/hooks.ts` | Loads conversation/message data; exposes placeholder hooks/actions for other modules | Conversations/messages tables; future functions/tables for queue, templates, suppression, campaign leads, AI, sending | Partially | Connected for conversations/messages; unconnected for other modules |
| `src/features/whatsapp/components/WhatsAppInbox.tsx` | Inbox shell using `useWhatsAppConversations` | `whatsapp_conversations` via hook | Yes | Connected |
| `src/features/whatsapp/components/ConversationList.tsx` | Conversation list and empty/error states | `whatsapp_conversations` via hook | Yes | Connected |
| `src/features/whatsapp/components/ConversationThread.tsx` | Message thread and reply composer container | `whatsapp_messages` via hook; send function for outbound | Messages yes, send function no | Partially connected |
| `src/features/whatsapp/components/ReplyComposer.tsx` | Freeform/template send UI and AI suggestion trigger | `sendFreeformMessage`, `sendTemplateMessage`, `generateAIReply`, `useWhatsAppTemplates` | No local backend functions/tables for these | Not connected for send/AI/templates |
| `src/features/whatsapp/components/AISuggestionPanel.tsx` | UI for AI reply suggestion | AI suggestion function/table | No | Not connected |
| `src/features/whatsapp/components/OutreachQueue.tsx` | Review/approve/reject outbound outreach | `approval_queue` or dedicated WhatsApp queue plus send function | `approval_queue` exists, hook not wired; send flow absent | Not connected |
| `src/features/whatsapp/components/TemplateManager.tsx` | Template listing/use UI | `whatsapp_templates` or `templates`; Meta template sync function | Generic `templates` exists, `whatsapp_templates` absent | Not connected |
| `src/features/whatsapp/components/SuppressionList.tsx` | Suppression/DNC UI | `whatsapp_suppression_list` or equivalent | No | Not connected |
| `src/features/whatsapp/components/CampaignLeads.tsx` | Click-to-WhatsApp/campaign lead UI | Campaign lead table/view, `campaigns`, ad/performance tables | Partial supporting tables exist; no campaign lead table/view proven | Not connected |
| `src/features/whatsapp/components/ProspectPanel.tsx` | Prospect side panel | `prospects`, enrichment/notes/compliance sources | `prospects` exists; hook not wired | Not connected beyond data already present on conversation mapping |
| `src/features/whatsapp/components/WhatsAppAnalytics.tsx` | Analytics empty state | Analytics views/RPCs over messages, campaigns, approvals, suppression | No dedicated views/RPCs | Not connected |
| `src/features/whatsapp/components/WhatsAppSettings.tsx` | Settings empty state | Secure settings/status endpoint; Supabase secrets | No local table/function | Not connected |

No `supabase.functions.invoke` or `functions.invoke` calls exist in the audited sources.

## Phase 6 - `aa-operator` Local Availability

`aa-operator` was not found at:

- `../aa-operator`
- `/workspaces/aa-operator`
- `/workspaces/*operator*`

Because it is unavailable locally, this audit could not verify its migrations, Edge Functions, Railway workflows, cron jobs, AI workflow files, or actual ownership conventions.

Checklist required in `aa-operator` before production build:

- Supabase client setup and project ref/URL.
- Full `supabase/migrations` history and remote migration status.
- `supabase/functions`, especially WhatsApp, Meta, AI, enrichment, approval, and sync functions.
- Railway configs and cron workflows.
- Package scripts that run cron/sync/enrichment jobs.
- AI workflow files using Claude, Anthropic, OpenAI, Apify, or internal agents.
- Prospect sourcing/enrichment logic.
- Approval queue creation/review/send logic.
- Writes to `integration_events`, `audit_events`, `ai_task_log`, `approval_queue`, `approval_logs`, `prospects`, `campaigns`, `clients`.
- Any WhatsApp or Meta Graph API references.

## Phase 7 - Backend Ownership Map

| Backend area | Ownership classification | Notes |
| --- | --- | --- |
| Prospects | Owned by `aa-operator` | `aa-outreach-auto` should read and display; updates need defined workflow/RLS |
| Prospect enrichment | Owned by `aa-operator` | Browser should not call Apify/AI enrichment directly |
| Outreach approval queue | Shared Supabase backend, likely `aa-operator` workflow owner | WhatsApp frontend can display/review approved WhatsApp-specific items once contract exists |
| WhatsApp conversations | Owned by `aa-outreach-auto` with shared Supabase backend | Conversation state is WhatsApp domain; operator can display |
| WhatsApp messages | Owned by `aa-outreach-auto` backend functions/webhooks | Browser reads; sends/status writes via backend |
| WhatsApp send function | Edge Function owned by backend only | Must hold Meta secrets server-side |
| WhatsApp inbound webhook | Edge Function owned by backend only | Must verify Meta webhook and write conversations/messages |
| WhatsApp status webhook | Edge Function owned by backend only | Must update message status/idempotently |
| AI reply suggestions | Shared AI/backend | Frontend invokes function; function uses `client_ai_context`, conversation/messages, and logs |
| AI task logs | Owned by `aa-operator`/shared backend | Display only from frontend |
| Claude/OpenAI/Anthropic calls | Should not be touched from front end | Must stay in Edge Functions or backend jobs |
| Meta Ads click-to-WhatsApp campaign data | Shared Supabase backend; ingestion likely `aa-operator`/backend | Frontend displays attribution and analytics |
| Campaign/ad performance logs | Owned by `aa-operator` or backend sync | Frontend display only |
| Templates | Shared; generic `templates` owned by `aa-operator`, WhatsApp template metadata should be `aa-outreach-auto`/backend | Need dedicated WhatsApp template source |
| `proof_sprint_whatsapp_scripts` | Owned by `aa-operator` | Frontend can display/copy approved script artifacts if useful |
| Suppression list | Owned by `aa-outreach-auto` with backend enforcement | Missing table/source; send function must enforce |
| Compliance/audit logs | Shared Supabase backend | Writes via backend only; frontend displays |
| `integration_events` | Shared backend | Writes via functions/jobs; frontend displays status |
| Clients | Owned by `aa-operator` | Frontend reads for context |
| Business settings | Shared; secret-backed parts backend only | Frontend can display non-secret status |
| Cron workflows | Owned by `aa-operator`/Railway | Do not duplicate in frontend |
| Railway jobs | Owned by `aa-operator` | Do not duplicate |
| Supabase secrets | Should not be touched from front end | Meta/AI/Apify/service role secrets must remain in Supabase/Railway backend |

## Phase 8 - Gap Analysis

1. Existing WhatsApp backend functionality:
   - `whatsapp_conversations` and `whatsapp_messages` tables exist in generated types.
   - Local migrations define indexes, RLS, updated-at trigger, and message-to-conversation sync trigger.
   - Frontend can read conversations/messages.

2. Existing WhatsApp tables:
   - `whatsapp_conversations`
   - `whatsapp_messages`
   - Related support tables: `prospects`, `clients`, `campaigns`, `approval_queue`, `approval_logs`, `audit_events`, `integration_events`, `templates`, `proof_sprint_whatsapp_scripts`.

3. Existing WhatsApp Edge Functions:
   - None found locally in `aa-outreach-auto`.

4. WhatsApp frontend modules already connected:
   - Inbox/conversation list reads `whatsapp_conversations`.
   - Conversation thread reads `whatsapp_messages`.
   - Prospect summary fields are joined through `prospects` in the conversation query.

5. Frontend modules still empty or placeholder:
   - Send freeform message.
   - Send template message.
   - AI reply generation.
   - Outreach approval queue.
   - Template manager.
   - Suppression list.
   - Campaign leads.
   - Prospect detail enrichment/notes/compliance.
   - Analytics.
   - Settings.

6. Backend workflows that belong in `aa-operator` and should not be duplicated:
   - Prospect sourcing/enrichment.
   - Global AI jobs and AI task logging conventions.
   - Generic approval queue orchestration.
   - Client lifecycle and campaign lifecycle workflows.
   - Railway cron jobs and scheduled syncs.
   - Generic Meta Ads/performance ingestion, unless WhatsApp-specific webhook attribution is intentionally split.

7. Backend workflows to create specifically for `aa-outreach-auto`:
   - WhatsApp send function with suppression, service window, template, audit, and status handling.
   - WhatsApp inbound webhook.
   - WhatsApp status webhook.
   - WhatsApp template metadata sync/create flow.
   - Opt-out/suppression handling.
   - AI reply suggestion function scoped to conversation context.

8. Missing tables required:
   - `whatsapp_suppression_list`
   - `whatsapp_templates`
   - `whatsapp_ai_suggestions` or an auditable AI draft table
   - WhatsApp settings/status table or secure function-backed status source
   - Optional campaign/conversation attribution table or view for click-to-WhatsApp leads

9. Missing Edge Functions required:
   - `send-whatsapp-message`
   - `send-whatsapp-template-message` or template mode inside send function
   - `whatsapp-webhook`
   - `whatsapp-status-webhook` or unified `meta-webhook`
   - `generate-whatsapp-reply-suggestion`
   - `create-whatsapp-template` / `sync-whatsapp-templates`
   - `process-outreach-queue` if sends are queued/approved asynchronously
   - `handle-whatsapp-opt-out`

10. Missing RPCs/views that would improve analytics:
   - Conversation funnel by stage/source/date/client.
   - Reply rate by template/campaign/source.
   - Cost per WhatsApp conversation and cost per qualified lead.
   - SLA/service-window open conversations.
   - Suppression and opt-out rate by source/template.
   - AI suggestion acceptance and edit rate.

11. RLS policies needing review before production:
   - Current local WhatsApp migrations use broad authenticated CRUD policies on conversations/messages.
   - Need role/client ownership rules, no arbitrary delete from browser, and backend-only write paths for sends/webhooks/status.

12. Secrets that must exist in Supabase/Railway backend, not the frontend:
   - Supabase service role key.
   - Meta/WhatsApp access token.
   - WhatsApp Business Account ID and Phone Number ID if sensitive in context.
   - Webhook verify token and app secret.
   - Claude/Anthropic/OpenAI API keys.
   - Apify token.
   - Railway cron/job secrets.

13. Existing AA tables reusable safely:
   - `prospects`, `clients`, `campaigns`, `approval_queue`, `approval_logs`, `audit_events`, `integration_events`, `client_ai_context`, `ai_task_log`, `proof_sprint_whatsapp_scripts`, `ad_set_performance_logs`.

14. Existing AA tables to avoid overloading for WhatsApp:
   - Generic `templates` should not be treated as official WhatsApp API templates.
   - `growth_metrics_daily` and `distribution_metrics` should not become detailed WhatsApp analytics ledgers.
   - `ai_task_log` should not store full sensitive message bodies if summaries are enough.
   - `campaigns` should not absorb low-level Meta ad/adset/message attribution without a clear schema.
