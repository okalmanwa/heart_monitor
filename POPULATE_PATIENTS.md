# Populate Database with 20+ Patients ❤️

## Overview

This script creates realistic patient data including:
- **20+ patients** with varied names
- **25 readings per patient** (over last 90 days)
- **20 health factors per patient** (sleep, stress, exercise)
- **Insights** for patients with hypertension

## BP Patterns Created

The script creates patients with different BP patterns:
- **8 Normal BP** patients (100-119/60-79)
- **5 Elevated BP** patients (120-129/60-79)
- **4 Stage 1 Hypertension** patients (130-139/80-89)
- **3 Stage 2 Hypertension** patients (140+/90+)

## Usage

### Method 1: Browser Endpoint (Easiest)

After Railway deploys, visit:

```
https://heartmonitor-production.up.railway.app/api/auth/populate-patients/
```

Or with custom count:
```
https://heartmonitor-production.up.railway.app/api/auth/populate-patients/?count=30
```

### Method 2: Django Management Command

**Local:**
```bash
cd backend
source venv/bin/activate
python manage.py populate_patients
```

**With options:**
```bash
# Create 30 patients
python manage.py populate_patients --count 30

# More readings per patient
python manage.py populate_patients --count 20 --readings-per-patient 50

# More health factors
python manage.py populate_patients --count 20 --factors-per-patient 30
```

### Method 3: Railway Start Command

Add to Railway's Custom Start Command:

```bash
python manage.py migrate && python manage.py populate_patients --count 20 && python manage.py ensure_test_users && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
```

⚠️ **Note**: This will run on every deploy. Remove after first run!

## Patient Login Credentials

All patients use the same password format:

**Email Format:** `{firstname}.{lastname}@patient.example.com`  
**Password:** `Patient123!`

**Examples:**
- `john.smith@patient.example.com` / `Patient123!`
- `mary.johnson@patient.example.com` / `Patient123!`
- `robert.williams@patient.example.com` / `Patient123!`

## Data Generated

For each patient:
- **25 blood pressure readings** (varied over 90 days)
- **20 health factor entries** (sleep, stress, exercise)
- **0-2 insights** (for hypertension patients)

## Realistic Features

- **BP patterns** match patient categories
- **Health factors correlate** with BP (e.g., high stress = higher BP)
- **Varied reading times** (morning, afternoon, evening)
- **Realistic notes** (e.g., "After exercise", "Stressful day")
- **Missing data** (some readings missing heart rate, some days without health factors)

## Verify Data

After running, check in Django shell:

```python
from accounts.models import User
from readings.models import BloodPressureReading
from health_factors.models import HealthFactor

# Count patients
patients = User.objects.filter(email__contains='@patient.example.com')
print(f"Patients: {patients.count()}")

# Count readings
print(f"Readings: {BloodPressureReading.objects.count()}")

# Count health factors
print(f"Health Factors: {HealthFactor.objects.count()}")

# Sample patient
patient = patients.first()
print(f"\nSample patient: {patient.email}")
print(f"  Readings: {patient.readings.count()}")
print(f"  Health Factors: {patient.health_factors.count()}")
```

---

**Use the browser endpoint method - it's the easiest!** 🚀

