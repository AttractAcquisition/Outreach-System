create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.whatsapp_suppression_list (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  normalized_phone_number text not null,
  reason text not null default 'manual',
  source text not null default 'manual',
  status text not null default 'active',
  prospect_id uuid references public.prospects(id) on delete set null,
  conversation_id uuid references public.whatsapp_conversations(id) on delete set null,
  added_by uuid references auth.users(id) on delete set null,
  removed_by uuid references auth.users(id) on delete set null,
  removed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_suppression_list_status_check
    check (status in ('active', 'removed')),
  constraint whatsapp_suppression_list_reason_check
    check (reason in (
      'manual',
      'opt_out',
      'not_interested',
      'wrong_number',
      'complaint',
      'duplicate',
      'invalid_number',
      'blocked',
      'other'
    )),
  constraint whatsapp_suppression_list_source_check
    check (source in ('manual', 'ui', 'inbound_keyword', 'webhook', 'import', 'system')),
  constraint whatsapp_suppression_list_removed_check
    check (
      (status = 'active' and removed_at is null)
      or
      (status = 'removed' and removed_at is not null)
    )
);

create index if not exists whatsapp_suppression_list_normalized_phone_number_idx
  on public.whatsapp_suppression_list (normalized_phone_number);

create index if not exists whatsapp_suppression_list_phone_number_idx
  on public.whatsapp_suppression_list (phone_number);

create index if not exists whatsapp_suppression_list_status_idx
  on public.whatsapp_suppression_list (status);

create index if not exists whatsapp_suppression_list_prospect_id_idx
  on public.whatsapp_suppression_list (prospect_id);

create index if not exists whatsapp_suppression_list_conversation_id_idx
  on public.whatsapp_suppression_list (conversation_id);

create index if not exists whatsapp_suppression_list_created_at_desc_idx
  on public.whatsapp_suppression_list (created_at desc);

create unique index if not exists whatsapp_suppression_list_active_normalized_phone_number_key
  on public.whatsapp_suppression_list (normalized_phone_number)
  where status = 'active';

drop trigger if exists set_whatsapp_suppression_list_updated_at
  on public.whatsapp_suppression_list;

create trigger set_whatsapp_suppression_list_updated_at
before update on public.whatsapp_suppression_list
for each row
execute function public.set_updated_at();

alter table public.whatsapp_suppression_list enable row level security;

-- Initial operator policies. Production hardening should move writes behind
-- Edge Functions once opt-out/webhook enforcement is implemented.
drop policy if exists whatsapp_suppression_list_select_authenticated
  on public.whatsapp_suppression_list;

create policy whatsapp_suppression_list_select_authenticated
  on public.whatsapp_suppression_list
  for select
  to authenticated
  using (true);

drop policy if exists whatsapp_suppression_list_insert_authenticated
  on public.whatsapp_suppression_list;

create policy whatsapp_suppression_list_insert_authenticated
  on public.whatsapp_suppression_list
  for insert
  to authenticated
  with check (true);

drop policy if exists whatsapp_suppression_list_update_authenticated
  on public.whatsapp_suppression_list;

create policy whatsapp_suppression_list_update_authenticated
  on public.whatsapp_suppression_list
  for update
  to authenticated
  using (true)
  with check (true);
