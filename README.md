# Fitness Management Pro

Comprehensive coaching and member experience platform built for fitness teams. Trainers can design programs, assign members, monitor progress, and stay connected through an integrated messaging workflow, while members gain a personalized dashboard to manage their workouts and track milestones.

## Key Capabilities

- **Trainer Operations**: Create structured workout plans, assign members, review analytics, and manage communication threads from a single dashboard.
- **Member Experience**: Access assigned plans, log progress, review session details, and message trainers in real time.
- **Role-Aware Routing**: Server-side Supabase checks ensure the right dashboard loads for each authenticated user role.
- **Supabase Integration**: Auth, row-level security policies, and Postgres tables power secure data storage and messaging.
- **Responsive UI**: Accessible components built with Tailwind CSS, Radix primitives, and custom design tokens for consistent theming.

## Tech Stack

- Next.js 15 (App Router, Server Components, Route Handlers)
- React 19 with TypeScript
- Supabase (Auth, Database, Edge Functions-ready)
- Tailwind CSS 4 with custom utility layers
- Radix UI + shadcn-inspired component library
- Lucide icons, Recharts analytics, date-fns utilities

## Project Structure

```
app/
  auth/               Authentication flows (login, sign-up, error states)
  dashboard/          Trainer dashboard routes and analytics pages
  member-dashboard/   Member-facing experience
  api/messages/       Route handler for composing messages
components/           Shared layout shells and UI primitives
lib/supabase/         Supabase client helpers for server and middleware
scripts/              SQL migrations and seed data
```

## Prerequisites

- Bun 1.1+ (preferred) or pnpm 9+ as a fallback
- Node.js 22 LTS (for tooling compatibility)
- Supabase project with the SQL schema from the `/scripts` directory

## Environment Variables

Create a `.env.local` file with the following values:

```
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<public-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"        # Optional, only for server-side scripts
``` 

> The service role key should never be exposed to the browser. Omit it locally unless you run server-to-server tasks.

## Getting Started

```bash
bun install
cp .env.example .env.local  # if the example is available, otherwise create it manually
bun dev
```

Open http://localhost:3000 to explore the application. The trainer and member dashboards automatically redirect based on the authenticated Supabase role.

### Database Setup

1. Configure your Supabase project and enable Row Level Security.
2. Apply the SQL migrations in `/scripts` in order. You can use the Supabase SQL Editor or the CLI:
   ```bash
   supabase db push < scripts/001_create_database_schema.sql
   ```
   Repeat for the remaining numbered scripts to load seed data and policies.
3. Verify that the `profiles`, `workout_plans`, `member_assignments`, `messages`, and `progress_entries` tables contain the seeded demo content.

### Available Scripts

- `bun dev` - Start the Next.js development server with hot reloading.
- `bun run build` - Create an optimized production build.
- `bun run start` - Serve the production build.
- `bun run lint` - Execute ESLint.
- `bun run format` / `bun run format:fix` - Check or write Prettier formatting.

## Architectural Notes

- **Authentication**: `app/(auth)` routes integrate with Supabase Auth; middleware ensures session refresh and protected routes.
- **Role Guards**: Server components in `app/dashboard` and `app/member-dashboard` call `createClient()` to enforce trainer/member access before rendering content.
- **UI System**: Shared layouts (`components/dashboard-layout.tsx`, `components/member-dashboard-layout.tsx`) standardize navigation, while `components/ui` hosts reusable primitives.
- **Messaging**: `app/api/messages/route.ts` handles message creation via Supabase RPC, surfacing notifications within dashboards.

## Testing & QA Checklist

- Manual verification of trainer and member login flows via Supabase-authenticated accounts.
- Confirm message send/receive paths in both dashboards.
- Review analytics charts and ensure data loads without console errors.
- Run `bun run lint` and `bun run format` before opening a pull request.

## Deployment

The app is optimized for Vercel. Configure the same environment variables from `.env.local` in your Vercel project settings. Ensure Supabase policies are deployed and that production service role keys are stored only in secure server-side contexts.

---

Need help or want to contribute? Open an issue or start a discussion in this repository.