create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  whatsapp_message_id text unique,
  direction text not null,
  message_type text not null default 'text',
  body text,
  media_url text,
  media_mime_type text,
  template_name text,
  template_language text,
  status text not null default 'received',
  sender_type text not null default 'contact',
  sent_by uuid references auth.users(id) on delete set null,
  ai_generated boolean not null default false,
  human_approved boolean not null default false,
  approval_id uuid references public.approval_queue(id) on delete set null,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  read_at timestamptz,
  constraint whatsapp_messages_direction_check
    check (direction in ('inbound', 'outbound')),
  constraint whatsapp_messages_message_type_check
    check (message_type in ('text', 'image', 'document', 'audio', 'video', 'template', 'interactive', 'system')),
  constraint whatsapp_messages_status_check
    check (status in ('received', 'queued', 'sent', 'delivered', 'read', 'failed')),
  constraint whatsapp_messages_sender_type_check
    check (sender_type in ('contact', 'human', 'ai', 'system'))
);

create index if not exists whatsapp_messages_conversation_created_at_idx
  on public.whatsapp_messages (conversation_id, created_at);

create index if not exists whatsapp_messages_prospect_id_idx
  on public.whatsapp_messages (prospect_id);

create index if not exists whatsapp_messages_client_id_idx
  on public.whatsapp_messages (client_id);

create index if not exists whatsapp_messages_whatsapp_message_id_idx
  on public.whatsapp_messages (whatsapp_message_id);

create index if not exists whatsapp_messages_direction_idx
  on public.whatsapp_messages (direction);

create index if not exists whatsapp_messages_status_idx
  on public.whatsapp_messages (status);

create index if not exists whatsapp_messages_created_at_desc_idx
  on public.whatsapp_messages (created_at desc);

create or replace function public.sync_whatsapp_conversation_from_message()
returns trigger
language plpgsql
as $$
begin
  update public.whatsapp_conversations
  set
    last_message_preview = left(coalesce(new.body, '[' || new.message_type || ']'), 500),
    last_message_at = new.created_at,
    last_inbound_at = case
      when new.direction = 'inbound' then new.created_at
      else last_inbound_at
    end,
    last_outbound_at = case
      when new.direction = 'outbound' then new.created_at
      else last_outbound_at
    end,
    unread_count = case
      when new.direction = 'inbound' then unread_count + 1
      else unread_count
    end,
    service_window_open_until = case
      when new.direction = 'inbound' then new.created_at + interval '24 hours'
      else service_window_open_until
    end,
    updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists sync_whatsapp_conversation_after_message_insert on public.whatsapp_messages;

create trigger sync_whatsapp_conversation_after_message_insert
after insert on public.whatsapp_messages
for each row
execute function public.sync_whatsapp_conversation_from_message();

alter table public.whatsapp_messages enable row level security;

-- Conservative initial policies for authenticated operators.
-- Harden before production with project-specific role/client ownership rules.
create policy "Authenticated users can read WhatsApp messages"
  on public.whatsapp_messages
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert WhatsApp messages"
  on public.whatsapp_messages
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update WhatsApp messages"
  on public.whatsapp_messages
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete WhatsApp messages"
  on public.whatsapp_messages
  for delete
  to authenticated
  using (true);
