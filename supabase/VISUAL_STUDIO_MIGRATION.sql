-- Run this once in Supabase after the original Jembe SQL.
-- It adds the Visual Studio design configuration to the existing site_content table.
alter table public.site_content
  add column if not exists design_json jsonb not null default '{}'::jsonb;

update public.site_content
set design_json = coalesce(design_json, '{}'::jsonb)
where site_key = 'main';
