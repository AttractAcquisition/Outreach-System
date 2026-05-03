# WhatsApp Backend Requirements

Date: 2026-05-03

## Current Schema State

- `src/integrations/supabase/database.types.ts` was missing and has been added as an empty typed scaffold.
- No generated Supabase table definitions are present in the repo.
- `src/integrations/supabase/client.ts` was missing and has been added.
- The front end must not connect to guessed table names. Replace the scaffolded `database.types.ts` with generated Supabase types before wiring queries.

## Required Data Sources

| Feature Area | Required Table/Data Source | Required Purpose | Minimum Data Needed By UI | Notes |
|---|---|---|---|---|
| Conversations | Conversations table or view | List WhatsApp conversations and selected conversation metadata. | Conversation id, prospect id, business/contact names, phone, source, CRM stage, lead score, assignee, last message preview/time, unread count, last inbound time, service window expiry/status, opt-out/suppression state, tags, niche, location, first contact time. | Exact Supabase table name is not available in repo. Do not wire until schema confirms it. |
| Messages | Messages table | Render conversation thread and message audit trail. | Message id, conversation id, direction, message type, body, template name/params, status, created time, sender, Meta message id, error message. | Should support inbound/outbound/system messages and delivery statuses. |
| Prospects | Prospects table | Power prospect panel, CRM ownership, pipeline stage, and profile details. | Prospect id, business/contact names, phone, location, niche, source, owner, first contact, last inbound, lead score, CRM stage, opt-out/suppression flags. | May be joined to conversations or exposed through a view. |
| AI enrichment | Enrichment table, recommendation table, or Edge Function/RPC | Store or generate qualification data, suggested angle, and next-best-action recommendations. | Google listing state, Instagram activity, Meta ads signal, website quality, reviews, main gap, suggested angle, generated recommendation, model metadata, reviewed status. | Avoid front-end-only AI logic. Use secure backend for model calls. |
| Outreach queue | Outreach queue table | Review, approve, reject, and send outbound WhatsApp template drafts. | Queue id, prospect id, business/contact names, phone, niche, location, template name, template params, draft preview, AI observation, risk score, compliance status, queue status, created/approved/sent metadata, error message. | Send action likely needs an Edge Function, not direct front-end insert only. |
| Templates | WhatsApp templates table | Display approved templates and allow template preview/use. | Template id, template name, category, language, status, body, variables, use case, last used, sent count, reply rate, opt-out rate, notes. | Could be synced from Meta through backend. |
| Suppression list | Suppression records table | Block outbound sends and manage Do Not Contact records. | Suppression id, phone, business name, reason, source, created time, created by, notes. | RLS and audit behavior must be handled in Supabase/backend, not changed here. |
| Campaign leads | Campaign leads table or view | Show Meta Click-to-WhatsApp leads and open them in inbox. | Lead id, conversation id, phone, business/contact names, campaign/adset/ad names, initial message, received time, lead status, service window expiry, assignee, niche, location. | Likely populated by webhook ingestion. |
| Analytics | Analytics view, materialized view, or RPC | Power funnel, source/template/agent performance, replies, calls booked, opt-outs, and failures. | Aggregated send counts, delivery counts, reply counts/rates, positive replies, calls booked, opt-outs, failures, response times, open/closing service windows, source/template/agent breakdowns. | Prefer backend aggregation over client-side scans of large tables. |
| Settings | Secure settings table or backend endpoint | Display non-secret WhatsApp integration status and operator settings. | Non-secret connection status, display name, webhook health/status, business hours, sending rules, AI behavior settings. | Do not expose service role keys, Meta access tokens, webhook verify tokens, or other secrets in Vite client env. |

## Required Backend Actions

| Action | Recommended Backend Surface | Reason |
|---|---|---|
| Send free-form WhatsApp message | Edge Function | Requires WhatsApp Cloud API credentials and compliance checks. |
| Send template message | Edge Function | Requires credentials, approved template validation, and audit logging. |
| Generate AI reply | Edge Function or RPC backed by secure service | Model credentials and prompt controls should not live in the browser. |
| Approve/reject queue item | Table update or RPC | Needs authorization and audit trail. |
| Mark Do Not Contact | RPC or coordinated table writes | Must update suppression/compliance consistently. |
| Update CRM stage | Table update or RPC | Should preserve stage history. |
| Save internal note | Table insert | Needs operator identity and timestamp. |
| WhatsApp webhook ingestion | Edge Function | Handles inbound messages, statuses, campaign leads, and template status events. |

## Integration Guardrails

- Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the browser client.
- Never add service role keys to front-end code or Vite env vars.
- Do not alter RLS policies from front-end work.
- Do not connect components to guessed table names.
- Generate real database types from the project schema before implementing queries.
