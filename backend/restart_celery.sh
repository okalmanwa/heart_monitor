#!/bin/bash

# Script to restart Celery worker

cd "$(dirname "$0")"

echo "🔄 Restarting Celery worker..."

# Find and kill existing Celery workers
CELERY_PIDS=$(ps aux | grep "celery.*worker" | grep -v grep | awk '{print $2}')

if [ -z "$CELERY_PIDS" ]; then
    echo "⚠️  No Celery workers found running"
else
    echo "Stopping existing Celery workers (PIDs: $CELERY_PIDS)..."
    kill $CELERY_PIDS 2>/dev/null
    sleep 2
    
    # Force kill if still running
    REMAINING=$(ps aux | grep "celery.*worker" | grep -v grep | awk '{print $2}')
    if [ ! -z "$REMAINING" ]; then
        echo "Force killing remaining processes..."
        kill -9 $REMAINING 2>/dev/null
    fi
    
    echo "✅ Celery workers stopped"
fi

# Wait a moment
sleep 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    exit 1
fi

source venv/bin/activate

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Warning: Redis is not running!"
    echo "Start Redis with: ./start_redis.sh"
fi

echo ""
echo "🚀 Starting Celery worker..."
echo "Press Ctrl+C to stop"
echo ""

# Start Celery worker
celery -A itaku_backend worker --loglevel=info


