# ⚠️ URGENT: Add VITE_API_URL in Vercel

## The Problem
Your frontend is trying to call `https://heart-monitor-one.vercel.app/api/auth/register/` instead of Railway. This is because `VITE_API_URL` is not set in Vercel.

## The Fix

### Step 1: Go to Vercel Settings
1. Open **Vercel Dashboard**
2. Click on your project: **heart-monitor**
3. Click **"Settings"** tab (top menu)
4. Click **"Environment Variables"** in the left sidebar

### Step 2: Add VITE_API_URL
1. Click **"+ Add New"** button
2. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://heartmonitor-production.up.railway.app`
   - **Environment**: Select **Production**, **Preview**, and **Development** (or at least **Production**)
3. Click **"Save"**

### Step 3: Redeploy
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait for the build to complete

---

## Important Notes

✅ **The value must be your Railway backend URL**: `https://heartmonitor-production.up.railway.app`  
✅ **Include `https://`**  
✅ **No trailing slash**  
✅ **Must be set for Production environment at minimum**

---

## After Adding

Once you add `VITE_API_URL` and redeploy:
1. ✅ Frontend will call Railway instead of Vercel
2. ✅ API calls will go to `https://heartmonitor-production.up.railway.app`
3. ✅ Registration/login will work

---

## Current Status

- ❌ `VITE_API_URL` is **NOT set** in Vercel (that's why you're getting 404)
- ✅ Railway backend is ready at `https://heartmonitor-production.up.railway.app`
- ✅ CORS needs to be added in Railway (do this after fixing VITE_API_URL)

---

**Add the environment variable now, then redeploy!** 🚀

