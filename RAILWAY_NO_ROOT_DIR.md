# Railway Deployment Without Root Directory Setting ❤️

Since you can't see the Root Directory option, here's how to configure Railway manually:

## Option 1: Manual Build Command (Easiest)

In Railway Settings → Build section:

1. **Custom Build Command** - Enable this
2. **Build Command** - Enter:
   ```
   cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput
   ```

3. **Start Command** is already set (you have this):
   ```
   cd backend && python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```

## Option 2: Create a Build Script

The build.sh file I created will work, but Railway needs to know to use it.

In Railway Settings → Build:
- **Build Command**: `bash build.sh`

## Option 3: Use Nixpacks Configuration

I've created `nixpacks.toml` in the root. Railway should automatically detect it.

## What to Check:

1. **Go to Settings → Build section**
2. **Find "Custom Build Command"** - Toggle it ON
3. **Enter the build command** I provided above
4. **Save**

Then Railway should:
- ✅ Detect Python
- ✅ Run the build from backend directory
- ✅ Deploy successfully

---

## Quick Steps:

1. Railway Dashboard → Your Service → Settings
2. Scroll to **Build** section
3. Enable **"Custom Build Command"**
4. Paste: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
5. Save
6. Check **Deploy** section - Start Command should already be set
7. Go to Deployments tab and watch it build!

---

If it still doesn't work, check the build logs and share the error message!

