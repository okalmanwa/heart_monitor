# Vercel Environment Variable Setup ❤️

## Step 1: Add VITE_API_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project (`heart-monitor`)
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left sidebar
4. Click **"+ Add New"**
5. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://heartmonitor-production.up.railway.app`
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just Production)
6. Click **"Save"**

## Step 2: Redeploy

After adding the variable, Vercel will automatically redeploy. If not:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

## Important Notes

- ✅ The value should be your **Railway backend URL** (not the Vercel URL)
- ✅ Include `https://` at the beginning
- ✅ No trailing slash at the end
- ✅ Make sure it's set for **Production** environment

## After Redeploy

Once Vercel redeploys with the new environment variable:
1. ✅ Frontend will call Railway API instead of Vercel
2. ✅ Registration/login should work
3. ✅ All API calls should connect to your backend

---

## Current Railway URL

Your Railway backend URL is:
**`https://heartmonitor-production.up.railway.app`**

Use this exact value for `VITE_API_URL` in Vercel!

