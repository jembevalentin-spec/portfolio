JEMBE — CURRENT BUILD

Use the creator-universe folder as the website project.

LOCAL TEST
1. Open creator-universe in CMD.
2. npm install
3. npm run dev
4. Open http://localhost:5173
5. Admin: http://localhost:5173/admin
6. Visual editor: http://localhost:5173/admin/visual

SUPABASE
The project uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env locally.
Do NOT commit .env.

RUN ONCE IN SUPABASE IF YOUR EXISTING DATABASE IS ALREADY CREATED:
JEMBE_VISUAL_BACKGROUND_MIGRATION.sql
This adds hero/lower background type + media fields.

VISUAL STUDIO
- Center preview is the full website and can scroll all the way down.
- Edit live mode lets you drag highlighted hero elements with the pointer.
- Background media controls let the admin choose video/photo/none for the hero and lower website zone.
- Publish design saves the design/content to Supabase.

GITHUB
Upload the contents of creator-universe to the repository. The .gitignore excludes .env.

NETLIFY
Base directory: creator-universe (when the repo contains that folder)
Build command: npm run build
Publish directory: dist
Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify environment variables.
