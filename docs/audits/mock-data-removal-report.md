# Mock Data Removal Report

Date: 2026-05-03

## Summary

All front-end WhatsApp Acquisition Console mock records were removed from active application code. No new mock data was introduced. Because this workspace does not currently contain an existing Supabase client, generated database types, or a `src/integrations` directory, mock-backed features were replaced with empty/loading/error-capable UI states and TODO comments identifying the missing backend data source.

Skeleton loading placeholders remain because they are visual loading UI, not mock records.

## Removed Or Replaced Mock Data

| File | What Mock Data Existed | What Replaced It | Real Supabase Table Available | Remaining Backend Requirement |
|---|---|---|---|---|
| `src/features/whatsapp/mockData.ts` | Static conversations, messages, templates, outreach queue records, suppression records, campaign leads, prospects, and prospect qualification details. | File deleted. Hooks no longer import it. | No generated types/client available in repo. | Add/confirm real tables for conversations, messages, templates, outreach queue, suppression records, campaign leads, prospects, notes, and enrichment. |
| `src/features/whatsapp/hooks.ts` | `useMock` helper and all mock-backed hooks. Async functions returned fake success and generated fake AI replies. | Hooks now return empty arrays with loading/error fields and TODO comments. Backend actions return unavailable results and show error toasts. | No. | Wire hooks to existing Supabase client once present; add Edge Functions/RPCs for sending, AI reply generation, DNC, approvals, stage updates, and notes. |
| `src/features/whatsapp/components/ConversationList.tsx` | Rendered mock conversations supplied by hooks. | Empty state says no conversation data source is connected; error state added. | No. | Real conversations/prospects/messages query. |
| `src/features/whatsapp/components/ConversationThread.tsx` | Rendered mock messages supplied by hooks. | Empty state says no message data source is connected; error state added. | No. | Real messages query and send mutation. |
| `src/features/whatsapp/components/ReplyComposer.tsx` | Appended fake outbound messages after placeholder send success; generated static AI reply. | Appends only if backend action returns `ok`; current backend actions return unavailable. AI suggestion only displays if a real response exists. | No. | Real send endpoint and AI suggestion endpoint/table. |
| `src/features/whatsapp/components/OutreachQueue.tsx` | Rendered mock queue rows and changed approval/rejection state after fake success. | Empty/error state added. Approval/rejection UI only mutates local state if backend action returns `ok`. | No. | Real outreach queue table and approval/send workflow. |
| `src/features/whatsapp/components/TemplateManager.tsx` | Rendered mock template rows and fake "outreach queue item created" toast. | Empty/error state added. Create outreach now reports missing queue data source. | No. | Real WhatsApp templates table/sync and outreach queue creation. |
| `src/features/whatsapp/components/SuppressionList.tsx` | Rendered mock suppression rows; add/remove mutated local mock state. | Empty/loading/error states added. Add/remove reports missing data source. | No. | Real suppression table and insert/delete/update mutations. |
| `src/features/whatsapp/components/CampaignLeads.tsx` | Rendered mock Meta campaign leads and fake action success toasts. | Empty/error state added. Actions report missing backend integration. | No. | Real campaign leads table/webhook ingestion and lead update mutations. |
| `src/features/whatsapp/components/ProspectPanel.tsx` | Hardcoded qualification values, suggested angle, next-best-action list, consent label, and last template. | Empty states for qualification and next-best-action; consent/template audit fields now show unavailable values with TODO comments. | No. | Real prospect enrichment, recommendation, compliance, and message audit data. |
| `src/features/whatsapp/components/WhatsAppAnalytics.tsx` | Static funnel, source, template, agent, and KPI numbers. | Empty state with TODO for real analytics source. | No. | Analytics query/view/RPC over messages, outreach, templates, pipeline stages, and compliance events. |
| `src/features/whatsapp/components/WhatsAppSettings.tsx` | Static WhatsApp API IDs, connected number, webhook URL, business hours, AI prompt settings, and toggles. | Empty state with TODO for real integration settings or secure backend endpoint. | No. | Secure settings source; do not expose secrets in front-end. |

## Remaining Non-Data Placeholder Text

The repo still contains normal input placeholder attributes such as search boxes and textarea prompts. These are UX copy, not mock records.

## Backend Requirements

- Existing typed Supabase client in `src/integrations/supabase/client.ts`.
- Generated database types in `src/integrations/supabase/database.types.ts`.
- Data sources for WhatsApp conversations, messages, templates, outreach queue, campaign leads, prospects, suppression records, notes, compliance logs, analytics, and integration settings.
- Secure backend/Edge Function for WhatsApp sending and webhook handling.
- Secure backend/Edge Function or RPC for AI reply generation and enrichment.
