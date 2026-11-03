# Requirements Brief Builder

Next.js application for collecting client website requirements and exporting implementation-ready specifications.

## Stack

- Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- Supabase (PostgreSQL, Storage), optional. Without keys, data stays in `.data/store.json`.

## Setup

1. Copy `.env.example` to `.env.local` only if you want Supabase. Leave it empty to use the local store.
2. If you use Supabase, run the SQL migration in `supabase/migrations/001_initial.sql` in the SQL editor.
3. Install and run:

```bash
npm install
npm run dev
```

4. Open the home page. Edit questionnaires, or create a questionnaire link and share `/q/{token}`. There is no login.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint

## Deployment

Deploy to Vercel and set the same environment variables. Set `NEXT_PUBLIC_APP_URL` to your production URL so client links copy correctly.
