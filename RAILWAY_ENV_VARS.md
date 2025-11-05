# Railway Environment Variables for Moyo ❤️

## Required Variables

### 1. SECRET_KEY ⚠️ **CRITICAL**
```
SECRET_KEY=<your-generated-secret-key>
```
**How to generate**: Run `python backend/generate_secret_key.py` or use:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. DEBUG
```
DEBUG=False
```
**Important**: Always set to `False` in production!

### 3. ALLOWED_HOSTS
```
ALLOWED_HOSTS=*.railway.app,yourdomain.com
```
**Note**: 
- `*.railway.app` allows Railway's default domain
- Add your custom domain if you have one (comma-separated)

---

## Optional but Recommended

### 4. CORS_ALLOWED_ORIGINS
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com
```
**Important**: Add your frontend URL(s) here so your frontend can communicate with the backend.

**Example**:
- If using Vercel: `https://moyo.vercel.app`
- If using custom domain: `https://moyo.app`

**Note**: Comma-separated, no spaces

---

## Database Variables (Auto-Provided by Railway)

When you add a PostgreSQL service in Railway, these are **automatically set** - you don't need to add them manually:

- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port (usually 5432)

**Just make sure**: Your PostgreSQL service is connected to your backend service!

---

## Complete Variable List

### Minimum Required (3 variables):
```
SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=*.railway.app
```

### Recommended (4 variables):
```
SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=*.railway.app,yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

---

## How to Add Variables in Railway

1. Go to Railway → Your Service → **Variables** tab
2. Click **"+ New Variable"**
3. Enter:
   - **Name**: (e.g., `SECRET_KEY`)
   - **Value**: (paste the value)
4. Click **"Add"**
5. Repeat for each variable

---

## Quick Setup Checklist

- [ ] Add `SECRET_KEY` (generate first!)
- [ ] Add `DEBUG=False`
- [ ] Add `ALLOWED_HOSTS=*.railway.app`
- [ ] Add `CORS_ALLOWED_ORIGINS` (your frontend URL)
- [ ] Verify PostgreSQL service is connected (auto-provides DB vars)

---

## Troubleshooting

### "Invalid SECRET_KEY" error
- Generate a new one using the script
- Make sure it's properly copied (no extra spaces)

### CORS errors from frontend
- Add your frontend URL to `CORS_ALLOWED_ORIGINS`
- Make sure it starts with `https://` (not `http://`)
- No spaces in the comma-separated list

### Database connection errors
- Verify PostgreSQL service is added and connected
- Check that database variables are auto-populated
- Railway should show them in the Variables tab automatically

---

## Example Values

Here's what your Railway Variables tab should look like:

```
SECRET_KEY = djangoinsecure-abc123xyz789...
DEBUG = False
ALLOWED_HOSTS = *.railway.app
CORS_ALLOWED_ORIGINS = https://moyo.vercel.app

DB_NAME = railway (auto-set)
DB_USER = postgres (auto-set)
DB_PASSWORD = **** (auto-set)
DB_HOST = **** (auto-set)
DB_PORT = 5432 (auto-set)
```

---

## Need Help?

If deployment still fails after adding these variables:
1. Check Railway deployment logs
2. Verify all variables are set correctly
3. Make sure PostgreSQL service is connected
4. Check for typos in variable names (they're case-sensitive!)

