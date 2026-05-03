create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  phone_number text not null,
  contact_name text,
  whatsapp_wa_id text,
  source text not null default 'unknown',
  status text not null default 'open',
  stage text not null default 'new',
  assigned_to uuid references auth.users(id) on delete set null,
  last_message_preview text,
  last_message_at timestamptz,
  unread_count integer not null default 0,
  service_window_open_until timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  ai_summary text,
  ai_intent text,
  ai_temperature text,
  needs_human boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_conversations_status_check
    check (status in ('open', 'pending', 'closed', 'archived')),
  constraint whatsapp_conversations_stage_check
    check (stage in ('new', 'needs_reply', 'qualified', 'quoted', 'booked', 'won', 'lost', 'bad_fit')),
  constraint whatsapp_conversations_unread_count_check
    check (unread_count >= 0)
);

create index if not exists whatsapp_conversations_prospect_id_idx
  on public.whatsapp_conversations (prospect_id);

create index if not exists whatsapp_conversations_client_id_idx
  on public.whatsapp_conversations (client_id);

create index if not exists whatsapp_conversations_campaign_id_idx
  on public.whatsapp_conversations (campaign_id);

create index if not exists whatsapp_conversations_phone_number_idx
  on public.whatsapp_conversations (phone_number);

create index if not exists whatsapp_conversations_status_idx
  on public.whatsapp_conversations (status);

create index if not exists whatsapp_conversations_stage_idx
  on public.whatsapp_conversations (stage);

create index if not exists whatsapp_conversations_last_message_at_idx
  on public.whatsapp_conversations (last_message_at desc);

create index if not exists whatsapp_conversations_needs_human_idx
  on public.whatsapp_conversations (needs_human);

create index if not exists whatsapp_conversations_service_window_open_until_idx
  on public.whatsapp_conversations (service_window_open_until);

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and pg_get_function_arguments(p.oid) = ''
  ) then
    create function public.set_updated_at()
    returns trigger
    language plpgsql
    as $function$
    begin
      new.updated_at = now();
      return new;
    end;
    $function$;
  end if;
end;
$$;

drop trigger if exists set_whatsapp_conversations_updated_at on public.whatsapp_conversations;

create trigger set_whatsapp_conversations_updated_at
before update on public.whatsapp_conversations
for each row
execute function public.set_updated_at();

alter table public.whatsapp_conversations enable row level security;

-- Conservative initial policies for authenticated operators.
-- Harden before production with project-specific role/client ownership rules.
create policy "Authenticated users can read WhatsApp conversations"
  on public.whatsapp_conversations
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert WhatsApp conversations"
  on public.whatsapp_conversations
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update WhatsApp conversations"
  on public.whatsapp_conversations
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete WhatsApp conversations"
  on public.whatsapp_conversations
  for delete
  to authenticated
  using (true);
