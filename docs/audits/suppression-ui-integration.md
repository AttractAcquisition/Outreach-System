# Suppression UI Integration

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Status

`SuppressionList` is wired to the real `public.whatsapp_suppression_list` table using the regenerated Supabase types from project `fgyvcyksgbivhrqoxkmj`.

## Table Used

`public.whatsapp_suppression_list`

Mapped columns:

- `id`
- `phone_number`
- `normalized_phone_number`
- `reason`
- `source`
- `status`
- `prospect_id`
- `conversation_id`
- `added_by`
- `removed_by`
- `removed_at`
- `notes`
- `metadata`
- `created_at`
- `updated_at`

## Actions Implemented

- `getSuppressionList()` reads suppression entries from Supabase and orders active/newer entries first.
- `addSuppressionEntry(input)` inserts a manual suppression entry using normalized phone data and the current authenticated user as `added_by` when available.
- `removeSuppressionEntry(id)` soft-removes an entry by setting `status = 'removed'`, `removed_at`, and `removed_by`.
- `isPhoneSuppressed(normalizedPhoneNumber)` checks for an active suppression entry.
- `useSuppressionList()`, `useAddSuppressionEntry()`, `useRemoveSuppressionEntry()`, and `useIsPhoneSuppressed()` expose the table through TanStack Query.
- `SuppressionList.tsx` now shows live loading, error, empty, add, list, and soft-remove states without mock rows.

## Phone Normalization

`normalizePhoneNumber(input)`:

- trims input,
- removes spaces, hyphens, square brackets, and parentheses,
- preserves one leading `+`,
- does not guess country codes.

## Limitations

- Send enforcement is not implemented here. The future WhatsApp send Edge Function must check suppression before sending.
- Inbound opt-out handling is not implemented here. A future webhook should create suppression entries when contacts opt out.
- Phone normalization is intentionally basic and does not infer or validate country codes.
- Add/remove behavior depends on current RLS allowing authenticated insert/update. Production hardening may move writes behind Edge Functions.

## Not Changed

- No WhatsApp API calls were added.
- No send logic was added.
- No Edge Functions were changed.
- No migrations or RLS policies were changed.
- No secrets were added.
