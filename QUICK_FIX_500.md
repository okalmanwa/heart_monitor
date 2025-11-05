# Quick Fix: 500 Error on Login ❤️

## The Issue
Your frontend is trying to login but getting a 500 error from the backend.

## Step 1: Check if Backend is Running

Open a new terminal and run:

```bash
cd /Users/okal/Desktop/itaku/backend
source venv/bin/activate
python manage.py runserver
```

The backend should start on `http://localhost:8000`

## Step 2: Check Backend Logs

When you try to login, **look at the backend terminal**. It will show the actual error message.

Common errors:
- `ModuleNotFoundError` - Missing dependencies
- `Database connection error` - Database not running
- `User.DoesNotExist` - User doesn't exist
- `AttributeError` - Code error

## Step 3: Test Backend Directly

Open your browser and go to:
```
http://localhost:8000/api/token/
```

Or test with curl:
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"TestPassword123!"}'
```

## Step 4: Create Test Users

If you don't have users, create them:

```bash
cd backend
source venv/bin/activate
python manage.py create_test_data --users-only
```

Then try logging in with:
- `john.doe@example.com` / `TestPassword123!`
- `jane.smith@example.com` / `TestPassword123!`
- `test@example.com` / `test123`

## Step 5: Check Database

Make sure your local database is running:

```bash
# Check if PostgreSQL is running
psql --version

# Or check if SQLite is being used
ls backend/db.sqlite3
```

## Most Common Fix

**The backend isn't running!** Start it:
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

Then try logging in again.

---

**Check your backend terminal - it will show the exact error!** 🔍

