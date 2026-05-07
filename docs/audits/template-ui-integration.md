# WhatsApp Template UI Integration

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Status

`TemplateManager` is wired to the real `public.whatsapp_templates` table using regenerated Supabase types from project `fgyvcyksgbivhrqoxkmj`.

## Table Used

`public.whatsapp_templates`

Mapped columns:

- `id`
- `name`
- `display_name`
- `category`
- `language`
- `body`
- `variables`
- `components`
- `status`
- `meta_template_id`
- `meta_status`
- `meta_quality_rating`
- `whatsapp_business_account_id`
- `phone_number_id`
- `usable_inside_window`
- `usable_outside_window`
- `created_by`
- `metadata`
- `created_at`
- `updated_at`

## Actions Implemented

- `getWhatsAppTemplates()` reads local WhatsApp template records from Supabase.
- `createWhatsAppTemplate(input)` creates a local template record and sets `created_by` from the authenticated user when available.
- `updateWhatsAppTemplate(id, input)` updates actual `whatsapp_templates` columns.
- `archiveWhatsAppTemplate(id)` soft-archives by setting `status = 'archived'`.
- `useWhatsAppTemplates()`, `useCreateWhatsAppTemplate()`, `useUpdateWhatsAppTemplate()`, and `useArchiveWhatsAppTemplate()` expose the table through TanStack Query.
- `TemplateManager.tsx` lists, filters, creates, edits, and archives templates without mock rows.
- `ReplyComposer.tsx` can insert an inside-window template body into the composer without sending automatically.

## Not Implemented

- No Meta Graph API calls were added.
- No WhatsApp template submission flow was added.
- No template send integration was added.
- No generic `templates` table was used as an official WhatsApp template source.
- No secrets were added.

## Production Notes

- Meta submission/sync should run through Supabase Edge Functions with Supabase secrets, not from browser code.
- `meta_status`, `meta_template_id`, and `meta_quality_rating` are display/sync fields until Meta API integration exists.
- Template sending should remain behind a dedicated send Edge Function that enforces suppression, service-window rules, and audit logging.
- Current create/update/archive behavior depends on RLS allowing authenticated writes. Production hardening may move write operations behind Edge Functions.
