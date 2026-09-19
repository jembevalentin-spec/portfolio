# Jembe Digital Universe

React + Vite + Tailwind website for Jembe, with a Supabase-ready admin and content backend.

## Local setup

```bash
npm install
```

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Then run:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Supabase setup — one SQL

Open your Supabase project → **SQL Editor → New query** and paste the entire contents of:

`supabase/schema.sql`

That one file creates the tables, RLS policies, Storage buckets, seed content, and the auth trigger used by the Jembe admin.

Then create this user in **Supabase → Authentication → Users → Add user**:

`jembevalentin@gmail.com`

Choose the admin password yourself. The SQL trigger automatically gives this exact email the `admin` role.

## Admin

Open:

`http://localhost:5173/admin`

Sign in with `jembevalentin@gmail.com` and the password you created in Supabase.

## Security

Use only the Supabase public publishable/anon key in the Vite frontend. Never put a Supabase service-role key in `.env` or browser code.

## Included

- Jembe branding
- Silent hero background video fallback
- Owner photo + logo/motto controls
- Supabase-backed site content
- Supabase-backed products and portfolio projects
- Admin authentication for the Jembe admin email
- Supabase Storage upload support for logo, owner photo and hero media
- Netlify SPA redirect

## Jembe Visual Studio

Open `/admin/visual` after signing in. The editor now uses a hybrid visual workflow:

- Click real homepage elements to select them.
- Drag hero elements directly on the live page.
- Resize selected hero elements with the corner handles.
- Double-click/typing works directly for the hero eyebrow, headline, description and motto.
- Use the Layers panel to hide/show and reorder sections.
- Use the Properties panel for exact position, size, alignment, text scale, locking and media uploads.
- Switch Desktop / Tablet / Mobile to preview the real page at different widths.
- Use Save/Publish to write the design to Supabase.
