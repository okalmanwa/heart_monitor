# Celery & Redis Setup Guide

This guide explains how to set up Celery and Redis for async task processing in the Itaku backend.

## Why Use Celery/Redis?

- **Faster Response Times**: AI insight generation runs in the background
- **Better User Experience**: Users don't wait 30+ seconds for insights
- **Scalability**: Can handle multiple concurrent requests
- **Reliability**: Tasks are queued and processed reliably

## Installation

### macOS

```bash
# Install Redis
brew install redis

# Start Redis (runs automatically on boot)
brew services start redis

# Or start manually
redis-server
```

### Ubuntu/Debian

```bash
# Install Redis
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server  # Start on boot
```

### Windows

1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Or use WSL (Windows Subsystem for Linux)
3. Or use Docker: `docker run -d -p 6379:6379 redis:alpine`

### Docker (All Platforms)

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

## Starting Services

### Option 1: Start Everything Together (Recommended)

```bash
cd backend
./start_all.sh
```

This script will:
- Check if Redis is installed
- Start Redis if not running
- Start Celery worker
- Start Django server

### Option 2: Start Individually

**Terminal 1 - Start Redis:**
```bash
cd backend
./start_redis.sh
```

**Terminal 2 - Start Celery Worker:**
```bash
cd backend
./start_celery.sh
```

**Terminal 3 - Start Django Server:**
```bash
cd backend
./start_server.sh
```

### Option 3: Manual Start

**Start Redis:**
```bash
redis-server
```

**Start Celery Worker:**
```bash
cd backend
source venv/bin/activate
celery -A itaku_backend worker --loglevel=info
```

**Start Django Server:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

## Verification

### Check if Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### Check if Celery Worker is Running

```bash
# Check processes
ps aux | grep celery

# Or check logs
tail -f celery.log
```

### Test Async Task

When you generate insights, check the Celery worker terminal - you should see task execution logs.

## Troubleshooting

### Redis Connection Error

```
Error: Connection refused
```

**Solution:**
- Make sure Redis is running: `redis-cli ping`
- Check Redis is on default port 6379
- Check firewall settings

### Celery Worker Not Starting

```
Error: No module named 'celery'
```

**Solution:**
- Make sure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

### Tasks Still Running Synchronously

**Check:**
1. Redis is running: `redis-cli ping`
2. Celery worker is running: `ps aux | grep celery`
3. Check Django logs for async task dispatch

**Solution:**
- Restart all services
- Check `CELERY_BROKER_URL` in settings.py
- Verify Redis connection: `redis-cli -h localhost -p 6379`

## Production Setup

For production, use:

1. **Supervisor** or **systemd** to manage Celery workers
2. **Redis Sentinel** for high availability
3. **Multiple Celery workers** for load distribution
4. **Flower** for monitoring: `celery -A itaku_backend flower`

## Environment Variables

Make sure these are set in your `.env` file:

```env
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## Monitoring

### View Celery Tasks

Install Flower (optional):
```bash
pip install flower
celery -A itaku_backend flower
```

Access at: http://localhost:5555

### View Redis Info

```bash
redis-cli info
```

## Stopping Services

### Stop Redis
```bash
redis-cli shutdown
# Or if started with brew:
brew services stop redis
```

### Stop Celery Worker
```bash
# Find process
ps aux | grep celery

# Kill process
kill <PID>

# Or if started with start_all.sh:
kill $(cat celery.pid)
```

## Performance Benefits

With Celery/Redis enabled:
- ✅ Insight generation: **Immediate response** (202 Accepted)
- ✅ User experience: **No waiting** for 30+ seconds
- ✅ Scalability: **Multiple concurrent requests**
- ✅ Reliability: **Tasks queued and retried**

Without Celery/Redis:
- ❌ Insight generation: **30-60 second wait**
- ❌ User experience: **Blocking request**
- ❌ Scalability: **One request at a time**
- ❌ Reliability: **No retry mechanism**


