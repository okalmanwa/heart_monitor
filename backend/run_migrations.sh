#!/bin/bash
# Script to run migrations for the insights app

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Run migrations
echo "Running migrations for insights app..."
python manage.py makemigrations insights
python manage.py migrate insights

echo "Migrations completed!"

