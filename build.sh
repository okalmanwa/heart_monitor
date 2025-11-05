#!/bin/bash
# Build script for Railway
set -e

echo "Building Moyo backend..."

cd backend

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

echo "Build complete!"

