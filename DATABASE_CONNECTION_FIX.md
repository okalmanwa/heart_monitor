# Database Connection Fix ❤️

## Problem
Django can't connect to the database because Railway hasn't provided database credentials.

## Solution: Add PostgreSQL Service

### Step 1: Add PostgreSQL Database

1. In Railway, go to your **project dashboard**
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway will create a PostgreSQL service

### Step 2: Connect Database to Backend

1. Click on your **backend service** (heart_monitor)
2. Go to **Settings** → **Variables** tab
3. You should see database variables automatically added:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

**OR** Railway might use different variable names. Check what's available.

### Step 3: Update Django Settings (if needed)

Railway might use `DATABASE_URL` or `POSTGRES_URL` instead of individual variables.

Let me update the settings to handle both formats.

---

## Quick Check

1. **Do you have a PostgreSQL service?** (Check your Railway dashboard)
2. **Is it connected to your backend service?** (Should be in the same environment)
3. **Are database variables set?** (Check Variables tab)

If no PostgreSQL service exists, add one first!

