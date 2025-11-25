# Database Setup Guide

## Overview
This project uses PostgreSQL running in Docker for local development. The database is automatically started when you run `npm run dev`.

## Quick Start

1. **Start the database:**
   ```bash
   npm run db:start
   ```
   Or it will start automatically when you run:
   ```bash
   npm run dev
   ```

2. **Stop the database:**
   ```bash
   npm run db:stop
   ```

3. **Restart the database:**
   ```bash
   npm run db:restart
   ```

## Database Configuration

- **Host:** localhost
- **Port:** 5432
- **Database:** cashpath_test
- **User:** cashpath_test
- **Password:** cashpath_test
- **Connection String:** `postgresql://cashpath_test:cashpath_test@localhost:5432/cashpath_test`

## Environment Variables

The `DATABASE_URL` is configured in `.env.local`:
```
DATABASE_URL=postgresql://cashpath_test:cashpath_test@localhost:5432/cashpath_test
```

## Database Schema

The database schema is managed using Drizzle ORM. The schema is defined in `db/schema.ts`.

### Available Tables:
- `users` - User accounts
- `profiles` - User profiles
- `businesses` - Business entities
- `accounts` - Financial accounts
- `categories` - Transaction categories
- `transactions` - Financial transactions
- `team_members` - Team member relationships
- `books` - Business books
- `user_settings` - User preferences
- `audit_logs` - Audit trail

### Database Commands

- **Push schema changes:** `npm run db:push`
- **Generate migrations:** `npm run db:generate`
- **Run migrations:** `npm run db:migrate`
- **Open Drizzle Studio:** `npm run db:studio`

## Troubleshooting

### Database connection errors

1. **Check if database is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Check database logs:**
   ```bash
   docker logs cashpath_test_postgres
   ```

3. **Verify DATABASE_URL:**
   Make sure `.env.local` contains the correct `DATABASE_URL`

4. **Reset database (WARNING: This will delete all data):**
   ```bash
   npm run db:stop
   docker volume rm cashpath_test_postgres_data
   npm run db:start
   npm run db:push
   ```

### Signup errors

If you encounter signup errors:

1. **Verify tables exist:**
   ```bash
   docker exec cashpath_test_postgres psql -U cashpath_test -d cashpath_test -c "\dt"
   ```

2. **Check for schema issues:**
   ```bash
   npm run db:push
   ```

3. **Check application logs:**
   The signup route now provides detailed error messages in development mode.

## Docker Compose

The database is managed via `docker-compose.yml`. You can also use Docker Compose directly:

```bash
# Start
docker compose up -d postgres

# Stop
docker compose stop postgres

# View logs
docker compose logs postgres

# Remove (WARNING: This will delete all data)
docker compose down -v
```

