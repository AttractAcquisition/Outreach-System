# AA Outreach Auto WhatsApp Integration Build Plan

Audit date: 2026-05-05  
Target Supabase project ref: `fgyvcyksgbivhrqoxkmj`  
Target Supabase URL: `https://fgyvcyksgbivhrqoxkmj.supabase.co`

This plan assumes `aa-outreach-auto` remains the WhatsApp frontend system and uses the shared Supabase backend without duplicating `aa-operator` ownership of global AI operations, prospect enrichment, client lifecycle, Railway cron jobs, or generic approval workflows.

## Recommended Order

1. Phase A - Backend truth audit and type sync.
2. Phase B - Core WhatsApp data model hardening.
3. Phase C - WhatsApp API Edge Functions.
4. Phase D - AI operations integration.
5. Phase E - Outreach workflow.
6. Phase F - Templates and compliance.
7. Phase G - Meta Ads and campaign attribution.
8. Phase H - Frontend module buildout.
9. Phase I - Production readiness.

## Phase A - Backend Truth Audit and Type Sync

| Item | Detail |
| --- | --- |
| Objective | Prove the remote Supabase schema, migration history, and types match `fgyvcyksgbivhrqoxkmj`; eliminate stale/local-only assumptions. |
| Files likely touched | `src/integrations/supabase/database.types.ts`, docs only; no schema changes in this phase |
| Tables used | All generated tables for inventory; especially `whatsapp_conversations`, `whatsapp_messages`, `prospects`, `clients`, `campaigns`, `approval_queue`, `audit_events`, `integration_events` |
| Edge Functions used | None |
| Risks | Generating types against the wrong project ref; pushing local migrations already applied remotely; trusting local files over remote metadata |
| Acceptance criteria | Supabase CLI linked to `fgyvcyksgbivhrqoxkmj`; old ref removed from docs/config in a dedicated cleanup; generated types freshly produced from the correct project; remote migration status documented |
| Codex build prompt required next | "Regenerate Supabase types from project `fgyvcyksgbivhrqoxkmj`, verify no app code changes are needed, and update only docs/type files if required." |

## Phase B - Core WhatsApp Data Model

| Item | Detail |
| --- | --- |
| Objective | Finalize production-safe conversation/message schema and required related WhatsApp tables. |
| Files likely touched | `supabase/migrations/*`, `src/integrations/supabase/database.types.ts`, docs |
| Tables used | `whatsapp_conversations`, `whatsapp_messages`, `prospects`, `clients`, `campaigns`, new `whatsapp_suppression_list`, new `whatsapp_templates`, optional attribution table/view |
| Edge Functions used | None initially |
| Risks | Broad authenticated CRUD policies; missing idempotency fields for webhooks; weak phone normalization; ambiguous ownership between prospect and conversation status |
| Acceptance criteria | Conversations link to prospect/client/campaign; messages support provider IDs/status; suppression and template metadata exist or have confirmed alternatives; RLS restricts browser writes appropriately |
| Codex build prompt required next | "Design and propose the production WhatsApp schema/RLS migration set for conversations, messages, suppression, templates, and attribution without applying it." |

## Phase C - WhatsApp API Edge Functions

| Item | Detail |
| --- | --- |
| Objective | Move all WhatsApp Cloud API and Meta webhook operations into Supabase Edge Functions. |
| Files likely touched | `supabase/functions/send-whatsapp-message/*`, `supabase/functions/whatsapp-webhook/*`, `supabase/functions/whatsapp-status-webhook/*`, `supabase/functions/sync-whatsapp-templates/*`, shared function utilities |
| Tables used | `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_suppression_list`, `whatsapp_templates`, `audit_events`, `integration_events`, `approval_queue`, `prospects`, `clients` |
| Edge Functions used | `send-whatsapp-message`, `whatsapp-webhook`, `whatsapp-status-webhook` or unified `meta-webhook`, `sync-whatsapp-templates`, `create-whatsapp-template`, `handle-whatsapp-opt-out` |
| Risks | Exposing Meta tokens to browser; duplicate sends; webhook replay; failing to enforce service-window/template rules; sending to suppressed contacts |
| Acceptance criteria | Send function checks auth, RLS/role, suppression, service window, template rules, writes message row and audit/integration events; webhooks verify Meta signatures/tokens and are idempotent |
| Codex build prompt required next | "Implement Supabase Edge Functions for WhatsApp send and webhook ingestion using server-side secrets only, with idempotency, suppression checks, and audit/integration event writes." |

## Phase D - AI Operations Integration

| Item | Detail |
| --- | --- |
| Objective | Add AI reply suggestions and prospect/context usage without duplicating `aa-operator` AI jobs. |
| Files likely touched | `supabase/functions/generate-whatsapp-reply-suggestion/*`, optional `supabase/migrations/*whatsapp_ai_suggestions*`, frontend hook wiring |
| Tables used | `whatsapp_conversations`, `whatsapp_messages`, `prospects`, `clients`, `client_ai_context`, `ai_task_log`, optional `whatsapp_ai_suggestions`, `approval_queue` |
| Edge Functions used | `generate-whatsapp-reply-suggestion`; possibly `enrich-prospect` only if owned by `aa-operator` and exposed intentionally |
| Risks | Sending sensitive context to browser; bypassing human approval; inconsistent AI logs; duplicating enrichment jobs |
| Acceptance criteria | AI function runs server-side, logs to `ai_task_log`, stores suggestion/audit if needed, supports human approval, and never requires AI keys in Vite env |
| Codex build prompt required next | "Wire AI reply suggestions through a Supabase Edge Function that reads conversation context server-side, logs to `ai_task_log`, and returns a reviewable draft." |

## Phase E - Outreach Workflow

| Item | Detail |
| --- | --- |
| Objective | Connect prospect sourcing handoff, approval queue, suppression checks, send scheduling, replies, and follow-up rules. |
| Files likely touched | `src/features/whatsapp/hooks.ts`, `src/features/whatsapp/api.ts`, `OutreachQueue.tsx`, backend functions/migrations |
| Tables used | `prospects`, `approval_queue`, `approval_logs`, `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_suppression_list`, `audit_events`, `integration_events` |
| Edge Functions used | `approve-outreach`, `process-outreach-queue`, `send-whatsapp-message` |
| Risks | Recreating `aa-operator` approval logic; sending before approval; ignoring suppression; race conditions around queue status |
| Acceptance criteria | Queue items have a WhatsApp-specific contract; approve/reject actions update the backend; sends happen only through backend; reply tracking updates conversations |
| Codex build prompt required next | "Connect the WhatsApp outreach queue UI to the existing approval backend contract, using backend functions for approve/reject/send and no direct send inserts from the browser." |

## Phase F - Templates and Compliance

| Item | Detail |
| --- | --- |
| Objective | Support official WhatsApp templates, suppression, consent/opt-out, audit logs, and service-window rules. |
| Files likely touched | `TemplateManager.tsx`, `SuppressionList.tsx`, `ReplyComposer.tsx`, migrations/functions for templates/suppression |
| Tables used | `whatsapp_templates`, `templates` as optional generic copy source, `whatsapp_suppression_list`, `audit_events`, `integration_events`, `whatsapp_messages`, `whatsapp_conversations` |
| Edge Functions used | `sync-whatsapp-templates`, `create-whatsapp-template`, `send-whatsapp-message`, `handle-whatsapp-opt-out` |
| Risks | Confusing generic AA templates with official Meta templates; missing opt-out proof; noncompliant freeform sends outside 24-hour window |
| Acceptance criteria | Template manager shows Meta-approved template status; send function enforces service window/template rules; opt-outs are durable and audited |
| Codex build prompt required next | "Build the WhatsApp templates and suppression backend contract, then connect the templates and suppression UI to it with production-safe RLS." |

## Phase G - Meta Ads and Campaign Attribution

| Item | Detail |
| --- | --- |
| Objective | Attribute click-to-WhatsApp leads and cost metrics back to Meta campaigns/adsets/ads and AA campaigns. |
| Files likely touched | `CampaignLeads.tsx`, `WhatsAppAnalytics.tsx`, migrations/views/RPCs, Meta sync functions |
| Tables used | `campaigns`, `ad_set_performance_logs`, `whatsapp_conversations`, `whatsapp_messages`, `prospects`, optional campaign attribution table/view |
| Edge Functions used | `sync-meta-ads`, `meta-webhook`, attribution RPCs/views |
| Risks | Campaign ID mismatch between AA and Meta; double counting conversations; missing cost joins |
| Acceptance criteria | Campaign leads list shows real source/ad/campaign metadata; analytics computes cost per conversation and cost per qualified lead from trusted tables/views |
| Codex build prompt required next | "Create/read the Meta-to-WhatsApp attribution model and connect campaign leads plus analytics to real campaign/ad performance sources." |

## Phase H - Frontend Module Buildout

| Item | Detail |
| --- | --- |
| Objective | Connect all WhatsApp Command Center modules to proven backend sources. |
| Files likely touched | `src/features/whatsapp/api.ts`, `hooks.ts`, `types.ts`, `WhatsAppInbox.tsx`, `ConversationThread.tsx`, `ReplyComposer.tsx`, `AISuggestionPanel.tsx`, `OutreachQueue.tsx`, `TemplateManager.tsx`, `SuppressionList.tsx`, `CampaignLeads.tsx`, `ProspectPanel.tsx`, `WhatsAppAnalytics.tsx`, `WhatsAppSettings.tsx` |
| Tables used | All WhatsApp, prospect, client, campaign, approval, audit, integration, analytics tables/views |
| Edge Functions used | Send, AI suggestion, approval, template, suppression, status/settings endpoints |
| Risks | UI optimistic state drifting from backend; broad `any` Supabase casts; rendering secret/config values; mobile layout regressions |
| Acceptance criteria | Inbox, thread, prospect panel, composer, AI suggestions, approval queue, templates, suppression, analytics, and settings all use real data or secure status endpoints; no mock data; build passes |
| Codex build prompt required next | "Wire the WhatsApp frontend modules one at a time to the proven Supabase tables and Edge Functions, preserving empty/error/loading states and avoiding mock data." |

## Phase I - Production Readiness

| Item | Detail |
| --- | --- |
| Objective | Harden security, deployment, observability, testing, and operations. |
| Files likely touched | RLS migrations, Edge Function tests/docs, deployment docs, `.env.example`, README, CI/build docs |
| Tables used | `audit_events`, `integration_events`, `exception_logs`, `ai_task_log`, all WhatsApp tables |
| Edge Functions used | All production WhatsApp/AI/Meta functions |
| Risks | Over-broad RLS; missing secrets; untested webhook replay; no staging/prod split; no monitoring of failed sends |
| Acceptance criteria | RLS reviewed; secrets only in Supabase/Railway; staging/prod config documented; webhook tests and send tests pass; failed sends logged; deployment flow documented |
| Codex build prompt required next | "Perform production readiness hardening for WhatsApp: RLS review, secrets checklist, webhook/send tests, audit logging, monitoring, and deployment docs." |

## Table and Function Ownership

| Object/area | Owner | Frontend behavior |
| --- | --- | --- |
| `prospects`, enrichment | `aa-operator` | Read/display; call owned backend only |
| `clients` | `aa-operator` | Read/display |
| `campaigns`, ad performance sync | `aa-operator` or shared backend | Read/display/analytics |
| `approval_queue`, `approval_logs` | Shared, likely `aa-operator` workflow owner | Display/review WhatsApp-specific items through defined API |
| `whatsapp_conversations`, `whatsapp_messages` | `aa-outreach-auto` domain on shared Supabase | Read directly; production writes through backend functions where appropriate |
| `whatsapp_suppression_list` | `aa-outreach-auto`/backend | Display/manage through secure mutations/functions |
| `whatsapp_templates` | `aa-outreach-auto`/backend, synced from Meta | Display/use; create/sync via backend |
| `audit_events`, `integration_events` | Shared backend | Display; writes by functions/jobs |
| AI provider calls | Backend only | Invoke Edge Functions, never provider APIs from browser |
| Meta/WhatsApp API calls | Backend only | Invoke Edge Functions, never Meta API from browser |
| Supabase secrets/service role | Backend only | Never exposed in Vite env |

## Exact Next Build Sequence

1. Regenerate Supabase types from `fgyvcyksgbivhrqoxkmj` and confirm the old project ref is removed from docs/config in a dedicated cleanup.
2. Inspect `aa-operator` when available and reconcile migration/function ownership before writing new migrations.
3. Harden/extend WhatsApp schema and RLS only after remote migration history is confirmed.
4. Build send/webhook/template/suppression Edge Functions with server-side secrets.
5. Wire frontend modules to those functions and proven tables one module at a time.

## Safeguards

- Do not run `npx supabase db push` until remote migration history is checked.
- Do not use service role keys in `src` or any Vite env file.
- Do not call Meta, OpenAI, Anthropic, Claude, or Apify from the browser.
- Do not treat generic `templates` as official WhatsApp templates without a mapping layer.
- Do not duplicate `aa-operator` cron/enrichment/approval jobs.
- Do not broaden RLS to make frontend work; design backend functions and policies intentionally.

