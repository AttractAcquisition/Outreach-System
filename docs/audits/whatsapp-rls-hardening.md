# WhatsApp RLS Hardening

Audit date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Why Manual SQL

Earlier migration reconciliation found local WhatsApp migrations that were not safe to push blindly because remote migration history is divergent. This hardening is therefore prepared as manual SQL:

```text
docs/sql/harden_whatsapp_rls.sql
```

Do not run:

```bash
npx supabase db push
npx supabase migration repair
```

for this change until migration ownership is reconciled.

## Current Risks

Local migrations showed broad authenticated policies:

- `whatsapp_conversations`: authenticated select, insert, update, delete.
- `whatsapp_messages`: authenticated select, insert, update, delete.
- `whatsapp_suppression_list`: authenticated select, insert, update.
- `whatsapp_templates`: authenticated select, insert, update.
- `whatsapp_ai_suggestions`: authenticated select, insert, update.

The highest-risk policies are browser insert/update/delete on `whatsapp_messages` and `whatsapp_conversations`, because those tables are the WhatsApp operational ledger and conversation source of truth.

## Current Browser Permissions Needed

Observed frontend usage:

| Table | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| `whatsapp_conversations` | Yes | No | No | No | Inbox and analytics reads only |
| `whatsapp_messages` | Yes | No | No | No | Message thread and analytics reads only |
| `whatsapp_suppression_list` | Yes | Yes | Yes | No | UI adds active suppressions and marks them removed |
| `whatsapp_templates` | Yes | Yes | Yes | No | TemplateManager still supports local create/edit/archive |
| `whatsapp_ai_suggestions` | Yes | No | Yes | No | UI approves/rejects/marks suggestions used |

## Proposed Policies

The manual SQL:

- Enables RLS on all five WhatsApp tables.
- Drops known broad policies from local migrations.
- Keeps authenticated read policies for current frontend read flows.
- Removes browser insert/update/delete policies from `whatsapp_conversations`.
- Removes browser insert/update/delete policies from `whatsapp_messages`.
- Allows browser insert into `whatsapp_suppression_list` only for active entries.
- Allows browser update of active suppression rows only into removed rows.
- Keeps temporary browser insert/update on `whatsapp_templates` so current TemplateManager behavior does not break.
- Removes browser delete on `whatsapp_templates`.
- Removes browser insert/delete on `whatsapp_ai_suggestions`.
- Allows browser update of AI suggestions only across review lifecycle statuses.

## Edge Function Permissions

Existing Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` server-side and bypass RLS:

- `send-whatsapp-message`
- `meta-whatsapp-webhook`
- `generate-whatsapp-reply-suggestion`
- `send-whatsapp-template-message`
- `sync-whatsapp-templates`
- `whatsapp-integration-health`

This means service-role send/webhook/status/template/AI writes continue to work after browser policies are tightened.

## Manual Application Instructions

1. Open Supabase project `fgyvcyksgbivhrqoxkmj`.
2. Open SQL Editor.
3. Paste the full contents of:

```text
docs/sql/harden_whatsapp_rls.sql
```

4. Confirm it does not alter table columns, triggers, or functions.
5. Run the SQL.
6. Validate these frontend flows:
   - Inbox loads conversations and messages.
   - Freeform send still works through `send-whatsapp-message`.
   - Inbound webhook still writes conversations/messages.
   - Template send still works through `send-whatsapp-template-message`.
   - Template sync still writes through `sync-whatsapp-templates`.
   - Suppression add/remove works.
   - TemplateManager local create/edit/archive still works.
   - AI suggestion approve/reject/use still works.

## Rollback Considerations

If the UI breaks because it still depends on a browser write not listed here, do not restore broad CRUD wholesale.

Prefer one of:

- Add a narrow Edge Function/RPC for that action.
- Add a narrowly scoped policy for the exact operation.
- Temporarily restore only the specific policy needed and document the gap.

Emergency rollback examples:

- For template editing only, restore `whatsapp_templates_update_authenticated`.
- For AI decisioning only, restore `whatsapp_ai_suggestions_update_authenticated`.
- Avoid restoring browser writes to `whatsapp_messages` or `whatsapp_conversations`; those should remain backend-owned.

## Remaining Hardening Work

- Move suppression add/remove behind an Edge Function if stricter audit controls are required.
- Move TemplateManager local create/edit/archive behind Edge Functions or disable local writes for official templates.
- Move AI suggestion approve/reject/use behind Edge Functions or RPCs because RLS cannot restrict update columns by itself.
- Add role/client ownership predicates once the shared AA authorization model is finalized.
