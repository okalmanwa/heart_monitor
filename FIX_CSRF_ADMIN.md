# Fix CSRF Error in Admin Panel ❤️

## The Problem
Getting "Forbidden (403) CSRF verification failed" when accessing Django admin.

## Solution

### Step 1: Add CSRF_TRUSTED_ORIGINS in Railway

1. Go to Railway Dashboard → Your backend service
2. Click **"Variables"** tab
3. Add/Update variable:
   - **Name**: `CSRF_TRUSTED_ORIGINS`
   - **Value**: `https://heartmonitor-production.up.railway.app`
4. Click **"Save"**

### Step 2: Verify CSRF_COOKIE_SECURE

If your site uses HTTPS (which Railway does), add:

- **Name**: `CSRF_COOKIE_SECURE`
- **Value**: `True`

### Step 3: Wait for Redeploy

Railway will automatically redeploy with the new settings.

## Alternative: Quick Fix

If you want to test quickly (less secure):

1. Railway Variables → Add:
   - **Name**: `CSRF_TRUSTED_ORIGINS`
   - **Value**: `https://heartmonitor-production.up.railway.app,https://*.railway.app`

2. The code I just pushed will also automatically add Railway domains to CSRF trusted origins.

## After Fix

1. Wait for Railway to redeploy
2. Clear your browser cache/cookies for the site
3. Try accessing `/admin/` again
4. Login with your superuser credentials

---

**Add CSRF_TRUSTED_ORIGINS to Railway variables and redeploy!** 🔄

