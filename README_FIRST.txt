JEMBE - FINAL ADMIN FIX

1. Use creator-universe as the website project folder.
2. Run: npm install
3. Run: npm run dev
4. Test: http://localhost:5173/
5. Test: http://localhost:5173/admin

The /admin routing was simplified to one React Router tree to prevent a blank/black admin page on direct navigation.
The admin login still uses Supabase Auth when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.

For GitHub/Netlify, do NOT upload .env. Add the VITE_* values in Netlify environment variables.
