# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev` - Start development server on http://localhost:3000
- `bun run build` - Build the application for production
- `bun start` - Start production server
- `bun run lint` - Run ESLint to check code quality

## Project Architecture

This is a **FitnessPro** - a professional fitness management platform built with Next.js 15 using the App Router. The application serves both trainers and members with separate dashboard experiences.

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with middleware-based session management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Type Safety**: TypeScript with Zod for schema validation
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Hookform/Resolvers

### Application Structure

**Dual Dashboard Architecture:**
- `/dashboard/*` - Trainer/admin dashboard for managing members, workouts, analytics
- `/member-dashboard/*` - Member-focused dashboard for viewing assigned workouts and progress
- `/auth/*` - Authentication pages (login, signup, error handling)

**Key Directory Structure:**
- `app/` - Next.js App Router pages with nested layouts
- `components/ui/` - shadcn/ui components (Button, Card, Input, etc.)
- `components/` - Custom application components (DashboardLayout, MessageForm)
- `lib/supabase/` - Supabase client configuration and middleware
- `lib/utils.ts` - Utility functions including shadcn's cn() helper

### Authentication & Session Management

The app uses Supabase authentication with Next.js middleware for session management:
- `middleware.ts` - Route protection and session updates
- `lib/supabase/middleware.ts` - Session update logic
- Separate client/server Supabase instances for different contexts

### UI System

Built on shadcn/ui with:
- **Design System**: "new-york" style with neutral base colors
- **Theme**: CSS variables for consistent theming (supports dark mode)
- **Icons**: Lucide React icon library
- **Path Aliases**: `@/components`, `@/lib`, `@/utils` configured

### Data Flow Patterns

The application follows these patterns:
- Server Components for data fetching from Supabase
- Client Components for interactive features
- Loading states with dedicated `loading.tsx` files
- Error boundaries with `error.tsx` files (when needed)

## Key Features

- **Workout Management**: Create, assign, and track workout programs
- **Member Management**: Trainer tools for managing client profiles
- **Progress Tracking**: Member progress visualization with charts
- **Real-time Messaging**: Communication between trainers and members
- **Analytics Dashboard**: Performance metrics and insights for trainers
- **Session Tracking**: Detailed workout session recording and analysis
- Everytime you're done testing to check if there are development errors after running a process at port 3001, stop that running process. Then, leave the process running at port 3000.
- After doing code changes, always execute `bun format:fix` and `bun lint:fix` to fix formatting and catch any linting issues.