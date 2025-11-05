# Populate Test Data on Railway ❤️

## Quick Guide: Add Test Data to Railway Database

### Option 1: Railway CLI (Recommended)

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project**:
   ```bash
   cd backend
   railway link
   # Select your project and service
   ```

4. **Run the command**:
   ```bash
   railway run python manage.py create_test_data
   ```

---

### Option 2: Railway Dashboard Shell

1. Go to **Railway Dashboard** → Your backend service
2. Click **"Deployments"** tab
3. Find the latest deployment
4. Click **"..."** menu → **"Open Shell"** (or **"View Logs"** → **"Shell"**)
5. In the shell, run:
   ```bash
   python manage.py create_test_data
   ```

---

### Option 3: One-Time Deploy Script

Add this to your Railway start command temporarily:

1. Go to Railway → Settings → **Deploy**
2. Find **"Custom Start Command"**
3. Temporarily change it to:
   ```bash
   python manage.py create_test_data --users-only && python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. Save and wait for redeploy
5. ⚠️ **After first deploy, remove `create_test_data` part** to avoid running it every time!

---

### Option 4: Django Admin Shell (Alternative)

If you have admin access:

1. Create a superuser first:
   ```bash
   railway run python manage.py createsuperuser
   ```

2. Go to Railway URL + `/admin/`
3. Login with superuser
4. Manually create users via Django admin

---

## Verify Data Was Created

After running the command, verify:

```bash
railway run python manage.py shell
```

Then in Python shell:
```python
from accounts.models import User
from readings.models import BloodPressureReading
from health_factors.models import HealthFactor

print(f"Users: {User.objects.count()}")
print(f"Readings: {BloodPressureReading.objects.count()}")
print(f"Health Factors: {HealthFactor.objects.count()}")
```

---

## Test Users Created

The command creates:
- `john.doe@example.com` / `TestPassword123!`
- `jane.smith@example.com` / `TestPassword123!`
- `test@example.com` / `test123`

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'dj_database_url'"
- This shouldn't happen on Railway (dependencies are installed)
- If it does, check Railway logs

### "Database connection failed"
- Check Railway PostgreSQL service is running
- Verify `DATABASE_URL` is set correctly

### Command runs but no data appears
- Check if you're looking at the right database
- Verify migrations ran: `railway run python manage.py migrate`
- Check Railway logs for errors

---

**Try Option 1 (Railway CLI) first - it's the easiest!** 🚀

