# Railway Deployment Fix ❤️

## Problem
Railway couldn't detect your Django app because it's in the `backend/` subdirectory.

## Solution: Set Root Directory

### Step 1: Configure Railway Settings

1. Go to your Railway project: https://railway.app
2. Click on your **service** (heart_monitor)
3. Click **"Settings"** tab
4. Scroll down to **"Root Directory"**
5. Set it to: `backend`
6. Click **"Save"**

### Step 2: Verify Configuration

Railway should now:
- ✅ Detect Python/Django
- ✅ Run migrations automatically
- ✅ Start the server with gunicorn

### Step 3: Check Deployment

1. Go to **"Deployments"** tab
2. Watch the new deployment
3. Check logs to ensure it's working

---

## Alternative: Manual Service Configuration

If setting root directory doesn't work:

### In Railway Settings:

1. **Build Command**: 
   ```
   cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput
   ```

2. **Start Command**:
   ```
   cd backend && python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```

3. **Root Directory**: `backend`

---

## Required Environment Variables

Make sure these are set in Railway Variables:

- `SECRET_KEY` - Your generated secret key
- `DEBUG=False`
- `ALLOWED_HOSTS=*.railway.app`
- `CORS_ALLOWED_ORIGINS` - Your frontend URL

Database variables are automatically provided by Railway when you add PostgreSQL.

---

## Troubleshooting

### Still failing?
- Check Railway logs for specific errors
- Verify all environment variables are set
- Make sure PostgreSQL service is connected
- Ensure `requirements.txt` has all dependencies

### Need help?
- Check Railway deployment logs
- Verify root directory is set correctly
- Make sure migrations can run (database connected)

