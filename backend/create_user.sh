#!/bin/bash

# Script to create a user account

cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    exit 1
fi

source venv/bin/activate

echo "Creating a new user account..."
echo ""
read -p "Email: " email
read -p "Username: " username
read -sp "Password: " password
echo ""
read -sp "Confirm Password: " password2
echo ""

if [ "$password" != "$password2" ]; then
    echo "Error: Passwords don't match!"
    exit 1
fi

python manage.py shell << EOF
from accounts.models import User
user = User.objects.create_user(
    username='$username',
    email='$email',
    password='$password'
)
print(f"\n✅ User created successfully!")
print(f"Email: {user.email}")
print(f"Username: {user.username}")
EOF

