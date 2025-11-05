# Populate Test Data for Moyo ❤️

## Quick Start

### Local Development

```bash
cd backend
source venv/bin/activate  # or: . venv/bin/activate
python manage.py create_test_data
```

### Options

**Create users only (no sample data):**
```bash
python manage.py create_test_data --users-only
```

**Custom number of readings/factors:**
```bash
python manage.py create_test_data --readings 30 --factors 20
```

## Test Users Created

The script creates 3 test users:

1. **John Doe**
   - Email: `john.doe@example.com`
   - Password: `TestPassword123!`

2. **Jane Smith**
   - Email: `jane.smith@example.com`
   - Password: `TestPassword123!`

3. **Test User**
   - Email: `test@example.com`
   - Password: `test123`

## Sample Data

For each user, the script creates:
- **20 blood pressure readings** (random dates over last 30 days)
- **15 health factor entries** (sleep, stress, exercise)

## For Railway (Production)

### Option 1: SSH into Railway (if available)

```bash
railway run python manage.py create_test_data
```

### Option 2: Django Admin Shell

1. Go to Railway → Your service → Settings → Variables
2. Add `DJANGO_SUPERUSER_USERNAME` and `DJANGO_SUPERUSER_PASSWORD`
3. Create superuser via Railway shell
4. Use Django admin to create users

### Option 3: One-time Script Deployment

Create a temporary script that runs on deploy:

1. Create `backend/create_test_data_once.sh`:
```bash
#!/bin/bash
python manage.py create_test_data --users-only
```

2. Add to Railway start command:
```bash
python manage.py create_test_data --users-only && python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
```

⚠️ **Note**: This runs every deploy, so remove it after first run!

## Alternative: Manual User Creation

You can also create users manually via Django shell:

```bash
python manage.py shell
```

Then:
```python
from accounts.models import User

user = User.objects.create_user(
    username='john_doe',
    email='john.doe@example.com',
    password='TestPassword123!',
    first_name='John',
    last_name='Doe',
)
```

## Verify Data

Check that data was created:

```bash
python manage.py shell
```

```python
from accounts.models import User
from readings.models import BloodPressureReading
from health_factors.models import HealthFactor

# Count users
print(f"Users: {User.objects.count()}")

# Count readings
print(f"Readings: {BloodPressureReading.objects.count()}")

# Count health factors
print(f"Health Factors: {HealthFactor.objects.count()}")
```

