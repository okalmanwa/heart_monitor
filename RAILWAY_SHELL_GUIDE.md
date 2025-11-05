# Populate Test Data via Railway Dashboard Shell ❤️

## Step-by-Step Guide

### Step 1: Open Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Login to your account
3. Click on your project: **heart_monitor**

### Step 2: Open Shell
1. Click on your **backend service** (the one running Django)
2. Look for **"Deployments"** tab (or **"Logs"** tab)
3. Find the latest deployment
4. Look for a button that says:
   - **"Shell"** or
   - **"Open Shell"** or
   - **"Terminal"** or
   - **"Console"**
5. Click it to open an interactive shell

### Step 3: Run the Command
In the shell that opens, type:
```bash
python manage.py create_test_data
```

Press Enter and wait for it to complete.

### Step 4: Verify
You should see output like:
```
============================================================
Moyo Test Data Generator ❤️
============================================================

Creating test users...
✅ Created user: john_doe (john.doe@example.com)
✅ Created user: jane_smith (jane.smith@example.com)
✅ Created user: test_user (test@example.com)

Creating sample data for users...
📊 Creating data for john_doe...
  ✅ Created 20 blood pressure readings
  ✅ Created 13 health factor entries
...
```

---

## Alternative: If Shell Not Available

If you can't find the shell option, use **Option 3** below:

---

## Option 3: Temporary Start Command

1. Go to Railway → Your service → **Settings** → **Deploy**
2. Find **"Custom Start Command"**
3. **Temporarily** change it to:
   ```bash
   python manage.py create_test_data --users-only && python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. Click **"Save"**
5. Wait for Railway to redeploy (1-2 minutes)
6. **IMPORTANT**: After first deploy completes, **remove** the `create_test_data` part:
   ```bash
   python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```
7. Save again

This will create users on the next deploy, then you can remove it.

---

## After Running

You should be able to login with:
- `john.doe@example.com` / `TestPassword123!`
- `jane.smith@example.com` / `TestPassword123!`
- `test@example.com` / `test123`

Try the Dashboard Shell method first! 🚀

