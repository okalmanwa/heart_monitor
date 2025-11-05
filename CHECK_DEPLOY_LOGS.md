# Check Deployment Logs for Errors ❤️

## What to Check

The HTTP logs show 400 errors, but we need to see WHY.

### Step 1: Check Deploy Logs

1. Click on the latest deployment (the one that says "Removed" or active one)
2. Click **"Deploy Logs"** tab
3. Look for:
   - Any import errors
   - Django startup errors
   - Migration errors
   - Application errors

### Step 2: Check Runtime Logs

1. Go to **"Logs"** tab (not Deploy Logs)
2. Make a request while watching
3. Look for our log messages:
   - "Register endpoint called"
   - "Serializer errors"
   - "Exception in register"

### Step 3: Test GET Endpoint

Try this first to see if endpoint is reachable:

```bash
curl https://heartmonitor-production.up.railway.app/api/auth/register/
```

If you get JSON back, the endpoint is working!
If you get HTML, there's still a routing issue.

---

## Common Issues

1. **Import errors** - Check deploy logs for Python import errors
2. **Database connection** - Check if migrations ran successfully
3. **URL routing** - Verify the URL patterns are correct
4. **Middleware blocking** - We disabled CSRF, but check logs

---

Check the Deploy Logs first - that's where startup errors would show!

