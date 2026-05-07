# WhatsApp Operations Runbook

Project ref: `fgyvcyksgbivhrqoxkmj`

Use this runbook for production support without exposing secrets or bypassing backend ownership.

## When Messages Fail

1. Open WhatsApp Settings and check integration health.
2. Check the app error shown to the operator.
3. Inspect recent failed outbound rows:

```sql
select id, conversation_id, template_name, status, error_message, created_at
from public.whatsapp_messages
where direction = 'outbound'
  and status = 'failed'
order by created_at desc
limit 20;
```

4. Check integration events:

```sql
select event_type, status, error_message, processed_at, created_at
from public.integration_events
where integration_name = 'whatsapp_cloud_api'
order by created_at desc
limit 50;
```

5. Check Supabase function logs for:

```bash
npx supabase functions logs send-whatsapp-message
npx supabase functions logs send-whatsapp-template-message
```

6. Confirm the recipient is not actively suppressed.
7. Confirm freeform sends are inside the 24-hour service window.
8. Confirm template sends use an approved outside-window template.

## When Webhook Stops Receiving

1. Open WhatsApp Settings and check last inbound/webhook event timestamps.
2. Confirm Meta webhook callback URL:

```text
https://fgyvcyksgbivhrqoxkmj.supabase.co/functions/v1/meta-whatsapp-webhook
```

3. Confirm verify token is configured in Supabase and Meta. Do not reveal the value in tickets.
4. Check function logs:

```bash
npx supabase functions logs meta-whatsapp-webhook
```

5. Check recent webhook events:

```sql
select event_type, status, error_message, processed_at, created_at
from public.integration_events
where integration_name = 'whatsapp_cloud_api'
  and event_type like 'whatsapp_%'
order by created_at desc
limit 50;
```

6. Confirm Meta app webhook subscription includes messages and status updates.
7. Confirm the Supabase function is deployed and reachable.

## When AI Suggestions Fail

1. Confirm `generate-whatsapp-reply-suggestion` is deployed.
2. Confirm either Anthropic or OpenAI key is configured in Supabase secrets.
3. Check UI error message for a safe provider/config error.
4. Check AI task logs:

```sql
select sop_id, tool_called, status, input_summary, output_summary, created_at
from public.ai_task_log
where tool_called = 'generate-whatsapp-reply-suggestion'
order by created_at desc
limit 50;
```

5. Check function logs:

```bash
npx supabase functions logs generate-whatsapp-reply-suggestion
```

6. Confirm the target conversation exists and has readable recent messages.

## When Meta Template Sync Fails

1. Confirm `sync-whatsapp-templates` is deployed.
2. Confirm these Supabase secrets are configured:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - optional `WHATSAPP_GRAPH_API_VERSION`
3. Check integration events:

```sql
select status, error_message, payload, processed_at, created_at
from public.integration_events
where integration_name = 'whatsapp_cloud_api'
  and event_type = 'sync_whatsapp_templates'
order by created_at desc
limit 20;
```

4. Check function logs:

```bash
npx supabase functions logs sync-whatsapp-templates
```

5. Confirm the token has permission to read WABA message templates.
6. Confirm templates are approved in Meta if outside-window sending is expected.

## Checking Audit Events

Use audit events for operator-visible actions and compliance review:

```sql
select action, entity_type, entity_id, actor_profile_id, created_at
from public.audit_events
where entity_type like 'whatsapp%'
   or action like 'whatsapp_%'
order by created_at desc
limit 50;
```

## Checking Supabase Function Logs

Common commands:

```bash
npx supabase functions logs send-whatsapp-message
npx supabase functions logs send-whatsapp-template-message
npx supabase functions logs meta-whatsapp-webhook
npx supabase functions logs generate-whatsapp-reply-suggestion
npx supabase functions logs sync-whatsapp-templates
npx supabase functions logs whatsapp-integration-health
```

Do not paste secret values into logs, tickets, or chat.

## Rotating Secrets

1. Generate the new secret in the source system.
2. Set it in Supabase secrets:

```bash
npx supabase secrets set SECRET_NAME=new_value_here
```

3. Redeploy or restart affected functions if required by the Supabase runtime.
4. Validate health status and a safe smoke test.
5. Revoke the old secret in the source system.
6. Document the rotation time and owner.

Never commit rotated values.

## Pausing Outbound Sending

Preferred options:

1. Remove or invalidate `WHATSAPP_ACCESS_TOKEN` in Supabase secrets to stop sends server-side.
2. Disable operator access to send actions in the deployment if a feature flag exists.
3. Temporarily mark high-risk numbers as suppressed.
4. Coordinate with Meta Business Manager if phone number suspension is needed.

Do not delete message/conversation tables to pause sending.

## Handling Opt-Out Complaints

1. Add or confirm an active suppression entry for the phone number.
2. Confirm webhook opt-out handling created suppression for `STOP` or equivalent inbound text.
3. Do not send further freeform or template messages to the number.
4. Review recent outbound messages:

```sql
select
  m.id,
  m.conversation_id,
  c.phone_number,
  m.body,
  m.template_name,
  m.created_at
from public.whatsapp_messages m
join public.whatsapp_conversations c on c.id = m.conversation_id
where m.direction = 'outbound'
order by m.created_at desc
limit 20;
```

5. Document the complaint and resolution in the appropriate support/compliance system.
