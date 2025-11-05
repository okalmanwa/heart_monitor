# Moyo Backend ❤️

Django REST API backend for the Moyo cardiac health monitoring application.

## Quick Start

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Set up database:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Create superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

5. Run server:
   ```bash
   python manage.py runserver
   ```

## Environment Variables

Create a `.env` file with:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=moyo_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## API Documentation

See the main README.md for API endpoint documentation.

