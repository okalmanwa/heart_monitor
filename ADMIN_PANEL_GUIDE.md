# Admin Panel Guide ❤️

## Overview

A comprehensive admin panel has been created where you can perform CRUD operations on all data.

## Access the Admin Panel

### Step 1: Login as Admin

1. Login with a user that has `is_staff=True` or `is_superuser=True`
2. After login, you'll see an **"Admin Panel"** button in the dashboard
3. Click it, or go directly to: `/admin`

### Step 2: Create Admin User

If you don't have an admin user yet:

**Local:**
```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

**Railway:**
- Use Railway shell: `python manage.py createsuperuser`
- Or use the API endpoint: `https://heartmonitor-production.up.railway.app/api/auth/create-test-users/`

## Admin Panel Features

### 📊 Dashboard Overview

- **Statistics Cards**: View total users, patients, readings, health factors, and insights
- **Real-time Data**: Statistics update when you refresh

### 👥 Users & Patients Tab

**View All Users:**
- See all users and patients
- Filter by patient status (patients have @patient.example.com email)
- See patient/user badges

**Create User:**
- Click "Add User" button
- Fill in username, email, first name, last name, password
- Click "Create"

**Edit User:**
- Click edit icon (pencil) next to any user
- Update any field
- Change password if needed
- Click "Update"

**Delete User:**
- Click delete icon (trash) next to any user
- Confirm deletion

### 💓 Blood Pressure Readings Tab

**View All Readings:**
- See all readings from all patients
- Color-coded categories (Normal, Elevated, High Stage 1/2)
- See which patient each reading belongs to

**Create Reading:**
- Click "Add Reading"
- Select patient from dropdown
- Enter systolic, diastolic, heart rate (optional)
- Set date/time
- Add notes (optional)
- Click "Create"

**Edit Reading:**
- Click edit icon
- Update any field
- Click "Update"

**Delete Reading:**
- Click delete icon
- Confirm deletion

### 💪 Health Factors Tab

**View All Health Factors:**
- See sleep quality, stress levels, exercise for all patients
- Filter and search

**Create Health Factor:**
- Click "Add Health Factor"
- Select patient
- Set date
- Adjust sleep quality slider (1-5)
- Adjust stress level slider (1-5)
- Enter exercise duration (minutes)
- Add notes (optional)
- Click "Create"

**Edit/Delete:**
- Same as above - edit or delete any entry

### 💡 Insights Tab

**View All Insights:**
- See AI-generated insights for all patients
- Color-coded by type (Trend, Anomaly, Correlation, Alert)
- Color-coded by severity (Low, Medium, High)

**Create Insight:**
- Click "Add Insight"
- Select patient
- Choose insight type
- Choose severity
- Enter insight text
- Mark as read/unread
- Click "Create"

**Edit/Delete:**
- Edit any insight
- Delete insights

## Features

### ✅ Full CRUD Operations
- **Create**: Add new users, readings, health factors, insights
- **Read**: View all data with filtering and search
- **Update**: Edit any record
- **Delete**: Remove records with confirmation

### ✅ Admin-Only Access
- Only users with `is_staff=True` or `is_superuser=True` can access
- Regular users are redirected to dashboard

### ✅ User-Friendly Interface
- Material-UI components
- Color-coded categories
- Search and filter capabilities
- Responsive design

### ✅ Data Management
- View all patients in one place
- Manage all readings
- Track health factors
- Monitor insights

## Navigation

- **Dashboard**: Regular user dashboard (`/dashboard`)
- **Admin Panel**: Admin interface (`/admin`)
- **Admin Button**: Shows in dashboard if you're admin

## Tips

1. **Use Search**: Search by email, username, or notes
2. **Filter**: Use filters to narrow down results
3. **Bulk Operations**: Select multiple items (coming soon)
4. **Quick Links**: Click on counts to see related data

---

**Access `/admin` after logging in as admin to manage all data!** 🚀

