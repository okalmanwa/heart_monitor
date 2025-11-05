#!/bin/bash
# One-time script to populate test data on Railway
# This will run once when deployed, then create a flag file to prevent re-running

FLAG_FILE="/tmp/test_data_created.flag"

# Check if test data already created
if [ -f "$FLAG_FILE" ]; then
    echo "Test data already created. Skipping..."
    exit 0
fi

# Run the command
echo "Creating test data..."
python manage.py create_test_data --users-only

# Create flag file to prevent re-running
touch "$FLAG_FILE"
echo "Test data creation completed!"

