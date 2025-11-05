# CORS Setup for Moyo ❤️

## Step-by-Step: Add CORS in Railway

### Step 1: Get Your Vercel URL

After Vercel deploys successfully, you'll get a URL like:
- `https://heart-monitor.vercel.app`
- Or `https://heart-monitor-xyz.vercel.app`

**Copy this URL!**

### Step 2: Add CORS Variable in Railway

1. Go to Railway → Your Backend Service → **"Variables"** tab
2. Click **"+ New Variable"**
3. Enter:
   - **Name**: `CORS_ALLOWED_ORIGINS`
   - **Value**: `https://your-vercel-app.vercel.app` (paste your actual Vercel URL)
4. Click **"Add"**

### Step 3: Railway Auto-Redeploys

Railway will automatically redeploy with the new CORS setting.

---

## Example

If your Vercel URL is `https://heart-monitor.vercel.app`:

**Variable Name**: `CORS_ALLOWED_ORIGINS`  
**Variable Value**: `https://heart-monitor.vercel.app`

---

## Multiple Origins (Optional)

If you want to allow multiple origins (e.g., localhost for testing):

**Variable Value**: `https://heart-monitor.vercel.app,http://localhost:3000,http://localhost:5173`

(Comma-separated, no spaces)

---

## After Adding CORS

1. ✅ Wait for Railway to redeploy
2. ✅ Test your frontend - it should connect to the backend
3. ✅ You should be able to register/login from the frontend

---

## Troubleshooting

### Still getting CORS errors?

1. Check that the Vercel URL is exactly correct (including `https://`)
2. Make sure there are no trailing slashes
3. Check Railway logs to see if CORS is being applied
4. Try adding `CORS_ALLOW_ALL_ORIGINS=True` temporarily to test

---

Once you have your Vercel URL, add it to Railway! 🚀

