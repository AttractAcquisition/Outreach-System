# WhatsApp Template Sync And Send

Audit date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Functions Created

Created:

- `supabase/functions/sync-whatsapp-templates/index.ts`
- `supabase/functions/send-whatsapp-template-message/index.ts`

## Sync Function

`sync-whatsapp-templates` authenticates the caller, calls Meta Graph API server-side, fetches official WhatsApp message templates for the configured WhatsApp Business Account, and reconciles them into `public.whatsapp_templates`.

It updates safe template metadata:

- `name`
- `display_name`
- `category`
- `language`
- `body`
- `components`
- `variables`
- `meta_template_id`
- `meta_status`
- `meta_quality_rating`
- `whatsapp_business_account_id`
- `usable_inside_window`
- `usable_outside_window`
- safe `metadata`

It logs a best-effort `integration_events` row and never returns or stores Meta token values.

## Template Send Function

`send-whatsapp-template-message` authenticates the caller and sends an official WhatsApp template message server-side.

Request:

```json
{
  "conversation_id": "uuid",
  "template_id": "uuid",
  "parameters": {
    "1": "Example value"
  }
}
```

The function:

- loads the WhatsApp conversation,
- loads the selected `whatsapp_templates` row,
- checks active suppression,
- rejects unapproved templates,
- allows outside-window sends only when `usable_outside_window` is true,
- calls WhatsApp Cloud API server-side,
- inserts an outbound `whatsapp_messages` row with `message_type = 'template'`,
- updates conversation last-message fields,
- logs best-effort `integration_events` and `audit_events`.

Freeform outside-window sends remain blocked by `send-whatsapp-message`.

## Required Secrets

Set in Supabase secrets only:

```bash
npx supabase secrets set WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
npx supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

Optional:

```bash
npx supabase secrets set WHATSAPP_GRAPH_API_VERSION=v23.0
```

Do not put these values in frontend code, docs, or browser-visible config.

## Deploy Commands

```bash
npx supabase functions deploy sync-whatsapp-templates
npx supabase functions deploy send-whatsapp-template-message
```

## Frontend Behavior

`TemplateManager.tsx` now has a `Sync from Meta` button. It invokes the backend sync function, refreshes `whatsapp_templates`, and displays safe Meta status, quality, language, category, and local usability fields.

`ReplyComposer.tsx` sends approved outside-window templates through `send-whatsapp-template-message`. It does not call Meta from the browser and does not auto-send inserted template bodies.

## Meta Setup Requirements

- Meta app has WhatsApp Cloud API access.
- `WHATSAPP_ACCESS_TOKEN` can read WABA templates and send messages.
- `WHATSAPP_BUSINESS_ACCOUNT_ID` is the WABA that owns official templates.
- `WHATSAPP_PHONE_NUMBER_ID` is the sending phone number ID.
- Templates are approved in Meta before outside-window sends.

## Limitations

- Sync fetches the first page of templates with `limit=100`; pagination can be added when needed.
- Template send currently maps simple body variables only.
- Button/header media parameters are not yet modeled in the composer UI.
- Template submission/creation in Meta is not implemented; local create/edit remains a local record workflow.
- Production RLS hardening should move more template writes behind backend-owned policies/functions.

## Testing Steps

1. Deploy both functions.
2. Set required Supabase secrets.
3. Open Template Manager and click `Sync from Meta`.
4. Confirm approved Meta templates appear with status, language, category, and quality.
5. Open a conversation outside the 24-hour service window.
6. Select an approved outside-window template, fill simple parameters, and send.
7. Confirm an outbound `whatsapp_messages` row is recorded with `message_type = 'template'`.
