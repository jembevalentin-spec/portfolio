# Jembe + Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql` once.
3. Go to **Authentication → Users → Add user** and create `jembevalentin@gmail.com` with the admin password you choose.
4. Copy `.env.example` to `.env` and fill in the Supabase Project URL and publishable/anon key.
5. Run `npm install` and `npm run dev`.
6. Open `/admin` and sign in with the admin account.

The SQL includes the database tables, RLS policies, Storage buckets and an Auth trigger that automatically creates the profile for new users; the exact `jembevalentin@gmail.com` account is assigned the `admin` role.

Never put a Supabase service-role key in the Vite frontend. Use the public publishable/anon key and let RLS enforce access.
