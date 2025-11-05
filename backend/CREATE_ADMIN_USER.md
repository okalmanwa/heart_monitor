# Create Django Admin User ❤️

## Create Admin Superuser

### Local Development

```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

Follow the prompts:
- Username: (your choice)
- Email: (your email)
- Password: (your password)

### Railway (Production)

#### Option 1: Via Railway Shell

1. Railway Dashboard → Your backend service
2. Click "Deployments" → Latest deployment
3. Click "Shell" or "Open Shell"
4. Run:
   ```bash
   python manage.py createsuperuser
   ```

#### Option 2: Via Environment Variables

1. Railway Dashboard → Your backend service → "Variables"
2. Add these variables:
   - `DJANGO_SUPERUSER_USERNAME` = `admin`
   - `DJANGO_SUPERUSER_EMAIL` = `admin@example.com`
   - `DJANGO_SUPERUSER_PASSWORD` = `YourSecurePassword123!`
3. Add to Railway start command temporarily:
   ```bash
   python manage.py migrate && python manage.py shell -c "from accounts.models import User; User.objects.filter(email='admin@example.com').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'YourSecurePassword123!')" && python manage.py ensure_test_users && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. After first deploy, remove the shell command part

## Access Admin Panel

Once you have a superuser:

1. Go to: `https://heartmonitor-production.up.railway.app/admin/`
2. Login with your superuser credentials

## What You Can Do in Admin

### Users Management
- View all patients and regular users
- Filter by patient status (patients have @patient.example.com email)
- See readings count per user
- Create/edit/delete users

### Blood Pressure Readings
- View all readings with color-coded categories
- Filter by date, user, category
- Search by user email or notes
- See BP trends over time

### Health Factors
- View sleep quality, stress levels, exercise
- Filter by date and factors
- See correlations between health factors and BP

### Insights
- View AI-generated insights
- Filter by type, severity, read status
- See which patients have alerts

## Admin Features

- **Color-coded categories** for BP readings
- **Star ratings** for sleep and stress
- **Badges** for insight types and severity
- **Quick links** to filter related data
- **Date hierarchy** for easy navigation
- **Search** across all fields

---

**Create a superuser and access the admin panel!** 🚀

