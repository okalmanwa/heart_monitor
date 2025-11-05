# Debug 500 Error on Login ❤️

## The Problem
Getting `500 (Internal Server Error)` when trying to login via `/api/token/`

## Possible Causes

### 1. Backend Not Running
Your frontend is trying to call `http://localhost:3000/api/token/` which proxies to `http://localhost:8000`. If the backend isn't running, you'll get a 500 error.

**Fix:** Start the backend:
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### 2. Database Connection Issue
The backend might not be able to connect to the database.

**Check:** Look at backend terminal/logs for database errors.

### 3. User Doesn't Exist
The user you're trying to login with might not exist in the local database.

**Fix:** Create a test user or use existing ones:
```bash
python manage.py create_test_data --users-only
```

### 4. Backend Error
There might be an error in the backend code.

**Check:** Look at backend terminal/logs for the actual error message.

## Quick Fixes

### Fix 1: Start Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

The backend should start on `http://localhost:8000`

### Fix 2: Check Backend Logs
Look at your backend terminal - it will show the actual error message causing the 500.

### Fix 3: Test Backend Directly
Open in browser:
```
http://localhost:8000/api/token/
```

Or test with curl:
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"TestPassword123!"}'
```

### Fix 4: Create Test Users
If users don't exist:
```bash
cd backend
source venv/bin/activate
python manage.py create_test_data --users-only
```

## React Router Warnings

The React Router warnings are just deprecation warnings for v7. They don't affect functionality. You can ignore them or add future flags to suppress them.

---

**Check your backend terminal for the actual error message!** 🔍

