# Populate Test Data on Railway - Auto Deploy Method ❤️

## What I Just Did

I've updated `railway.toml` to automatically create test data on the next deployment.

The start command now includes:
```bash
python manage.py create_test_data --users-only
```

This will:
- ✅ Create 3 test users
- ✅ Run on the next Railway deploy
- ⚠️ **Run every time** until you remove it

## Next Steps

### Step 1: Push to GitHub
The changes are already committed. Just push:
```bash
git push
```

### Step 2: Wait for Railway to Deploy
- Railway will detect the push
- It will run migrations
- It will create test users
- Then start the server

### Step 3: Verify Test Users
After deployment completes, try logging in with:
- `john.doe@example.com` / `TestPassword123!`
- `jane.smith@example.com` / `TestPassword123!`
- `test@example.com` / `test123`

### Step 4: Remove the Command (After First Run)
Once test data is created, **remove** it from `railway.toml`:

**Change this:**
```toml
startCommand = "python manage.py migrate && python manage.py create_test_data --users-only && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT"
```

**Back to:**
```toml
startCommand = "python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT"
```

Then push again to prevent it from running every deploy.

---

## Alternative: Manual Shell Method

If you prefer to run it manually:

1. Railway Dashboard → Your service
2. Click "Deployments" → Latest deployment
3. Click "Shell" or "Open Shell"
4. Run: `python manage.py create_test_data`
5. Done!

---

**The auto-deploy method is already set up. Just push to GitHub and Railway will deploy!** 🚀

