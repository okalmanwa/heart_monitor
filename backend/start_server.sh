#!/bin/bash

# Start Django development server with virtual environment

cd "$(dirname "$0")"

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

echo "Starting Django development server..."
echo "Server will be available at http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

python manage.py runserver

