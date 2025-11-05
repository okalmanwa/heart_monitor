# Railway Variables Check ❤️

## Current Variables

I see you have:
- ✅ `SECRET_KEY` - Good!
- ✅ `DEBUG` - Should be `False`
- ✅ `ALLOWED_HOSTS` - Should include `*.railway.app`
- ✅ `DB_NAME` - Database name
- ✅ `DB_USER` - Database user
- ⚠️ Missing: `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- ⚠️ Missing: `DATABASE_URL` (Railway's preferred format)

## Issues to Fix

### 1. Remove Unnecessary Variables

These shouldn't be environment variables:
- ❌ `email`
- ❌ `password`
- ❌ `password2`
- ❌ `username`

**Delete these** - they're not environment variables, they're form data!

### 2. Add Missing Database Variables

Railway should provide these automatically, but if not, check:

1. **Go to your PostgreSQL service** in Railway
2. **Click "Variables"** tab
3. **Copy the connection details**:
   - `PGHOST` or `POSTGRES_HOST`
   - `PGPORT` or `POSTGRES_PORT`
   - `PGPASSWORD` or `POSTGRES_PASSWORD`
   - `PGDATABASE` or `POSTGRES_DB`

### 3. Or Use DATABASE_URL (Better!)

Railway usually provides `DATABASE_URL` automatically. If it's missing:

1. **Go to PostgreSQL service** → **Variables** tab
2. Look for `DATABASE_URL` or `POSTGRES_URL`
3. If it exists, **promote it to shared variable** (click ⋮ icon)
4. Or manually create it in your backend service

Format: `postgresql://user:password@host:port/database`

---

## Quick Fix

### Option 1: Check PostgreSQL Service

1. Go to your **PostgreSQL service** in Railway
2. Click **"Variables"** tab
3. See what variables Railway provided
4. Copy `DATABASE_URL` if it exists, or individual variables

### Option 2: Manual Setup

If Railway didn't auto-provide, add these to backend service:

- `DB_HOST` = (from PostgreSQL service)
- `DB_PORT` = `5432` (usually)
- `DB_PASSWORD` = (from PostgreSQL service)

Or better, create `DATABASE_URL`:
```
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@DB_HOST:5432/DB_NAME
```

---

## What Should Be There

**Required:**
- `SECRET_KEY` ✅
- `DEBUG=False` ✅
- `ALLOWED_HOSTS=*.railway.app` ✅

**Database (either):**
- `DATABASE_URL` (preferred) OR
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

**Optional:**
- `CORS_ALLOWED_ORIGINS` (your frontend URL)

---

## Action Items

1. ✅ Delete: `email`, `password`, `password2`, `username`
2. ✅ Check PostgreSQL service for `DATABASE_URL`
3. ✅ Add missing database variables if needed
4. ✅ Verify `DEBUG=False` and `ALLOWED_HOSTS` is set correctly

