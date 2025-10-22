# Deployment Guide

## Environment Variables for Deployment

When deploying this application to production, you **MUST** configure the following environment variable:

### Required Environment Variable

```bash
DATABASE_URL="postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require"
```

## Platform-Specific Instructions

### Vercel

1. Go to your project settings on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require`
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy your application

### Netlify

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require`
4. Click **Save**
5. Trigger a new deploy

### Railway

1. Go to your project on Railway
2. Click on **Variables** tab
3. Click **New Variable**
4. Add:
   - **Variable**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require`
5. Click **Add**
6. Redeploy

### Render

1. Go to your web service dashboard
2. Navigate to **Environment** section
3. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require`
4. Click **Save Changes**
5. Render will automatically redeploy

### AWS Amplify

1. Go to **App settings** → **Environment variables**
2. Click **Manage variables**
3. Add variable:
   - **Variable name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require`
4. Click **Save**
5. Redeploy

### DigitalOcean App Platform

1. Go to **Settings** tab
2. Click on **App-Level Environment Variables**
3. Click **Edit**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require`
5. Click **Save**

### Docker / Docker Compose

Add to your `docker-compose.yml` or pass via command line:

```yaml
environment:
  - DATABASE_URL=postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require
```

Or via Docker command:
```bash
docker run -e DATABASE_URL="postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require" your-image
```

## Post-Deployment Steps

### 1. Initialize the Database (First Time Only)

After deploying, you need to initialize the database tables. You have two options:

#### Option A: Using the API endpoint
Make a POST request to your deployed application:
```bash
curl -X POST https://your-app.vercel.app/api/init
```

Or visit this URL in your browser (it will make a POST request automatically if you set it up).

#### Option B: Run the script locally pointing to production
```bash
DATABASE_URL="postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require" yarn db:init
```

### 2. Verify Deployment

After deployment, test the API endpoints:

```bash
# Test the init endpoint
curl -X POST https://your-app.vercel.app/api/init

# Test fetching categories
curl https://your-app.vercel.app/api/categories

# Test fetching income
curl https://your-app.vercel.app/api/income

# Test fetching expenses
curl https://your-app.vercel.app/api/expenses
```

## Security Considerations

### Production Environment Variables

For production, consider:

1. **Separate Database**: Use a different database for production than development
2. **Connection Pooling**: Neon.tech provides a pooler endpoint (which you're already using)
3. **SSL Mode**: Always use `sslmode=require` in production (already configured)
4. **Secrets Management**: Never commit `.env` files to git (already in `.gitignore`)

### Recommended: Create Separate Production Database

For better security and data isolation, create a separate Neon.tech database for production:

1. Go to Neon.tech console
2. Create a new project or database for production
3. Get the new connection string
4. Use the production connection string in your deployment platform's environment variables

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |

## Troubleshooting

### "Connection refused" errors
- Verify the DATABASE_URL is correctly set in your deployment platform
- Check that your deployment platform can connect to external databases
- Ensure SSL mode is set to `require`

### "Tables don't exist" errors
- Run the database initialization (see Post-Deployment Steps above)
- Or call the `/api/init` endpoint

### "Missing environment variable" errors
- Double-check that DATABASE_URL is set in your deployment platform
- Redeploy after adding environment variables
- Some platforms require a manual redeploy after changing environment variables

## Quick Checklist for Deployment

- [ ] Set `DATABASE_URL` environment variable in deployment platform
- [ ] Deploy the application
- [ ] Initialize database tables (POST to `/api/init` or run `yarn db:init`)
- [ ] Test API endpoints
- [ ] Verify the application works correctly

## Notes

- The `.env` file is only for local development and is git-ignored
- Each deployment platform has its own environment variable configuration
- Always redeploy after adding or changing environment variables
- The database connection uses SSL by default for security
