# Application Functionality Analysis

Date: 2026-05-03

## 1. App Overview

- Framework: Vite, React 18, TypeScript.
- Routing: `react-router-dom` with `/`, `/whatsapp`, and `*` Not Found route in `src/App.tsx`.
- Layout structure: app-level providers wrap routes. `/` is a small entry page. `/whatsapp` renders a tabbed command center with feature panels.
- Auth structure: no auth flow exists in the front end. No Supabase Auth calls were found.
- Data layer: currently local React hooks in `src/features/whatsapp/hooks.ts`. Mock records were removed. Hooks now return empty data and expose TODOs for missing backend sources.
- Styling system: Tailwind CSS, shadcn/Radix components, lucide icons, custom AA dark brand tokens in `src/index.css`.

## 2. Current Pages / Routes

| Route | Component File | Purpose | Visible Functionality | Supabase Dependencies | Status | Issues Found | Recommended Next Build Step |
|---|---|---|---|---|---|---|---|
| `/` | `src/pages/Index.tsx` | Entry page for the operator panel. | Brand heading and link to WhatsApp Command Center. | None. | Partial. | App had potential root scroll risk from starter `App.css`; root/global scroll styles are now safe. | Add real navigation/dashboard cards only after backend scope is clear. |
| `/whatsapp` | `src/pages/WhatsApp.tsx` and `src/features/whatsapp/components/WhatsAppCommandCenter.tsx` | Main WhatsApp Acquisition Console. | Tabs for Inbox, Outreach Queue, Templates, Campaign Leads, Suppression, Analytics, Settings. | None currently wired. | Partial/missing data. | All core features need real Supabase or backend endpoints. | Add existing Supabase client/types, then wire hooks one feature at a time. |
| `*` | `src/pages/NotFound.tsx` | Catch-all missing route page. | Logs route error and displays not-found UI. | None. | Complete enough. | No app-blocking issue. | Optional: style to match AA brand. |

## 3. Current Components

Shared layout/components:

- `src/App.tsx`: providers and routes.
- `src/components/ui/*`: shadcn/Radix UI primitives.
- `src/components/NavLink.tsx`: navigation helper.
- `src/features/whatsapp/components/EmptyState.tsx`: reusable empty state.
- Badge/utility components: `CrmStageBadge`, `ServiceWindowBadge`, `SourceBadge`, `ConfirmActionModal`.

Feature-specific components:

- `WhatsAppCommandCenter`: tab shell.
- `WhatsAppInbox`: three-column inbox layout.
- `ConversationList`: filtering/sorting shell for conversations.
- `ConversationCard`: single conversation preview.
- `ConversationThread`: message thread and conversation actions.
- `ReplyComposer`: free-form/template reply shell; backend actions currently unavailable.
- `ProspectPanel`: prospect details shell; enrichment/recommendation data unavailable.
- `OutreachQueue`: approval queue shell; data unavailable.
- `TemplateManager`: template shell; data unavailable.
- `CampaignLeads`: campaign leads shell; data unavailable.
- `SuppressionList`: compliance suppression shell; data unavailable.
- `WhatsAppAnalytics`: empty state pending analytics data source.
- `WhatsAppSettings`: empty state pending secure settings source.

## 4. Current Data Model Usage

Actively used Supabase tables: none.

Features depending on future data:

- Inbox: conversations, prospects, messages.
- Conversation thread: messages, stage updates, DNC/suppression updates.
- Reply composer: templates, message sending, AI suggestions.
- Outreach queue: queue items, approval status, send status.
- Template manager: WhatsApp templates and performance metrics.
- Campaign leads: Meta ad lead ingestion and lead status updates.
- Suppression list: suppression records and opt-out compliance.
- Prospect panel: prospects, enrichment, notes, compliance audit.
- Analytics: aggregated messages, sends, replies, opt-outs, bookings, template performance, source performance.
- Settings: secure integration configuration.

Unused tables: cannot determine because no generated database types are present.

Database types imported: none. `src/integrations/supabase/database.types.ts` is not present.

## 5. Missing Backend Requirements

- Existing typed Supabase client and generated database types.
- Conversations/prospects tables or views.
- WhatsApp messages table.
- WhatsApp templates table/sync.
- Outreach queue table with approval/send statuses.
- Suppression list table.
- Campaign leads table or webhook-fed source.
- Prospect notes table.
- Prospect enrichment table or AI enrichment endpoint.
- Compliance/audit log table.
- Analytics view or RPC.
- Secure settings source. Secrets must not be exposed through Vite env vars.
- Edge Functions/webhooks for WhatsApp Cloud API send/status/inbound events.
- Edge Function/RPC for AI reply generation.

## 6. WhatsApp Acquisition Console Readiness

| Capability | Readiness | Notes |
|---|---|---|
| WhatsApp inbox | UI shell only | Needs conversations/messages data. |
| Conversations | UI shell only | Empty state currently shown. |
| Messages | UI shell only | Needs message table and realtime or polling. |
| Prospects | UI shell only | Needs prospect table and enrichment data. |
| AI enrichment | Missing backend | Static AI suggestion removed. |
| Outreach approvals | UI shell only | Needs queue table and mutations. |
| Templates | UI shell only | Needs template sync/source. |
| Compliance logs | Partial shell | Suppression/DNC UI exists; needs data source and audit table. |
| Meta ads reporting | UI shell only | Needs campaign lead source and reporting data. |
| Pipeline stages | Partial shell | Stage badges/select exist; mutations unavailable. |

## 7. Priority Fix List

P0 build-breaking or app-blocking issues:

- None after cleanup. `npm run build` passes.

P1 data connection issues:

- Add/restore existing Supabase client and generated database types.
- Wire `src/features/whatsapp/hooks.ts` to real data.
- Add backend endpoints for send, AI reply generation, DNC, approvals, notes, and stage updates.

P2 UX/layout issues:

- Validate `/whatsapp` three-column height behavior on mobile with real data.
- Add better empty states per tab once backend object names are known.
- Consider importing/removing `App.css` consistently; it is currently not imported.

P3 enhancements:

- Add auth/role-aware operator identity.
- Add realtime updates for messages and queue status.
- Add analytics charts once real data exists.
- Add route-level loading/error boundaries.
