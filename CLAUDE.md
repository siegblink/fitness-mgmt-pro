# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev` - Start development server with Turbopack on http://localhost:3000
- `bun run build` - Build the application for production
- `bun start` - Start production server
- `bun run lint` - Check code quality with Biome
- `bun run lint:fix` - Auto-fix linting issues with Biome
- `bun run format` - Check code formatting with Biome
- `bun run format:fix` - Auto-fix formatting issues with Biome

## Project Architecture

This is **FitnessPro** - a professional fitness management platform built with Next.js 15 using the App Router. The application serves both trainers and members with separate dashboard experiences.

### Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Runtime**: React 19.1.1
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth (@supabase/ssr) with middleware-based session management
- **UI Framework**: shadcn/ui (60+ components) built on Radix UI primitives
- **Styling**: Tailwind CSS 4.1.13 with CSS variables for theming
- **Type Safety**: TypeScript 5.9.2 with Zod 4.1.12 for schema validation
- **Code Quality**: Biome 2.2.6 (linter + formatter, replaces ESLint and Prettier)
- **Charts**: Recharts 2.15.4 for data visualization
- **Forms**: React Hook Form 7.65.0 with @hookform/resolvers and Zod
- **Icons**: Lucide React 0.546.0
- **Fonts**: Geist and Geist Mono
- **Theme Management**: next-themes 0.4.6 with custom theme context
- **Analytics**: Vercel Analytics

### Application Structure

**Dual Dashboard Architecture:**
- `/dashboard/*` - Trainer/admin dashboard for managing members, workouts, meal plans, and analytics
- `/member-dashboard/*` - Member-focused dashboard for viewing assigned workouts and tracking progress
- `/auth/*` - Authentication pages (login, sign-up, forgot-password, error handling)

**Key Directory Structure:**
```
app/
├── auth/                      # Authentication pages
│   ├── login/                 # Login page
│   ├── sign-up/               # Registration with role selection
│   ├── forgot-password/       # Password reset request
│   ├── sign-up-success/       # Confirmation page
│   └── error/                 # Error handling
├── dashboard/                 # Trainer dashboard (protected)
│   ├── members/               # Member management
│   ├── workouts/              # Workout plan management
│   ├── meal-plans/            # Meal plan management (NEW)
│   ├── analytics/             # Performance analytics
│   ├── messages/              # Trainer messaging
│   └── settings/              # Trainer settings
├── member-dashboard/          # Member dashboard (protected)
│   ├── workouts/              # View assigned workouts
│   ├── progress/              # Progress tracking
│   ├── messages/              # Member messaging
│   ├── profile/               # Member profile
│   └── settings/              # Member settings
└── api/                       # API routes
    └── messages/              # Message endpoints

components/
├── ui/                        # shadcn/ui library (60+ components)
│   ├── button.tsx, card.tsx, input.tsx, form.tsx
│   ├── dialog.tsx, drawer.tsx, sheet.tsx, sidebar.tsx
│   ├── select.tsx, tabs.tsx, table.tsx, calendar.tsx
│   └── ... (40+ more UI components)
├── dashboard-layout.tsx       # Trainer dashboard layout
├── member-dashboard-layout.tsx # Member dashboard layout
├── message-form.tsx           # Messaging component
└── theme-toggle.tsx           # Theme switcher

lib/
├── supabase/
│   ├── client.ts              # Browser Supabase client (SSR)
│   ├── server.ts              # Server Supabase client
│   └── middleware.ts          # Session update logic
├── theme-context.tsx          # Theme management context
└── utils.ts                   # Utility functions (cn() helper)
```

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - (Optional) Development redirect URL for sign-up

### Authentication & Session Management

The app uses Supabase Auth (@supabase/ssr) with Next.js middleware for session management:

- **middleware.ts** - Route protection, session updates, and role-based redirects
- **lib/supabase/client.ts** - Browser client using `createBrowserClient()`
- **lib/supabase/server.ts** - Server client using `createServerClient()` with cookie handling
- **lib/supabase/middleware.ts** - Session update logic for middleware

**Features:**
- Middleware-based automatic token refresh
- Role-based routing (trainer → `/dashboard`, member → `/member-dashboard`)
- Protected routes with redirect to `/auth/login`
- Password reset via email tokens
- Sign-up with role selection (trainer vs. member)
- User profile role detection

### UI System

Built on shadcn/ui with comprehensive component library:

- **Design System**: "new-york" style with neutral base colors
- **Theme**: CSS variables (OkLCh color space) for light/dark mode
- **Component Count**: 60+ shadcn/ui components
- **Icons**: Lucide React icon library
- **Animations**: Custom animations (blob, float, sparkle, gradient-x)
- **Path Aliases**: `@/components`, `@/lib`, `@/utils` configured

**Key UI Libraries:**
- **Radix UI**: Accessible component primitives
- **Sonner**: Toast notifications
- **Embla Carousel**: Carousel/slider
- **cmdk**: Command palette/autocomplete
- **Vaul**: Drawer component
- **react-day-picker**: Date picker
- **input-otp**: OTP input field

### Data Flow Patterns

- Server Components for data fetching from Supabase
- Client Components (`"use client"`) for interactive features
- Loading states with dedicated `loading.tsx` files
- Error boundaries with `error.tsx` files (when needed)
- API routes for server-side mutations
- Supabase RLS (Row Level Security) for data protection

### Database Schema

**Key Tables:**
- `profiles` - User profiles (id, full_name, role, avatar_url)
- `messages` - Messaging (sender_id, receiver_id, content, created_at)
- `workouts` - Workout plans
- `meal_plans` - Meal plan data
- `sessions` - Workout session records

## Key Features

### Trainer Dashboard Features
- **Member Management**: View, manage, and assign members
- **Workout Planning**: Create, edit, and assign workout programs
- **Meal Planning**: Create and manage meal plans for members
- **Analytics Dashboard**: Performance metrics and insights with data visualization
- **Session Tracking**: Detailed workout session recording and analysis
- **Real-time Messaging**: Communication with members
- **Settings**: Trainer account and application settings

### Member Dashboard Features
- **My Workouts**: View assigned workout plans and sessions
- **Progress Tracking**: Personal fitness progress visualization with charts
- **Messaging**: Communicate with trainers
- **Profile Management**: Update personal profile information
- **Settings**: Member account settings

### Authentication Features
- User registration with role selection (trainer/member)
- Email/password authentication
- Password reset via email
- Session persistence and automatic refresh
- Sign-up confirmation page
- Error handling for auth issues

## Development Workflow

### After Code Changes
Always execute these commands after making code changes:
```bash
bun run format:fix  # Fix formatting issues
bun run lint:fix    # Fix linting issues
```

### Testing and Ports
- Primary development server runs on port 3000
- If testing on port 3001, stop that process when done
- Always leave the main dev server on port 3000 running

### Code Quality Tools
- **Biome** is configured to replace both Prettier and ESLint
- Configuration: `biome.json`
- 2-space indents, 80-character line width, LF line endings
- Git-aware with gitignore support
- Type-aware linting for TypeScript