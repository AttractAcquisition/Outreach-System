# Remote Migration and Type Sync Audit

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`  
Supabase URL: `https://fgyvcyksgbivhrqoxkmj.supabase.co`

This verification was read-only for database schema. No migrations were altered, no RLS policies were changed, no tables were created, and `supabase db push` was not run.

## Project Link Status

| File | Finding |
| --- | --- |
| `supabase/.temp/project-ref` | `fgyvcyksgbivhrqoxkmj` |
| `supabase/.temp/linked-project.json` | `{"ref":"fgyvcyksgbivhrqoxkmj","name":"AICOS",...}` |
| `supabase/config.toml` | Not present in this repo |

Status: the local Supabase project metadata points at the correct project.

## Generated Type Status

Inspected: `src/integrations/supabase/database.types.ts`

| Check | Result |
| --- | --- |
| Type file present | Yes |
| Type file non-empty | Yes |
| PostgREST version in type file | `14.5` |
| `whatsapp_conversations` in generated types | Yes, starts at line 6061 |
| `whatsapp_messages` in generated types | Yes, starts at line 6164 |
| Type regeneration run | No |

The generated types include both WhatsApp tables and match the main local migration column shapes for those tables. Because the type file already includes the expected WhatsApp objects, it was not regenerated during this verification.

## WhatsApp Tables Confirmed in Types

### `whatsapp_conversations`

Confirmed columns include:

- `id`
- `prospect_id`
- `client_id`
- `campaign_id`
- `phone_number`
- `contact_name`
- `whatsapp_wa_id`
- `source`
- `status`
- `stage`
- `assigned_to`
- `last_message_preview`
- `last_message_at`
- `unread_count`
- `service_window_open_until`
- `last_inbound_at`
- `last_outbound_at`
- `ai_summary`
- `ai_intent`
- `ai_temperature`
- `needs_human`
- `metadata`
- `created_at`
- `updated_at`

Confirmed relationships:

- `campaign_id -> campaigns.id`
- `client_id -> clients.id`
- `prospect_id -> prospects.id`

### `whatsapp_messages`

Confirmed columns include:

- `id`
- `conversation_id`
- `prospect_id`
- `client_id`
- `whatsapp_message_id`
- `direction`
- `message_type`
- `body`
- `media_url`
- `media_mime_type`
- `template_name`
- `template_language`
- `status`
- `sender_type`
- `sent_by`
- `ai_generated`
- `human_approved`
- `approval_id`
- `error_message`
- `metadata`
- `created_at`
- `delivered_at`
- `read_at`

Confirmed relationships:

- `approval_id -> approval_queue.id`
- `client_id -> clients.id`
- `conversation_id -> whatsapp_conversations.id`
- `prospect_id -> prospects.id`

## Local Migration Inventory

| Migration | Creates/changes | Appears in generated types | Appears already represented in remote schema | Remote migration history status |
| --- | --- | --- | --- | --- |
| `20260503190000_create_whatsapp_conversations.sql` | `public.whatsapp_conversations`; indexes; conditional `public.set_updated_at()` function; `set_whatsapp_conversations_updated_at` trigger; enables RLS; broad authenticated select/insert/update/delete policies | Yes, table and FKs appear in generated types | Yes, table shape is represented in generated types | Not listed as applied remotely by `npx supabase migration list --linked` |
| `20260503200000_create_whatsapp_messages.sql` | `public.whatsapp_messages`; indexes; `public.sync_whatsapp_conversation_from_message()` function; `sync_whatsapp_conversation_after_message_insert` trigger; enables RLS; broad authenticated select/insert/update/delete policies | Yes, table and FKs appear in generated types | Yes, table shape is represented in generated types | Not listed as applied remotely by `npx supabase migration list --linked` |

## Remote Migration Status

Read-only command run:

```bash
npx supabase migration list --linked
```

Result summary:

| Local | Remote | Notes |
| --- | --- | --- |
| empty | `20260501000000` | Remote-only migration |
| empty | `20260501100000` | Remote-only migration |
| empty | `20260501200000` | Remote-only migration |
| empty | `20260501300000` | Remote-only migration |
| `20260503190000` | empty | Local-only migration according to migration history |
| `20260503200000` | empty | Local-only migration according to migration history |
| empty | `20260504000000` | Remote-only migration |
| empty | `20260505000000` | Remote-only migration |
| empty | `20260505100000` | Remote-only migration |
| empty | `20260505200000` | Remote-only migration |
| empty | `20260505300000` | Remote-only migration |

Important interpretation:

- The remote schema represented by `database.types.ts` includes `whatsapp_conversations` and `whatsapp_messages`.
- The remote migration history does not list the two local WhatsApp migrations as applied.
- This means schema objects appear to exist remotely, but the migration history is divergent.
- Running `supabase db push` now could attempt to apply local migrations that create objects already present in remote schema. Some statements are `if not exists`, but policy creation is not guarded with `if not exists`, so a push could fail or create migration-state confusion.

## Migration Safety Notes

It is not safe to add and push new migrations until migration history is reconciled.

Before schema changes:

1. Determine which remote migration created `whatsapp_conversations` and `whatsapp_messages`, if any.
2. Compare the remote SQL definitions for tables, indexes, triggers, functions, and RLS policies against the two local migration files.
3. Decide whether to:
   - mark the local migrations as repaired/applied in migration history, or
   - replace local migration files with the actual remote migration history, or
   - create a documented baseline strategy for this repo.
4. Confirm the correct approach with the owner of `aa-operator`/shared Supabase backend before any `db push`.

Safe to do now:

- Build frontend features against the current generated types.
- Read from `whatsapp_conversations` and `whatsapp_messages` through existing browser client behavior.
- Write documentation and planning.

Pause before:

- Adding new migrations.
- Running `supabase db push`.
- Changing WhatsApp RLS policies.
- Creating new backend tables/functions.

## Commands Run

```bash
sed -n '1,80p' supabase/.temp/project-ref
sed -n '1,160p' supabase/.temp/linked-project.json
find supabase -maxdepth 2 -type f | sort
sed -n '1,60p' src/integrations/supabase/database.types.ts
grep -n "whatsapp_conversations:\|whatsapp_messages:\|PostgrestVersion" src/integrations/supabase/database.types.ts
sed -n '1,180p' supabase/migrations/20260503190000_create_whatsapp_conversations.sql
sed -n '1,190p' supabase/migrations/20260503200000_create_whatsapp_messages.sql
sed -n '6061,6271p' src/integrations/supabase/database.types.ts
npx supabase --version
npx supabase migration list --project-ref fgyvcyksgbivhrqoxkmj
npx supabase migration list --linked
npm run build
```

Notes:

- `npx supabase migration list --project-ref fgyvcyksgbivhrqoxkmj` was attempted first, but Supabase CLI `2.98.0` does not support `--project-ref` for `migration list`.
- `npx supabase migration list --linked` initially failed under sandboxed DNS/network restrictions, then succeeded after user-approved escalation.

## Commands Intentionally Not Run

```bash
npx supabase db push
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
```

`db push` was intentionally not run because this was verification only and migration history is divergent.

Type generation was intentionally not run because the current type file already contains the expected WhatsApp tables and there was no local evidence that the type file is stale enough to justify changing application type artifacts during this audit.

## Recommendation

Pause before schema changes.

The project link and generated types are usable for frontend read integration, but migration history must be reconciled before adding or pushing new migrations. The safest next backend step is a migration reconciliation audit against the shared Supabase remote history, ideally with access to `aa-operator` migrations or Supabase SQL/migration metadata.

