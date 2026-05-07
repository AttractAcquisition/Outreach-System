# Apply Missing WhatsApp AI Suggestions Plan

Plan date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

This plan prepares a safe manual SQL path for adding only:

- `public.whatsapp_ai_suggestions`

It must not modify:

- `public.whatsapp_conversations`
- `public.whatsapp_messages`
- `public.whatsapp_suppression_list`
- `public.whatsapp_templates`

## Current Type Check

Generated types currently include:

- `whatsapp_conversations`
- `whatsapp_messages`

Generated types currently do not include:

- `whatsapp_ai_suggestions`

## Why `npx supabase db push` May Be Unsafe

Local migration history is divergent from the remote Supabase project. Existing local WhatsApp migrations appear local-only even though remote generated types already include `whatsapp_conversations` and `whatsapp_messages`.

Running `npx supabase db push` now may attempt to apply local migrations against objects that already exist remotely. That can fail on existing policies/triggers, overwrite trigger/function behavior, or create more migration-history ambiguity.

Do not run:

```bash
npx supabase db push
npx supabase migration repair
```

until the shared migration ownership and remote history are deliberately reconciled.

## SQL To Apply

Review and apply this file only:

```text
docs/sql/apply_missing_whatsapp_ai_suggestions.sql
```

The SQL creates/reconciles only `public.whatsapp_ai_suggestions`, enables RLS, creates authenticated read/insert/update policies, creates the requested indexes, and attaches the `updated_at` trigger with a safe `public.set_updated_at()` prelude.

## Human Application Options

Option A: Supabase SQL Editor

1. Open the Supabase project `fgyvcyksgbivhrqoxkmj`.
2. Open SQL Editor.
3. Paste the full contents of `docs/sql/apply_missing_whatsapp_ai_suggestions.sql`.
4. Review that it does not create or alter `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_suppression_list`, or `whatsapp_templates`.
5. Run it.

Option B: `psql`

Use this only if local Postgres credentials are configured for the Supabase project.

```bash
psql "$SUPABASE_DB_URL" -f docs/sql/apply_missing_whatsapp_ai_suggestions.sql
```

Do not place database passwords, service role keys, AI keys, or WhatsApp tokens in frontend files.

## Commands After Applying SQL

Regenerate types:

```bash
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
```

Run the build:

```bash
npm run build
```

## Validation Checklist

- `database.types.ts` includes `whatsapp_ai_suggestions`.
- `generate-whatsapp-reply-suggestion` can insert suggestions into `whatsapp_ai_suggestions`.
- `npm run build` passes.

## Continue Criteria

It is safe to continue only after:

1. The manual SQL is applied to the correct Supabase project.
2. Types are regenerated from `fgyvcyksgbivhrqoxkmj`.
3. `database.types.ts` includes `whatsapp_ai_suggestions`.
4. The build passes.
