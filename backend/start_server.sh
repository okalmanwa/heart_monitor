#!/bin/bash

# Start Django development server with virtual environment
# Optionally starts Redis and Celery if available

cd "$(dirname "$0")"

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

# Check if Redis is available
REDIS_AVAILABLE=false
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        REDIS_AVAILABLE=true
        echo "✅ Redis is running"
    elif command -v redis-server &> /dev/null; then
        echo "⚠️  Redis is installed but not running"
        echo "   Start Redis with: ./start_redis.sh"
        echo "   Or use: ./start_all.sh to start everything"
    fi
else
    echo "⚠️  Redis is not installed - async tasks will run synchronously"
    echo "   Install Redis for better performance:"
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt-get install redis-server"
fi

# Check if Celery worker is running
CELERY_RUNNING=false
if command -v celery &> /dev/null; then
    if pgrep -f "celery.*worker" > /dev/null; then
        CELERY_RUNNING=true
        echo "✅ Celery worker is running"
    else
        echo "⚠️  Celery worker is not running"
        echo "   Start Celery with: ./start_celery.sh"
        echo "   Or use: ./start_all.sh to start everything"
    fi
fi

echo ""
echo "Starting Django development server..."
echo "Server will be available at http://localhost:8000"
if [ "$REDIS_AVAILABLE" = true ] && [ "$CELERY_RUNNING" = true ]; then
    echo "✅ Async task processing is enabled"
else
    echo "⚠️  Async tasks will run synchronously (slower)"
fi
echo "Press Ctrl+C to stop"
echo ""

python manage.py runserver

