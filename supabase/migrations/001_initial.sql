-- Website Requirements Builder — initial schema

create extension if not exists "pgcrypto";

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists form_schemas (
  id uuid primary key default gen_random_uuid(),
  version int not null default 1,
  schema jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text,
  client_email text,
  access_token text not null unique,
  status text not null default 'active' check (status in ('active', 'archived')),
  is_sample boolean not null default false,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  form_schema_snapshot jsonb not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (project_id)
);

create index if not exists idx_projects_token on projects(access_token);
create index if not exists idx_submissions_project on submissions(project_id);

alter table site_settings enable row level security;
alter table form_schemas enable row level security;
alter table projects enable row level security;
alter table submissions enable row level security;

-- Authenticated admins: full access
create policy "Admins manage site_settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admins manage form_schemas"
  on form_schemas for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admins manage projects"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admins manage submissions"
  on submissions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Public read/update via service role only (API routes validate token)

insert into storage.buckets (id, name, public)
values ('client-uploads', 'client-uploads', false)
on conflict (id) do nothing;

create policy "Admins read uploads"
  on storage.objects for select
  using (bucket_id = 'client-uploads' and auth.role() = 'authenticated');

create policy "Admins delete uploads"
  on storage.objects for delete
  using (bucket_id = 'client-uploads' and auth.role() = 'authenticated');
