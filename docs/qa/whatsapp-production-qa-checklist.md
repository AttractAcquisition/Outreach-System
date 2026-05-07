# WhatsApp Production QA Checklist

Project ref: `fgyvcyksgbivhrqoxkmj`

Run this checklist against the intended deployment environment before production handoff. Do not use real customer data for destructive tests.

## A. Environment And Setup

- [ ] App uses `VITE_SUPABASE_URL=https://fgyvcyksgbivhrqoxkmj.supabase.co`.
- [ ] Browser env has `VITE_SUPABASE_ANON_KEY`.
- [ ] Frontend bundle and env do not contain service role keys.
- [ ] Frontend bundle and env do not contain Meta tokens, webhook tokens, AI keys, or Apify keys.
- [ ] `send-whatsapp-message` is deployed.
- [ ] `meta-whatsapp-webhook` is deployed.
- [ ] `generate-whatsapp-reply-suggestion` is deployed.
- [ ] `whatsapp-integration-health` is deployed if settings health is enabled.
- [ ] `sync-whatsapp-templates` is deployed if template sync is enabled.
- [ ] `send-whatsapp-template-message` is deployed if template sends are enabled.
- [ ] Required Supabase Edge Function secrets are configured with real values in Supabase, not frontend files.
- [ ] Manual SQL for missing tables/RLS hardening has been applied only after review.
- [ ] Generated Supabase types were regenerated after schema changes.

## B. Conversations And Messages

- [ ] Conversation list loads for an authenticated user.
- [ ] Selecting a conversation loads the message thread.
- [ ] Empty conversation/message states render correctly.
- [ ] Network/RLS error states render a useful error.
- [ ] Conversation search/filtering does not hide valid live rows incorrectly.
- [ ] Message timestamps and direction styling are readable.
- [ ] Mobile inbox can open and switch conversations.

## C. Sending

- [ ] Freeform send inside an active 24-hour service window succeeds.
- [ ] Freeform send outside the 24-hour service window is blocked with the approved-template guidance.
- [ ] Sending to an actively suppressed number is blocked.
- [ ] Failed WhatsApp API response is surfaced to the operator.
- [ ] Successful send creates an outbound `whatsapp_messages` row.
- [ ] Failed provider send creates or logs a safe failure record.
- [ ] Browser never calls Meta directly.
- [ ] No message is sent without explicit human click.

## D. Webhooks

- [ ] GET verification succeeds with the configured verify token.
- [ ] GET verification fails safely with an invalid verify token.
- [ ] Inbound message creates or updates the matching conversation.
- [ ] Inbound message inserts exactly one `whatsapp_messages` row.
- [ ] Duplicate inbound webhook does not duplicate the message.
- [ ] Status webhook updates sent/delivered/read/failed state.
- [ ] Failed status webhook records safe error metadata.
- [ ] Opt-out text such as `STOP` creates an active suppression entry.
- [ ] Webhook logs safe `integration_events` rows.

## E. AI Suggestions

- [ ] Generate reply succeeds for a valid conversation with an AI provider secret configured.
- [ ] Missing AI secret returns a safe error.
- [ ] Suggestion appears in the UI for human review.
- [ ] Suggestion can be inserted into the composer.
- [ ] Suggestion insertion does not auto-send.
- [ ] Edited AI suggestion asks for confirmation where applicable.
- [ ] Approve/reject/use status updates are reflected in `whatsapp_ai_suggestions`.
- [ ] AI prompt/output summaries do not expose secrets.

## F. Templates

- [ ] Templates list loads from `whatsapp_templates`.
- [ ] Local create works if local template editing is still enabled.
- [ ] Local edit works if local template editing is still enabled.
- [ ] Archive sets status to `archived` and does not delete the row.
- [ ] Sync from Meta works if `sync-whatsapp-templates` is deployed and secrets are configured.
- [ ] Synced templates show Meta status, language, category, and quality.
- [ ] Outside-window template send works only with approved outside-window templates.
- [ ] Rejected/paused/draft templates cannot be sent.
- [ ] Template send inserts outbound `whatsapp_messages` with `message_type = template`.
- [ ] Template send does not expose token/config values.

## G. Suppression

- [ ] Add suppression entry with a valid phone number.
- [ ] Remove suppression entry marks it removed without deleting the row.
- [ ] Active suppression blocks freeform sends.
- [ ] Active suppression blocks template sends.
- [ ] Basic phone normalization handles spaces, parentheses, dashes, and leading plus.
- [ ] Opt-out webhook suppression and manual suppression both appear in the list.

## H. Analytics

- [ ] Analytics metrics load from real Supabase rows.
- [ ] Conversation totals match expected database counts.
- [ ] Message direction/status breakdowns match expected database rows.
- [ ] Suppression/template/AI counts match expected database rows.
- [ ] Unavailable metrics are labelled as unavailable.
- [ ] No fake revenue, cost, or lead metrics appear.
- [ ] Date range selector changes visible metrics.

## I. Settings And Health

- [ ] Overall health status appears.
- [ ] Supabase project ref appears as `fgyvcyksgbivhrqoxkmj`.
- [ ] Send function activity appears when send events exist.
- [ ] Webhook activity appears when inbound/webhook events exist.
- [ ] Missing configuration warnings appear for missing secrets.
- [ ] No secret values are rendered.
- [ ] Health endpoint requires authentication.

## J. Mobile And Layout

- [ ] First page scrolls normally on mobile and desktop.
- [ ] Inbox is usable on mobile.
- [ ] Conversation thread is readable on mobile.
- [ ] Composer textarea and buttons are usable on mobile.
- [ ] Template selection and parameter inputs are usable on mobile.
- [ ] No top-squashed layout regression.
- [ ] No overlapping buttons, cards, or text at common mobile widths.
