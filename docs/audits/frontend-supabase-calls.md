# Front-End Supabase Calls Audit

Date: 2026-05-03

## Summary

No front-end Supabase client usage exists in the current `src` tree after cleanup.

Searches performed:

- `supabase`
- `.from(`
- `.select(`
- `.insert(`
- `.update(`
- `.delete(`
- `.upsert(`
- `.rpc(`
- `.storage`
- `.auth`
- `createClient`

Important finding: this workspace does not currently contain `src/integrations/supabase/client.ts`, `src/integrations/supabase/database.types.ts`, or any `src/integrations` directory. The installed `supabase` package is the Supabase CLI dev dependency only. There is no `@supabase/supabase-js` client dependency in `package.json`.

## Calls

| File | Function/Page | Supabase Area | Table/RPC/Bucket | Operation | Columns/Filters | User-Facing Functionality | Notes |
|---|---|---|---|---|---|---|---|
| None found | None | None | None | None | None | None | No current front-end Supabase calls exist. |

## Auth

No Supabase Auth calls were found.

## Storage

No Supabase Storage calls were found.

## RPC

No Supabase RPC calls were found.

## Summary By Table

| Table | Files Used In | Operations | Feature Area |
|---|---|---|---|
| None found | None | None | None |

## Expected Future Data Sources

The current WhatsApp Acquisition Console UI implies these likely data sources, but none are currently used by front-end Supabase calls:

| Expected Source | Feature Area |
|---|---|
| `whatsapp_conversations` or equivalent | Inbox, conversation list, prospect side panel |
| `whatsapp_messages` or equivalent | Conversation thread, reply composer, compliance log |
| `whatsapp_templates` or equivalent | Template manager, closed-window template sending |
| `outreach_queue` or equivalent | Outreach approvals and send queue |
| `suppression_list` or equivalent | Compliance / Do Not Contact |
| `campaign_leads` or equivalent | Meta Click-to-WhatsApp campaign leads |
| `prospects` or equivalent | Prospect profile, CRM stage, owner, lead score |
| `prospect_notes` or equivalent | Internal notes |
| `compliance_logs` or equivalent | Consent, opt-out, audit trail |
| analytics view/RPC | Analytics tab |
| secure integration settings source | Settings tab |
