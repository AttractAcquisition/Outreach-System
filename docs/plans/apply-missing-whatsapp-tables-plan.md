# Apply Missing WhatsApp Tables Plan

Plan date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`  
Supabase URL: `https://fgyvcyksgbivhrqoxkmj.supabase.co`

This plan prepares a safe manual SQL path for adding only:

- `public.whatsapp_suppression_list`
- `public.whatsapp_templates`

It must not modify:

- `public.whatsapp_conversations`
- `public.whatsapp_messages`

## Current Type Check

Generated types currently include:

- `whatsapp_conversations`
- `whatsapp_messages`

Generated types currently do not include:

- `whatsapp_suppression_list`
- `whatsapp_templates`

## Why `npx supabase db push` Is Unsafe

Local migration history is divergent from the remote project. The local migrations for `whatsapp_conversations` and `whatsapp_messages` appear local-only, but the remote generated types already include those tables.

Running `npx supabase db push` now may attempt to apply local migrations that create or alter objects already present remotely. That can fail on existing policies/triggers or overwrite trigger/function behavior. It also does not resolve the underlying migration ownership problem.

## Why Manual SQL Is Safest Short Term

The manual SQL file creates only the two missing tables and intentionally avoids the existing conversation/message tables. This lets a human apply the smallest necessary schema change while migration history ownership is still unresolved.

Review and apply this file only:

```text
docs/sql/apply_missing_whatsapp_suppression_templates.sql
```

## Human Application Options

Option A: Supabase SQL Editor

1. Open the Supabase project `fgyvcyksgbivhrqoxkmj`.
2. Open SQL Editor.
3. Paste the full contents of `docs/sql/apply_missing_whatsapp_suppression_templates.sql`.
4. Review that it does not mention `create table public.whatsapp_conversations` or `create table public.whatsapp_messages`.
5. Run it.

Option B: `psql`

Use this only if local Postgres credentials are configured for the Supabase project.

```bash
psql "$SUPABASE_DB_URL" -f docs/sql/apply_missing_whatsapp_suppression_templates.sql
```

Do not place database passwords or service role keys in frontend files.

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

- `database.types.ts` includes `whatsapp_suppression_list`.
- `database.types.ts` includes `whatsapp_templates`.
- `npm run build` passes.
- No old project ref appears:

```bash
grep -RIn "old_project_ref_here" . --exclude-dir=node_modules --exclude-dir=.git
```

- No service secrets appear in frontend code:

```bash
grep -RIn "SUPABASE_SERVICE_ROLE_KEY\\|WHATSAPP_ACCESS_TOKEN\\|META_ACCESS_TOKEN\\|ANTHROPIC_API_KEY\\|OPENAI_API_KEY\\|APIFY_TOKEN" src .env.example README.md docs --exclude-dir=node_modules --exclude-dir=.git
```

Secret names may appear in docs as forbidden examples; real values must not.

## Warning

Do not run migration repair until `aa-operator` or shared backend migration ownership is inspected.

Do not run:

```bash
npx supabase migration repair
npx supabase db push
```

until the migration divergence for the existing WhatsApp conversation/message tables is resolved.

## Continue Criteria

It is safe to continue to suppression/template UI wiring only after:

1. The manual SQL is applied to the correct Supabase project.
2. Types are regenerated from `fgyvcyksgbivhrqoxkmj`.
3. `database.types.ts` includes both missing tables.
4. The build passes.
