create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text,
  category text not null default 'utility',
  language text not null default 'en',
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  components jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  meta_template_id text,
  meta_status text,
  meta_quality_rating text,
  whatsapp_business_account_id text,
  phone_number_id text,
  usable_inside_window boolean not null default true,
  usable_outside_window boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_templates_category_check
    check (category in ('utility', 'marketing', 'authentication', 'service')),
  constraint whatsapp_templates_status_check
    check (status in ('draft', 'submitted', 'approved', 'rejected', 'paused', 'archived')),
  constraint whatsapp_templates_meta_status_check
    check (
      meta_status is null
      or meta_status in ('pending', 'approved', 'rejected', 'paused', 'disabled', 'unknown')
    ),
  constraint whatsapp_templates_variables_array_check
    check (jsonb_typeof(variables) = 'array'),
  constraint whatsapp_templates_components_array_check
    check (jsonb_typeof(components) = 'array')
);

create unique index if not exists whatsapp_templates_name_language_key
  on public.whatsapp_templates (name, language);

create index if not exists whatsapp_templates_name_idx
  on public.whatsapp_templates (name);

create index if not exists whatsapp_templates_category_idx
  on public.whatsapp_templates (category);

create index if not exists whatsapp_templates_language_idx
  on public.whatsapp_templates (language);

create index if not exists whatsapp_templates_status_idx
  on public.whatsapp_templates (status);

create index if not exists whatsapp_templates_meta_status_idx
  on public.whatsapp_templates (meta_status);

create index if not exists whatsapp_templates_created_at_desc_idx
  on public.whatsapp_templates (created_at desc);

drop trigger if exists set_whatsapp_templates_updated_at
  on public.whatsapp_templates;

create trigger set_whatsapp_templates_updated_at
before update on public.whatsapp_templates
for each row
execute function public.set_updated_at();

alter table public.whatsapp_templates enable row level security;

-- Initial operator policies. Production hardening should move writes behind
-- Edge Functions once Meta template sync/create flows are implemented.
drop policy if exists whatsapp_templates_select_authenticated
  on public.whatsapp_templates;

create policy whatsapp_templates_select_authenticated
  on public.whatsapp_templates
  for select
  to authenticated
  using (true);

drop policy if exists whatsapp_templates_insert_authenticated
  on public.whatsapp_templates;

create policy whatsapp_templates_insert_authenticated
  on public.whatsapp_templates
  for insert
  to authenticated
  with check (true);

drop policy if exists whatsapp_templates_update_authenticated
  on public.whatsapp_templates;

create policy whatsapp_templates_update_authenticated
  on public.whatsapp_templates
  for update
  to authenticated
  using (true)
  with check (true);
