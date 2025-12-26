#!/bin/bash

# Script to start Celery worker for async task processing

cd "$(dirname "$0")"

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Warning: Redis is not running!"
    echo "Please start Redis first:"
    echo "  ./start_redis.sh"
    echo "  or"
    echo "  redis-server"
    echo ""
    echo "Continuing anyway (will fall back to sync mode)..."
    echo ""
fi

echo "Starting Celery worker..."
echo "Celery worker will process async tasks"
echo "Press Ctrl+C to stop"
echo ""

# Start Celery worker
celery -A itaku_backend worker --loglevel=info

