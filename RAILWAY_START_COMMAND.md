# Railway Start Command ❤️

## Custom Start Command for Railway

Copy and paste this into Railway's "Custom Start Command" field:

```bash
python manage.py migrate && python manage.py ensure_test_users && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
```

---

## What This Does

1. **`python manage.py migrate`** - Runs database migrations
2. **`python manage.py ensure_test_users`** - Creates test users if they don't exist (safe to run every time)
3. **`gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT`** - Starts the Django server

---

## Where to Add It

1. Railway Dashboard → Your service (heart_monitor)
2. Click **"Settings"** tab
3. Find **"Deploy"** section
4. Find **"Custom Start Command"** field
5. Paste the command above
6. Click **"Save"** or **"Update"**

---

## Alternative: Simpler Version (Without Test Users)

If you prefer to use the browser endpoint instead:

```bash
python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
```

Then create test users by visiting:
```
https://heartmonitor-production.up.railway.app/api/auth/create-test-users/
```

---

**Paste the first command into Railway's Custom Start Command field!** 🚀

