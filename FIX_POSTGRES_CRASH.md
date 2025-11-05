# Fix PostgreSQL Crash on Railway ❤️

## The Problem
Your PostgreSQL service is crashing with:
```
ERROR (catatonit:2): failed to exec pid1: No such file or directory
```

This is a Railway infrastructure issue, not a code problem.

## Quick Fixes

### Option 1: Restart PostgreSQL Service (Try This First)

1. Go to Railway Dashboard → Your **Postgres** service
2. Click **"Settings"** tab
3. Scroll down to **"Danger"** section
4. Click **"Restart Service"** or **"Redeploy"**
5. Wait for it to restart

### Option 2: Delete and Recreate PostgreSQL (If Restart Doesn't Work)

**⚠️ WARNING: This will delete all data!**

1. Go to Railway Dashboard → Your **Postgres** service
2. Click **"Settings"** tab
3. Scroll to **"Danger"** section
4. Click **"Delete Service"**
5. Wait for deletion to complete
6. Create a new PostgreSQL service:
   - Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway will automatically create it
7. **Update your backend service variables:**
   - Go to your backend service → **"Variables"**
   - Railway should automatically set `DATABASE_URL`
   - If not, copy the new `DATABASE_URL` from the PostgreSQL service

### Option 3: Use Railway's Built-in Database (Recommended)

If the managed PostgreSQL keeps crashing:

1. Make sure your backend service is in the same project
2. Railway should automatically link the database
3. Check `DATABASE_URL` is set in your backend variables

### Option 4: Check Railway Status

1. Go to [status.railway.app](https://status.railway.app)
2. Check if there are any ongoing issues
3. If yes, wait for Railway to fix it

---

## After Fixing PostgreSQL

Once PostgreSQL is running again:

1. **Run migrations** (if needed):
   - Your start command should handle this automatically
   - Or Railway will run them on next deploy

2. **Create test users**:
   - Visit: `https://heartmonitor-production.up.railway.app/api/auth/create-test-users/`
   - Or they'll be created automatically if you have `ensure_test_users` in start command

---

## If Nothing Works

1. **Contact Railway Support** - This looks like an infrastructure issue
2. **Try a different region** - Sometimes switching regions helps
3. **Check Railway logs** - Look for more detailed error messages

---

**Try Option 1 (Restart) first - it's the quickest!** 🔄

