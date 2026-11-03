# Requirements Brief Builder

Next.js application for collecting client website requirements and exporting implementation-ready specifications.

## Stack

- Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase credentials.
2. Run the SQL migration in `supabase/migrations/001_initial.sql` in your Supabase project (SQL editor).
3. Create an admin user in Supabase Auth (email/password).
4. Install and run:

```bash
npm install
npm run dev
```

5. Sign in at `/admin/login`, create a client project, and share the `/q/{token}` link.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint

## Deployment

Deploy to Vercel and set the same environment variables. Set `NEXT_PUBLIC_APP_URL` to your production URL so client links copy correctly.
