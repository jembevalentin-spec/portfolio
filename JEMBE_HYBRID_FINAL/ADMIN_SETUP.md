# Jembe admin setup

The `/admin` panel now uses Supabase Authentication for the administrator account and Supabase/PostgREST + Storage for site data and uploads.

Admin email:
`jembevalentin@gmail.com`

Setup:
1. Run `supabase/schema.sql` once in Supabase SQL Editor.
2. Create `jembevalentin@gmail.com` in Supabase Authentication → Users.
3. Copy `.env.example` to `.env` and add your Supabase project URL and public publishable/anon key.
4. Run `npm install` and `npm run dev`.
5. Open `/admin` and sign in with the password created in Supabase.

The supplied silent background video remains at `public/media/jembe-background.mp4`. Admin can replace the logo, owner photo, fallback image and background video through Site content; uploaded media is stored in Supabase Storage.

## Visual Studio

After login, open `/admin/visual` to edit the real Jembe homepage visually. The center canvas is a full scrollable live website preview. Changes to the visual draft update immediately in the preview and only become public after **Publish**.
