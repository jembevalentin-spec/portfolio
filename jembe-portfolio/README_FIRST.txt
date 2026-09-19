JEMBE — FULL PROJECT
====================

IMPORTANT: This ZIP is already arranged as the actual project root.
The folder you extract contains package.json directly.
There is NO second nested creator-universe folder.

LOCAL HOST
----------
1. Open this folder in File Explorer.
2. Double-click START_JEMBE.bat OR open CMD in this folder.
3. Run:
   npm install
   npm run dev
4. Open the URL Vite prints, normally:
   http://localhost:5173
5. Admin:
   http://localhost:5173/admin
   Visual Studio:
   http://localhost:5173/admin/visual

SUPABASE
--------
The local .env contains the Supabase public project URL/key you supplied.
Do NOT commit .env to GitHub. .gitignore excludes it.
The main Supabase schema is:
  supabase/schema.sql

NETLIFY
-------
If the GitHub repository contains these files at its root, use:
  Base directory: (leave blank)
  Build command: npm run build
  Publish directory: dist

If you keep the site inside a creator-universe subfolder in GitHub instead,
set Netlify Base directory to creator-universe and keep the same build/publish values.

GITHUB
------
Upload the CONTENTS of this project folder to the repository root for the simplest setup.
Do not upload .env.
