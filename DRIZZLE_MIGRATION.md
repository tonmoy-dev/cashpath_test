# Migration to Drizzle ORM

This document outlines the migration from Prisma to Drizzle ORM.

## What Changed

### 1. Database Setup
- **Removed**: Prisma ORM and dependencies
- **Added**: Drizzle ORM with PostgreSQL
- **New Schema**: Created `db/schema.ts` with all database models
- **Connection**: Uses `postgres` driver with Drizzle

### 2. Package Changes
- **Removed**: `@prisma/client`, `prisma`
- **Added**: `drizzle-orm`, `drizzle-kit`, `postgres`
- **Updated**: Scripts in `package.json`

### 3. Schema Location
- **Old**: `prisma/schema.prisma`
- **New**: `db/schema.ts` (TypeScript file)

### 4. Database Connection
- **Old**: `lib/prisma.ts` with PrismaClient
- **New**: `db/index.ts` with Drizzle client
- **Export**: `lib/db.ts` re-exports for convenience

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

This will install:
- `drizzle-orm` - Drizzle ORM core
- `drizzle-kit` (dev) - Drizzle CLI for migrations
- `postgres` - PostgreSQL driver

### 2. Environment Variables

Make sure your `.env` file has:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/cash_supa?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. Generate Migrations

```bash
pnpm db:generate
```

This creates migration files in the `drizzle/` directory.

### 4. Push Schema to Database

```bash
pnpm db:push
```

Or run migrations:

```bash
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

## Key Differences from Prisma

### Query Syntax

**Prisma:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: { profile: true }
})
```

**Drizzle:**
```typescript
const [user] = await db
  .select({
    user: users,
    profile: profiles,
  })
  .from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId))
  .where(eq(users.email, "user@example.com"))
  .limit(1)
```

### Insert

**Prisma:**
```typescript
const user = await prisma.user.create({
  data: { email, name }
})
```

**Drizzle:**
```typescript
const [user] = await db
  .insert(users)
  .values({ email, name })
  .returning()
```

### Update

**Prisma:**
```typescript
const user = await prisma.user.update({
  where: { id },
  data: { name: "New Name" }
})
```

**Drizzle:**
```typescript
const [user] = await db
  .update(users)
  .set({ name: "New Name", updatedAt: new Date() })
  .where(eq(users.id, id))
  .returning()
```

### Transactions

**Prisma:**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: {...} })
})
```

**Drizzle:**
```typescript
await db.transaction(async (tx) => {
  await tx.insert(users).values({...})
})
```

## Advantages of Drizzle

1. **TypeScript Native**: Schema is written in TypeScript
2. **SQL-like Syntax**: More control over queries
3. **Better Performance**: Less abstraction overhead
4. **Simpler Setup**: No code generation step needed
5. **More Flexible**: Easier to write complex queries

## API Routes Updated

All API routes have been updated to use Drizzle:
- `/api/accounts`
- `/api/businesses`
- `/api/categories`
- `/api/transactions`
- `/api/profile`
- `/api/team-members`
- `/api/user-settings`
- `/api/dashboard/stats`
- `/api/auth/*`

## Next Steps

1. Install dependencies: `pnpm install`
2. Generate migrations: `pnpm db:generate`
3. Push to database: `pnpm db:push`
4. Test the application
5. All API routes should work the same as before

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### Migration Issues
- Run `pnpm db:generate` to create migration files
- Check `drizzle/` directory for migration files
- Use `pnpm db:push` for development (auto-applies changes)

### Type Errors
- Restart TypeScript server in your IDE
- Ensure all imports use `@/lib/db` instead of `@/lib/prisma`

