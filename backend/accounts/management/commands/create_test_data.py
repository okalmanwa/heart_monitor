"""
Django management command to create test users and sample data.
Usage: python manage.py create_test_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from readings.models import BloodPressureReading
from health_factors.models import HealthFactor

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test users and sample data for Moyo application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users-only',
            action='store_true',
            help='Only create users, no sample data',
        )
        parser.add_argument(
            '--readings',
            type=int,
            default=20,
            help='Number of readings per user (default: 20)',
        )
        parser.add_argument(
            '--factors',
            type=int,
            default=15,
            help='Number of health factor entries per user (default: 15)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Moyo Test Data Generator ❤️'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')

        # Test users to create
        test_users_data = [
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

        # Create users
        users = []
        created_count = 0
        existing_count = 0

        self.stdout.write('Creating test users...\n')

        for user_data in test_users_data:
            username = user_data['username']
            email = user_data['email']

            # Check if user already exists
            if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
                user = User.objects.get(username=username) if User.objects.filter(username=username).exists() else User.objects.get(email=email)
                self.stdout.write(self.style.WARNING(f'⚠️  User \'{username}\' already exists. Using existing user.'))
                users.append(user)
                existing_count += 1
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
                self.stdout.write(self.style.SUCCESS(f'✅ Created user: {username} ({email})'))
                users.append(user)
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error creating user \'{username}\': {str(e)}'))

        if not users:
            self.stdout.write(self.style.ERROR('❌ No users available. Exiting.'))
            return

        if options['users_only']:
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('='*60))
            self.stdout.write(self.style.SUCCESS(f'Summary: Created {created_count} users, {existing_count} existing'))
            self.stdout.write(self.style.SUCCESS('='*60))
            return

        # Create sample data
        self.stdout.write('')
        self.stdout.write('Creating sample data for users...\n')

        total_readings = 0
        total_factors = 0

        for user in users:
            self.stdout.write(f'📊 Creating data for {user.username}...')

            # Create readings
            readings_count = self.create_sample_readings(user, options['readings'])
            total_readings += readings_count
            self.stdout.write(self.style.SUCCESS(f'  ✅ Created {readings_count} blood pressure readings'))

            # Create health factors
            factors_count = self.create_sample_health_factors(user, options['factors'])
            total_factors += factors_count
            self.stdout.write(self.style.SUCCESS(f'  ✅ Created {factors_count} health factor entries'))
            self.stdout.write('')

        # Summary
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  👤 Users: {len(users)} (Created: {created_count}, Existing: {existing_count})'))
        self.stdout.write(self.style.SUCCESS(f'  📈 Blood Pressure Readings: {total_readings}'))
        self.stdout.write(self.style.SUCCESS(f'  💪 Health Factors: {total_factors}'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ Test data created successfully!'))
        self.stdout.write('')
        self.stdout.write('You can now login with:')
        for user in users:
            password = 'TestPassword123!' if 'test' not in user.email else 'test123'
            self.stdout.write(f'  - {user.email} / {password}')

    def create_sample_readings(self, user, num_readings=20):
        """Create sample blood pressure readings for a user"""
        readings_created = 0
        today = timezone.now()

        for i in range(num_readings):
            days_ago = random.randint(0, 30)
            recorded_at = today - timedelta(days=days_ago)

            systolic = random.randint(110, 145)
            diastolic = random.randint(70, 95)
            heart_rate = random.randint(60, 100) if random.random() > 0.2 else None

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
                BloodPressureReading.objects.create(
                    user=user,
                    systolic=systolic,
                    diastolic=diastolic,
                    heart_rate=heart_rate,
                    recorded_at=recorded_at,
                    notes=notes,
                )
                readings_created += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ⚠️  Error creating reading: {str(e)}'))

        return readings_created

    def create_sample_health_factors(self, user, num_entries=15):
        """Create sample health factors for a user"""
        factors_created = 0
        today = timezone.now().date()

        for i in range(num_entries):
            days_ago = random.randint(0, 30)
            date = today - timedelta(days=days_ago)

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
                HealthFactor.objects.create(
                    user=user,
                    date=date,
                    sleep_quality=sleep_quality,
                    stress_level=stress_level,
                    exercise_duration=exercise_duration,
                    notes=notes,
                )
                factors_created += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ⚠️  Error creating health factor: {str(e)}'))

        return factors_created

