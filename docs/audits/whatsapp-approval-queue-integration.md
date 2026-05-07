# WhatsApp Approval Queue Integration

Audit date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Storage Model Chosen

WhatsApp AI reply drafts use `public.whatsapp_ai_suggestions` as their lifecycle table.

Lifecycle states wired in the frontend:

- `pending_review`
- `approved`
- `rejected`
- `used`

Legacy `pending` suggestions are also read by the queue so previously generated rows still appear for review.

The `generate-whatsapp-reply-suggestion` Edge Function now stores new suggestions as `pending_review` and writes `client_id`, `provider`, and `model` into their first-class columns.

## `approval_queue` Usage

`approval_queue` is not used for WhatsApp AI reply drafts.

Reason: generated types show `approval_queue.client_id` and `approval_queue.content_id` are non-null insert requirements. WhatsApp conversations can be prospect-only and may not have a client-backed content row. Forcing reply drafts into `approval_queue` would either fail for prospect-only conversations or require placeholder content records that duplicate `aa-operator` approval semantics.

`approval_queue` remains suitable only for broader outbound outreach items after a clear content contract exists, for example a client-backed campaign/template approval with real `client_id` and `content_id`.

## UI Behavior

`OutreachQueue.tsx` now shows live pending WhatsApp AI suggestions from `whatsapp_ai_suggestions`.

Operators can:

- review proposed message text,
- see prospect/conversation context where available,
- approve a suggestion,
- reject a suggestion with an optional reason,
- copy the draft text for use in the composer.

The queue does not send messages and does not call Meta from the browser.

`ReplyComposer.tsx` marks a generated suggestion as `used` when the operator inserts it into the composer. This records the human use decision but still does not auto-send. Sending remains a separate explicit human action through the existing `send-whatsapp-message` Edge Function.

## `approval_logs` Behavior

No browser-side `approval_logs` writes were added.

The table shape is visible, but its foreign keys point at `profiles`/`ops_manager_status`, and existing audit guidance says generic approval log writes should be backend-owned. Without confirmed RLS and an agreed WhatsApp `entity_type`/`approval_type` convention from the shared approval owner, writing logs directly from this frontend could either fail or create inconsistent AA approval history.

Suggestion decision details are recorded on `whatsapp_ai_suggestions`:

- approval: `status`, `approved_by`, `approved_at`
- rejection: `status`, `rejected_at`, `metadata.rejection_reason`
- use: `status`, `approved_by`, `approved_at`, `metadata.used_at`

## Remaining Production Gaps

- Add a backend-owned approval logging path for `approval_logs` after the shared AA convention for WhatsApp entity types is confirmed.
- Define whether broader outbound WhatsApp campaign/template approvals should use `approval_queue` and what `content_id` should reference.
- Add role-specific approval authorization if product policy requires only certain operators/managers to approve AI suggestions.
- Add server-side decision endpoints if direct frontend updates to `whatsapp_ai_suggestions` need stricter audit guarantees than current RLS provides.
