# Railway Setup Guide for Moyo ❤️

## Step 1: Generate Secret Key

Run this command locally:

```bash
cd backend
python generate_secret_key.py
```

Or use Python directly:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Copy the generated key** - you'll need it in the next step!

---

## Step 2: Add Secret Key to Railway

### Option A: Via Railway Dashboard

1. Go to your Railway project: https://railway.app
2. Click on your **backend service** (not the database)
3. Click on the **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   - **Variable Name**: `SECRET_KEY`
   - **Variable Value**: Paste your generated secret key
6. Click **"Add"**

### Option B: Via Railway CLI

```bash
# Install Railway CLI if you haven't
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set the secret key
railway variables set SECRET_KEY="your-generated-secret-key-here"
```

---

## Step 3: Add Other Required Environment Variables

While you're in the Variables tab, also add these:

### Required Variables:

1. **SECRET_KEY** (you just added this)
   - Value: Your generated secret key

2. **DEBUG**
   - Value: `False`

3. **ALLOWED_HOSTS**
   - Value: `*.railway.app,yourdomain.com` (add your custom domain if you have one)

4. **CORS_ALLOWED_ORIGINS**
   - Value: Your frontend URL(s), comma-separated
   - Example: `https://moyo.vercel.app,https://yourdomain.com`

### Optional but Recommended:

5. **TIME_ZONE**
   - Value: `UTC` (or your preferred timezone)

**Note**: Railway automatically provides database variables (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) when you add a PostgreSQL service, so you don't need to set those manually!

---

## Step 4: Verify Variables

After adding variables, Railway will automatically redeploy your service. Check:

1. Go to **"Deployments"** tab
2. Watch the latest deployment
3. Click on it to see logs
4. Make sure it completes successfully

---

## Quick Reference: All Environment Variables

Here's a complete list of what you might need:

```bash
# Security
SECRET_KEY=<generated-key>
DEBUG=False
ALLOWED_HOSTS=*.railway.app,yourdomain.com

# CORS (frontend URLs)
CORS_ALLOWED_ORIGINS=https://moyo.vercel.app,https://yourdomain.com

# Database (auto-provided by Railway when you add PostgreSQL)
# DB_NAME=<auto-set>
# DB_USER=<auto-set>
# DB_PASSWORD=<auto-set>
# DB_HOST=<auto-set>
# DB_PORT=<auto-set>
```

---

## Troubleshooting

### Secret Key Issues

**Error**: "You must set the SECRET_KEY environment variable"
- **Solution**: Make sure you added `SECRET_KEY` in Railway Variables
- **Check**: Click on your service → Variables tab → Verify `SECRET_KEY` exists

**Error**: "Invalid SECRET_KEY"
- **Solution**: Generate a new one and update it in Railway
- **Tip**: Secret keys should be long and random (50+ characters)

### How to Update Secret Key

1. Generate a new one locally
2. Go to Railway → Your service → Variables
3. Find `SECRET_KEY`
4. Click the edit icon (pencil)
5. Update the value
6. Save (Railway will redeploy automatically)

---

## Security Best Practices

✅ **DO:**
- Use a different secret key for production
- Keep secret keys out of your code (use environment variables)
- Never commit `.env` files to git
- Rotate secret keys periodically

❌ **DON'T:**
- Use the default secret key
- Share secret keys publicly
- Commit secret keys to GitHub
- Use the same key for dev and production

---

## Quick Commands

```bash
# Generate new secret key
cd backend
python generate_secret_key.py

# Or one-liner:
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# View Railway variables (CLI)
railway variables
```

---

## Need Help?

- Check Railway logs if deployment fails
- Verify all required variables are set
- Make sure database is connected
- Check CORS settings match your frontend URL

