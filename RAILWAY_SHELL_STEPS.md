# Create Test Users via Railway Dashboard Shell ❤️

## Step-by-Step Instructions

### Step 1: Open Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Login to your account
3. Click on your project: **heart_monitor**

### Step 2: Find Your Service
1. Click on your **backend service** (the Django service)
2. You should see tabs: **Deployments**, **Variables**, **Metrics**, **Settings**

### Step 3: Open Shell
Look for one of these options:

**Option A: From Deployments Tab**
1. Click **"Deployments"** tab
2. Find the **latest deployment** (should be active/green)
3. Look for a button that says:
   - **"Shell"**
   - **"Open Shell"**
   - **"Terminal"**
   - **"Console"**
   - Or click the **"..."** menu → **"Shell"**

**Option B: From Service Page**
1. On the service page, look for a **"Shell"** or **"Terminal"** button in the top right
2. Or check the **"Observability"** tab → **"Shell"**

### Step 4: Run the Command
Once the shell opens, type:

```bash
python manage.py create_test_data --users-only
```

Press **Enter** and wait for it to complete.

You should see output like:
```
============================================================
Moyo Test Data Generator ❤️
============================================================

Creating test users...
✅ Created user: john_doe (john.doe@example.com)
✅ Created user: jane_smith (jane.smith@example.com)
✅ Created user: test_user (test@example.com)
```

### Step 5: Verify Users Created
In the same shell, run:

```bash
python manage.py shell
```

Then type:
```python
from accounts.models import User
print(f"Users: {User.objects.count()}")
for user in User.objects.all():
    print(f"  - {user.email}")
```

Press **Enter** after each line. Type `exit()` to exit the Python shell.

### Step 6: Test Login
Now try logging in with:
- `john.doe@example.com` / `TestPassword123!`
- `jane.smith@example.com` / `TestPassword123!`
- `test@example.com` / `test123`

---

## If You Can't Find Shell Button

Some Railway interfaces don't have a visible shell button. Try:

1. **Check the right sidebar** - sometimes it's there
2. **Try the "..." menu** on the deployment
3. **Use the alternative method below**

---

## Alternative: Manual User Creation

If shell isn't available, you can create users manually via Django shell:

1. Still try to find shell (check all tabs)
2. If found, run:
   ```bash
   python manage.py shell
   ```
3. Then paste this:
   ```python
   from accounts.models import User
   
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

---

## Still Can't Find Shell?

If you absolutely cannot find the shell option:
1. The start command in `railway.toml` should create users on next deploy
2. Make a small change (like a comment) and push to trigger a new deploy
3. Check Railway logs to see if test data creation ran

---

**Try the Dashboard Shell method - it's the easiest!** 🚀

