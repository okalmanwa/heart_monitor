#!/bin/bash

# Script to start Redis, Celery, and Django server together

cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Itaku Backend Services${NC}"
echo ""

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo -e "${RED}❌ Redis is not installed!${NC}"
    echo ""
    echo "Install Redis:"
    echo "  macOS:    brew install redis"
    echo "  Ubuntu:   sudo apt-get install redis-server"
    echo "  Windows:  Download from https://redis.io/download"
    echo ""
    echo "Or use Docker:"
    echo "  docker run -d -p 6379:6379 redis:alpine"
    echo ""
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}⚠️  Starting Redis server...${NC}"
    # Start Redis in background
    redis-server --daemonize yes
    sleep 2
    
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis started${NC}"
    else
        echo -e "${RED}❌ Failed to start Redis${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Redis is already running${NC}"
fi

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

# Start Celery worker in background
echo -e "${YELLOW}📦 Starting Celery worker...${NC}"
celery -A itaku_backend worker --loglevel=info --detach --pidfile=celery.pid --logfile=celery.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Celery worker started${NC}"
else
    echo -e "${YELLOW}⚠️  Celery worker may have failed to start${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "Services running:"
echo "  - Redis:     localhost:6379"
echo "  - Celery:    Processing async tasks"
echo ""
echo -e "${YELLOW}Starting Django server...${NC}"
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    
    # Stop Celery worker
    if [ -f celery.pid ]; then
        kill $(cat celery.pid) 2>/dev/null
        rm celery.pid
        echo "✅ Celery worker stopped"
    fi
    
    # Stop Redis if we started it
    redis-cli shutdown 2>/dev/null
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Start Django server
python manage.py runserver


