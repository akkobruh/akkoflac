-- Run this once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{5}$'),
  used boolean not null default false,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists access_codes_unused_idx
  on public.access_codes (used, created_at desc);

-- Frontend never talks to this table directly. Netlify Functions use the
-- Supabase service-role key, so RLS can stay locked down.
alter table public.access_codes enable row level security;
