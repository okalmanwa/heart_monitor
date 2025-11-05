# Moyo Deployment Guide ❤️

This guide covers multiple deployment options for the Moyo application. Choose the option that best fits your needs.

## Table of Contents

1. [Quick Deploy Options](#quick-deploy-options)
2. [Deployment Architecture](#deployment-architecture)
3. [Option 1: Railway (Recommended for Beginners)](#option-1-railway-recommended-for-beginners)
4. [Option 2: Render](#option-2-render)
5. [Option 3: Vercel + Railway/Render](#option-3-vercel--railwayrender)
6. [Option 4: DigitalOcean App Platform](#option-4-digitalocean-app-platform)
7. [Option 5: Traditional VPS (Ubuntu/Debian)](#option-5-traditional-vps-ubuntudebian)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Quick Deploy Options

**Easiest (Free/Cheap):**
- **Railway** - Deploy both backend + database (free tier available)
- **Render** - Free tier for backend, separate PostgreSQL
- **Vercel** (frontend) + **Railway** (backend) - Best separation

**More Control:**
- **DigitalOcean App Platform** - Managed platform
- **VPS** (DigitalOcean, AWS EC2) - Full control, requires more setup

---

## Deployment Architecture

```
┌─────────────────┐
│   Frontend      │  (React - Vite build)
│   (Static Site) │  → Served via CDN/Vercel/Netlify
└─────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Backend API    │  (Django)
│   (Railway/etc)  │  → Handles all requests
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL     │  (Managed DB)
│   (Railway/etc)  │  → Stores all data
└─────────────────┘
```

---

## Option 1: Railway (Recommended for Beginners)

Railway can host both your backend and database easily.

### Prerequisites
- GitHub account
- Railway account (railway.app)

### Steps

#### 1. Prepare Your Backend

Create a `Procfile` in `/Users/okal/Desktop/itaku/backend/`:

```bash
web: gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:$PORT
```

Update `requirements.txt` to include:
```
gunicorn==21.2.0
whitenoise==6.6.0
```

#### 2. Update Django Settings for Production

Add to `backend/itaku_backend/settings.py`:

```python
import os

# Add at the end of settings.py
ALLOWED_HOSTS = ['*']  # Or specific domain: ['yourdomain.com', '*.railway.app']

# Static files (for production)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Add whitenoise middleware (should be after SecurityMiddleware)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... rest of middleware
]

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### 3. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your repository (or create one and push)
5. Railway will detect Django automatically
6. Add environment variables:
   - `SECRET_KEY` - Generate a new one
   - `DEBUG=False`
   - `DB_NAME` - Railway will provide
   - `DB_USER` - Railway will provide
   - `DB_PASSWORD` - Railway will provide
   - `DB_HOST` - Railway will provide
   - `DB_PORT` - Railway will provide

7. Add PostgreSQL service:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway automatically connects it

8. Deploy!

#### 4. Deploy Frontend

Option A: Static export to Railway
- Build the frontend: `npm run build`
- Serve `dist/` folder

Option B: Use Vercel (recommended for frontend)

---

## Option 2: Render

### Backend on Render

1. Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: moyo-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt && cd backend && python manage.py collectstatic --noinput
    startCommand: cd backend && gunicorn itaku_backend.wsgi:application
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: DATABASE_URL
        fromDatabase:
          name: moyo-db
          property: connectionString
```

2. Go to [render.com](https://render.com)
3. Create "New Web Service"
4. Connect GitHub repo
5. Add PostgreSQL database
6. Deploy!

### Frontend on Render

1. Create new "Static Site"
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`

---

## Option 3: Vercel + Railway/Render

Best separation: Frontend on Vercel, Backend on Railway/Render.

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework preset: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variables:
   - `VITE_API_URL=https://your-backend-url.com`

### Backend (Railway or Render)

Follow Option 1 or 2 above for backend deployment.

---

## Option 4: DigitalOcean App Platform

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Create App → GitHub
3. Add components:
   - **Backend**: Python service
   - **Database**: PostgreSQL (managed)
   - **Frontend**: Static site (or separate service)

4. Configure each component with environment variables
5. Deploy!

---

## Option 5: Traditional VPS (Ubuntu/Debian)

For full control on a VPS (DigitalOcean, AWS EC2, Linode, etc.)

### Server Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install -y python3-pip python3-venv postgresql nginx certbot python3-certbot-nginx

# 3. Create database
sudo -u postgres psql
CREATE DATABASE moyo_db;
CREATE USER moyo_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE moyo_db TO moyo_user;
\q

# 4. Clone your repository
cd /var/www
sudo git clone https://github.com/yourusername/moyo.git
cd moyo

# 5. Set up backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# 6. Configure environment
sudo nano .env
# Add your environment variables

# 7. Run migrations
python manage.py migrate
python manage.py collectstatic --noinput

# 8. Test run
gunicorn itaku_backend.wsgi:application --bind 0.0.0.0:8000
```

### Nginx Configuration

Create `/etc/nginx/sites-available/moyo`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (static files)
    location / {
        root /var/www/moyo/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static {
        alias /var/www/moyo/backend/staticfiles;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/moyo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Systemd Service

Create `/etc/systemd/system/moyo.service`:

```ini
[Unit]
Description=Moyo Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/moyo/backend
Environment="PATH=/var/www/moyo/backend/venv/bin"
ExecStart=/var/www/moyo/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/var/www/moyo/backend/moyo.sock \
    itaku_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl start moyo
sudo systemctl enable moyo
```

### SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment Checklist

### Security
- [ ] Set `DEBUG=False` in production
- [ ] Generate new `SECRET_KEY` (don't use default)
- [ ] Set `ALLOWED_HOSTS` to your domain
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly (only allow your frontend domain)
- [ ] Set up database backups
- [ ] Use strong database passwords
- [ ] Enable Django security middleware

### Performance
- [ ] Set up CDN for static files (optional)
- [ ] Configure caching (Redis recommended)
- [ ] Set up database connection pooling
- [ ] Enable gzip compression (Nginx/Whitenoise)

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Database monitoring

### Updates
- [ ] Set up CI/CD pipeline
- [ ] Automated testing
- [ ] Staging environment

---

## Environment Variables Reference

### Backend (.env)
```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_NAME=moyo_db
DB_USER=moyo_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend
```bash
VITE_API_URL=https://api.yourdomain.com
```

---

## Troubleshooting

### Backend won't start
- Check logs: `railway logs` or `journalctl -u moyo`
- Verify environment variables
- Check database connection
- Ensure migrations are run

### CORS errors
- Update `CORS_ALLOWED_ORIGINS` in Django settings
- Include your frontend domain

### Static files not loading
- Run `python manage.py collectstatic`
- Check STATIC_ROOT and STATIC_URL settings
- Verify Nginx/Whitenoise configuration

### Database connection errors
- Verify database credentials
- Check firewall rules
- Ensure database is accessible

---

## Quick Start Commands

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Render
```bash
# Use Render Dashboard or GitHub integration
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## Cost Estimates

- **Railway**: Free tier (limited), then ~$5-20/month
- **Render**: Free tier available, then ~$7/month per service
- **Vercel**: Free tier (generous), then ~$20/month
- **DigitalOcean**: ~$5-12/month for basic setup
- **VPS**: ~$5-20/month depending on provider

---

## Recommended Setup for Production

1. **Frontend**: Vercel (free tier is excellent)
2. **Backend**: Railway or Render
3. **Database**: Managed PostgreSQL (Railway/Render)
4. **Domain**: Namecheap, Google Domains, etc.
5. **SSL**: Automatic (Let's Encrypt via platform)

This gives you:
- ✅ Free/cheap hosting
- ✅ Automatic SSL
- ✅ Easy deployments
- ✅ Good performance
- ✅ Scalability

---

## Need Help?

- Check platform-specific documentation
- Review Django deployment docs
- Check React/Vite deployment docs
- Review error logs carefully

