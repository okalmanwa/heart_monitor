# Force Railway to Use Dockerfile ❤️

Railway is still using Nixpacks. Here's how to force it to use Dockerfile:

## Step-by-Step Instructions

### 1. Go to Railway Settings

1. Open your Railway project: https://railway.app
2. Click on your **service** (heart_monitor)
3. Click **"Settings"** tab

### 2. Change Builder to Dockerfile

1. Scroll down to **"Build"** section
2. Find **"Builder"** dropdown (it probably says "Nixpacks" or "Nix-based builder")
3. Click the dropdown
4. Select **"Dockerfile"** (or "Docker" if that's the option)
5. **Save** the settings

### 3. Alternative: Use Metal Builder

If "Dockerfile" isn't available, try:
1. Select **"Metal"** (Beta) from the Builder dropdown
2. Metal will automatically use the Dockerfile
3. Save

### 4. Redeploy

After changing the builder:
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** or wait for auto-deploy
3. Watch the build logs - you should see Docker building instead of Nixpacks

---

## What You Should See

After switching to Dockerfile, the build logs should show:
```
Step 1/8 : FROM python:3.9-slim
Step 2/8 : WORKDIR /app
...
```

Instead of:
```
Using Nixpacks
...
nix-env -if .nixpacks/...
```

---

## If Builder Dropdown Doesn't Show Dockerfile

1. Make sure `Dockerfile` is in the root of your repository (it is ✅)
2. Make sure you've pushed the latest changes (you have ✅)
3. Try disconnecting and reconnecting the GitHub repo
4. Or contact Railway support

---

## Quick Fix Command (if you have Railway CLI)

```bash
railway service update --builder dockerfile
```

But the easiest is to change it in the UI!

---

## Still Having Issues?

If Railway still won't use Dockerfile:
1. Check that Dockerfile exists in root (it does ✅)
2. Verify railway.toml has `builder = "DOCKERFILE"` (it does ✅)
3. Try deleting the service and recreating it
4. Or use Railway's Metal builder (newer, faster)

