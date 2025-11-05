# Debug API 400 Error ❤️

## The Problem

You're getting HTML error page instead of JSON, which means:
1. CORS might be blocking the request
2. Django is returning HTML error instead of JSON
3. Need to see the actual error message

## Solution 1: Check the Actual Error

Run this in browser console to see the full error:

```javascript
fetch('https://heartmonitor-production.up.railway.app/api/auth/register/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    password2: 'TestPassword123!'
  })
})
.then(response => {
  console.log('Status:', response.status);
  return response.text(); // Get text first to see HTML
})
.then(text => {
  console.log('Response:', text);
  // Try to parse as JSON if possible
  try {
    const json = JSON.parse(text);
    console.log('JSON:', json);
  } catch(e) {
    console.log('Not JSON, showing HTML:', text.substring(0, 500));
  }
})
.catch(error => console.error('Error:', error));
```

## Solution 2: Check CORS Settings

In Railway Variables, make sure you have:
- `CORS_ALLOWED_ORIGINS` = `*` (temporarily for testing) OR
- `CORS_ALLOWED_ORIGINS` = `https://heartmonitor-production.up.railway.app`

Or check if CORS is configured correctly in settings.py.

## Solution 3: Test from Same Origin

Since CORS might be the issue, test from Railway's own domain or use a CORS-enabled tool.

---

Run the debug code above to see what the actual error is!

