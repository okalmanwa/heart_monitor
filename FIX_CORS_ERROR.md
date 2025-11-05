# Fix CORS Error on Railway ❤️

## The Problem

Railway is showing this error:
```
Origin 'True' in CORS_ALLOWED_ORIGINS is missing scheme or netloc
```

This means `CORS_ALLOWED_ORIGINS` is set to `True` instead of actual URLs.

## The Fix

### Step 1: Go to Railway Variables
1. Railway Dashboard → Your service (heart_monitor)
2. Click **"Variables"** tab
3. Find `CORS_ALLOWED_ORIGINS`

### Step 2: Fix the Value
If `CORS_ALLOWED_ORIGINS` is set to `True`, **delete it** or **update it** to:

```
https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app,https://heart-monitor-one.vercel.app
```

(Include all your Vercel URLs, comma-separated, no spaces)

### Step 3: Check CORS_ALLOW_ALL_ORIGINS
1. Look for `CORS_ALLOW_ALL_ORIGINS` variable
2. If it exists, set it to: `True` (if you want to allow all origins)
3. **OR** delete it and use specific origins in `CORS_ALLOWED_ORIGINS`

### Step 4: Save and Redeploy
- Railway will automatically redeploy
- The error should be gone!

---

## Recommended Configuration

**For Production (Specific Origins):**
- `CORS_ALLOWED_ORIGINS` = `https://your-vercel-url.vercel.app,https://another-url.vercel.app`
- `CORS_ALLOW_ALL_ORIGINS` = (delete or leave unset)

**For Testing (Allow All):**
- `CORS_ALLOW_ALL_ORIGINS` = `True`
- `CORS_ALLOWED_ORIGINS` = (delete or leave default)

⚠️ **Don't set both!** Use one or the other.

---

## Current Vercel URLs to Add

Based on your earlier messages:
- `https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app`
- `https://heart-monitor-one.vercel.app`

Set `CORS_ALLOWED_ORIGINS` to:
```
https://heart-monitor-git-main-careys-projects-42fe5375.vercel.app,https://heart-monitor-one.vercel.app
```

---

**Fix this now and Railway will redeploy!** 🚀

