# Dockerfile Path for Railway ❤️

## Dockerfile Location

The Dockerfile is in the **root directory** of your repository.

## Path to Enter in Railway

In Railway Settings → Build → Dockerfile Path, enter:

```
Dockerfile
```

Or if Railway requires a relative path:

```
./Dockerfile
```

## Full Path Structure

```
itaku/ (repository root)
├── Dockerfile          ← Here!
├── backend/
│   ├── requirements.txt
│   ├── manage.py
│   └── ...
├── frontend/
└── railway.toml
```

## Railway Settings

1. **Dockerfile Path**: `Dockerfile` (or `./Dockerfile`)
2. **Builder**: Metal or Dockerfile
3. Save

That's it! Railway will use the Dockerfile from the root.

