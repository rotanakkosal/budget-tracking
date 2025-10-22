
# Personal Budget Tracker — Next.js (App Router, TypeScript)

This is a Next.js 14 app using the App Router and TypeScript with PostgreSQL database integration.

## Features

- **Income & Expense Tracking**: Organize your finances with detailed income and expense entries
- **PostgreSQL Database**: Persistent data storage using a Neon.tech PostgreSQL database
- **Multi-Currency Support**: KRW↔USD conversion with live exchange rates
- **Custom Categories**: Create and manage your own expense categories
- **Category Analytics**: Breakdown of expenses by category with percentage bars
- **Data Import/Export**: JSON-based data portability
- **RESTful API**: Next.js API routes for all database operations
- **Lightweight UI**: Toast notifications and responsive design

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Database

The database connection is already configured in `.env`. For a new environment:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Initialize Database

Create the necessary tables and seed default categories:

```bash
yarn db:init
```

### 4. Test Database Connection (Optional)

Verify the database connection is working:

```bash
yarn db:test
```

### 5. Start Development Server

```bash
yarn dev
```

Then open http://localhost:3000

## Available Scripts

- `yarn dev` - Start the development server
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint
- `yarn db:init` - Initialize database tables and seed data
- `yarn db:test` - Test database connection

## Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed information about:
- Database schema
- API endpoints
- Connection configuration
- Troubleshooting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon.tech)
- **Database Client**: node-postgres (pg)
- **Styling**: CSS with custom properties
- **Runtime**: Node.js

## Project Structure

```
budget-tracking/
├── app/
│   ├── api/              # API routes for database operations
│   │   ├── income/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── settings/
│   │   └── init/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── lib/
│   └── db.ts             # Database connection utility
├── scripts/
│   ├── init-db.ts        # Database initialization script
│   └── test-connection.ts # Connection test script
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Environment variables template
└── DATABASE_SETUP.md     # Database documentation
```

## API Endpoints

All API endpoints follow RESTful conventions:

- **Income**: `/api/income` (GET, POST, PUT, DELETE)
- **Expenses**: `/api/expenses` (GET, POST, PUT, DELETE)
- **Categories**: `/api/categories` (GET, POST)
- **Settings**: `/api/settings` (GET, POST)
- **Initialize**: `/api/init` (POST)

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed API documentation.

## Notes

- The frontend currently uses localStorage, but all API routes are ready for integration
- Exchange rates are fetched from open.er-api.com and cached for 12 hours
- SSL is required for database connections
- The application uses connection pooling for efficient database access
