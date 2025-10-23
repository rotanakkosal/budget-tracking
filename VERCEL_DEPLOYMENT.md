# Deploying to Vercel

This guide covers deploying your Budget Tracker application to Vercel with PostgreSQL database integration.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your Neon.tech PostgreSQL database URL
- The Vercel CLI installed (optional): `npm i -g vercel`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### 1. Push Your Code to GitHub

Ensure your latest code is pushed to your GitHub repository:

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main  # or your main branch name
```

#### 2. Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`rotanakkosal/budget-tracking`)
4. Vercel will auto-detect it's a Next.js project

#### 3. Configure Environment Variables

**IMPORTANT:** Before deploying, add your database URL:

1. In the project configuration, find **"Environment Variables"**
2. Add the following:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Neon.tech connection string
     ```
     postgresql://neondb_owner:npg_sXbJVz80wtqH@ep-bitter-credit-a1brvkbd-pooler.ap-southeast-1.aws.neon.tech:5432/postgres?sslmode=require
     ```
   - **Environments:** Check all (Production, Preview, Development)

3. Click **"Add"**

#### 4. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

#### 5. Initialize the Database (CRITICAL!)

After deployment, you need to create the database tables. You have two options:

**Option A: Using the API endpoint** (Easiest)

Visit this URL in your browser or use curl:
```bash
curl -X POST https://your-app.vercel.app/api/init
```

This will create all tables and seed default categories.

**Option B: Run locally against production database**

If you have the production DATABASE_URL:

1. Create a `.env.production` file locally:
   ```bash
   DATABASE_URL="your-production-database-url"
   ```

2. Run initialization:
   ```bash
   NODE_ENV=production yarn db:init
   ```

---

### Option 2: Deploy via Vercel CLI

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Set Environment Variables

```bash
vercel env add DATABASE_URL
```

When prompted:
- Enter your Neon.tech DATABASE_URL
- Select all environments (Production, Preview, Development)

#### 4. Deploy

For production:
```bash
vercel --prod
```

For preview:
```bash
vercel
```

#### 5. Initialize Database

After deployment:
```bash
curl -X POST https://your-app.vercel.app/api/init
```

---

## Environment Variables Reference

Your Vercel deployment needs these environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |

### Where to Find Your Database URL

1. Go to your [Neon.tech dashboard](https://console.neon.tech)
2. Select your project
3. Go to **"Connection Details"**
4. Copy the connection string (select "Node.js" format)
5. Ensure it includes `?sslmode=require` at the end

---

## Verifying Your Deployment

### 1. Check if App is Running

Visit your Vercel URL: `https://your-app.vercel.app`

### 2. Verify Database Connection

Visit the test endpoint:
```bash
curl https://your-app.vercel.app/api/init
```

You should see:
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

### 3. Test API Endpoints

Check if categories were created:
```bash
curl https://your-app.vercel.app/api/categories
```

You should see a list of default categories.

---

## Troubleshooting Vercel Deployment

### Issue: "Database connection failed"

**Causes:**
- Environment variable not set correctly
- Database URL is incorrect
- Neon.tech database is paused (free tier auto-pauses after inactivity)

**Solutions:**
1. Check environment variables in Vercel Dashboard → Project Settings → Environment Variables
2. Verify DATABASE_URL is correct and includes `?sslmode=require`
3. Wake up your Neon database by visiting the Neon dashboard
4. Redeploy: Vercel Dashboard → Deployments → [latest] → Redeploy

### Issue: "Tables not found" or "relation does not exist"

**Cause:** Database initialization script wasn't run.

**Solution:**
Run the initialization endpoint:
```bash
curl -X POST https://your-app.vercel.app/api/init
```

Or check the initialization endpoint exists at: `app/api/init/route.ts`

### Issue: Build fails with "DATABASE_URL not defined"

**Cause:** Build-time scripts trying to access database before environment variables are available.

**Solution:**
1. Ensure build scripts don't require database access
2. Environment variables should only be accessed at runtime (in API routes)
3. If using Prisma, add to `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

### Issue: "Too many database connections"

**Cause:** Serverless functions creating new connections on each request.

**Solution:**
The app already uses connection pooling (see `lib/db.ts`), but you can:
1. Reduce max connections in pool configuration
2. Use Neon's connection pooler (already in your URL with `-pooler`)
3. Check for connection leaks in your code

### Issue: Different behavior between local and Vercel

**Causes:**
- Environment variables differ
- Database data differs
- Build vs development mode

**Solutions:**
1. Use the same DATABASE_URL locally and on Vercel to test
2. Check Vercel logs: Dashboard → Deployments → [deployment] → Runtime Logs
3. Enable verbose logging in production temporarily

---

## Continuous Deployment

Vercel automatically deploys your app when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Controlling Deployments

**Disable auto-deployment for specific branches:**

Add `vercel.json`:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "claude/*": false
    }
  }
}
```

---

## Database Migrations on Vercel

When you make schema changes:

### Using the API endpoint approach:

1. Update your schema in code
2. Update the initialization script (`scripts/init-db.ts`)
3. Deploy to Vercel
4. Run the init endpoint: `curl -X POST https://your-app.vercel.app/api/init`

**Note:** The init script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Using Prisma migrations (if you switch to Prisma later):

Add to `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

---

## Performance Optimization for Vercel

### 1. Connection Pooling

Already configured in `lib/db.ts`:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Adjust based on Neon plan limits
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Region Selection

Place your Vercel app in the same region as your Neon database:
- Your Neon DB: `ap-southeast-1` (Singapore)
- Vercel region: Select **Singapore (sin1)** in project settings

### 3. Caching

Consider adding caching for:
- Category lists (rarely change)
- Settings (rarely change)
- Use Vercel's Edge Caching or Redis

---

## Monitoring Your Vercel Deployment

### 1. Vercel Analytics

Enable in: Dashboard → Project → Analytics

Tracks:
- Page views
- Performance metrics
- Web Vitals

### 2. Database Monitoring

In Neon.tech dashboard:
- Connection count
- Query performance
- Storage usage

### 3. Error Tracking

Check Vercel logs:
```bash
vercel logs your-app.vercel.app
```

Or in Dashboard → Deployments → [deployment] → Runtime Logs

---

## Security Best Practices

### 1. Environment Variables

- ✅ Store DATABASE_URL in Vercel environment variables
- ❌ Never commit `.env` files
- ✅ Use different databases for production and development
- ✅ Rotate database credentials regularly

### 2. Database Security

- ✅ Enable SSL (already in your connection string: `?sslmode=require`)
- ✅ Use Neon's IP allowlist if needed
- ✅ Use strong passwords
- ✅ Limit database user permissions

### 3. API Security

Consider adding:
- Rate limiting (e.g., using Vercel's rate limiting)
- Authentication (NextAuth.js)
- Input validation
- CORS configuration

---

## Cost Considerations

### Vercel Free Tier Limits:
- 100GB bandwidth/month
- Unlimited serverless function executions (with 100GB-hours)
- 6,000 build minutes/month

### Neon Free Tier Limits:
- 10 projects
- 3 GB storage per project
- 1 compute endpoint
- Database pauses after 5 minutes of inactivity

**Tips to stay within free tier:**
1. Use Neon's connection pooler (already configured)
2. Implement proper connection cleanup
3. Monitor usage in both dashboards
4. Consider upgrading if you exceed limits

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Vercel Dashboard → Project → Settings → Domains
   - Add your domain and configure DNS

2. **Enable authentication** (recommended for production)
   - Implement NextAuth.js
   - Protect API routes
   - Add user management

3. **Set up monitoring**
   - Enable Vercel Analytics
   - Set up error tracking (e.g., Sentry)
   - Monitor database performance in Neon dashboard

4. **Implement backups** (important!)
   - Neon Pro plan includes automated backups
   - Or manually export data regularly

5. **Add CI/CD checks** (optional)
   - Run tests before deployment
   - Use GitHub Actions
   - Prevent broken deployments

---

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs

# Check environment variables
vercel env ls

# Add environment variable
vercel env add DATABASE_URL

# Pull environment variables to local
vercel env pull

# Initialize production database
curl -X POST https://your-app.vercel.app/api/init
```

---

## Getting Help

- **Vercel Documentation:** https://vercel.com/docs
- **Neon Documentation:** https://neon.tech/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Project Issues:** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Vercel Support:** https://vercel.com/support
