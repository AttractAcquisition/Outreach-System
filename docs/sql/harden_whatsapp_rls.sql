-- Manual RLS hardening for WhatsApp tables.
-- Target project: fgyvcyksgbivhrqoxkmj
--
-- Do not apply with `npx supabase db push` while migration history is divergent.
-- Review and run manually in the Supabase SQL Editor after confirming the target project.

-- ---------------------------------------------------------------------------
-- whatsapp_conversations
-- Browser: SELECT only.
-- Writes are owned by Edge Functions/webhook using service role.
-- ---------------------------------------------------------------------------

alter table public.whatsapp_conversations enable row level security;

drop policy if exists "Authenticated users can read WhatsApp conversations"
  on public.whatsapp_conversations;
drop policy if exists "Authenticated users can insert WhatsApp conversations"
  on public.whatsapp_conversations;
drop policy if exists "Authenticated users can update WhatsApp conversations"
  on public.whatsapp_conversations;
drop policy if exists "Authenticated users can delete WhatsApp conversations"
  on public.whatsapp_conversations;
drop policy if exists whatsapp_conversations_select_authenticated
  on public.whatsapp_conversations;
drop policy if exists whatsapp_conversations_insert_authenticated
  on public.whatsapp_conversations;
drop policy if exists whatsapp_conversations_update_authenticated
  on public.whatsapp_conversations;
drop policy if exists whatsapp_conversations_delete_authenticated
  on public.whatsapp_conversations;

create policy whatsapp_conversations_select_authenticated
  on public.whatsapp_conversations
  for select
  to authenticated
  using (true);

-- No browser insert/update/delete policy.

-- ---------------------------------------------------------------------------
-- whatsapp_messages
-- Browser: SELECT only.
-- Message ledger writes are audit-critical and must go through Edge Functions.
-- ---------------------------------------------------------------------------

alter table public.whatsapp_messages enable row level security;

drop policy if exists "Authenticated users can read WhatsApp messages"
  on public.whatsapp_messages;
drop policy if exists "Authenticated users can insert WhatsApp messages"
  on public.whatsapp_messages;
drop policy if exists "Authenticated users can update WhatsApp messages"
  on public.whatsapp_messages;
drop policy if exists "Authenticated users can delete WhatsApp messages"
  on public.whatsapp_messages;
drop policy if exists whatsapp_messages_select_authenticated
  on public.whatsapp_messages;
drop policy if exists whatsapp_messages_insert_authenticated
  on public.whatsapp_messages;
drop policy if exists whatsapp_messages_update_authenticated
  on public.whatsapp_messages;
drop policy if exists whatsapp_messages_delete_authenticated
  on public.whatsapp_messages;

create policy whatsapp_messages_select_authenticated
  on public.whatsapp_messages
  for select
  to authenticated
  using (true);

-- No browser insert/update/delete policy.

-- ---------------------------------------------------------------------------
-- whatsapp_suppression_list
-- Browser: SELECT, INSERT active manual suppressions, UPDATE active rows to
-- removed. Webhook opt-out writes still bypass RLS through service role.
-- ---------------------------------------------------------------------------

alter table public.whatsapp_suppression_list enable row level security;

drop policy if exists whatsapp_suppression_list_select_authenticated
  on public.whatsapp_suppression_list;
drop policy if exists whatsapp_suppression_list_insert_authenticated
  on public.whatsapp_suppression_list;
drop policy if exists whatsapp_suppression_list_update_authenticated
  on public.whatsapp_suppression_list;
drop policy if exists whatsapp_suppression_list_delete_authenticated
  on public.whatsapp_suppression_list;

create policy whatsapp_suppression_list_select_authenticated
  on public.whatsapp_suppression_list
  for select
  to authenticated
  using (true);

create policy whatsapp_suppression_list_insert_authenticated
  on public.whatsapp_suppression_list
  for insert
  to authenticated
  with check (
    status = 'active'
    and removed_at is null
    and removed_by is null
    and (added_by is null or added_by = auth.uid())
  );

create policy whatsapp_suppression_list_mark_removed_authenticated
  on public.whatsapp_suppression_list
  for update
  to authenticated
  using (status = 'active')
  with check (
    status = 'removed'
    and removed_at is not null
    and (removed_by is null or removed_by = auth.uid())
  );

-- No browser delete policy.

-- ---------------------------------------------------------------------------
-- whatsapp_templates
-- Browser: SELECT and temporary local create/edit/archive workflow.
-- Official Meta sync writes are owned by sync-whatsapp-templates using service
-- role. This keeps current TemplateManager behavior working while removing
-- delete access and tying local inserts to the current user when provided.
-- ---------------------------------------------------------------------------

alter table public.whatsapp_templates enable row level security;

drop policy if exists whatsapp_templates_select_authenticated
  on public.whatsapp_templates;
drop policy if exists whatsapp_templates_insert_authenticated
  on public.whatsapp_templates;
drop policy if exists whatsapp_templates_update_authenticated
  on public.whatsapp_templates;
drop policy if exists whatsapp_templates_delete_authenticated
  on public.whatsapp_templates;

create policy whatsapp_templates_select_authenticated
  on public.whatsapp_templates
  for select
  to authenticated
  using (true);

create policy whatsapp_templates_insert_authenticated
  on public.whatsapp_templates
  for insert
  to authenticated
  with check (created_by is null or created_by = auth.uid());

create policy whatsapp_templates_update_authenticated
  on public.whatsapp_templates
  for update
  to authenticated
  using (true)
  with check (true);

-- No browser delete policy. Archive by setting status = 'archived'.

-- ---------------------------------------------------------------------------
-- whatsapp_ai_suggestions
-- Browser: SELECT and status/review lifecycle UPDATE.
-- Inserts are owned by generate-whatsapp-reply-suggestion using service role.
-- Note: RLS cannot restrict updated columns by itself. For stricter production
-- control, move approve/reject/used decisions behind Edge Functions or RPCs and
-- remove this update policy.
-- ---------------------------------------------------------------------------

alter table public.whatsapp_ai_suggestions enable row level security;

drop policy if exists whatsapp_ai_suggestions_select_authenticated
  on public.whatsapp_ai_suggestions;
drop policy if exists whatsapp_ai_suggestions_insert_authenticated
  on public.whatsapp_ai_suggestions;
drop policy if exists whatsapp_ai_suggestions_update_authenticated
  on public.whatsapp_ai_suggestions;
drop policy if exists whatsapp_ai_suggestions_delete_authenticated
  on public.whatsapp_ai_suggestions;

create policy whatsapp_ai_suggestions_select_authenticated
  on public.whatsapp_ai_suggestions
  for select
  to authenticated
  using (true);

create policy whatsapp_ai_suggestions_review_update_authenticated
  on public.whatsapp_ai_suggestions
  for update
  to authenticated
  using (status in ('pending_review', 'pending', 'approved'))
  with check (
    status in ('approved', 'rejected', 'used')
    and (
      approved_by is null
      or approved_by = auth.uid()
    )
  );

-- No browser insert/delete policy.
