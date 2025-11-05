# Access Admin Panel on Production (Railway) ❤️

## Step 1: Create Superuser on Railway

You need to create a superuser on Railway's database (not local).

### Option 1: Railway Shell (Recommended)

1. Go to **Railway Dashboard** → Your backend service
2. Click **"Deployments"** → Latest deployment
3. Look for **"Shell"** or **"Open Shell"** button
   - If you can't find it, try the **"..."** menu
   - Or check **"Observability"** tab
4. In the shell, run:
   ```bash
   python manage.py createsuperuser
   ```
5. Enter:
   - Email: `your-email@example.com`
   - Username: `your-username`
   - Password: (choose a secure password)

### Option 2: API Endpoint (If Shell Not Available)

Visit this URL after Railway deploys:
```
https://heartmonitor-production.up.railway.app/api/auth/create-test-users/
```

This creates test users, but they won't be admins. You'll still need to make one admin via shell.

### Option 3: Django Admin (If Available)

If Django admin is accessible, you can promote a user to admin there.

## Step 2: Access Admin Panel

Once you have a superuser:

1. Go to your **Vercel frontend URL**
2. **Login** with your superuser credentials
3. You'll see **"Admin Panel"** button in the dashboard
4. Click it, or go directly to:
   ```
   https://your-vercel-url.vercel.app/admin
   ```

## Step 3: Verify Admin Access

The admin panel will:
- Check if you're admin (`is_staff` or `is_superuser`)
- Redirect to dashboard if you're not admin
- Show all CRUD operations if you are admin

## Alternative: Django Admin (Classic)

You can also use Django's built-in admin:

1. Go to: `https://heartmonitor-production.up.railway.app/admin/`
2. Login with your superuser credentials
3. Manage all data there

## Quick Checklist

- [ ] Create superuser on Railway (via shell)
- [ ] Login on frontend with superuser
- [ ] Access `/admin` route
- [ ] Should see admin dashboard with statistics
- [ ] Can perform CRUD operations on all models

---

**Create superuser on Railway, then access `/admin` on your frontend!** 🚀

