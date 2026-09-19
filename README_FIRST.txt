JEMBE — VISUAL STUDIO VERSION

START HERE
1. Use the creator-universe folder as the website project.
2. In Supabase, because you already ran the older Jembe SQL, run JEMBE_VISUAL_STUDIO_MIGRATION.sql once.
3. Open creator-universe in CMD and run: npm install
4. Then run: npm run dev
5. Website: http://localhost:5173
6. Admin: http://localhost:5173/admin
7. Visual Studio: http://localhost:5173/admin/visual

VISUAL STUDIO
- Drag hero elements directly in the live preview.
- Select logo, motto, owner photo, headline, description, buttons or featured product.
- Change X/Y position, width, height, visibility, headline scale, opacity and corner radius.
- Show/hide homepage sections.
- Reorder homepage sections.
- Add and delete custom homepage sections.
- Preview desktop/mobile.
- Use Undo/Redo.
- Publish the design to Supabase.

SUPABASE
- The local .env is included for local testing and is ignored by Git.
- The public/publishable Supabase key is safe to use in a browser app; never add a service_role/secret key.
- For Netlify, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as environment variables and redeploy.
