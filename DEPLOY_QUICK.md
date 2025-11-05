# Quick Deploy: Moyo to Railway + Vercel ❤️

This is the **easiest and fastest** way to deploy Moyo. Should take ~15 minutes.

## Prerequisites
- GitHub account
- Railway account (free at railway.app)
- Vercel account (free at vercel.com)

---

## Step 1: Push to GitHub

```bash
cd /Users/okal/Desktop/itaku

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Moyo app"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/moyo.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)** and sign up/login

2. **Create New Project** → "Deploy from GitHub repo"

3. **Select your repository** (moyo)

4. **Railway auto-detects Django!** But we need to configure:
   - Click on the service → "Settings"
   - Set **Root Directory**: `backend`

5. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway automatically connects it

6. **Add Environment Variables**:
   - Click "Variables" tab
   - Add these:
     ```
     SECRET_KEY=<generate-a-random-secret-key>
     DEBUG=False
     ALLOWED_HOSTS=*.railway.app,yourdomain.com
     ```
   - Railway automatically provides DB variables (don't need to set manually)

7. **Deploy!** Railway will:
   - Install dependencies
   - Run migrations automatically (if you add a build command)
   - Start the server

8. **Get your backend URL**: 
   - Click "Settings" → "Networking"
   - Copy the public URL (e.g., `https://moyo-production.up.railway.app`)

---

## Step 3: Update CORS Settings

In `backend/itaku_backend/settings.py`, update CORS:

```python
# CORS Settings - Update with your frontend URL
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend.vercel.app",  # Add your Vercel URL here
]

# Or allow all (less secure, but easier for testing)
# CORS_ALLOW_ALL_ORIGINS = True  # Only for testing!
```

Commit and push:
```bash
git add .
git commit -m "Update CORS settings"
git push
```

---

## Step 4: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login

2. **Click "Add New"** → "Project"

3. **Import your GitHub repository**

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: Your Railway backend URL (e.g., `https://moyo-production.up.railway.app`)

6. **Deploy!** Vercel will:
   - Build your frontend
   - Deploy it
   - Give you a URL (e.g., `https://moyo.vercel.app`)

7. **Update CORS again** with your Vercel URL:
   - Go back to Railway → Variables
   - Update `ALLOWED_HOSTS` to include your Vercel domain
   - Or update CORS settings in Django settings.py

---

## Step 5: Test Everything

1. **Frontend**: Visit your Vercel URL
2. **Register** a new account
3. **Add a reading**
4. **Check charts**

---

## Optional: Custom Domain

### Vercel (Frontend)
1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g., `moyo.app`)
3. Update DNS records as instructed

### Railway (Backend)
1. Go to Railway service → Settings → Networking
2. Add custom domain
3. Update DNS records

### Update CORS
After adding custom domains, update CORS settings with your actual domain.

---

## Troubleshooting

### Backend won't start
- Check Railway logs: Click on service → "Deployments" → Click latest → View logs
- Verify environment variables are set
- Check that migrations ran (you may need to add a build command)

### CORS errors
- Update `CORS_ALLOWED_ORIGINS` in Django settings
- Make sure your frontend URL is in the list
- Redeploy backend after changing settings

### Database connection errors
- Check Railway database is running
- Verify DB environment variables are set (Railway does this automatically)
- Check logs for connection errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that backend URL is accessible (try in browser)
- Check CORS settings

---

## Cost

- **Railway**: Free tier (limited), then ~$5/month
- **Vercel**: Free tier (excellent for personal projects)
- **Total**: $0-5/month

---

## Next Steps

1. ✅ Set up database backups
2. ✅ Configure monitoring (Sentry, etc.)
3. ✅ Set up custom domain
4. ✅ Enable HTTPS (automatic on both platforms)
5. ✅ Set up CI/CD (automatic on both platforms)

---

## Quick Commands Reference

```bash
# Local development
cd backend && source venv/bin/activate && python manage.py runserver
cd frontend && npm run dev

# Deploy updates
git add .
git commit -m "Your changes"
git push  # Auto-deploys on Railway & Vercel!
```

That's it! Your app should be live! 🎉

