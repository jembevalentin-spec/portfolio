-- JEMBE SUPABASE SETUP — RUN THIS ONE FILE ONCE
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), case when lower(new.email)=lower('jembevalentin@gmail.com') then 'admin' else 'user' end)
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.site_content (
  site_key text primary key default 'main',
  site_name text not null default 'Jembe', logo_text text not null default 'JM', logo_url text default '', motto text default '',
  hero_eyebrow text default '', hero_headline text default '', hero_description text default '', hero_owner_image text default '',
  hero_background_video text default '/media/jembe-background.mp4', hero_background_image text default '/media/jembe-background-poster.jpg', hero_background_type text not null default 'video' check(hero_background_type in ('video','image','none')), hero_overlay numeric not null default 62,
  lower_background_type text not null default 'image' check(lower_background_type in ('video','image','none')), lower_background_video text default '/media/jembe-background.mp4', lower_background_image text default '/media/jembe-background-poster.jpg', lower_overlay numeric not null default 78,
  hero_visible boolean not null default true, show_owner_photo boolean not null default true, show_featured_product boolean not null default true,
  store_label text default '', store_headline text default '', store_description text default '',
  portfolio_label text default '', portfolio_headline text default '', portfolio_description text default '',
  about_label text default '', about_headline text default '', about_text text default '',
  contact_label text default '', contact_headline text default '', contact_description text default '', contact_email text default 'jembevalentin@gmail.com',
  github text default '', twitter text default '', linkedin text default '', footer_text text default '',
  announcement_text text default '', announcement_visible boolean not null default false,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at before update on public.site_content for each row execute function public.set_updated_at();

alter table public.site_content add column if not exists design_json jsonb not null default '{}'::jsonb;

insert into public.site_content (site_key,site_name,logo_text,motto,hero_eyebrow,hero_headline,hero_description,hero_background_video,hero_overlay,hero_visible,show_owner_photo,show_featured_product,store_label,store_headline,store_description,portfolio_label,portfolio_headline,portfolio_description,about_label,about_headline,about_text,contact_label,contact_headline,contact_description,contact_email,footer_text)
values ('main','Jembe','JM','Build it. Ship it. Make it useful.','Independent creator — apps, sites & digital tools','Digital products built to be useful.','I design and build Android apps, websites, and focused digital tools — then ship the finished work here. Practical ideas, polished execution, no unnecessary noise.','/media/jembe-background.mp4',62,true,true,true,'The store','Useful products, ready to use.','Apps, websites, templates and tools made by Jembe — ready to download, license or explore.','Portfolio','Selected work, with the thinking behind it.','Case studies that show the problem, process, technology and outcome — not just the final screenshot.','About Jembe','I build small, useful things — then I finish them.','Jembe is an independent developer studio focused on Android apps, modern websites and digital tools. Ideas are turned into real products with a bias toward clarity, speed and usefulness.','Get in touch','Have something worth building?','Open to selected freelance work, collaborations and product conversations.','jembevalentin@gmail.com','Building Android apps, web tools, and focused digital products — and shipping the ones worth sharing.')
on conflict (site_key) do nothing;

create table if not exists public.product_categories (
 id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null, description text default '', sort_order int not null default 0, visible boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists product_categories_updated_at on public.product_categories;
create trigger product_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();
insert into public.product_categories(name,slug,sort_order) values
('Android App','android-app',1),('Website','website',2),('Digital Tool','digital-tool',3),('Template','template',4),('Experiment','experiment',5)
on conflict(slug) do nothing;

create table if not exists public.products (
 id text primary key, name text not null, slug text unique not null, description text default '', long_description text default '', category text not null,
 price numeric(12,2) not null default 0, currency text not null default 'USD', is_free boolean not null default true, image text default '', gallery text[] not null default '{}',
 file text default '', live_url text default '', version text default '', compatibility text default '', features text[] not null default '{}', featured boolean not null default false,
 status text not null default 'draft' check(status in ('live','draft','archived')), sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

insert into public.products (id,name,slug,description,long_description,category,price,currency,is_free,image,gallery,file,live_url,version,compatibility,features,featured,status,sort_order)
values
('p1', 'Project Organizer', 'project-organizer', 'A focused task and project tracker built for people who juggle too many side quests.', 'Project Organizer keeps every side project, deadline, and note in one offline-first workspace. Built natively for Android with a fast, distraction-free interface — no accounts, no sync required, no clutter. Group work into boards, attach quick notes, and track progress with a single glance widget on your home screen.', 'Android App', 0, 'USD', true, 'https://picsum.photos/seed/organizer/900/700', ARRAY['https://picsum.photos/seed/organizer1/900/700','https://picsum.photos/seed/organizer2/900/700','https://picsum.photos/seed/organizer3/900/700'], 'project-organizer.apk', '', '2.4.1', 'Android 9.0+', ARRAY['Offline-first, no account needed','Home screen progress widget','Custom boards and tags','Dark mode by default'], true, 'live', 0),
('p2', 'Sano Marketplace', 'sano-marketplace', 'A full storefront template for creators selling digital goods, with cart and checkout built in.', 'Sano Marketplace is a production-ready web app template for anyone launching a digital storefront. It ships with product listings, a cart, a checkout flow, and an admin dashboard scaffold — all wired to a clean, swappable data layer so you can connect your own backend in a weekend.', 'Website', 49, 'USD', false, 'https://picsum.photos/seed/sano/900/700', ARRAY['https://picsum.photos/seed/sano1/900/700','https://picsum.photos/seed/sano2/900/700','https://picsum.photos/seed/sano3/900/700'], '', '', '1.2.0', 'Node 18+, any static host', ARRAY['Cart + checkout flow scaffold','Admin dashboard template','Swappable data layer','Fully typed with TypeScript'], true, 'live', 0),
('p3', 'Creator Toolkit', 'creator-toolkit', 'A bundle of small utilities — image compression, palette extraction, and batch renaming.', 'Creator Toolkit bundles the small utilities you reach for constantly: a batch image compressor, a palette extractor for building design systems from photos, and a smart file renamer. Runs entirely client-side — nothing you drop into it ever leaves your machine.', 'Digital Tool', 19, 'USD', false, 'https://picsum.photos/seed/toolkit/900/700', ARRAY['https://picsum.photos/seed/toolkit1/900/700','https://picsum.photos/seed/toolkit2/900/700'], '', '', '3.0.0', 'Web (any modern browser)', ARRAY['Client-side image compression','Palette extraction from photos','Smart batch renaming','No uploads, fully local'], true, 'live', 0),
('p4', 'Motion Grid', 'motion-grid', 'A Framer Motion component template for building bento-style animated grids fast.', 'Motion Grid is a drop-in set of React + Framer Motion components for building the animated bento grids that used to take days to hand-roll: scroll-triggered reveals, stacking cards, and magnetic hover states, all with sane defaults and full TypeScript types.', 'Template', 29, 'USD', false, 'https://picsum.photos/seed/motiongrid/900/700', ARRAY['https://picsum.photos/seed/motiongrid1/900/700','https://picsum.photos/seed/motiongrid2/900/700'], '', '', '1.0.4', 'React 18+', ARRAY['Scroll-triggered reveals','Stacking card system','Magnetic hover primitives'], false, 'live', 0),
('p5', 'Signal', 'signal-widget-kit', 'An experimental Android widget kit for surfacing live data on the home screen.', 'Signal is an experimental widget kit exploring how much useful information can live on an Android home screen without feeling noisy. Includes five widget shapes and a lightweight config screen for wiring your own data sources.', 'Experiment', 0, 'USD', true, 'https://picsum.photos/seed/signal/900/700', ARRAY['https://picsum.photos/seed/signal1/900/700'], 'signal-widget-kit.apk', '', '0.6.0-beta', 'Android 12.0+', ARRAY['Five widget shapes','Lightweight config screen','Actively evolving'], false, 'live', 0),
('p6', 'Field Notes', 'field-notes-template', 'A minimal journaling and note-taking web template with local-first storage.', 'Field Notes is a minimal, local-first journaling template — fast, private, and built to be forked. No backend required to start; a clean data layer makes it easy to add sync later.', 'Template', 15, 'USD', false, 'https://picsum.photos/seed/fieldnotes/900/700', ARRAY['https://picsum.photos/seed/fieldnotes1/900/700'], '', '', '1.1.0', 'React 18+, any static host', ARRAY['Local-first storage','Minimal distraction-free editor','Easy to fork and theme'], false, 'live', 0)
on conflict(id) do update set name=excluded.name, slug=excluded.slug, description=excluded.description, long_description=excluded.long_description, category=excluded.category, price=excluded.price, currency=excluded.currency, is_free=excluded.is_free, image=excluded.image, gallery=excluded.gallery, file=excluded.file, live_url=excluded.live_url, version=excluded.version, compatibility=excluded.compatibility, features=excluded.features, featured=excluded.featured, status=excluded.status;

create table if not exists public.projects (
 id text primary key, title text not null, slug text unique not null, description text default '', long_description text default '', category text not null,
 technologies text[] not null default '{}', image text default '', gallery text[] not null default '{}', live_url text default '', github_url text default '', role text default '', duration text default '',
 problem text default '', solution text default '', results text default '', featured boolean not null default false, visible boolean not null default true, sort_order int not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

insert into public.projects (id,title,slug,description,long_description,category,technologies,image,gallery,live_url,github_url,role,duration,problem,solution,results,featured,visible,sort_order)
values
('pr1', 'Sano Marketplace', 'sano-marketplace-case-study', 'A digital-goods storefront built for independent creators, from concept to launch.', 'Sano started as a weekend experiment in checkout flows and grew into a full marketplace template now used as the base for the Store section of this site. The brief was simple: make buying a digital product feel as considered as buying a physical one — clear pricing, honest previews, and a checkout that never makes you guess what happens next.', 'Web App', ARRAY['React','TypeScript','Tailwind CSS','Framer Motion'], 'https://picsum.photos/seed/proj-sano/1200/900', ARRAY['https://picsum.photos/seed/proj-sano1/1200/900','https://picsum.photos/seed/proj-sano2/1200/900'], '', '', '', '', '', '', '', true, true, 0),
('pr2', 'Project Organizer', 'project-organizer-case-study', 'An offline-first Android app for tracking side projects without the overhead.', 'Built out of frustration with task apps that demand an account before you''ve written a single to-do. Project Organizer is deliberately small: boards, notes, a widget, done. The whole build leaned on Jetpack Compose and a local Room database, with an emphasis on cold-start speed.', 'Android App', ARRAY['Kotlin','Jetpack Compose','Room'], 'https://picsum.photos/seed/proj-organizer/1200/900', ARRAY['https://picsum.photos/seed/proj-organizer1/1200/900'], '', '', '', '', '', '', '', true, true, 0),
('pr3', 'Future Experiments', 'future-experiments', 'A running log of interface experiments — widgets, motion studies, and half-finished ideas.', 'Not every build needs to ship. This is the sketchbook: motion studies, odd widget shapes, and interface ideas tested in isolation before (sometimes) making their way into a real product.', 'Experiment', ARRAY['React','Framer Motion','Canvas'], 'https://picsum.photos/seed/proj-experiments/1200/900', ARRAY['https://picsum.photos/seed/proj-experiments1/1200/900'], '', '', '', '', '', '', '', true, true, 0),
('pr4', 'Field Notes', 'field-notes-case-study', 'A minimal local-first journaling template built to be forked and themed.', 'Field Notes exists because most note apps are too loud. This template strips the interface down to a single column and a clean local data model, so the writing is the only thing competing for attention.', 'Personal Project', ARRAY['React','TypeScript','IndexedDB'], 'https://picsum.photos/seed/proj-fieldnotes/1200/900', ARRAY['https://picsum.photos/seed/proj-fieldnotes1/1200/900'], '', '', '', '', '', '', '', false, true, 0)
on conflict(id) do update set title=excluded.title, slug=excluded.slug, description=excluded.description, long_description=excluded.long_description, category=excluded.category, technologies=excluded.technologies, image=excluded.image, gallery=excluded.gallery, live_url=excluded.live_url, github_url=excluded.github_url, role=excluded.role, duration=excluded.duration, problem=excluded.problem, solution=excluded.solution, results=excluded.results, featured=excluded.featured, visible=excluded.visible;

create table if not exists public.media (
 id uuid primary key default gen_random_uuid(), name text not null, file_path text not null, public_url text default '', media_type text not null, mime_type text default '', size_bytes bigint, alt_text text default '', caption text default '', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);

create table if not exists public.customers (
 id uuid primary key default gen_random_uuid(), auth_user_id uuid references auth.users(id) on delete set null, name text not null, email text not null, phone text default '', country text default '', city text default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();

create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null, customer_name text default '', customer_email text default '', currency text not null default 'USD', subtotal numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
 payment_method text default '', payment_reference text default '', status text not null default 'pending' check(status in ('pending','processing','paid','failed','cancelled','refunded')), payment_verified boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id text references public.products(id) on delete set null, product_name text not null, quantity int not null default 1 check(quantity>0), unit_price numeric(12,2) not null default 0, total_price numeric(12,2) not null default 0, created_at timestamptz not null default now()
);

create table if not exists public.downloads (
 id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete set null, product_id text references public.products(id) on delete set null, customer_email text not null, download_token text unique default encode(gen_random_bytes(32),'hex'), download_count int not null default 0, max_downloads int not null default 5, expires_at timestamptz, created_at timestamptz not null default now(), last_downloaded_at timestamptz
);

create table if not exists public.contact_messages (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text default '', subject text default '', project_type text default '', budget text default '', message text not null,
 status text not null default 'new' check(status in ('new','read','replied','archived')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at before update on public.contact_messages for each row execute function public.set_updated_at();

create table if not exists public.testimonials (
 id uuid primary key default gen_random_uuid(), name text not null, role text default '', company text default '', message text not null, avatar_url text default '', rating int check(rating between 1 and 5), visible boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists testimonials_updated_at on public.testimonials;
create trigger testimonials_updated_at before update on public.testimonials for each row execute function public.set_updated_at();

create table if not exists public.announcements (
 id uuid primary key default gen_random_uuid(), title text not null, message text default '', link_text text default '', link_url text default '', visible boolean not null default true, start_at timestamptz, end_at timestamptz, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

drop trigger if exists announcements_updated_at on public.announcements;
create trigger announcements_updated_at before update on public.announcements for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and lower(email)=lower('jembevalentin@gmail.com')); $$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.media enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.downloads enable row level security;
alter table public.contact_messages enable row level security;
alter table public.testimonials enable row level security;
alter table public.announcements enable row level security;

-- Profiles
 drop policy if exists profiles_self_read on public.profiles;
 create policy profiles_self_read on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
 drop policy if exists profiles_admin_all on public.profiles;
 create policy profiles_admin_all on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Public content + admin write
 drop policy if exists site_public_read on public.site_content;
 create policy site_public_read on public.site_content for select to anon,authenticated using(true);
 drop policy if exists site_admin_write on public.site_content;
 create policy site_admin_write on public.site_content for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists category_public_read on public.product_categories;
 create policy category_public_read on public.product_categories for select to anon,authenticated using(visible=true or public.is_admin());
 drop policy if exists category_admin_write on public.product_categories;
 create policy category_admin_write on public.product_categories for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists product_public_read on public.products;
 create policy product_public_read on public.products for select to anon,authenticated using(status='live' or public.is_admin());
 drop policy if exists product_admin_write on public.products;
 create policy product_admin_write on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists project_public_read on public.projects;
 create policy project_public_read on public.projects for select to anon,authenticated using(visible=true or public.is_admin());
 drop policy if exists project_admin_write on public.projects;
 create policy project_admin_write on public.projects for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists media_public_read on public.media;
 create policy media_public_read on public.media for select to anon,authenticated using(true);
 drop policy if exists media_admin_write on public.media;
 create policy media_admin_write on public.media for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists customer_self_read on public.customers;
 create policy customer_self_read on public.customers for select to authenticated using(auth_user_id=auth.uid() or public.is_admin());
 drop policy if exists customer_admin_all on public.customers;
 create policy customer_admin_all on public.customers for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists orders_customer_read on public.orders;
 create policy orders_customer_read on public.orders for select to authenticated using(customer_id in(select id from public.customers where auth_user_id=auth.uid()) or public.is_admin());
 drop policy if exists orders_admin_all on public.orders;
 create policy orders_admin_all on public.orders for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists order_items_customer_read on public.order_items;
 create policy order_items_customer_read on public.order_items for select to authenticated using(order_id in(select o.id from public.orders o join public.customers c on c.id=o.customer_id where c.auth_user_id=auth.uid()) or public.is_admin());
 drop policy if exists order_items_admin_all on public.order_items;
 create policy order_items_admin_all on public.order_items for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists downloads_customer_read on public.downloads;
 create policy downloads_customer_read on public.downloads for select to authenticated using(customer_email=(auth.jwt()->>'email') or public.is_admin());
 drop policy if exists downloads_admin_all on public.downloads;
 create policy downloads_admin_all on public.downloads for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists contact_public_insert on public.contact_messages;
 create policy contact_public_insert on public.contact_messages for insert to anon,authenticated with check(true);
 drop policy if exists contact_admin_read on public.contact_messages;
 create policy contact_admin_read on public.contact_messages for select to authenticated using(public.is_admin());
 drop policy if exists contact_admin_update on public.contact_messages;
 create policy contact_admin_update on public.contact_messages for update to authenticated using(public.is_admin()) with check(public.is_admin());
 drop policy if exists contact_admin_delete on public.contact_messages;
 create policy contact_admin_delete on public.contact_messages for delete to authenticated using(public.is_admin());

 drop policy if exists testimonial_public_read on public.testimonials;
 create policy testimonial_public_read on public.testimonials for select to anon,authenticated using(visible=true or public.is_admin());
 drop policy if exists testimonial_admin_write on public.testimonials;
 create policy testimonial_admin_write on public.testimonials for all to authenticated using(public.is_admin()) with check(public.is_admin());

 drop policy if exists announcement_public_read on public.announcements;
 create policy announcement_public_read on public.announcements for select to anon,authenticated using(visible=true or public.is_admin());
 drop policy if exists announcement_admin_write on public.announcements;
 create policy announcement_admin_write on public.announcements for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Storage buckets
insert into storage.buckets(id,name,public) values ('jembe-media','jembe-media',true),('jembe-backgrounds','jembe-backgrounds',true),('jembe-products','jembe-products',false) on conflict(id) do nothing;

 drop policy if exists jembe_media_read on storage.objects;
 create policy jembe_media_read on storage.objects for select to anon,authenticated using(bucket_id='jembe-media');
 drop policy if exists jembe_media_admin_insert on storage.objects;
 create policy jembe_media_admin_insert on storage.objects for insert to authenticated with check(bucket_id='jembe-media' and public.is_admin());
 drop policy if exists jembe_media_admin_update on storage.objects;
 create policy jembe_media_admin_update on storage.objects for update to authenticated using(bucket_id='jembe-media' and public.is_admin()) with check(bucket_id='jembe-media' and public.is_admin());
 drop policy if exists jembe_media_admin_delete on storage.objects;
 create policy jembe_media_admin_delete on storage.objects for delete to authenticated using(bucket_id='jembe-media' and public.is_admin());

 drop policy if exists jembe_bg_read on storage.objects;
 create policy jembe_bg_read on storage.objects for select to anon,authenticated using(bucket_id='jembe-backgrounds');
 drop policy if exists jembe_bg_admin_insert on storage.objects;
 create policy jembe_bg_admin_insert on storage.objects for insert to authenticated with check(bucket_id='jembe-backgrounds' and public.is_admin());
 drop policy if exists jembe_bg_admin_update on storage.objects;
 create policy jembe_bg_admin_update on storage.objects for update to authenticated using(bucket_id='jembe-backgrounds' and public.is_admin()) with check(bucket_id='jembe-backgrounds' and public.is_admin());
 drop policy if exists jembe_bg_admin_delete on storage.objects;
 create policy jembe_bg_admin_delete on storage.objects for delete to authenticated using(bucket_id='jembe-backgrounds' and public.is_admin());

 drop policy if exists jembe_products_admin_select on storage.objects;
 create policy jembe_products_admin_select on storage.objects for select to authenticated using(bucket_id='jembe-products' and public.is_admin());
 drop policy if exists jembe_products_admin_insert on storage.objects;
 create policy jembe_products_admin_insert on storage.objects for insert to authenticated with check(bucket_id='jembe-products' and public.is_admin());
 drop policy if exists jembe_products_admin_update on storage.objects;
 create policy jembe_products_admin_update on storage.objects for update to authenticated using(bucket_id='jembe-products' and public.is_admin()) with check(bucket_id='jembe-products' and public.is_admin());
 drop policy if exists jembe_products_admin_delete on storage.objects;
 create policy jembe_products_admin_delete on storage.objects for delete to authenticated using(bucket_id='jembe-products' and public.is_admin());

-- Keep an existing account promoted correctly if the email already exists.
insert into public.profiles(id,email,full_name,role)
select id,email,coalesce(raw_user_meta_data->>'full_name','Jembe Admin'),'admin'
from auth.users where lower(email)=lower('jembevalentin@gmail.com')
on conflict(id) do update set email=excluded.email,role='admin',updated_at=now();
