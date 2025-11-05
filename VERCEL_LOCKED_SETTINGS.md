# Vercel Locked Settings Fix ❤️

## Problem
Vercel auto-detected settings and won't let you edit the build command.

## Solution: Use vercel.json

I've created `frontend/vercel.json` that will override the build settings.

### Steps:

1. **Set Root Directory to `frontend`** in Vercel UI (this you CAN edit)

2. **The vercel.json file will handle the rest** - it will override:
   - Build Command
   - Output Directory
   - Install Command

3. **Redeploy** - Vercel will use the vercel.json settings

---

## Alternative: Delete and Recreate Project

If vercel.json doesn't work:

1. **Delete the current project** in Vercel
2. **Create a new project** from the same repo
3. **Set Root Directory to `frontend`** FIRST
4. **Then add environment variables**
5. **Deploy**

When you set Root Directory first, Vercel will auto-detect Vite correctly.

---

## Quick Fix: Update Root Directory Only

If you can only edit Root Directory:

1. Set **Root Directory** to: `frontend`
2. The vercel.json I created will handle build commands
3. Make sure **Environment Variable** is set: `VITE_API_URL`

---

Try redeploying now - the vercel.json should override the build settings! 🚀

