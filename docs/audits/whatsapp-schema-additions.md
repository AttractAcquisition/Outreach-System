# WhatsApp Schema Additions

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

This change creates local migration files only. It does not push to Supabase, regenerate types, wire UI, create Edge Functions, call Meta, or add mock data.

## Tables Added

### `public.whatsapp_suppression_list`

Migration:

- `supabase/migrations/20260505210000_create_whatsapp_suppression_list.sql`

Purpose:

- Stores active and removed WhatsApp suppression records for opt-out, do-not-contact, wrong number, complaint, duplicate, and other suppression cases.
- Intended to be checked by future send/webhook Edge Functions before outbound WhatsApp messages are sent.

Fields:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `phone_number` | `text` | Original/display phone number |
| `normalized_phone_number` | `text` | Required normalized number used for uniqueness/checks |
| `reason` | `text` | Default `manual`; constrained to known reasons |
| `source` | `text` | Default `manual`; constrained to known sources |
| `status` | `text` | Default `active`; `active` or `removed` |
| `prospect_id` | `uuid` | Nullable FK to `public.prospects(id)` |
| `conversation_id` | `uuid` | Nullable FK to `public.whatsapp_conversations(id)` |
| `added_by` | `uuid` | Nullable FK to `auth.users(id)` |
| `removed_by` | `uuid` | Nullable FK to `auth.users(id)` |
| `removed_at` | `timestamptz` | Required when status is `removed` |
| `notes` | `text` | Optional internal notes |
| `metadata` | `jsonb` | Default `{}` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by existing `public.set_updated_at()` trigger |

Indexes:

- `normalized_phone_number`
- `phone_number`
- `status`
- `prospect_id`
- `conversation_id`
- `created_at desc`
- Unique active `normalized_phone_number` where `status = 'active'`

RLS:

- Enabled.
- Authenticated users can read.
- Authenticated users can insert.
- Authenticated users can update.
- No delete policy was added.

### `public.whatsapp_templates`

Migration:

- `supabase/migrations/20260505211000_create_whatsapp_templates.sql`

Purpose:

- Stores local WhatsApp template metadata and future Meta template sync fields.
- Distinct from the generic AA `templates` table.

Fields:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Template name |
| `display_name` | `text` | Optional UI label |
| `category` | `text` | Default `utility` |
| `language` | `text` | Default `en` |
| `body` | `text` | Template body |
| `variables` | `jsonb` | Default `[]`, constrained to array |
| `components` | `jsonb` | Default `[]`, constrained to array |
| `status` | `text` | Local status, default `draft` |
| `meta_template_id` | `text` | Future Meta template ID |
| `meta_status` | `text` | Future Meta status |
| `meta_quality_rating` | `text` | Future Meta quality rating |
| `whatsapp_business_account_id` | `text` | Non-secret WABA identifier |
| `phone_number_id` | `text` | Non-secret phone number identifier |
| `usable_inside_window` | `boolean` | Default true |
| `usable_outside_window` | `boolean` | Default false |
| `created_by` | `uuid` | Nullable FK to `auth.users(id)` |
| `metadata` | `jsonb` | Default `{}` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by existing `public.set_updated_at()` trigger |

Indexes:

- Unique `(name, language)`
- `name`
- `category`
- `language`
- `status`
- `meta_status`
- `created_at desc`

RLS:

- Enabled.
- Authenticated users can read.
- Authenticated users can insert.
- Authenticated users can update.
- No delete policy was added.

## Production Hardening Notes

- Current initial write policies are intentionally permissive for authenticated operators during early UI/admin workflows.
- Production should move writes behind Edge Functions or RPCs once WhatsApp send, opt-out webhook, and Meta template sync flows exist.
- `whatsapp_suppression_list` writes should eventually be handled by:
  - manual suppression backend action,
  - inbound opt-out webhook handler,
  - suppression import/admin action.
- `whatsapp_templates` writes should eventually be handled by:
  - `sync-whatsapp-templates`,
  - `create-whatsapp-template`,
  - admin-only local template update actions.
- No browser delete policies were added. Removals are represented as status changes for suppression records, and templates should be archived/paused instead of deleted.
- These migrations rely on the existing `public.set_updated_at()` trigger function and do not recreate it.
- Before any `db push`, reconcile the known local-vs-remote migration history divergence documented in `docs/audits/remote-migration-type-sync.md`.

## Types and UI Wiring

Current generated types do not include:

- `whatsapp_suppression_list`
- `whatsapp_templates`

Do not wire `TemplateManager` or `SuppressionList` to these tables until after the migrations are pushed and types are regenerated.

## Manual Commands Required

Run only after migration-history safety is confirmed:

```bash
npx supabase db push
```

Then regenerate types:

```bash
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
```

