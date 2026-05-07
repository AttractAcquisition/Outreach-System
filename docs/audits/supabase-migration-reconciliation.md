# Supabase Migration Reconciliation Audit

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

This is an audit and reconciliation plan only. No remote database writes were performed. `supabase db push` and `supabase migration repair` were intentionally not run.

## Current State

Local WhatsApp migrations:

- `20260503190000_create_whatsapp_conversations.sql`
- `20260503200000_create_whatsapp_messages.sql`
- `20260505210000_create_whatsapp_suppression_list.sql`
- `20260505211000_create_whatsapp_templates.sql`

Generated remote schema in `src/integrations/supabase/database.types.ts` includes:

- `whatsapp_conversations`
- `whatsapp_messages`

Generated remote schema does not include:

- `whatsapp_suppression_list`
- `whatsapp_templates`

The remote schema and local migration history are divergent: the first two local WhatsApp migrations are not recorded in remote migration history, even though their tables already exist in the remote generated type file.

## Read-Only Migration Status

Command run:

```bash
npx supabase migration list --linked
```

Result:

| Local | Remote | Meaning |
| --- | --- | --- |
| empty | `20260501000000` | Remote-only migration |
| empty | `20260501100000` | Remote-only migration |
| empty | `20260501200000` | Remote-only migration |
| empty | `20260501300000` | Remote-only migration |
| `20260503190000` | empty | Local-only migration |
| `20260503200000` | empty | Local-only migration |
| empty | `20260504000000` | Remote-only migration |
| empty | `20260505000000` | Remote-only migration |
| empty | `20260505100000` | Remote-only migration |
| empty | `20260505200000` | Remote-only migration |
| `20260505210000` | empty | Local-only migration |
| `20260505211000` | empty | Local-only migration |
| empty | `20260505300000` | Remote-only migration |

## Table Comparison: `whatsapp_conversations`

### Local Migration Columns

| Column | Local definition |
| --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` |
| `prospect_id` | `uuid references public.prospects(id) on delete set null` |
| `client_id` | `uuid references public.clients(id) on delete set null` |
| `campaign_id` | `uuid references public.campaigns(id) on delete set null` |
| `phone_number` | `text not null` |
| `contact_name` | `text` |
| `whatsapp_wa_id` | `text` |
| `source` | `text not null default 'unknown'` |
| `status` | `text not null default 'open'` |
| `stage` | `text not null default 'new'` |
| `assigned_to` | `uuid references auth.users(id) on delete set null` |
| `last_message_preview` | `text` |
| `last_message_at` | `timestamptz` |
| `unread_count` | `integer not null default 0` |
| `service_window_open_until` | `timestamptz` |
| `last_inbound_at` | `timestamptz` |
| `last_outbound_at` | `timestamptz` |
| `ai_summary` | `text` |
| `ai_intent` | `text` |
| `ai_temperature` | `text` |
| `needs_human` | `boolean not null default false` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

### Generated Type Columns

`database.types.ts` lists the same 25 row columns:

- `ai_intent`
- `ai_summary`
- `ai_temperature`
- `assigned_to`
- `campaign_id`
- `client_id`
- `contact_name`
- `created_at`
- `id`
- `last_inbound_at`
- `last_message_at`
- `last_message_preview`
- `last_outbound_at`
- `metadata`
- `needs_human`
- `phone_number`
- `prospect_id`
- `service_window_open_until`
- `source`
- `stage`
- `status`
- `unread_count`
- `updated_at`
- `whatsapp_wa_id`

### Match/Mismatch Summary

| Category | Finding |
| --- | --- |
| Matching columns | All local migration columns appear in generated types |
| Missing columns in generated types | None visible |
| Extra columns in generated types | None visible |
| Type differences | None visible at generated TypeScript level |
| Nullable differences | Generated Insert type matches local defaults/nullability for required browser-visible fields: `phone_number` required; most defaulted fields optional; nullable FKs/texts are nullable |
| Default differences | Defaults are not directly proven by generated types, but Insert optionality is consistent with local defaults for defaulted columns |
| FK differences visible in types | Generated types show FKs for `campaign_id -> campaigns.id`, `client_id -> clients.id`, `prospect_id -> prospects.id`; generated types do not expose `assigned_to -> auth.users(id)` because `auth` schema is not represented |

### Local Trigger/Function Assumptions

The local migration:

- conditionally creates `public.set_updated_at()` if no zero-argument function with that name exists,
- creates trigger `set_whatsapp_conversations_updated_at`,
- executes `public.set_updated_at()`.

Generated types list exposed RPC functions but do not list `public.set_updated_at()`. That does not prove absence because trigger functions may not appear in generated types. Remote existence of `public.set_updated_at()` is therefore not provable from generated types alone.

### Local RLS Assumptions

The local migration enables RLS and creates broad authenticated policies:

- read/select for all authenticated users,
- insert for all authenticated users,
- update for all authenticated users,
- delete for all authenticated users.

Generated types do not expose RLS policy details, so remote policy parity is not proven by types. The table shape is represented remotely; the trigger and RLS state are not fully proven from generated types.

## Table Comparison: `whatsapp_messages`

### Local Migration Columns

| Column | Local definition |
| --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` |
| `conversation_id` | `uuid not null references public.whatsapp_conversations(id) on delete cascade` |
| `prospect_id` | `uuid references public.prospects(id) on delete set null` |
| `client_id` | `uuid references public.clients(id) on delete set null` |
| `whatsapp_message_id` | `text unique` |
| `direction` | `text not null` |
| `message_type` | `text not null default 'text'` |
| `body` | `text` |
| `media_url` | `text` |
| `media_mime_type` | `text` |
| `template_name` | `text` |
| `template_language` | `text` |
| `status` | `text not null default 'received'` |
| `sender_type` | `text not null default 'contact'` |
| `sent_by` | `uuid references auth.users(id) on delete set null` |
| `ai_generated` | `boolean not null default false` |
| `human_approved` | `boolean not null default false` |
| `approval_id` | `uuid references public.approval_queue(id) on delete set null` |
| `error_message` | `text` |
| `metadata` | `jsonb not null default '{}'::jsonb` |
| `created_at` | `timestamptz not null default now()` |
| `delivered_at` | `timestamptz` |
| `read_at` | `timestamptz` |

### Generated Type Columns

`database.types.ts` lists the same 23 row columns:

- `ai_generated`
- `approval_id`
- `body`
- `client_id`
- `conversation_id`
- `created_at`
- `delivered_at`
- `direction`
- `error_message`
- `human_approved`
- `id`
- `media_mime_type`
- `media_url`
- `message_type`
- `metadata`
- `prospect_id`
- `read_at`
- `sender_type`
- `sent_by`
- `status`
- `template_language`
- `template_name`
- `whatsapp_message_id`

### Match/Mismatch Summary

| Category | Finding |
| --- | --- |
| Matching columns | All local migration columns appear in generated types |
| Missing columns in generated types | None visible |
| Extra columns in generated types | None visible |
| Type differences | None visible at generated TypeScript level |
| Nullable differences | Generated Insert type matches local defaults/nullability for required fields: `conversation_id` and `direction` required; most defaulted fields optional; nullable fields nullable |
| Default differences | Defaults are not directly proven by generated types, but Insert optionality is consistent with local defaults for defaulted columns |
| FK differences visible in types | Generated types show FKs for `approval_id -> approval_queue.id`, `client_id -> clients.id`, `conversation_id -> whatsapp_conversations.id`, `prospect_id -> prospects.id`; generated types do not expose `sent_by -> auth.users(id)` because `auth` schema is not represented |

### Local Trigger/Function Assumptions

The local migration:

- creates or replaces `public.sync_whatsapp_conversation_from_message()`,
- creates trigger `sync_whatsapp_conversation_after_message_insert`,
- updates `whatsapp_conversations` preview, timestamps, unread count, service window, and `updated_at` after message insert.

Generated types do not expose triggers or trigger functions, so remote trigger/function parity is not proven by types.

### Local RLS Assumptions

The local migration enables RLS and creates broad authenticated policies:

- read/select for all authenticated users,
- insert for all authenticated users,
- update for all authenticated users,
- delete for all authenticated users.

Generated types do not expose RLS policy details, so remote policy parity is not proven by types.

## Are Local Create Migrations Safe To Apply?

### A. Are `whatsapp_conversations` and `whatsapp_messages` create migrations safe to apply?

No. They are not safe to push as-is.

### B. Why not?

The remote schema already contains the tables according to generated types, but migration history does not record the two local migrations as applied. Applying them can cause several problems:

- `create table if not exists` will skip existing tables, so the table creation itself may not fail, but it also will not reconcile missing columns, constraints, indexes, triggers, or policies if the remote definition differs.
- `create policy` statements are not guarded with `if not exists`; if equivalent policies already exist remotely, the push can fail.
- `drop trigger if exists` then `create trigger` can alter existing trigger behavior.
- `create or replace function public.sync_whatsapp_conversation_from_message()` can overwrite a remote function if it already exists with different logic.
- Migration history would still not explain how the remote table was originally created, making future schema operations brittle.

### C. Should these migrations be converted into idempotent migrations?

Not as the first step. They should be reconciled against the remote source of truth first.

If the team decides to keep these files in `aa-outreach-auto`, they should be converted from "create base table" migrations into safe reconciliation/baseline-aware migrations only after verifying remote table, index, trigger, and policy definitions. That may include guarded `do $$ begin if not exists ... end $$;` policy creation, but it still does not solve migration-history truth by itself.

### D. Should they be removed from future push flow?

Possibly, but not silently.

Recommended approach:

- Do not delete them in this audit.
- Decide whether `aa-outreach-auto` owns WhatsApp schema migrations or whether the shared backend/`aa-operator` repo owns them.
- If another repo owns the already-applied remote migrations, remove or archive these duplicate local create migrations only as part of a deliberate baseline cleanup.

### E. Should Supabase migration history be repaired?

Possibly, if the team verifies that the remote schema exactly matches the intent of these two migrations and wants Supabase to treat them as already applied.

Migration repair is a metadata operation with real consequences. It should be performed only by a developer who owns the shared Supabase migration history and has verified remote object definitions.

### F. What command would be used for repair?

If the developer chooses the repair path after verification, the command pattern is:

```bash
npx supabase migration repair --status applied 20260503190000
npx supabase migration repair --status applied 20260503200000
```

Depending on CLI version and linked project context, use the linked project and confirm the target project is `fgyvcyksgbivhrqoxkmj` before running.

Do not run these commands until a human approves the strategy.

### G. Risks of Migration Repair

- Marks migrations as applied even if the remote schema does not exactly match the files.
- Can hide real drift between local SQL and remote objects.
- Can make future rollback/debugging harder.
- Can conflict with another repo's migration history if `aa-operator` or another shared backend repo owns the original migrations.
- Does not apply missing objects; it only changes migration metadata.

## Suppression/Templates Migration Dependency Review

Local migrations:

- `20260505210000_create_whatsapp_suppression_list.sql`
- `20260505211000_create_whatsapp_templates.sql`

Both new migrations create `updated_at` triggers that execute:

```sql
public.set_updated_at()
```

`public.set_updated_at()` is created conditionally in `20260503190000_create_whatsapp_conversations.sql`, but that migration is currently local-only in migration history.

Generated types expose RPC functions such as `aa_can_access_client`, `can_access_client`, and `get_my_role`, but do not list `set_updated_at`. This does not prove absence, because trigger functions are not necessarily exposed in generated types. It does mean remote existence is not provable from generated types alone.

Risk:

- If a developer applies only the new suppression/template migrations to a remote DB where `public.set_updated_at()` does not exist, the migrations will fail at trigger creation.

Recommendation:

- Before applying the new migrations, either verify `public.set_updated_at()` exists remotely with a read-only SQL inspection, or modify the new migrations to safely ensure the function exists before creating triggers.
- The safer migration pattern is to add a guarded function prelude to the first new migration, for example:

```sql
do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and pg_get_function_arguments(p.oid) = ''
  ) then
    create function public.set_updated_at()
    returns trigger
    language plpgsql
    as $function$
    begin
      new.updated_at = now();
      return new;
    end;
    $function$;
  end if;
end;
$$;
```

Alternative if the team accepts replacing function body:

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
```

The guarded version is less invasive.

## Safest Strategy To Apply Only Missing Tables

The safest path is:

1. Pause on `db push`.
2. Identify whether `aa-operator` or another repo owns the remote migrations that created `whatsapp_conversations` and `whatsapp_messages`.
3. Verify remote definitions for:
   - `whatsapp_conversations`
   - `whatsapp_messages`
   - indexes
   - triggers
   - `public.set_updated_at()`
   - `public.sync_whatsapp_conversation_from_message()`
   - RLS policies
4. Choose one reconciliation path:
   - Repair migration history for `20260503190000` and `20260503200000` only after verifying exact match, or
   - remove/archive those two local create migrations from this repo's push flow if another repo owns them, or
   - create a shared baseline migration strategy.
5. Ensure the suppression/template migrations include or are preceded by a guarded `public.set_updated_at()` function creation.
6. Apply only the missing local migrations:
   - `20260505210000`
   - `20260505211000`
7. Regenerate types from `fgyvcyksgbivhrqoxkmj`.
8. Wire UI only after generated types include the new tables.

## Safe Commands

Read-only/status commands:

```bash
npx supabase migration list --linked
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
npm run build
```

Local inspection commands:

```bash
sed -n '1,220p' supabase/migrations/20260503190000_create_whatsapp_conversations.sql
sed -n '1,240p' supabase/migrations/20260503200000_create_whatsapp_messages.sql
sed -n '1,220p' supabase/migrations/20260505210000_create_whatsapp_suppression_list.sql
sed -n '1,220p' supabase/migrations/20260505211000_create_whatsapp_templates.sql
sed -n '6236,6448p' src/integrations/supabase/database.types.ts
```

## Commands Requiring Human Approval

These change remote state and must not run until the reconciliation strategy is approved:

```bash
npx supabase migration repair --status applied 20260503190000
npx supabase migration repair --status applied 20260503200000
npx supabase db push
```

## Commands Intentionally Not Run

```bash
npx supabase db push
npx supabase migration repair --status applied 20260503190000
npx supabase migration repair --status applied 20260503200000
```

No SQL write commands were run against the remote database.

## Recommendation

Pause before schema changes.

Do not push the current migration set as-is. First reconcile ownership/history for the existing `whatsapp_conversations` and `whatsapp_messages` tables. After that, apply only the missing suppression/template migrations, ideally after adding a guarded `public.set_updated_at()` function prelude or otherwise proving the function exists remotely.

