# WhatsApp Settings And Integration Health

Audit date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Health Function Contract

Created Edge Function:

```text
supabase/functions/whatsapp-integration-health/index.ts
```

Request:

- `POST`
- authenticated Supabase user required

Response:

```json
{
  "status": "healthy",
  "checks": [
    {
      "key": "whatsapp_access_token",
      "label": "WhatsApp Access Token",
      "status": "configured",
      "message": "Configured"
    }
  ],
  "metrics": {
    "projectRef": "fgyvcyksgbivhrqoxkmj",
    "conversationTableReadable": true,
    "messageTableReadable": true,
    "conversationCount": 0,
    "messageCount": 0,
    "lastInboundAt": null,
    "lastOutboundAt": null,
    "lastFailedSendAt": null,
    "lastWebhookEventAt": null,
    "lastSendEventAt": null,
    "lastAiSuggestionAt": null,
    "templateCount": 0,
    "suppressionCount": 0,
    "aiSuggestionCount": 0
  }
}
```

The function uses the service role key server-side only after authenticating the caller. It never returns secret values.

## Safe Checks

The function returns safe status only:

- required secret presence by name,
- conversation/message table readability,
- recent inbound message activity,
- recent outbound send activity,
- recent failed outbound send timestamp,
- recent webhook integration event timestamp,
- recent send integration event timestamp,
- template count,
- active suppression count,
- AI suggestion count,
- recent AI suggestion task timestamp.

## Required Secrets Checked

Checked by presence only:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`

No token, key, app secret, webhook verify token, service role key, AI API key, or Apify key is returned to the frontend.

## Frontend Settings Screen

`WhatsAppSettings.tsx` displays:

- overall integration status,
- Supabase project/table status,
- WhatsApp send function activity,
- webhook activity,
- AI provider configuration status,
- template count,
- suppression count,
- last inbound event,
- last outbound send,
- last failed send,
- setup checklist and missing configuration warnings.

All labels are safe operational metadata. Secret values are never rendered.

## Deploy Command

```bash
npx supabase functions deploy whatsapp-integration-health
```

## Limitations

- This checks configuration presence, not token validity with Meta.
- It does not call Meta from the browser or from the health function.
- It does not validate webhook subscription state inside Meta Business Manager.
- It does not validate template sync freshness against Meta.
- Operational activity warnings may be expected for a newly configured project with no inbound/outbound traffic yet.
