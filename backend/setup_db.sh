#!/bin/bash

# Itaku Database Setup Script

echo "Setting up Itaku database..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "PostgreSQL doesn't appear to be running."
    echo "Please start PostgreSQL first:"
    echo "  brew services start postgresql@14  (or your version)"
    echo "  or: pg_ctl -D /usr/local/var/postgres start"
    exit 1
fi

# Get database credentials from .env or use defaults
DB_NAME=${DB_NAME:-itaku_db}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "Creating database: $DB_NAME"
echo "User: $DB_USER"

# Create database
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
    echo "Database might already exist or you need to create it manually."
    echo "Run this command manually:"
    echo "  psql -U postgres -c \"CREATE DATABASE $DB_NAME;\""
}

echo ""
echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your .env file has the correct database credentials"
echo "2. Run migrations: python manage.py migrate"
echo "3. Create superuser (optional): python manage.py createsuperuser"

