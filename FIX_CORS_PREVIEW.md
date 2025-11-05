# Fix CORS for Vercel Preview URL ❤️

## Your Current Vercel URL
**`https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app`**

This is a preview/deployment URL from your git branch.

## Quick Fix: Update CORS in Railway

### Step 1: Go to Railway
1. Open **Railway Dashboard**
2. Click on your backend service (**heart_monitor**)
3. Click **"Variables"** tab

### Step 2: Update CORS_ALLOWED_ORIGINS
1. Find the variable `CORS_ALLOWED_ORIGINS`
2. Click **"Edit"** (or delete and recreate)
3. Update the value to include BOTH URLs (comma-separated):
   ```
   https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app,https://heart-monitor-one.vercel.app
   ```
   
   Or if you want to include your production URL too:
   ```
   https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app,https://heart-monitor-one.vercel.app,https://heart-monitor.vercel.app
   ```

4. Click **"Save"**

### Step 3: Wait for Redeploy
- Railway will automatically redeploy
- Takes 1-2 minutes
- After redeploy, try logging in again!

---

## Alternative: Allow All Origins (Quick Test)

If you want to test quickly without worrying about URLs:

1. Add/Update variable:
   - **Name**: `CORS_ALLOW_ALL_ORIGINS`
   - **Value**: `True`
2. Save and wait for redeploy

⚠️ **Note**: This is less secure. Use specific origins for production.

---

## Multiple Origins Format

When adding multiple origins, use comma-separated format (no spaces):
```
origin1,origin2,origin3
```

Example:
```
https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app,https://heart-monitor-one.vercel.app,http://localhost:3000
```

---

## Why This Happens

Vercel creates different URLs for:
- **Production**: `https://heart-monitor.vercel.app` (or your custom domain)
- **Preview**: `https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app` (branch deployments)
- **Development**: Different URLs for each deployment

Each URL needs to be added to `CORS_ALLOWED_ORIGINS` in Railway.

---

**Update Railway now and try again!** 🚀

