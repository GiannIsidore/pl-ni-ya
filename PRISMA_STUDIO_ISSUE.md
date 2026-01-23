# Prisma Studio MariaDB Compatibility Issue

## Problem

Prisma Studio fails with MariaDB due to introspection errors:
1. **SQL Syntax Error**: `near 'json)'` - Prisma Studio uses MySQL-specific JSON functions that MariaDB doesn't support identically
2. **Runtime Error**: `m.sort is not a function` - Prisma Studio expects array data but receives a different format from MariaDB introspection

## Status

- **Application**: ✅ Works correctly (Prisma Client queries work fine)
- **Prisma Studio**: ❌ Fails during introspection (known bug)

## Workarounds

### Option 1: Use Direct Database Tools
Use MySQL/MariaDB client tools or database management software:
- MySQL Workbench
- phpMyAdmin
- DBeaver
- TablePlus
- Adminer

### Option 2: Use Prisma CLI Commands
Instead of Prisma Studio, use Prisma CLI commands:

```bash
# View data using Prisma Client queries
# Create a simple script to query your data

# Or use raw SQL queries
bunx prisma db execute --stdin
```

### Option 3: Try Different Prisma Studio Versions
The issue may be fixed in future Prisma versions. Check for updates:

```bash
bun install prisma@latest @prisma/client@latest
```

### Option 4: Use Alternative Database Browser
Since the application works, you can:
- Use your application's API endpoints to view data
- Create custom admin pages in your application
- Use database-specific tools

## Current Configuration

- **Prisma Version**: 7.3.0
- **Database**: MariaDB (using MySQL provider)
- **Adapter**: @prisma/adapter-mariadb 7.3.0

## Scripts Available

- `bun run studio` - Uses DATABASE_URL (may still have introspection issues)
- `bun run studio:config` - Uses config file (may still have introspection issues)
- `bun run studio:direct` - Uses hardcoded URL (may still have introspection issues)

All three methods will likely fail due to the introspection bug.

## Reporting the Issue

If you want to report this to Prisma:
1. GitHub: https://github.com/prisma/prisma/issues
2. Include: Prisma version, MariaDB version, error messages, and schema details

## Alternative: Database Admin Interface

Consider building a simple admin interface in your application for viewing/editing data, since Prisma Client works correctly.
