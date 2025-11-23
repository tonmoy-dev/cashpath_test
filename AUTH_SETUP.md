# Authentication Setup with Drizzle ORM and NextAuth

## Overview

This application uses **NextAuth.js** with **JWT strategy** for authentication, backed by **Drizzle ORM** and **PostgreSQL**.

## Key Components

### 1. Database Schema (`db/schema.ts`)
- **Users table**: Stores user credentials (email, password hash)
- **Profiles table**: Extended user information (name, role, avatar)
- **Businesses table**: User-owned businesses
- **Team Members table**: Business team memberships

### 2. Authentication Flow

#### Sign Up (`/api/auth/signup`)
1. Validates email, password, and name
2. Checks if email already exists
3. Hashes password with bcrypt (12 rounds)
4. Creates user, profile, and optional business in a transaction
5. Returns success message

#### Sign In (`/api/auth/[...nextauth]`)
1. Validates credentials
2. Finds user by email
3. Compares password hash
4. Fetches user's businesses and team memberships
5. Creates JWT token with user data
6. Returns session

### 3. JWT Configuration

- **Strategy**: JWT (stateless)
- **Session Duration**: 30 days
- **Token Contains**:
  - User ID
  - Email
  - Name
  - Role (owner/partner/staff)
  - Business ID
  - Avatar URL
  - Phone number

### 4. Session Management

- **Server-side**: `getServerSession(authOptions)` in API routes
- **Client-side**: `useSession()` hook from `next-auth/react`
- **Middleware**: Protected routes via `middleware.ts`

## Important Notes

### Timestamps
- **Drizzle's `defaultNow()`** is a TypeScript default, NOT a database default
- **Always explicitly set** `createdAt` and `updatedAt` when inserting records
- Example:
  ```typescript
  const now = new Date()
  await db.insert(users).values({
    id: randomUUID(),
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  })
  ```

### UUIDs
- **Drizzle's `defaultRandom()`** doesn't generate UUIDs at database level
- **Always generate UUIDs** using `crypto.randomUUID()` before inserting
- Example:
  ```typescript
  import { randomUUID } from "crypto"
  const userId = randomUUID()
  ```

### Password Hashing
- Uses **bcryptjs** with **12 salt rounds**
- Never store plain text passwords
- Always hash before storing

## Environment Variables

Required in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cash_supa"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/register-member` - Register team member
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Protected Routes
All routes check authentication via `getServerSession(authOptions)`:
- `/api/accounts`
- `/api/businesses`
- `/api/categories`
- `/api/transactions`
- `/api/profile`
- `/api/team-members`
- `/api/user-settings`
- `/api/dashboard/stats`

## Testing Authentication

1. **Sign Up**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User",
       "businessName": "Test Business"
     }'
   ```

2. **Sign In** (via NextAuth):
   - Navigate to `/auth/login`
   - Enter credentials
   - Session cookie will be set automatically

3. **Check Session**:
   ```bash
   curl http://localhost:3000/api/auth/session
   ```

## Troubleshooting

### "null value in column" errors
- **Cause**: Missing required fields (UUIDs or timestamps)
- **Fix**: Always provide `id`, `createdAt`, and `updatedAt` when inserting

### Authentication not working
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your app URL
- Check database connection
- Verify user exists in database

### JWT token issues
- Clear browser cookies
- Check token expiration (30 days default)
- Verify `NEXTAUTH_SECRET` hasn't changed

## Security Best Practices

1. ✅ Passwords hashed with bcrypt (12 rounds)
2. ✅ JWT tokens signed with secret
3. ✅ Session cookies httpOnly (default in NextAuth)
4. ✅ Password validation (min 6 characters)
5. ✅ Email uniqueness enforced
6. ✅ SQL injection prevented (Drizzle parameterized queries)
7. ✅ CSRF protection (NextAuth default)

## Next Steps

1. Implement password reset flow
2. Add email verification
3. Add rate limiting for auth endpoints
4. Implement refresh tokens (if needed)
5. Add 2FA support (optional)

