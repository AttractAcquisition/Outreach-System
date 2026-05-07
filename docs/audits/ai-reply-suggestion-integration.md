# WhatsApp AI Reply Suggestion Integration

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Function

Created:

`generate-whatsapp-reply-suggestion`

Path:

`supabase/functions/generate-whatsapp-reply-suggestion/index.ts`

Webhook/function URL after deploy:

`https://fgyvcyksgbivhrqoxkmj.supabase.co/functions/v1/generate-whatsapp-reply-suggestion`

Request body:

```json
{
  "conversation_id": "uuid"
}
```

Response body:

```json
{
  "suggestion_id": "uuid",
  "suggested_body": "Draft reply text",
  "reason": "Short reason",
  "confidence": 0.74
}
```

## Storage Decision

`approval_queue` was inspected but not used as the primary storage table. It requires a non-null `client_id` and `content_id`, while WhatsApp conversations can be prospect-only and there is no existing WhatsApp suggestion content row to reference. Forcing suggestions into the generic queue would make unlinked conversations fail and blur the approval workflow contract.

Created local migration only:

`supabase/migrations/20260505212000_create_whatsapp_ai_suggestions.sql`

The new table stores pending AI suggestions with:

- `conversation_id`
- `prospect_id`
- `suggested_body`
- `reason`
- `confidence`
- `status`
- `created_by`
- review timestamps and metadata

No `db push` was run.

## Server-Side Behavior

The Edge Function:

- authenticates the caller with the Supabase auth token,
- loads the target `whatsapp_conversations` row,
- checks `aa_can_access_client` when the conversation is linked to a client,
- loads the last 20 `whatsapp_messages`,
- loads linked `prospects` and `clients` rows where available,
- reads existing `client_ai_context` only when linked to a client,
- extracts a small safe subset of context fields,
- calls the configured AI provider server-side,
- stores the suggestion as `pending` in `whatsapp_ai_suggestions`,
- logs success/failure summaries in `ai_task_log`.

It does not trigger enrichment jobs and does not call any `aa-operator` enrichment workflow.

## Prompt Rules

The prompt instructs the model to:

- write like a helpful human WhatsApp operator,
- stay concise,
- ask one clear question if more info is needed,
- avoid inventing facts,
- avoid pricing, availability, guarantees, and results unless context proves them,
- escalate sensitive messages carefully,
- avoid aggressive language,
- avoid auto-closing deals,
- return strict JSON only.

## Secrets

Required AI key, one of:

```bash
npx supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key_here
npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
```

Optional:

```bash
npx supabase secrets set AI_PROVIDER=anthropic
npx supabase secrets set AI_MODEL=claude-3-5-sonnet-latest
```

If `AI_PROVIDER` is omitted, the function prefers Anthropic when `ANTHROPIC_API_KEY` is present; otherwise it uses OpenAI. AI keys stay in Supabase secrets and are never exposed to browser code.

## Frontend Behavior

Updated:

- `generateWhatsAppReplySuggestion(conversationId)` in `api.ts`
- `useGenerateWhatsAppReplySuggestion()` in `hooks.ts`
- `ReplyComposer.tsx`
- `AISuggestionPanel.tsx`

The composer shows a `Generate AI Reply` button. The returned suggestion is shown in a review panel with reason and confidence. Operators can insert it into the composer, edit it, discard it, or regenerate it. Sending still uses the existing human-triggered send button; AI replies are never auto-sent.

## Deploy Order

Apply the migration before deploying the function:

```bash
npx supabase db push
npx supabase functions deploy generate-whatsapp-reply-suggestion
```

Local function smoke test:

```bash
npx supabase functions serve generate-whatsapp-reply-suggestion
```
