"""
Django management command to populate database with 20+ realistic patients.
Each patient gets readings, health factors, and some insights.

Usage: python manage.py populate_patients
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from readings.models import BloodPressureReading
from health_factors.models import HealthFactor
from insights.models import UserInsight

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with 20+ realistic patients with readings and health data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of patients to create (default: 20)',
        )
        parser.add_argument(
            '--readings-per-patient',
            type=int,
            default=25,
            help='Number of readings per patient (default: 25)',
        )
        parser.add_argument(
            '--factors-per-patient',
            type=int,
            default=20,
            help='Number of health factor entries per patient (default: 20)',
        )

    def handle(self, *args, **options):
        count = options['count']
        readings_per_patient = options['readings_per_patient']
        factors_per_patient = options['factors_per_patient']

        self.stdout.write(self.style.SUCCESS('='*70))
        self.stdout.write(self.style.SUCCESS('Moyo Patient Data Generator ❤️'))
        self.stdout.write(self.style.SUCCESS('='*70))
        self.stdout.write('')

        # Realistic patient names
        first_names = [
            'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
            'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
            'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
            'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
            'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
            'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah',
            'Timothy', 'Stephanie', 'Ronald', 'Rebecca', 'Jason', 'Sharon', 'Edward', 'Laura',
            'Jeffrey', 'Cynthia', 'Ryan', 'Kathleen', 'Jacob', 'Amy', 'Gary', 'Angela',
        ]
        
        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
            'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
            'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
            'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
            'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
        ]

        # BP patterns for different patient types
        bp_patterns = [
            # Normal BP patients
            {'name': 'normal', 'systolic_range': (100, 119), 'diastolic_range': (60, 79), 'count': 8},
            # Elevated BP patients
            {'name': 'elevated', 'systolic_range': (120, 129), 'diastolic_range': (60, 79), 'count': 5},
            # Stage 1 Hypertension
            {'name': 'stage1', 'systolic_range': (130, 139), 'diastolic_range': (80, 89), 'count': 4},
            # Stage 2 Hypertension
            {'name': 'stage2', 'systolic_range': (140, 160), 'diastolic_range': (90, 100), 'count': 3},
        ]

        created_patients = []
        total_readings = 0
        total_factors = 0
        total_insights = 0

        pattern_index = 0
        pattern_count = 0

        for i in range(count):
            # Select name
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            username = f"{first_name.lower()}_{last_name.lower()}_{i+1}"
            email = f"{first_name.lower()}.{last_name.lower()}@patient.example.com"
            
            # Check if user exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'⚠️  Patient {email} already exists, skipping...'))
                continue

            # Select BP pattern
            if pattern_count >= bp_patterns[pattern_index]['count']:
                pattern_index = (pattern_index + 1) % len(bp_patterns)
                pattern_count = 0
            
            pattern = bp_patterns[pattern_index]
            pattern_count += 1

            # Create patient
            try:
                patient = User.objects.create_user(
                    username=username,
                    email=email,
                    password='Patient123!',
                    first_name=first_name,
                    last_name=last_name,
                )
                created_patients.append((patient, pattern))
                self.stdout.write(self.style.SUCCESS(f'✅ Created patient: {first_name} {last_name} ({email}) - {pattern["name"]} BP'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error creating {email}: {str(e)}'))
                continue

            # Create readings for this patient
            readings_created = self.create_readings(
                patient, readings_per_patient, pattern
            )
            total_readings += readings_created

            # Create health factors
            factors_created = self.create_health_factors(
                patient, factors_per_patient, pattern
            )
            total_factors += factors_created

            # Create some insights for patients with concerning patterns
            if pattern['name'] in ['stage1', 'stage2']:
                insights_created = self.create_insights(patient, pattern)
                total_insights += insights_created

            self.stdout.write(f'  📊 Created {readings_created} readings, {factors_created} health factors')
            self.stdout.write('')

        # Summary
        self.stdout.write(self.style.SUCCESS('='*70))
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  👥 Patients: {len(created_patients)}'))
        self.stdout.write(self.style.SUCCESS(f'  📈 Blood Pressure Readings: {total_readings}'))
        self.stdout.write(self.style.SUCCESS(f'  💪 Health Factors: {total_factors}'))
        self.stdout.write(self.style.SUCCESS(f'  💡 Insights: {total_insights}'))
        self.stdout.write(self.style.SUCCESS('='*70))
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ Patient data populated successfully!'))
        self.stdout.write('')
        self.stdout.write('Login credentials for all patients:')
        self.stdout.write('  Email: {firstname}.{lastname}@patient.example.com')
        self.stdout.write('  Password: Patient123!')
        self.stdout.write('')
        self.stdout.write('Example patients:')
        for patient, pattern in created_patients[:5]:
            self.stdout.write(f'  - {patient.email} ({pattern["name"]} BP pattern)')

    def create_readings(self, patient, count, pattern):
        """Create realistic blood pressure readings"""
        created = 0
        today = timezone.now()
        
        # Base ranges from pattern
        sys_min, sys_max = pattern['systolic_range']
        dia_min, dia_max = pattern['diastolic_range']
        
        # Create readings over last 90 days
        for i in range(count):
            days_ago = random.randint(0, 90)
            recorded_at = today - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            # Add some variation to readings
            systolic = random.randint(max(90, sys_min - 10), min(180, sys_max + 15))
            diastolic = random.randint(max(50, dia_min - 10), min(110, dia_max + 10))
            
            # Heart rate (60-100 BPM, occasional missing)
            heart_rate = random.randint(60, 100) if random.random() > 0.15 else None
            
            # Notes (occasional)
            notes = ""
            if random.random() > 0.75:
                notes = random.choice([
                    "Morning reading",
                    "After exercise",
                    "Before bed",
                    "After meal",
                    "Stressful day",
                    "Medication taken",
                    "Feeling well",
                    "Feeling tired",
                ])
            
            try:
                BloodPressureReading.objects.create(
                    user=patient,
                    systolic=systolic,
                    diastolic=diastolic,
                    heart_rate=heart_rate,
                    recorded_at=recorded_at,
                    notes=notes,
                )
                created += 1
            except Exception:
                pass
        
        return created

    def create_health_factors(self, patient, count, pattern):
        """Create health factors that correlate with BP patterns"""
        created = 0
        today = timezone.now().date()
        
        for i in range(count):
            days_ago = random.randint(0, 90)
            date = today - timedelta(days=days_ago)
            
            # Skip if entry exists for this date
            if HealthFactor.objects.filter(user=patient, date=date).exists():
                continue
            
            # Sleep quality (better for normal BP patients)
            if pattern['name'] == 'normal':
                sleep_quality = random.choices([3, 4, 5], weights=[20, 40, 40])[0]
            elif pattern['name'] == 'stage2':
                sleep_quality = random.choices([1, 2, 3, 4, 5], weights=[30, 30, 20, 15, 5])[0]
            else:
                sleep_quality = random.randint(1, 5) if random.random() > 0.1 else None
            
            # Stress level (higher for hypertension)
            if pattern['name'] in ['stage1', 'stage2']:
                stress_level = random.choices([3, 4, 5], weights=[20, 40, 40])[0]
            else:
                stress_level = random.randint(1, 5) if random.random() > 0.1 else None
            
            # Exercise (less for hypertension patients)
            if pattern['name'] == 'normal':
                exercise_duration = random.randint(0, 120) if random.random() > 0.2 else None
            elif pattern['name'] == 'stage2':
                exercise_duration = random.randint(0, 30) if random.random() > 0.5 else None
            else:
                exercise_duration = random.randint(0, 60) if random.random() > 0.3 else None
            
            # Notes
            notes = ""
            if random.random() > 0.7:
                notes = random.choice([
                    "Good sleep last night",
                    "Had a walk in the morning",
                    "Busy day at work",
                    "Relaxing weekend",
                    "Feeling stressed",
                    "Didn't sleep well",
                    "30 minute jog",
                    "Yoga session",
                ])
            
            try:
                HealthFactor.objects.create(
                    user=patient,
                    date=date,
                    sleep_quality=sleep_quality,
                    stress_level=stress_level,
                    exercise_duration=exercise_duration,
                    notes=notes,
                )
                created += 1
            except Exception:
                pass
        
        return created

    def create_insights(self, patient, pattern):
        """Create insights for patients with concerning BP patterns"""
        created = 0
        
        insight_templates = {
            'stage1': [
                {
                    'text': f'Your blood pressure readings show Stage 1 hypertension. Consider lifestyle changes and consult with your healthcare provider.',
                    'type': 'alert',
                    'severity': 'medium',
                },
                {
                    'text': f'Your recent readings indicate elevated blood pressure. Regular monitoring and stress management may help.',
                    'type': 'trend',
                    'severity': 'medium',
                },
            ],
            'stage2': [
                {
                    'text': f'Your blood pressure readings show Stage 2 hypertension. Please consult with your healthcare provider as soon as possible.',
                    'type': 'alert',
                    'severity': 'high',
                },
                {
                    'text': f'Multiple high readings detected. This pattern suggests you should seek medical attention.',
                    'type': 'trend',
                    'severity': 'high',
                },
                {
                    'text': f'Your stress levels appear to correlate with higher blood pressure readings. Consider stress management techniques.',
                    'type': 'correlation',
                    'severity': 'medium',
                },
            ],
        }
        
        templates = insight_templates.get(pattern['name'], [])
        
        for template in templates[:2]:  # Create 1-2 insights per patient
            try:
                UserInsight.objects.create(
                    user=patient,
                    insight_text=template['text'],
                    insight_type=template['type'],
                    severity=template['severity'],
                    is_read=False,
                )
                created += 1
            except Exception:
                pass
        
        return created

