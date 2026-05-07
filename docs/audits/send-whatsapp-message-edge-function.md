# Send WhatsApp Message Edge Function

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Function

`send-whatsapp-message`

Path:

`supabase/functions/send-whatsapp-message/index.ts`

## Contract

Request body:

```json
{
  "conversation_id": "uuid",
  "body": "message text"
}
```

Success response:

```json
{
  "ok": true,
  "message": {
    "id": "uuid"
  },
  "meta": {
    "messaging_product": "whatsapp",
    "contacts": [],
    "messages": []
  }
}
```

Error responses include a clear `error` string. Freeform sends are rejected when:

- the caller is not authenticated,
- `conversation_id` is invalid,
- `body` is empty,
- the conversation is missing,
- the conversation phone number is actively suppressed,
- `service_window_open_until` is missing or expired.

The service-window error is:

`Outside WhatsApp service window. Use an approved template.`

## Server-Side Behavior

The browser never calls Meta directly. The browser invokes:

```ts
supabase.functions.invoke("send-whatsapp-message", {
  body: { conversation_id, body },
});
```

The Edge Function:

- authenticates the Supabase user from the request JWT,
- loads `whatsapp_conversations`,
- uses `conversation.phone_number` only,
- normalizes the phone number,
- checks `whatsapp_suppression_list` for active suppression,
- enforces the WhatsApp 24-hour service window,
- calls WhatsApp Cloud API server-side,
- inserts a `whatsapp_messages` outbound row on success,
- optionally inserts a failed `whatsapp_messages` row on provider failure,
- updates conversation last-message fields,
- writes best-effort `audit_events` and `integration_events`.

## Required Secrets

Set these in Supabase secrets only. Do not put real values in front-end code or docs.

```bash
npx supabase secrets set WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
npx supabase secrets set WHATSAPP_GRAPH_API_VERSION=v23.0
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

`WHATSAPP_GRAPH_API_VERSION` is optional and defaults to `v23.0`.

## Deploy

```bash
npx supabase functions deploy send-whatsapp-message
```

## Manual Test

After deploy and secrets are set, test from the app with an authenticated user and a conversation whose `service_window_open_until` is still open.

Expected validation failures:

- suppressed phone returns `Recipient is suppressed`,
- closed/missing service window returns `Outside WhatsApp service window. Use an approved template.`,
- missing WhatsApp secrets returns `WhatsApp API secrets are not configured`.

## Production Notes

- Template sends must use a separate function. This function intentionally handles freeform text only.
- AI suggestions are not auto-sent. The composer sends only user-confirmed text.
- Suppression enforcement must remain in this backend function even if the UI also displays suppression state.
- Failed provider responses store only safe metadata and never store access tokens.
