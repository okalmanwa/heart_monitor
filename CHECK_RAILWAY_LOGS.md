# Check Railway Logs for Actual Error ❤️

## The Problem

You're getting a generic 400 error. Django isn't showing details because `DEBUG=False`.

## Solution: Check Railway Logs

1. Go to Railway → Your Service → **"Logs"** tab
2. Look for the most recent error when you made the request
3. You should see the actual validation error message

The logs will show something like:
- "This field is required"
- "Password fields didn't match"
- "Email already exists"
- etc.

---

## Alternative: Test with curl (Shows JSON Error)

Use curl which bypasses browser CORS and shows JSON errors:

```bash
curl -X POST https://heartmonitor-production.up.railway.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "password2": "TestPassword123!"
  }'
```

This will show you the actual JSON error response with details!

---

## Common Issues

1. **Password too simple** - Django requires complex passwords by default
2. **Missing fields** - All required fields must be present
3. **Email format** - Must be valid email
4. **Username taken** - If username already exists

---

Check Railway logs first - that's where you'll see the real error! 🔍

