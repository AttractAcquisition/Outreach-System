# WhatsApp Analytics And Campaign Attribution Audit

Audit date: 2026-05-07  
Repo: `aa-outreach-auto`  
Supabase project ref: `fgyvcyksgbivhrqoxkmj`

## Metrics Implemented

Implemented in the frontend through direct Supabase reads in `getWhatsAppAnalytics(range)`:

- total conversations
- conversations today
- open conversations
- conversations needing human
- unread conversations
- active 24-hour service windows
- expired service windows
- inbound messages
- outbound messages
- messages sent today
- messages received today
- failed outbound messages
- active suppressed numbers count
- active templates count
- pending AI suggestions
- approved AI suggestions
- rejected AI suggestions
- conversations by source
- conversations by stage
- messages by direction
- messages by status
- campaign-attributed conversations where `whatsapp_conversations.campaign_id` is present
- conversations by campaign where the existing `campaign_id -> campaigns.id` relationship resolves
- conversations by client where `client_id -> clients.id` resolves
- conversations by prospect source where `prospect_id -> prospects.id` resolves

Date ranges supported:

- `today`
- `7d`
- `30d`
- `all`

Default range is `7d`.

## Source Tables

The analytics use only existing Supabase data:

- `whatsapp_conversations`
- `whatsapp_messages`
- `whatsapp_suppression_list`
- `whatsapp_templates`
- `whatsapp_ai_suggestions`
- `campaigns`
- `prospects`
- `clients`

`ad_set_performance_logs` was inspected for cost metrics, but it is not joined into live WhatsApp analytics.

## Unavailable Metrics

Unavailable in the UI:

- cost per conversation
- cost per qualified lead
- Meta ad/campaign/ad set breakdowns

Reason:

- `whatsapp_conversations` has app-level `campaign_id`, `client_id`, and `prospect_id` fields.
- `ad_set_performance_logs` has ad set spend rows, but its `campaign_id` is an external ad/campaign identifier and there is no proven relationship to `campaigns.id` or WhatsApp conversations.
- Conversations do not expose Meta campaign ID, ad set ID, ad ID, click ID, or spend attribution fields.
- No dedicated campaign lead table/view exists that links WhatsApp conversations to Meta ad spend and qualified lead outcomes.

The UI shows: `Unavailable until campaign attribution is connected.`

## RPC/View Decision

No RPC or database view was created.

The current metric set can be calculated with read-only Supabase selects and client-side grouping over existing WhatsApp rows. A backend RPC may be worthwhile later for larger datasets, stricter authorization, or server-side aggregation, but it is not required for the current implementation.

No migrations were created or applied.

## CampaignLeads Status

`CampaignLeads.tsx` now displays real campaign-attributed WhatsApp conversations when `whatsapp_conversations.campaign_id` is present.

It includes:

- campaign name/status/channel where the `campaigns` join resolves,
- conversation source/stage/status,
- prospect/client context where joins resolve,
- service window badge,
- link back to the inbox conversation.

If no conversations have `campaign_id`, the screen shows an unavailable state explaining the missing data:

- Meta campaign/ad IDs,
- conversation attribution,
- ad spend join,
- campaign lead table/view.

## Next Backend Requirements

To calculate cost per conversation and cost per qualified lead safely, backend ownership should add one of:

- WhatsApp conversation attribution fields for Meta campaign ID, ad set ID, ad ID, click/referral ID, and source event metadata.
- A backend-owned attribution table/view linking WhatsApp conversations to Meta campaign/ad spend rows.
- A qualified lead definition that maps conversation/prospect stages to a stable outcome field.
- A read-only analytics RPC/view that aggregates spend and outcomes server-side after attribution is connected.

This should be owned by the shared backend/`aa-operator` sync path rather than duplicating Meta campaign sync jobs in this frontend.
