# Moyo Quick Start Guide ❤️

Get Moyo up and running in minutes!

## Prerequisites

Before starting, ensure you have:
- Python 3.9+ installed
- Node.js 18+ and npm installed
- PostgreSQL installed and running
- A PostgreSQL database created (or use SQLite for development)

## Quick Setup (5 minutes)

### 1. Backend Setup

```bash
cd backend

# Option A: Use the setup script (recommended)
./setup.sh

# Option B: Manual setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Optional
python manage.py runserver
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Access the Application

1. Open your browser to `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Log in with your credentials
4. Start adding blood pressure readings!

## Database Setup (PostgreSQL)

If using PostgreSQL:

```sql
CREATE DATABASE itaku_db;
CREATE USER itaku_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE itaku_db TO itaku_user;
```

Then update your `.env` file:
```
DB_NAME=itaku_db
DB_USER=itaku_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## Using SQLite (Development Only)

For quick testing, you can use SQLite instead of PostgreSQL. Update `backend/itaku_backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**Note**: SQLite is fine for development but PostgreSQL is recommended for production.

## Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running (if using PostgreSQL)
- Check that your `.env` file has correct database credentials
- Make sure all migrations are applied: `python manage.py migrate`

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check that CORS is properly configured in `settings.py`
- Verify the proxy settings in `vite.config.ts`

### Authentication errors
- Ensure you're using email (not username) to log in
- Check that the user exists in the database
- Verify JWT tokens are being stored in localStorage

## Next Steps

- Add your first blood pressure reading
- View the color-coded chart
- Export your readings as PDF
- Check out the full README.md for more features

## Need Help?

See the main README.md for detailed documentation and API endpoints.

