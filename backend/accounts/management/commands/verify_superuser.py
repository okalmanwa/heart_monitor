"""
Django management command to verify superuser status.
Usage: python manage.py verify_superuser
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Verify superuser status and permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Superuser Verification'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')

        # Check all users
        users = User.objects.all()
        self.stdout.write(f'Total users: {users.count()}\n')

        for user in users:
            is_super = user.is_superuser
            is_staff = user.is_staff
            is_active = user.is_active
            
            self.stdout.write(f'User: {user.email} ({user.username})')
            self.stdout.write(f'  - Superuser: {is_super}')
            self.stdout.write(f'  - Staff: {is_staff}')
            self.stdout.write(f'  - Active: {is_active}')
            
            if is_super and is_staff and is_active:
                self.stdout.write(self.style.SUCCESS('  ✅ Can access admin'))
            else:
                self.stdout.write(self.style.WARNING('  ⚠️  Cannot access admin'))
                if not is_super:
                    self.stdout.write(self.style.ERROR('     Missing: is_superuser'))
                if not is_staff:
                    self.stdout.write(self.style.ERROR('     Missing: is_staff'))
                if not is_active:
                    self.stdout.write(self.style.ERROR('     Missing: is_active'))
            self.stdout.write('')

        # Check your specific user
        your_user = User.objects.filter(email='careyokal@gmail.com').first()
        if your_user:
            self.stdout.write(self.style.SUCCESS('='*60))
            self.stdout.write(self.style.SUCCESS('Your Account Status:'))
            self.stdout.write(f'  Email: {your_user.email}')
            self.stdout.write(f'  Username: {your_user.username}')
            self.stdout.write(f'  Superuser: {your_user.is_superuser}')
            self.stdout.write(f'  Staff: {your_user.is_staff}')
            self.stdout.write(f'  Active: {your_user.is_active}')
            
            if your_user.is_superuser and your_user.is_staff and your_user.is_active:
                self.stdout.write(self.style.SUCCESS('  ✅ You should be able to access admin!'))
            else:
                self.stdout.write(self.style.WARNING('  ⚠️  Fix needed:'))
                if not your_user.is_superuser:
                    self.stdout.write(self.style.ERROR('     Run: python manage.py shell'))
                    self.stdout.write(self.style.ERROR('     Then: user.is_superuser = True'))
                if not your_user.is_staff:
                    self.stdout.write(self.style.ERROR('     Run: user.is_staff = True'))
                if not your_user.is_active:
                    self.stdout.write(self.style.ERROR('     Run: user.is_active = True'))
                self.stdout.write(self.style.ERROR('     Then: user.save()'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  User careyokal@gmail.com not found'))

