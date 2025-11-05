"""
Django management command to ensure test users exist.
This is safe to run multiple times - it only creates if they don't exist.
Usage: python manage.py ensure_test_users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Ensure test users exist (creates only if they don\'t)'

    def handle(self, *args, **options):
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

        created_count = 0
        existing_count = 0

        for user_data in test_users_data:
            email = user_data['email']
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'⚠️  User {email} already exists'))
                existing_count += 1
                continue

            try:
                User.objects.create_user(**user_data)
                self.stdout.write(self.style.SUCCESS(f'✅ Created user: {email}'))
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error creating {email}: {str(e)}'))

        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Created {created_count} test users'))
        if existing_count > 0:
            self.stdout.write(self.style.WARNING(f'⚠️  {existing_count} users already existed'))

