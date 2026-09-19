-- Jembe: hero + lower background media controls
alter table public.site_content
  add column if not exists hero_background_type text not null default 'video' check (hero_background_type in ('video','image','none'));

alter table public.site_content
  add column if not exists lower_background_type text not null default 'image' check (lower_background_type in ('video','image','none'));

alter table public.site_content
  add column if not exists lower_background_video text default '';

alter table public.site_content
  add column if not exists lower_background_image text default '/media/jembe-background-poster.jpg';

alter table public.site_content
  add column if not exists lower_overlay numeric not null default 78;

update public.site_content
set
  hero_background_type = coalesce(nullif(hero_background_type, ''), 'video'),
  lower_background_type = coalesce(nullif(lower_background_type, ''), 'image'),
  lower_background_video = coalesce(lower_background_video, '/media/jembe-background.mp4'),
  lower_background_image = coalesce(nullif(lower_background_image, ''), '/media/jembe-background-poster.jpg');
