# Common Django Commands for Itaku Backend

## Important: Always Activate Virtual Environment First!

Before running any Django commands, you must activate the virtual environment:

```bash
cd /Users/okal/Desktop/itaku/backend
source venv/bin/activate
```

You'll know it's activated when you see `(venv)` at the start of your terminal prompt.

## Quick Start Commands

### Using Helper Scripts (Easiest)

```bash
# Start the server
./start_server.sh

# Run any Django command
./run.sh python manage.py [command]
```

### Manual Commands

```bash
# 1. Navigate to backend directory
cd /Users/okal/Desktop/itaku/backend

# 2. Activate virtual environment
source venv/bin/activate

# 3. Run your command
python manage.py [command]
```

## Common Commands

### Start Development Server
```bash
source venv/bin/activate
python manage.py runserver
```
Server runs at: http://localhost:8000

### Create Migrations
```bash
source venv/bin/activate
python manage.py makemigrations
```

### Apply Migrations
```bash
source venv/bin/activate
python manage.py migrate
```

### Create Superuser (Admin)
```bash
source venv/bin/activate
python manage.py createsuperuser
```

### Access Django Shell
```bash
source venv/bin/activate
python manage.py shell
```

### Check Database
```bash
source venv/bin/activate
python manage.py dbshell
```

## Troubleshooting

### "Couldn't import Django" Error
**Solution**: You forgot to activate the virtual environment!
```bash
source venv/bin/activate
```

### Virtual Environment Not Found
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database Connection Error
Check your `.env` file has correct database credentials:
```bash
cat .env
```

### Port Already in Use
If port 8000 is busy, use a different port:
```bash
python manage.py runserver 8001
```

## Tips

1. **Always activate venv first** - This is the #1 cause of errors!
2. **Keep terminal open** - Don't close the terminal where venv is activated
3. **Use helper scripts** - The `start_server.sh` script handles activation automatically
4. **Check your prompt** - You should see `(venv)` when it's activated

