# WhatsApp Live Integration Progress

Date: 2026-05-03

## Migration Added

- `supabase/migrations/20260503190000_create_whatsapp_conversations.sql`
- `supabase/migrations/20260503200000_create_whatsapp_messages.sql`

## Table Added

`public.whatsapp_conversations`

Columns included:

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

`public.whatsapp_messages`

Columns included:

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

The migration also adds:

- Check constraints for `status` and `stage`.
- Indexes for prospect/client/campaign/phone/status/stage/message time/needs-human/service-window filtering.
- `public.set_updated_at()` trigger function.
- `set_whatsapp_conversations_updated_at` trigger.
- RLS enabled.
- Conservative authenticated read/write RLS policies.
- Message insert trigger `sync_whatsapp_conversation_after_message_insert`.
- Trigger function `public.sync_whatsapp_conversation_from_message()` updates conversation preview, message timestamp, inbound/outbound timestamps, unread count, service window, and `updated_at`.

## Files Changed

- `supabase/migrations/20260503190000_create_whatsapp_conversations.sql`
- `supabase/migrations/20260503200000_create_whatsapp_messages.sql`
- `src/features/whatsapp/api.ts`
- `src/features/whatsapp/hooks.ts`
- `src/features/whatsapp/types.ts`
- `src/features/whatsapp/components/ConversationCard.tsx`
- `src/features/whatsapp/components/ConversationList.tsx`
- `src/features/whatsapp/components/ConversationThread.tsx`
- `src/features/whatsapp/components/MessageBubble.tsx`
- `src/features/whatsapp/components/SourceBadge.tsx`
- `docs/audits/whatsapp-live-integration-progress.md`

## Functionality Now Live

- `getWhatsAppConversations()` reads from `whatsapp_conversations`.
- `useWhatsAppConversations()` loads conversations from Supabase instead of returning an empty static array.
- Conversation rows are ordered by `last_message_at desc nulls last`, then `created_at desc`.
- The query includes related `prospects` fields through the `prospect_id` relationship.
- The inbox list preserves loading, error, and empty states.
- The empty state now says: "No WhatsApp conversations yet. Once inbound messages or approved outbound outreach starts, conversations will appear here."
- Conversation cards show stage, status, source, unread count, last message time, needs-human state, and service-window state.
- `getWhatsAppMessages(conversationId)` reads from `whatsapp_messages`.
- `useConversationMessages(conversationId)` loads selected conversation messages from Supabase.
- Messages are ordered by `created_at asc`.
- The selected conversation thread displays inbound/outbound/system messages from Supabase.
- Outbound message bubbles show status.
- Message bubbles show sender type labels such as contact, human, AI, or system.

## Type Generation

Local type generation was attempted with:

```bash
npx supabase gen types typescript --local
```

It could not run because the local Supabase stack is not running.

Remote type generation was attempted with:

```bash
npx supabase gen types typescript --project-id ayfidvycgqorxmlczyxl
```

It could not run because Supabase reported: "Project must be active and healthy."

After applying the migration to the linked Supabase project, regenerate types with:

```bash
npx supabase gen types typescript --project-id ayfidvycgqorxmlczyxl > src/integrations/supabase/database.types.ts
```

## Remaining Limitations

- `database.types.ts` has not been regenerated with `whatsapp_conversations` or `whatsapp_messages` yet.
- The front-end query uses a narrow API boundary row type until generated types include the new table.
- RLS policies are intentionally broad authenticated policies and must be hardened before production.
- No conversation write actions are wired from the front end.
- No WhatsApp message send actions are wired from the front end.
- No realtime subscription is wired yet.
- No audit/integration logging was added because this integration is read-only.
- Inbound unread messages are not marked read from the front end yet.

## Next Step

Read prospect profile:

- Add or map the prospect profile read model needed by `ProspectPanel`.
- Regenerate Supabase types.
- Implement read-only prospect details loading for the selected conversation.
- Keep message read/writeback and send actions separate from the profile read step.
