# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE $PORT

# Run migrations and start server
CMD python manage.py migrate && gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT

