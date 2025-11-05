# Testing Your Moyo API ❤️

## Backend URL
Your backend is live at: `https://heartmonitor-production.up.railway.app`

## Testing Registration Endpoint

### Method 1: Using Browser (Quick Test)

Just visiting the URL gives a 400 error (expected - needs POST data).

### Method 2: Using curl (Command Line)

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

### Method 3: Using Postman or Insomnia

1. **Method**: POST
2. **URL**: `https://heartmonitor-production.up.railway.app/api/auth/register/`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body** (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPassword123!",
  "password2": "TestPassword123!"
}
```

### Method 4: Using Browser Developer Tools

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Run:
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
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Expected Response (Success)

```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "",
    "last_name": "",
    "created_at": "2025-11-05T..."
  },
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Testing Login Endpoint

```bash
curl -X POST https://heartmonitor-production.up.railway.app/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## Next Steps

1. ✅ Test registration endpoint
2. ✅ Test login endpoint  
3. ✅ Deploy frontend to Vercel
4. ✅ Connect frontend to backend
5. ✅ Test full flow!

---

The 400 error is normal when accessing POST endpoints with GET. Use one of the methods above to test properly! 🎉

