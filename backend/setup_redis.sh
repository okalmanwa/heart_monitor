#!/bin/bash

# Script to install and setup Redis

echo "🔍 Checking Redis installation..."

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Detected: macOS"
    
    if command -v brew &> /dev/null; then
        echo "✅ Homebrew found"
        
        if command -v redis-server &> /dev/null; then
            echo "✅ Redis is already installed"
        else
            echo "📦 Installing Redis via Homebrew..."
            brew install redis
            
            if [ $? -eq 0 ]; then
                echo "✅ Redis installed successfully"
            else
                echo "❌ Failed to install Redis"
                exit 1
            fi
        fi
        
        echo ""
        echo "🚀 Starting Redis..."
        brew services start redis
        
        sleep 2
        
        if redis-cli ping &> /dev/null; then
            echo "✅ Redis is running!"
        else
            echo "⚠️  Redis may not have started. Try: redis-server"
        fi
        
    else
        echo "❌ Homebrew not found"
        echo ""
        echo "Install Homebrew first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        echo "Then run this script again."
        exit 1
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Detected: Linux"
    
    if command -v apt-get &> /dev/null; then
        echo "📦 Installing Redis via apt-get..."
        sudo apt-get update
        sudo apt-get install -y redis-server
        
        echo "🚀 Starting Redis..."
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        
        sleep 2
        
        if redis-cli ping &> /dev/null; then
            echo "✅ Redis is running!"
        else
            echo "⚠️  Redis may not have started. Check: sudo systemctl status redis-server"
        fi
        
    elif command -v yum &> /dev/null; then
        echo "📦 Installing Redis via yum..."
        sudo yum install -y redis
        sudo systemctl start redis
        sudo systemctl enable redis
    else
        echo "❌ Package manager not found (apt-get or yum)"
        echo "Please install Redis manually"
        exit 1
    fi
    
else
    echo "⚠️  Unsupported OS: $OSTYPE"
    echo ""
    echo "Please install Redis manually:"
    echo "  macOS:    brew install redis"
    echo "  Ubuntu:   sudo apt-get install redis-server"
    echo "  Windows:  Use WSL or Docker"
    echo ""
    echo "Or use Docker:"
    echo "  docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi

echo ""
echo "✅ Redis setup complete!"
echo ""
echo "Test Redis:"
echo "  redis-cli ping"
echo ""
echo "Start Redis manually:"
echo "  redis-server"
echo ""
echo "Or use the provided scripts:"
echo "  ./start_redis.sh    # Start Redis"
echo "  ./start_celery.sh   # Start Celery worker"
echo "  ./start_all.sh      # Start everything"


