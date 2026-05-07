# AA Outreach Auto

WhatsApp front-end and operations console for Attract Acquisition.

This app is responsible for the WhatsApp command center experience: outreach review, conversations, messages, prospects, templates, suppression, analytics, and WhatsApp operations UI. It shares the Attract Acquisition Supabase backend with `aa-operator`.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/Radix UI
- Supabase JS client

Package manager: npm.

## Supabase Project

Correct shared Supabase project:

- Project ref: `fgyvcyksgbivhrqoxkmj`
- Project URL: `https://fgyvcyksgbivhrqoxkmj.supabase.co`

The browser client lives at:

- `src/integrations/supabase/client.ts`

Generated database types live at:

- `src/integrations/supabase/database.types.ts`

Regenerate types from the correct project with:

```bash
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
```

Do not run `supabase db push` unless the migration state has been explicitly reviewed and the task calls for it.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Fill in the anon key in `.env.local`. Do not commit `.env.local`.

Run the dev server:

```bash
npm run dev
```

Run a production build:

```bash
npm run build
```

## Secret Handling

Frontend env files may contain only browser-safe values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put these secrets in frontend code, `.env.example`, committed docs, or Vite env files:

- Supabase service role key
- WhatsApp or Meta access tokens
- WhatsApp webhook verify token or app secret
- Anthropic, OpenAI, or other AI provider keys
- Apify token
- Railway cron or job secrets

Server-side secrets belong in Supabase Edge Function secrets, Railway variables, or the appropriate backend secret store.

## Development Workflow

1. Confirm the Supabase project ref is `fgyvcyksgbivhrqoxkmj`.
2. Regenerate database types when backend schema changes.
3. Build UI changes against generated types and existing Supabase contracts.
4. Keep WhatsApp API calls, AI provider calls, and privileged Supabase writes in backend functions.
5. Run `npm run build` before handing off changes.

## WhatsApp Production Readiness

- [Production QA checklist](docs/qa/whatsapp-production-qa-checklist.md)
- [Deployment checklist](docs/deployment/whatsapp-deployment-checklist.md)
- [Operations runbook](docs/runbooks/whatsapp-operations-runbook.md)

Key audit and implementation notes:

- [Shared Supabase WhatsApp backend audit](docs/audits/aa-shared-supabase-whatsapp-backend-audit.md)
- [Supabase migration reconciliation](docs/audits/supabase-migration-reconciliation.md)
- [Send WhatsApp message Edge Function](docs/audits/send-whatsapp-message-edge-function.md)
- [WhatsApp webhooks](docs/audits/whatsapp-webhooks.md)
- [AI reply suggestion integration](docs/audits/ai-reply-suggestion-integration.md)
- [WhatsApp approval queue integration](docs/audits/whatsapp-approval-queue-integration.md)
- [WhatsApp analytics and campaign attribution](docs/audits/whatsapp-analytics-campaign-attribution.md)
- [WhatsApp settings and integration health](docs/audits/whatsapp-settings-health.md)
- [WhatsApp template sync and send](docs/audits/whatsapp-template-sync-send.md)
- [WhatsApp RLS hardening](docs/audits/whatsapp-rls-hardening.md)
