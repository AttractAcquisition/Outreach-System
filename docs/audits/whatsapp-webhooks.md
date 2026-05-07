# WhatsApp Webhooks

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Function Created

Unified function:

`meta-whatsapp-webhook`

Path:

`supabase/functions/meta-whatsapp-webhook/index.ts`

Webhook URL after deploy:

`https://fgyvcyksgbivhrqoxkmj.supabase.co/functions/v1/meta-whatsapp-webhook`

## Why Unified

Meta sends webhook verification, inbound messages, and message statuses through the same callback subscription. A single function keeps verification, signature validation, event logging, and idempotency in one place while keeping inbound/status handling separated internally.

Separate `whatsapp-webhook` and `whatsapp-status-webhook` functions were not created because they would duplicate the same GET verification, POST signature verification, payload envelope parsing, and `integration_events` logging for the same Meta callback URL.

## Request Handling

### GET Verification

Supports Meta webhook verification using:

- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

Required secret:

- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### POST Ingestion

The POST handler:

- verifies `x-hub-signature-256` when `WHATSAPP_APP_SECRET` is configured,
- parses payloads defensively,
- handles inbound `messages`,
- handles delivery `statuses`,
- writes safe `integration_events` payloads with counts, IDs, status, and processing results,
- avoids browser-visible webhook secrets.

## Inbound Behavior

For each inbound WhatsApp message:

- skips if `id` or `from` is missing,
- checks `whatsapp_messages.whatsapp_message_id` before insert,
- also treats database unique-constraint conflicts as duplicate deliveries,
- finds or creates `whatsapp_conversations` by `whatsapp_wa_id` or `phone_number`,
- attempts to link a `prospects` row using `phone` or `whatsapp`,
- inserts `whatsapp_messages` with:
  - `direction = inbound`
  - `sender_type = contact`
  - `status = received`
  - `message_type` from Meta payload
  - `body` when text/caption/button text is available
  - `media_url` set to the Meta media ID when media is present
- stores Meta message type and webhook entry/change IDs in `metadata` when available,
- lets the existing `sync_whatsapp_conversation_from_message` trigger update conversation last message, unread count, inbound timestamp, and service-window fields,
- sets `needs_human = true`,
- moves new conversations to `stage = needs_reply`.

Unsupported or unknown Meta message types are stored as `message_type = system` with the original Meta type retained in message metadata.

## Status Behavior

For each status update:

- finds `whatsapp_messages` by `whatsapp_message_id`,
- updates `status`,
- sets `delivered_at` for `delivered`,
- sets `read_at` for `read`,
- sets `error_message` for `failed`,
- stores the latest status webhook details in message metadata,
- skips unsupported status strings instead of writing values that would violate the table constraint,
- logs an `integration_events` row whether processed, skipped, or failed.

## Opt-Out Behavior

The function adds an active `whatsapp_suppression_list` row when inbound text clearly contains:

- `stop`
- `unsubscribe`
- `opt out`
- `remove me`

It does not try to infer vague phrases. Existing active suppression rows for the same normalized number are not duplicated.

The suppression row uses `reason = opt_out`, `source = webhook`, and includes the source conversation, prospect, and WhatsApp message ID when available. If the suppression table is unavailable, the webhook logs a failed opt-out integration event and continues processing the inbound message.

## Idempotency

Inbound messages are idempotent through:

- a pre-insert lookup by `whatsapp_message_id`,
- the existing unique constraint on `whatsapp_messages.whatsapp_message_id`,
- duplicate-key handling for concurrent webhook retries.

Status updates are idempotent because they update the existing message by `whatsapp_message_id`. When Meta provides an `entry.id` and change field, those values are recorded in message metadata and integration event payloads.

## Secrets Required

Set placeholders only:

```bash
npx supabase secrets set WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
npx supabase secrets set WHATSAPP_APP_SECRET=your_meta_app_secret_here
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

`WHATSAPP_APP_SECRET` is optional in local testing but should be configured in production.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required by the Edge Function runtime. Do not expose `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, or the service role key in browser code.

## Deploy

```bash
npx supabase functions deploy meta-whatsapp-webhook
```

Optional local smoke test:

```bash
npx supabase functions serve meta-whatsapp-webhook
```

## Meta Setup Notes

In Meta Developer settings:

1. Add the callback URL:
   `https://fgyvcyksgbivhrqoxkmj.supabase.co/functions/v1/meta-whatsapp-webhook`
2. Use the same verify token stored in `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
3. Subscribe to WhatsApp message fields that include inbound messages and message statuses.
4. Configure `WHATSAPP_APP_SECRET` in Supabase secrets before production verification of signed POST payloads.

## Not Changed

- No browser secrets were added.
- No app code was changed for webhook refetching.
- No migrations were created.
- No RLS policies were changed.

The existing frontend hooks currently load conversations/messages through explicit fetches and React Query invalidation after sends. Realtime or polling can be added later if operators need inbound webhook updates to appear without manual refresh.
