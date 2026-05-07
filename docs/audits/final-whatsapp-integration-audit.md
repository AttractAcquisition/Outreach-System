# Final WhatsApp Integration Audit

Audit date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

This is the final verification pass before production testing. No deployment, schema change, or production API call was performed.

## A. Architecture Summary

### Frontend Modules

The WhatsApp app lives under `src/features/whatsapp`.

Primary shell:

- `WhatsAppCommandCenter.tsx`

Main feature modules:

- Inbox and conversations: `WhatsAppInbox`, `ConversationList`, `ConversationCard`, `ConversationThread`, `MessageBubble`
- Composer and sending: `ReplyComposer`
- AI suggestions and approvals: `AISuggestionPanel`, `OutreachQueue`
- Templates: `TemplateManager`
- Suppression: `SuppressionList`
- Campaign attribution: `CampaignLeads`
- Analytics: `WhatsAppAnalytics`
- Settings/health: `WhatsAppSettings`
- Prospect context: `ProspectPanel`

Data access is centralized in:

- `src/features/whatsapp/api.ts`
- `src/features/whatsapp/hooks.ts`
- `src/features/whatsapp/types.ts`
- `src/features/whatsapp/phone.ts`

Supabase client/type files:

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/database.types.ts`

### Supabase Tables

WhatsApp-owned/app-owned tables:

- `whatsapp_conversations`
- `whatsapp_messages`
- `whatsapp_suppression_list`
- `whatsapp_templates`
- `whatsapp_ai_suggestions`

Shared AA/backend tables read or written by WhatsApp workflows:

- `prospects`
- `clients`
- `campaigns`
- `approval_queue`
- `approval_logs`
- `audit_events`
- `integration_events`
- `ai_task_log`
- `client_ai_context`

### Edge Functions

Local functions present:

- `send-whatsapp-message`
- `meta-whatsapp-webhook`
- `generate-whatsapp-reply-suggestion`
- `whatsapp-integration-health`
- `sync-whatsapp-templates`
- `send-whatsapp-template-message`

These functions keep Meta API calls, AI provider calls, webhook verification, service-role writes, and secret handling server-side.

### `aa-operator` Responsibilities

This app should not duplicate `aa-operator` ownership for:

- shared prospect/client/campaign lifecycle,
- generic approval infrastructure ownership,
- campaign/ad spend sync jobs,
- enrichment and scoring workflows,
- shared authorization model and manager/client ownership rules.

### Shared Supabase Backend Responsibilities

The shared backend remains responsible for:

- durable schema ownership,
- RLS/authorization rules,
- Edge Function secrets,
- webhook and send operational logs,
- audit/compliance tables,
- Meta/WABA integration settings,
- long-term campaign attribution model.

## B. Current Functionality Matrix

| Module | Connected | Tables used | Edge Functions used | Read/write behavior | Remaining gaps |
| --- | --- | --- | --- | --- | --- |
| Inbox | Yes | `whatsapp_conversations`, `prospects` | None directly | Browser reads conversations; no direct conversation writes | Role/client-scoped reads still need production RLS predicates |
| Conversation thread | Yes | `whatsapp_messages` | None directly | Browser reads messages; no direct message writes | Message ledger writes must remain backend-only after RLS hardening |
| Reply composer | Yes | `whatsapp_templates`, `whatsapp_messages` via function response | `send-whatsapp-message`, `send-whatsapp-template-message` | Freeform and template sends go through Edge Functions; inserted templates do not auto-send | Template parameter UI supports simple body variables only |
| AI suggestions | Yes | `whatsapp_ai_suggestions`, `whatsapp_conversations`, `whatsapp_messages`, `prospects`, `clients`, `client_ai_context`, `ai_task_log` | `generate-whatsapp-reply-suggestion` | Generation is backend-owned; browser updates review/use status | Move approve/reject/use behind RPC/Edge Function for stricter audit controls |
| Approval queue | Partially | `whatsapp_ai_suggestions`; `approval_queue` inspected but not used for reply drafts | None for status decisions | Shows pending AI suggestions; approve/reject/use updates suggestion lifecycle | Generic `approval_queue` not used because required `client_id`/`content_id` does not fit prospect-only conversations |
| Templates | Yes | `whatsapp_templates` | `sync-whatsapp-templates` | Browser can list/create/edit/archive local rows; Meta sync is backend-owned | Local template create/edit should move behind backend or be permission-gated before production |
| Suppression list | Yes | `whatsapp_suppression_list` | Webhook writes opt-outs server-side | Browser lists/adds/soft-removes suppressions | Browser writes should move behind Edge Function for stricter audit controls |
| Campaign leads | Partially | `whatsapp_conversations`, `campaigns`, `prospects`, `clients` | None | Reads conversations with real `campaign_id` joins | Meta campaign/ad IDs, spend joins, and qualified lead attribution are unavailable |
| Analytics | Yes | `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_suppression_list`, `whatsapp_templates`, `whatsapp_ai_suggestions`, `campaigns`, `prospects`, `clients` | None | Browser reads and groups real Supabase rows | Cost per conversation/qualified lead unavailable until attribution is connected |
| Settings/health | Yes | `whatsapp_*`, `integration_events`, `ai_task_log` via function | `whatsapp-integration-health` | Browser invokes safe health function; no secret values displayed | Checks presence/activity only, not Meta token validity or webhook subscription state |
| Prospect panel | Partially | Conversation-linked prospect fields | None | Displays available context; some enrichment/recommendation panels remain unavailable | Qualification, next-best action, consent audit, notes, CRM actions not fully connected |

## C. Backend Function Matrix

| Function | Purpose | Request body | Secrets required | Tables read | Tables written | Deployment status | Test status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `send-whatsapp-message` | Send freeform text inside 24-hour service window | `{ conversation_id, body }` | `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, optional `WHATSAPP_GRAPH_API_VERSION` | `whatsapp_conversations`, `whatsapp_suppression_list` | `whatsapp_messages`, `whatsapp_conversations`, `integration_events`, `audit_events` | Unknown/local | Build only; manual QA required |
| `meta-whatsapp-webhook` | Verify webhook, ingest inbound messages, opt-outs, and status updates | GET verification; POST Meta webhook payload | `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | `prospects`, `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_suppression_list` | `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_suppression_list`, `integration_events` | Unknown/local | Build only; manual webhook QA required |
| `generate-whatsapp-reply-suggestion` | Generate and store AI reply draft for human review | `{ conversation_id }` | `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, optional `AI_PROVIDER`, `AI_MODEL` | `whatsapp_conversations`, `whatsapp_messages`, `prospects`, `clients`, `client_ai_context` | `whatsapp_ai_suggestions`, `ai_task_log` | Unknown/local | Build only; manual AI QA required |
| `whatsapp-integration-health` | Safe integration health/status endpoint | `{}` | `SUPABASE_SERVICE_ROLE_KEY`; checks presence of WhatsApp/AI secrets | `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_templates`, `whatsapp_suppression_list`, `whatsapp_ai_suggestions`, `integration_events`, `ai_task_log` | None | Unknown/local | Build only; manual health QA required |
| `sync-whatsapp-templates` | Sync official Meta template metadata into `whatsapp_templates` | `{}` | `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, optional `WHATSAPP_GRAPH_API_VERSION` | Meta Graph API, `whatsapp_templates` | `whatsapp_templates`, `integration_events` | Unknown/local | Build only; manual Meta QA required |
| `send-whatsapp-template-message` | Send approved official template message, including outside service window | `{ conversation_id, template_id, parameters }` | `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, optional `WHATSAPP_GRAPH_API_VERSION` | `whatsapp_conversations`, `whatsapp_templates`, `whatsapp_suppression_list` | `whatsapp_messages`, `whatsapp_conversations`, `integration_events`, `audit_events` | Unknown/local | Build only; manual template-send QA required |

## D. Data Model Matrix

| Table | Owner | Frontend access | Backend access | RLS status | Production risk |
| --- | --- | --- | --- | --- | --- |
| `whatsapp_conversations` | WhatsApp/shared backend | Read | Send/webhook/template functions read/update/insert | Broad local policies identified; manual hardening prepared | High until browser writes are removed remotely |
| `whatsapp_messages` | WhatsApp/shared backend | Read | Send/webhook/template functions insert/update | Broad local policies identified; manual hardening prepared | High until browser writes are removed remotely |
| `whatsapp_suppression_list` | WhatsApp/shared backend | Read, insert, soft-remove | Webhook opt-out and send checks | Broad write policies identified; narrower manual policy prepared | Medium; browser writes remain temporarily |
| `whatsapp_templates` | WhatsApp/shared backend | Read, local create/edit/archive | Meta sync and template send | Broad write policies identified; narrower manual policy prepared | Medium; local writes remain temporarily |
| `whatsapp_ai_suggestions` | WhatsApp AI workflow | Read, approve/reject/use update | AI generation insert | Broad insert/update identified; manual insert removal and narrower update prepared | Medium; lifecycle updates still browser-side |
| `prospects` | `aa-operator`/shared AA | Read via joins/context | Webhook prospect matching; AI context | Existing shared RLS unknown in this audit | Medium; ownership and visibility predicates must be shared |
| `clients` | `aa-operator`/shared AA | Read via joins/context | AI context and access checks | Existing shared RLS unknown in this audit | Medium; client ownership rules must align |
| `campaigns` | `aa-operator`/shared AA | Read via campaign attribution | None from WhatsApp functions currently | Existing shared RLS unknown in this audit | Low/medium; attribution incomplete |
| `approval_queue` | `aa-operator` approval infrastructure | Not used for WhatsApp AI drafts | Potential future broader outbound approvals | Existing shared RLS unknown | Low for current flow; medium if reused without contract |
| `approval_logs` | `aa-operator` approval/audit infrastructure | Not written from browser | Future backend approval logs | Existing shared RLS unknown | Low for current flow; logging convention missing |
| `audit_events` | Shared backend/audit | Not directly used by UI | Send/template functions write | Existing shared RLS unknown | Low; service-role backend writes only |
| `integration_events` | Shared backend/integration ops | Read indirectly via health docs/SQL; health function reads | Webhook/send/sync functions write | Existing shared RLS unknown | Low; service-role backend writes only |
| `ai_task_log` | Shared AI operations | Read indirectly via health docs/SQL; health function reads | AI function writes | Existing shared RLS unknown | Low/medium; summaries must stay non-sensitive |
| `client_ai_context` | `aa-operator`/AI backend | Not read directly by browser | AI function reads safe subset | Existing shared RLS unknown | Medium; sensitive context must stay backend-only |

## E. Security Review

### Frontend Secrets

`.env.example` contains only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` placeholder

README explicitly forbids service role keys, Meta tokens, webhook tokens, AI keys, and Apify keys in frontend files.

Secret-pattern scan returned documentation files with placeholder examples only:

- `docs/deployment/whatsapp-deployment-checklist.md`
- `docs/audits/whatsapp-template-sync-send.md`
- `docs/audits/ai-reply-suggestion-integration.md`
- `docs/audits/whatsapp-webhooks.md`
- `docs/audits/send-whatsapp-message-edge-function.md`

No source/frontend file path was flagged by the scan.

### Service Role Usage

Service role usage is restricted to Supabase Edge Functions. Functions authenticate the caller where appropriate before privileged operations. Webhook uses service role after signature/verification handling.

### Meta And AI Keys

Meta and AI provider keys are read via `Deno.env.get()` inside Edge Functions only. Browser calls Supabase functions, never Meta or AI providers directly.

### RLS

Manual hardening SQL exists:

- `docs/sql/harden_whatsapp_rls.sql`

It removes browser writes from `whatsapp_conversations` and `whatsapp_messages` while preserving current reads and temporary UI writes for suppression/templates/AI review lifecycle. It has not been applied by this audit.

### Webhook Verification

`meta-whatsapp-webhook` implements GET verification token handling and POST signature verification with `WHATSAPP_APP_SECRET`. Production QA must verify both valid and invalid webhook verification paths.

### Idempotency

Inbound webhook checks existing `whatsapp_messages.whatsapp_message_id` before insert. Status updates target existing Meta message IDs. Production QA must replay a duplicate inbound webhook to confirm no duplicate row is created.

### Suppression Enforcement

Suppression is enforced in both freeform send and template send functions. Webhook opt-out handling can create suppression entries.

### Service-Window Enforcement

Freeform sends are blocked when the 24-hour service window is missing or expired. Template sends allow outside-window sends only for approved/usable templates.

## F. Production Blockers

### P0 Must Fix Before Live

1. Apply reviewed RLS hardening or equivalent backend-owned policies in Supabase.
2. Confirm required tables exist remotely and generated types match production schema.
3. Deploy required Edge Functions to `fgyvcyksgbivhrqoxkmj`.
4. Configure required Supabase secrets in the Edge Function environment.
5. Complete Meta webhook callback, verify token, app secret, WABA, and phone number setup.
6. Run the full manual QA checklist against the production target.
7. Verify no service role, Meta, webhook, AI, or Apify secrets are present in frontend deploy artifacts.

### P1 Should Fix Before Client Use

1. Move suppression add/remove behind an Edge Function or RPC for stronger audit control.
2. Move AI suggestion approve/reject/use behind an Edge Function or RPC.
3. Decide whether local TemplateManager create/edit/archive is allowed in production or should be backend/role-gated.
4. Add role/client ownership predicates to WhatsApp read policies after shared AA authorization model is finalized.
5. Validate template sync pagination and non-body/header/button parameter handling if templates require it.
6. Validate health/settings behavior after deployment and with missing secrets.

### P2 Can Improve Later

1. Add server-side analytics RPC/view for scale.
2. Add full Meta campaign/ad attribution and spend joins.
3. Add backend-owned approval logs for AI suggestion decisions.
4. Connect ProspectPanel enrichment/recommendations/notes/CRM actions.
5. Add richer automated tests around extracted pure mappers after module boundaries are cleaned up.
6. Split large frontend chunks if bundle size becomes an operational issue.

## G. Final Recommended Next Actions

One sequence:

1. Review and apply `docs/sql/harden_whatsapp_rls.sql` manually in Supabase SQL Editor.
2. Deploy all required Edge Functions from `docs/deployment/whatsapp-deployment-checklist.md`.
3. Set required Supabase secrets with placeholder commands from the deployment checklist.
4. Regenerate Supabase types from `fgyvcyksgbivhrqoxkmj`.
5. Run `npm run test` and `npm run build`.
6. Configure Meta webhook/WABA/phone number settings.
7. Execute `docs/qa/whatsapp-production-qa-checklist.md` end to end.
8. Use `docs/runbooks/whatsapp-operations-runbook.md` for first production smoke monitoring.

## Verification Notes

- The old project ref was found once in a historical plan grep example and replaced with `old_project_ref_here`.
- No remote SQL was applied.
- No functions were deployed.
- No production APIs were called.
