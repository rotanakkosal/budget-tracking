# Database Setup Guide

This document explains how to configure and use the PostgreSQL database connection for the Budget Tracking application.

## Database Configuration

The application has been configured to use a PostgreSQL database hosted on Neon.tech.

### Environment Variables

The database credentials are stored in the `.env` file (which is git-ignored for security):

```bash
DATABASE_URL="postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require"
```

**Database Details:**
- **Host:** ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech
- **Port:** 5432
- **Database:** postgres
- **User:** neondb_owner
- **SSL:** Required

### Database Schema

The database contains the following tables:

#### 1. `income`
- `id` (VARCHAR, PRIMARY KEY)
- `date` (VARCHAR)
- `description` (TEXT)
- `amount` (DECIMAL)
- `notes` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. `expenses`
- `id` (VARCHAR, PRIMARY KEY)
- `date` (VARCHAR)
- `category` (VARCHAR)
- `description` (TEXT)
- `amount` (DECIMAL)
- `notes` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. `categories`
- `id` (VARCHAR, PRIMARY KEY)
- `name` (VARCHAR, UNIQUE)
- `created_at` (TIMESTAMP)

#### 4. `settings`
- `id` (VARCHAR, PRIMARY KEY)
- `key` (VARCHAR, UNIQUE)
- `value` (TEXT)
- `updated_at` (TIMESTAMP)

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment Variables

The `.env` file is already created with the database credentials. For a new environment, copy `.env.example` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Initialize the Database

Run the database initialization script to create tables and seed default categories:

```bash
yarn db:init
```

This will:
- Create all necessary tables if they don't exist
- Seed default expense categories:
  - Room and Utility
  - Daily Expense
  - Borrow Others
  - Food & Drinks
  - Transportation
  - Entertainment
  - Shopping
  - Other

### 4. Start the Development Server

```bash
yarn dev
```

The application will be available at http://localhost:3000

## API Endpoints

The application now uses API routes to interact with the database:

### Income Endpoints
- `GET /api/income` - Fetch all income records
- `POST /api/income` - Create a new income record
- `PUT /api/income` - Update an income record
- `DELETE /api/income?id={id}` - Delete an income record

### Expense Endpoints
- `GET /api/expenses` - Fetch all expense records
- `POST /api/expenses` - Create a new expense record
- `PUT /api/expenses` - Update an expense record
- `DELETE /api/expenses?id={id}` - Delete an expense record

### Category Endpoints
- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create a new category

### Settings Endpoints
- `GET /api/settings?key={key}` - Fetch a setting value
- `POST /api/settings` - Save/update a setting

### Initialize Endpoint
- `POST /api/init` - Initialize database tables (alternative to CLI script)

## Database Connection

The database connection is managed by a connection pool in `lib/db.ts`:

```typescript
import { getPool, query } from '@/lib/db';

// Get the connection pool
const pool = getPool();

// Execute a query
const result = await query('SELECT * FROM income');
```

### Connection Pool Configuration
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- SSL: Enabled with `rejectUnauthorized: false`

## Migration from localStorage

The application previously used browser localStorage for data persistence. With the database integration:

1. **Data is now persisted in PostgreSQL** - Data survives browser clears and is accessible from any device
2. **API-based architecture** - The Next.js API routes handle all database operations
3. **Backward compatibility** - The frontend can still work with the same data structure

### Data Migration (Optional)

If you have existing data in localStorage that you want to migrate to the database, you can:

1. Export your data using the existing export feature
2. Use the import feature to load it back (you may need to update the frontend to use the API endpoints)

## Troubleshooting

### Connection Errors

If you encounter connection errors:

1. **Check network connectivity** - Ensure you can reach the Neon.tech servers
2. **Verify credentials** - Confirm the DATABASE_URL in `.env` is correct
3. **SSL Issues** - The connection requires SSL; ensure your network allows SSL connections
4. **Firewall** - Check if your firewall blocks outbound connections on port 5432

### DNS Resolution Issues

If you see `EAI_AGAIN` errors:
- This indicates DNS resolution problems
- Check your network's DNS settings
- Try using a different DNS server (e.g., 8.8.8.8)

### Table Already Exists Errors

The initialization script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. If you need to reset the database:

1. Connect to the database using a PostgreSQL client
2. Drop the tables manually
3. Run `yarn db:init` again

## Security Notes

- The `.env` file is git-ignored to prevent accidental credential commits
- Always use `.env.example` as a template and never commit actual credentials
- The connection uses SSL for secure data transmission
- Consider using different credentials for development and production

## Next Steps

The database is now configured and ready to use. You may want to:

1. Update the frontend (`app/page.tsx`) to use the API endpoints instead of localStorage
2. Add authentication to secure the API endpoints
3. Implement data validation and error handling
4. Add database backups and monitoring
5. Consider implementing database migrations for schema changes
