# Debug API 400 Error ❤️

## The Problem
Getting 400 (Bad Request) on `/api/token/` endpoint.

## Possible Causes

### 1. CORS Still Not Fixed
If CORS isn't properly configured, you might get 400 errors.

**Check Railway Variables:**
- `CORS_ALLOWED_ORIGINS` should be your Vercel URL(s)
- OR `CORS_ALLOW_ALL_ORIGINS` = `True` (for testing)

### 2. Request Format Issue
The `/api/token/` endpoint expects:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Make sure the frontend is sending exactly this format.

### 3. CSRF Token Issue
Check if CSRF middleware is blocking the request.

### 4. User Doesn't Exist
If test users weren't created, login will fail.

## Quick Tests

### Test 1: Check if endpoint exists
Open in browser:
```
https://heartmonitor-production.up.railway.app/api/token/
```

Should return a method not allowed error (405), not 404.

### Test 2: Test with curl
```bash
curl -X POST https://heartmonitor-production.up.railway.app/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"TestPassword123!"}'
```

### Test 3: Check Railway Logs
1. Go to Railway → Your service
2. Click "Logs" tab
3. Look for error messages when you try to login

### Test 4: Verify Test Users
Run this in Railway shell:
```bash
python manage.py shell
```

Then:
```python
from accounts.models import User
print(f"Users: {User.objects.count()}")
for user in User.objects.all():
    print(f"  - {user.email}")
```

## Common Fixes

### Fix 1: Ensure CORS is set
- Go to Railway Variables
- Set `CORS_ALLOW_ALL_ORIGINS` = `True` (temporary)
- Or set `CORS_ALLOWED_ORIGINS` to your exact Vercel URL

### Fix 2: Check Browser Console
Open browser DevTools → Console
- Look for the exact error message
- Check the Network tab to see the request/response

### Fix 3: Verify Test Users Created
If users don't exist, login will always fail.
Run test data creation again if needed.

---

**Check Railway logs first - they'll show the exact error!** 🔍

