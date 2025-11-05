#!/usr/bin/env python
"""
One-time script to populate test data.
This creates a flag file to prevent re-running.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'itaku_backend.settings')
django.setup()

from django.core.management import call_command

FLAG_FILE = '/tmp/test_data_created.flag'

# Check if already run
if os.path.exists(FLAG_FILE):
    print("Test data already created. Skipping...")
    sys.exit(0)

# Run the command
print("Creating test data...")
try:
    call_command('create_test_data', '--users-only')
    # Create flag file
    with open(FLAG_FILE, 'w') as f:
        f.write('created')
    print("✅ Test data created successfully!")
except Exception as e:
    print(f"❌ Error creating test data: {str(e)}")
    sys.exit(1)

