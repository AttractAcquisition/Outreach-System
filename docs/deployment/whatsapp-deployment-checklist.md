# WhatsApp Deployment Checklist

Project ref: `fgyvcyksgbivhrqoxkmj`  
Project URL: `https://fgyvcyksgbivhrqoxkmj.supabase.co`

## 1. Preflight

- [ ] Confirm target Supabase project is `fgyvcyksgbivhrqoxkmj`.
- [ ] Confirm local branch contains only intended WhatsApp changes.
- [ ] Confirm no secrets are committed.
- [ ] Confirm `.env.local` contains only browser-safe Vite variables.
- [ ] Confirm migration history divergence has been reviewed before applying SQL.

## 2. Types

Regenerate Supabase types after any remote schema changes:

```bash
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
```

Then build:

```bash
npm run build
```

## 3. Manual SQL

Apply only reviewed SQL files that are still needed.

Potential files:

```text
docs/sql/apply_missing_whatsapp_suppression_templates.sql
docs/sql/apply_missing_whatsapp_ai_suggestions.sql
docs/sql/harden_whatsapp_rls.sql
```

Do not run blindly:

```bash
npx supabase db push
npx supabase migration repair
```

unless migration ownership/history has been explicitly reconciled.

## 4. Edge Function Deploys

Deploy the functions that are part of the release:

```bash
npx supabase functions deploy send-whatsapp-message
npx supabase functions deploy meta-whatsapp-webhook
npx supabase functions deploy generate-whatsapp-reply-suggestion
npx supabase functions deploy whatsapp-integration-health
npx supabase functions deploy sync-whatsapp-templates
npx supabase functions deploy send-whatsapp-template-message
```

If a function is intentionally not part of the release, document why in the release notes.

## 5. Supabase Secrets

Set server-side secrets with placeholders replaced in the Supabase environment only:

```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
npx supabase secrets set WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
npx supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
npx supabase secrets set WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
npx supabase secrets set WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
npx supabase secrets set WHATSAPP_APP_SECRET=your_meta_app_secret_here
npx supabase secrets set WHATSAPP_GRAPH_API_VERSION=v23.0
```

Set one AI provider key if AI suggestions are enabled:

```bash
npx supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key_here
npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
npx supabase secrets set AI_PROVIDER=anthropic
npx supabase secrets set AI_MODEL=claude-3-5-sonnet-latest
```

Do not put these values in frontend env files.

## 6. Frontend Environment

Frontend env should contain only:

```bash
VITE_SUPABASE_URL=https://fgyvcyksgbivhrqoxkmj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 7. Meta Setup

Webhook callback URL:

```text
https://fgyvcyksgbivhrqoxkmj.supabase.co/functions/v1/meta-whatsapp-webhook
```

Meta configuration checklist:

- [ ] Callback URL points to the Supabase Edge Function.
- [ ] Verify token matches `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
- [ ] Meta app secret matches `WHATSAPP_APP_SECRET`.
- [ ] WhatsApp phone number ID matches `WHATSAPP_PHONE_NUMBER_ID`.
- [ ] WhatsApp Business Account ID matches `WHATSAPP_BUSINESS_ACCOUNT_ID`.
- [ ] App has access to receive message and message status webhooks.
- [ ] Sending phone number is connected and approved.
- [ ] Official templates are approved in Meta before outside-window sends.

## 8. Local Build

Run:

```bash
npm run build
```

Optional test command when relevant:

```bash
npm run test
```

## 9. Post-Deploy Validation

- [ ] Open WhatsApp Settings and verify health status.
- [ ] Verify no secret values are visible.
- [ ] Load conversation list and message thread.
- [ ] Send freeform message inside 24-hour service window.
- [ ] Confirm freeform send outside 24 hours is blocked.
- [ ] Send approved template outside 24-hour service window if enabled.
- [ ] Trigger or replay a safe webhook sample.
- [ ] Confirm inbound message creates/updates rows.
- [ ] Confirm status webhook updates message state.
- [ ] Generate AI suggestion if AI is enabled.
- [ ] Sync Meta templates if enabled.
- [ ] Confirm analytics loads real metrics.
- [ ] Confirm RLS hardening did not break required reads/writes.
