#!/usr/bin/env python
"""
Django management script to create test users AND sample data (readings, health factors).
Run this from the backend directory: python create_test_data.py
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'itaku_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import User
from readings.models import BloodPressureReading
from health_factors.models import HealthFactor

User = get_user_model()

# Test users to create
test_users = [
    {
        'username': 'john_doe',
        'email': 'john.doe@example.com',
        'password': 'TestPassword123!',
        'first_name': 'John',
        'last_name': 'Doe',
    },
    {
        'username': 'jane_smith',
        'email': 'jane.smith@example.com',
        'password': 'TestPassword123!',
        'first_name': 'Jane',
        'last_name': 'Smith',
    },
    {
        'username': 'test_user',
        'email': 'test@example.com',
        'password': 'test123',
        'first_name': 'Test',
        'last_name': 'User',
    },
]

def create_test_users():
    """Create test users if they don't exist"""
    created_users = []
    
    print("Creating test users...\n")
    
    for user_data in test_users:
        username = user_data['username']
        email = user_data['email']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            user = User.objects.get(username=username) if User.objects.filter(username=username).exists() else User.objects.get(email=email)
            print(f"⚠️  User '{username}' already exists. Using existing user.")
            created_users.append(user)
            continue
        
        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
            )
            print(f"✅ Created user: {username} ({email})")
            created_users.append(user)
        except Exception as e:
            print(f"❌ Error creating user '{username}': {str(e)}")
    
    return created_users

def create_sample_readings(user, num_readings=20):
    """Create sample blood pressure readings for a user"""
    readings_created = 0
    
    # Generate readings over the last 30 days
    today = datetime.now()
    
    for i in range(num_readings):
        # Random date within last 30 days
        days_ago = random.randint(0, 30)
        recorded_at = today - timedelta(days=days_ago)
        
        # Generate realistic BP values with some variation
        # Base values around normal/elevated
        systolic = random.randint(110, 145)
        diastolic = random.randint(70, 95)
        heart_rate = random.randint(60, 100) if random.random() > 0.2 else None
        
        # Add some notes occasionally
        notes = ""
        if random.random() > 0.7:
            notes = random.choice([
                "Morning reading",
                "After exercise",
                "Stressful day",
                "After meal",
                "Before bed",
            ])
        
        try:
            reading = BloodPressureReading.objects.create(
                user=user,
                systolic=systolic,
                diastolic=diastolic,
                heart_rate=heart_rate,
                recorded_at=recorded_at,
                notes=notes,
            )
            readings_created += 1
        except Exception as e:
            print(f"  ⚠️  Error creating reading: {str(e)}")
    
    return readings_created

def create_sample_health_factors(user, num_entries=15):
    """Create sample health factors for a user"""
    factors_created = 0
    
    # Generate entries over the last 30 days
    today = datetime.now().date()
    
    for i in range(num_entries):
        days_ago = random.randint(0, 30)
        date = today - timedelta(days=days_ago)
        
        # Skip if entry already exists for this date
        if HealthFactor.objects.filter(user=user, date=date).exists():
            continue
        
        sleep_quality = random.randint(1, 5) if random.random() > 0.1 else None
        stress_level = random.randint(1, 5) if random.random() > 0.1 else None
        exercise_duration = random.randint(0, 120) if random.random() > 0.3 else None
        
        notes = ""
        if random.random() > 0.7:
            notes = random.choice([
                "Good sleep last night",
                "Had a walk in the morning",
                "Busy day at work",
                "Relaxing weekend",
            ])
        
        try:
            factor = HealthFactor.objects.create(
                user=user,
                date=date,
                sleep_quality=sleep_quality,
                stress_level=stress_level,
                exercise_duration=exercise_duration,
                notes=notes,
            )
            factors_created += 1
        except Exception as e:
            print(f"  ⚠️  Error creating health factor: {str(e)}")
    
    return factors_created

def main():
    """Main function to create all test data"""
    print("="*60)
    print("Moyo Test Data Generator ❤️")
    print("="*60)
    print()
    
    # Create users
    users = create_test_users()
    
    if not users:
        print("❌ No users available. Exiting.")
        return
    
    print()
    print("Creating sample data for users...\n")
    
    total_readings = 0
    total_factors = 0
    
    for user in users:
        print(f"📊 Creating data for {user.username}...")
        
        # Create readings
        readings_count = create_sample_readings(user, num_readings=20)
        total_readings += readings_count
        print(f"  ✅ Created {readings_count} blood pressure readings")
        
        # Create health factors
        factors_count = create_sample_health_factors(user, num_entries=15)
        total_factors += factors_count
        print(f"  ✅ Created {factors_count} health factor entries")
        print()
    
    print("="*60)
    print("Summary:")
    print(f"  👤 Users: {len(users)}")
    print(f"  📈 Blood Pressure Readings: {total_readings}")
    print(f"  💪 Health Factors: {total_factors}")
    print("="*60)
    print()
    print("✅ Test data created successfully!")
    print()
    print("You can now login with:")
    for user in users:
        print(f"  - {user.email} / TestPassword123!")
    print()

if __name__ == '__main__':
    main()

