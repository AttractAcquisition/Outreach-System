do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and p.pronargs = 0
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
end $$;

create table if not exists public.whatsapp_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  suggested_body text not null,
  reason text,
  confidence numeric,
  status text not null default 'pending_review',
  provider text,
  model text,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejected_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_ai_suggestions
  add column if not exists conversation_id uuid references public.whatsapp_conversations(id) on delete cascade,
  add column if not exists prospect_id uuid references public.prospects(id) on delete set null,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists suggested_body text,
  add column if not exists reason text,
  add column if not exists confidence numeric,
  add column if not exists status text default 'pending_review',
  add column if not exists provider text,
  add column if not exists model text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.whatsapp_ai_suggestions
  alter column conversation_id set not null,
  alter column suggested_body set not null,
  alter column status set default 'pending_review',
  alter column status set not null,
  alter column metadata set default '{}'::jsonb,
  alter column metadata set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

create index if not exists whatsapp_ai_suggestions_conversation_id_idx
  on public.whatsapp_ai_suggestions (conversation_id);

create index if not exists whatsapp_ai_suggestions_prospect_id_idx
  on public.whatsapp_ai_suggestions (prospect_id);

create index if not exists whatsapp_ai_suggestions_client_id_idx
  on public.whatsapp_ai_suggestions (client_id);

create index if not exists whatsapp_ai_suggestions_status_idx
  on public.whatsapp_ai_suggestions (status);

create index if not exists whatsapp_ai_suggestions_created_at_idx
  on public.whatsapp_ai_suggestions (created_at desc);

alter table public.whatsapp_ai_suggestions enable row level security;

drop policy if exists whatsapp_ai_suggestions_select_authenticated
  on public.whatsapp_ai_suggestions;

create policy whatsapp_ai_suggestions_select_authenticated
  on public.whatsapp_ai_suggestions
  for select
  to authenticated
  using (true);

drop policy if exists whatsapp_ai_suggestions_insert_authenticated
  on public.whatsapp_ai_suggestions;

create policy whatsapp_ai_suggestions_insert_authenticated
  on public.whatsapp_ai_suggestions
  for insert
  to authenticated
  with check (true);

drop policy if exists whatsapp_ai_suggestions_update_authenticated
  on public.whatsapp_ai_suggestions;

create policy whatsapp_ai_suggestions_update_authenticated
  on public.whatsapp_ai_suggestions
  for update
  to authenticated
  using (true)
  with check (true);

drop trigger if exists set_whatsapp_ai_suggestions_updated_at
  on public.whatsapp_ai_suggestions;

create trigger set_whatsapp_ai_suggestions_updated_at
before update on public.whatsapp_ai_suggestions
for each row
execute function public.set_updated_at();
