# CCP Confession

Anonymous confession website with moderation, categories, search, sorting and reactions.

## Files

- `index.html` — homepage
- `submit.html` — anonymous confession form
- `confessions.html` — public confession feed
- `admin.html` — private moderation dashboard
- `css/style.css` — all styling
- `js/config.js` — Supabase connection
- `js/submit.js` — submission logic
- `js/confessions.js` — public feed + reactions
- `js/admin.js` — admin login/moderation
- `supabase.sql` — database + security policies

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase.sql`.
3. Create an admin user in Supabase Authentication > Users.
4. Copy that user's UUID.
5. Insert the UUID into `public.admins`:
   `insert into public.admins (user_id) values ('YOUR_UUID');`
6. Open Project Settings > API and copy the Project URL and anon/public key.
7. Put them into `js/config.js`.
8. Upload the folder to any static host.

## Important security rule

Never put the Supabase `service_role` key in frontend JavaScript. Only use the public `anon` key.

## Local testing

Because browser security can block some local module/network behavior, use a simple local server if needed. For example with Python:

`python -m http.server 5500`

Then open `http://localhost:5500`.

## What the current version does

- Anonymous public submission
- Mandatory moderation before public display
- Category filtering
- Search
- Latest / Most Reacted sorting
- Random confession
- Five reactions
- Optional nickname
- Admin login
- Approve/reject moderation
- Pinned-confession field ready for admin use

For production, add stronger anti-spam/rate limiting and content moderation before opening it publicly.
