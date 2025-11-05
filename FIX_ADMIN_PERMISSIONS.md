# Fix Admin Permissions Issue ❤️

## The Problem
You're logged in but see "You don't have permission to view or edit anything."

This means your user account might not have `is_superuser` and `is_staff` flags set correctly.

## Quick Fix

### Step 1: Verify Your User Status

Run this command locally or on Railway:

```bash
python manage.py verify_superuser
```

This will show you the status of all users.

### Step 2: Fix Your User Permissions

**Via Django Shell:**

```bash
python manage.py shell
```

Then run:
```python
from accounts.models import User

# Find your user
user = User.objects.get(email='careyokal@gmail.com')

# Make sure all flags are True
user.is_superuser = True
user.is_staff = True
user.is_active = True

# Save
user.save()

# Verify
print(f"Superuser: {user.is_superuser}")
print(f"Staff: {user.is_staff}")
print(f"Active: {user.is_active}")
```

Type `exit()` to exit the shell.

### Step 3: Try Admin Again

1. Logout from admin (if logged in)
2. Clear browser cache/cookies
3. Login again at `/admin/`
4. You should now see all the sections!

## Alternative: Create New Superuser

If fixing doesn't work, create a fresh superuser:

```bash
python manage.py createsuperuser
```

Use a different email/username this time.

## Why This Happens

Sometimes when creating a superuser, the flags don't get set correctly, especially if:
- There was an error during creation
- The user model has custom fields
- Database constraints interfered

---

**Run the shell commands above to fix your permissions!** 🔧

