# Migration from Supabase to Prisma + PostgreSQL

This document outlines the migration from Supabase to Prisma with a local PostgreSQL database.

## What Changed

### 1. Database Setup

- **Removed**: Supabase client and dependencies
- **Added**: Prisma ORM with PostgreSQL (Prisma 7.0.0)
- **New Schema**: Created `prisma/schema.prisma` with all database models
- **New Table**: Added `users` table for authentication (replaces Supabase auth.users)
- **Config File**: Created `prisma.config.js` for migrations (Prisma 7 requirement)
- **Note**: Prisma 7 uses `datasourceUrl` in PrismaClient constructor and requires `prisma.config.js` for migrations

### 2. Authentication

- **Removed**: Supabase Auth
- **Added**: NextAuth.js with Credentials provider
- **Location**: `app/api/auth/[...nextauth]/route.ts`
- **Password Hashing**: Using bcryptjs (already installed)

### 3. API Routes

All API routes have been updated to use Prisma instead of Supabase:

- `/api/accounts`
- `/api/businesses`
- `/api/categories`
- `/api/transactions`
- `/api/profile`
- `/api/team-members`
- `/api/user-settings`
- `/api/dashboard/stats`
- `/api/auth/register-member`
- `/api/auth/set-password`

### 4. Middleware & Auth Helpers

- **Updated**: `middleware.ts` to use NextAuth middleware
- **Updated**: `auth.ts` to use Prisma and NextAuth session

### 5. Frontend Components

- **Updated**: `components/auth/auth-guard.tsx` to use NextAuth `useSession`
- **Updated**: `components/providers.tsx` to include NextAuth `SessionProvider`
- **Updated**: `app/auth/callback/page.tsx` to use NextAuth session
- **Updated**: `app/protected/page.tsx` to use NextAuth session

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

This will install:

- `@prisma/client` - Prisma client
- `prisma` (dev) - Prisma CLI
- `@types/bcryptjs` (dev) - TypeScript types for bcryptjs
- `dotenv` - For loading environment variables in Prisma config

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cash_supa?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 3. Set Up PostgreSQL Database

Make sure PostgreSQL is running locally and create a database:

```sql
CREATE DATABASE cash_supa;
```

### 4. Run Prisma Migrations

Generate Prisma Client:

```bash
pnpm db:generate
```

Push the schema to your database:

```bash
pnpm db:push
```

Or create a migration:

```bash
pnpm db:migrate
```

### 5. Start the Development Server

```bash
pnpm dev
```

## Database Schema Changes

### New User Model

The `users` table replaces Supabase's `auth.users`:

- `id` (UUID, primary key)
- `email` (unique)
- `passwordHash` (hashed password)
- `emailVerified` (optional)
- `name` (optional)
- `image` (optional)
- `createdAt`, `updatedAt`

### Profile Model

- Now references `users.id` instead of Supabase auth.users
- `userId` is a foreign key to `users.id`

### All Other Models

- Remain the same structure
- Foreign keys updated to reference `users.id` where applicable

## Authentication Flow

### Sign Up

1. User registers via `/api/auth/register-member` (for team members) or create user directly
2. Password is hashed with bcryptjs
3. User and Profile records are created in database

### Sign In

1. User submits credentials to NextAuth
2. NextAuth validates credentials against `users` table
3. Session is created with JWT strategy
4. User data is stored in session token

### Protected Routes

- Middleware checks for valid NextAuth session
- Redirects to `/auth/login` if not authenticated
- Public routes: `/`, `/auth/login`, `/auth/signup`, etc.

## API Usage

All API routes now use:

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const session = await getServerSession(authOptions);
// Use session.user.id for user operations
// Use prisma for database operations
```

## Client-Side Usage

For client components:

```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
// Access session.user for user data
```

## Important Notes

1. **Password Migration**: Existing users will need to reset their passwords or you'll need to migrate password hashes from Supabase
2. **RLS Policies**: Row Level Security (RLS) from Supabase is not automatically migrated. You'll need to implement authorization checks in your API routes
3. **Database Functions**: Some PostgreSQL functions from the original schema (like `calculate_account_balance`) may need to be recreated if you want to use them
4. **Default Categories**: When creating a business, default categories are now created via Prisma instead of database triggers
5. **Prisma 7 Configuration**: The connection URL is passed via `datasourceUrl` in the PrismaClient constructor, not in the schema file

## Next Steps

1. Set up your local PostgreSQL database
2. Run Prisma migrations
3. Create your first user (you may need to create a signup endpoint or seed script)
4. Test authentication flow
5. Test all API endpoints
6. Update any remaining frontend components that reference Supabase

## Troubleshooting

### Prisma Client Not Generated

```bash
pnpm db:generate
```

### Database Connection Issues

- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### NextAuth Issues

- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your app URL
- Check browser console for session errors

### Type Errors

- Run `pnpm db:generate` after schema changes
- Restart TypeScript server in your IDE
