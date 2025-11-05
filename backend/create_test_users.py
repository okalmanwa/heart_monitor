#!/usr/bin/env python
"""
Django management script to create test users for Moyo application.
Run this from the backend directory: python create_test_users.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'itaku_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import User

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
        'username': 'mike_johnson',
        'email': 'mike.johnson@example.com',
        'password': 'TestPassword123!',
        'first_name': 'Mike',
        'last_name': 'Johnson',
    },
    {
        'username': 'sarah_williams',
        'email': 'sarah.williams@example.com',
        'password': 'TestPassword123!',
        'first_name': 'Sarah',
        'last_name': 'Williams',
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
    created_count = 0
    existing_count = 0
    
    print("Creating test users for Moyo...\n")
    
    for user_data in test_users:
        username = user_data['username']
        email = user_data['email']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"⚠️  User '{username}' already exists. Skipping...")
            existing_count += 1
            continue
            
        if User.objects.filter(email=email).exists():
            print(f"⚠️  Email '{email}' already exists. Skipping...")
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
            print(f"✅ Created user: {username} ({email})")
            created_count += 1
        except Exception as e:
            print(f"❌ Error creating user '{username}': {str(e)}")
    
    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  ✅ Created: {created_count} users")
    print(f"  ⚠️  Existing: {existing_count} users")
    print(f"{'='*50}\n")
    
    print("Test users created successfully!")
    print("\nYou can now login with any of these credentials:")
    print("  - john.doe@example.com / TestPassword123!")
    print("  - jane.smith@example.com / TestPassword123!")
    print("  - mike.johnson@example.com / TestPassword123!")
    print("  - sarah.williams@example.com / TestPassword123!")
    print("  - test@example.com / test123")

if __name__ == '__main__':
    create_test_users()

