# Vercel Frontend Deployment Guide ❤️

## Correct Vercel Configuration

Since you set **Root Directory** to `frontend`, the build commands should NOT include `cd frontend`.

### Settings in Vercel:

1. **Root Directory**: `frontend` ✅

2. **Framework Preset**: `Vite` ✅

3. **Build Command**: 
   ```
   npm install && npm run build
   ```
   (NOT `cd frontend && npm install && npm run build`)

4. **Output Directory**: 
   ```
   dist
   ```
   (NOT `frontend/dist`)

5. **Install Command**: Leave default (auto-detected)

6. **Environment Variables**:
   - `VITE_API_URL` = `https://heartmonitor-production.up.railway.app` ✅

---

## After Deployment

1. **Get your Vercel URL** (e.g., `https://heart-monitor.vercel.app`)

2. **Update CORS in Railway**:
   - Go to Railway → Backend Service → Variables
   - Add/Update: `CORS_ALLOWED_ORIGINS` = `https://your-vercel-url.vercel.app`

3. **Test the app**:
   - Visit your Vercel URL
   - Register/Login
   - Add readings!

---

## Troubleshooting

### Build fails with "No such file or directory"
- Make sure Build Command doesn't have `cd frontend`
- Root Directory should be `frontend`

### Can't connect to backend
- Check `VITE_API_URL` is set correctly
- Check CORS settings in Railway
- Make sure backend URL is accessible

---

Your frontend should deploy successfully now! 🎉

