#!/bin/bash

# Script to start Redis server
# For macOS: brew install redis
# For Ubuntu/Debian: sudo apt-get install redis-server
# For Windows: Download from https://redis.io/download

echo "Checking if Redis is installed..."

# Check if redis-server command exists
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis is not installed!"
    echo ""
    echo "Install Redis:"
    echo "  macOS:    brew install redis"
    echo "  Ubuntu:   sudo apt-get install redis-server"
    echo "  Windows:  Download from https://redis.io/download"
    echo ""
    echo "Or use Docker:"
    echo "  docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi

echo "✅ Redis found"
echo "Starting Redis server..."
echo "Redis will run on port 6379"
echo "Press Ctrl+C to stop"
echo ""

# Start Redis server
redis-server


