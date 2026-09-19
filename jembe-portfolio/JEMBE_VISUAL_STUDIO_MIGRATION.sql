-- JEMBE VISUAL STUDIO — run once after your existing Jembe SQL
-- This adds the saved visual design configuration used by /admin/visual.
alter table public.site_content
  add column if not exists design_json jsonb not null default '{}'::jsonb;

update public.site_content
set design_json = coalesce(design_json, '{}'::jsonb)
where site_key = 'main';
