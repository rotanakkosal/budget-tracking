# Troubleshooting Guide

## "I can't find the tables I just added in the database"

This is the most common issue when setting up the Budget Tracker app. Here's why this happens and how to fix it:

### Root Cause

The database tables don't exist yet because the initialization script hasn't been run. Even though you have:
- ✓ A Prisma schema file (`prisma/schema.prisma`)
- ✓ Database initialization scripts (`scripts/init-db.ts`)
- ✓ A Neon.tech PostgreSQL database

The actual tables in your database haven't been created yet.

### Solution - Quick Setup Steps

Follow these steps **on your local machine** to set up the database properly:

#### 1. Create the `.env` file

```bash
cp .env.example .env
```

Then edit `.env` and replace the placeholder with your actual Neon.tech database URL:

```bash
DATABASE_URL="postgresql://your-user:your-password@your-host.neon.tech:5432/your-database?sslmode=require"
```

**Note:** The `.env` file is git-ignored for security, so it won't be committed to the repository.

#### 2. Install dependencies

```bash
yarn install
```

#### 3. Initialize the database

This creates all the necessary tables:

```bash
yarn db:init
```

You should see output like:
```
✓ Income table created
✓ Expenses table created
✓ Categories table created
✓ Settings table created

Seeding default categories...
  ✓ Added category: Room and Utility
  ✓ Added category: Daily Expense
  ...

✅ Database initialized successfully!
```

#### 4. Verify everything is working

```bash
yarn verify:setup
```

This script checks:
- ✓ `.env` file exists
- ✓ `DATABASE_URL` is configured
- ✓ Dependencies are installed
- ✓ Database connection works
- ✓ Tables exist in the database

#### 5. Test the database connection

```bash
yarn db:test
```

This will show you:
- Database version
- Connected database name
- Current user
- List of existing tables
- Row counts for each table

## Common Errors and Solutions

### Error: `EAI_AGAIN` - DNS Resolution Failed

**Error message:**
```
Error: getaddrinfo EAI_AGAIN ep-bitter-credit-xxx.neon.tech
```

**Causes:**
- Network connectivity issues
- DNS server problems
- Firewall blocking connections
- VPN interfering with DNS

**Solutions:**
1. Check your internet connection
2. Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)
3. Disable VPN temporarily
4. Check if your firewall is blocking port 5432
5. Try from a different network

### Error: `.env` file not found

**Error message:**
```
DATABASE_URL not found
```

**Solution:**
```bash
# Create .env from the example
cp .env.example .env

# Edit .env and add your database URL
# Use your actual Neon.tech credentials
```

### Error: Tables already exist

**Error message:**
```
relation "income" already exists
```

**This is actually OK!** The init script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. If you see this, your tables are already created.

### Error: Connection refused

**Error message:**
```
Error: connect ECONNREFUSED
```

**Causes:**
- Database URL is incorrect
- Database server is down
- Wrong port number
- IP whitelist restrictions

**Solutions:**
1. Verify your `DATABASE_URL` in `.env`
2. Check Neon.tech dashboard to ensure database is running
3. Confirm you're using the correct connection string from Neon.tech
4. Check if Neon has IP whitelist restrictions

### No tables showing up in database client

**If you're using a database client (like pgAdmin, DBeaver, etc.) and don't see tables:**

1. Make sure you ran `yarn db:init`
2. Refresh your database client
3. Check you're connected to the correct database
4. Verify the schema is set to `public`
5. Run this query to list tables:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

## Checking What's in Your Database

### Using the CLI

```bash
# Test connection and show all tables
yarn db:test

# Verify full setup
yarn verify:setup
```

### Using SQL

Connect to your database and run:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check if specific tables exist
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'income'
);

-- Count rows in income table
SELECT COUNT(*) FROM income;

-- Show all data in income table
SELECT * FROM income ORDER BY created_at DESC;
```

## Database Schema Overview

After running `yarn db:init`, you should have these tables:

### `income` table
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| date | VARCHAR(50) | Income date |
| description | TEXT | Description |
| amount | DECIMAL(15,2) | Amount |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `expenses` table
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| date | VARCHAR(50) | Expense date |
| category | VARCHAR(255) | Expense category |
| description | TEXT | Description |
| amount | DECIMAL(15,2) | Amount |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `categories` table
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| name | VARCHAR(255) | Category name (unique) |
| created_at | TIMESTAMP | Creation timestamp |

### `settings` table
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| key | VARCHAR(255) | Setting key (unique) |
| value | TEXT | Setting value |
| updated_at | TIMESTAMP | Last update timestamp |

## Still Having Issues?

If you've followed all the steps above and are still having problems:

1. **Check your Neon.tech dashboard**
   - Is your database active?
   - Are there any service disruptions?
   - Is your connection string correct?

2. **Run the verification script**
   ```bash
   yarn verify:setup
   ```

3. **Check the logs**
   - Look for error messages in the terminal
   - Check if there are specific error codes

4. **Try the test connection script**
   ```bash
   yarn db:test
   ```

5. **Verify your environment**
   - Node.js version: Should be 18+ (`node --version`)
   - Yarn version: Should be 1.22+ (`yarn --version`)
   - Network access: Can you reach the internet?

## Prevention Tips

To avoid setup issues in the future:

1. **Always run setup in this order:**
   - `yarn install` (install dependencies)
   - Create/update `.env` file
   - `yarn db:init` (create tables)
   - `yarn verify:setup` (verify everything)

2. **Keep your `.env` file secure:**
   - Never commit it to git (it's in `.gitignore`)
   - Don't share your database credentials
   - Use different credentials for development and production

3. **Use the verification script:**
   - Run `yarn verify:setup` whenever you clone the repo
   - Run it after pulling major changes
   - Run it if something seems off

4. **Keep your database connection string handy:**
   - Save it in a password manager
   - You can always get it from Neon.tech dashboard
   - Update it if you reset your database password

## Need More Help?

- Check the [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed setup instructions
- Review the [README.md](./README.md) for general project information
- Check Neon.tech documentation: https://neon.tech/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
