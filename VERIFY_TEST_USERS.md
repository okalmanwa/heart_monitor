# Verify Test Users Were Created ❤️

## The Issue
The API is working (endpoint responds), but login fails with "Invalid email or password."
This means **test users might not exist yet**.

## Quick Fix: Verify Users Exist

### Option 1: Check Railway Logs
1. Go to Railway → Your service
2. Click **"Logs"** tab
3. Look for messages like:
   - "✅ Created user: john_doe"
   - "Test data created successfully!"

If you don't see these, the test data creation didn't run.

### Option 2: Check via Railway Shell
1. Railway Dashboard → Your service
2. Click **"Deployments"** → Latest deployment
3. Click **"Shell"** or **"Open Shell"**
4. Run:
   ```bash
   python manage.py shell
   ```
5. Then in Python:
   ```python
   from accounts.models import User
   
   print(f"Total users: {User.objects.count()}")
   for user in User.objects.all():
       print(f"  - {user.email} ({user.username})")
   ```

### Option 3: Create Users Manually
If users don't exist, create them via shell:

```bash
python manage.py shell
```

Then:
```python
from accounts.models import User

# Create test users
users_data = [
    {'username': 'john_doe', 'email': 'john.doe@example.com', 'password': 'TestPassword123!', 'first_name': 'John', 'last_name': 'Doe'},
    {'username': 'jane_smith', 'email': 'jane.smith@example.com', 'password': 'TestPassword123!', 'first_name': 'Jane', 'last_name': 'Smith'},
    {'username': 'test_user', 'email': 'test@example.com', 'password': 'test123', 'first_name': 'Test', 'last_name': 'User'},
]

for user_data in users_data:
    if not User.objects.filter(email=user_data['email']).exists():
        user = User.objects.create_user(**user_data)
        print(f"✅ Created: {user.email}")
    else:
        print(f"⚠️  Already exists: {user_data['email']}")
```

### Option 4: Re-run Test Data Command
If the start command didn't work, run it manually:

```bash
python manage.py create_test_data --users-only
```

---

## Test Users Should Be
- `john.doe@example.com` / `TestPassword123!`
- `jane.smith@example.com` / `TestPassword123!`
- `test@example.com` / `test123`

---

## After Creating Users
Try logging in again with one of the test accounts above.

**Check Railway logs first to see if test data creation ran!** 🔍

