# Add CORS to Railway NOW! 🚀

## Your Vercel URL
**`https://heart-monitor-7mfy9y7nm-careys-projects-42fe5375.vercel.app`**

## Step-by-Step Instructions

### 1. Go to Railway
1. Open your Railway dashboard
2. Click on your backend service (heart_monitor)
3. Click the **"Variables"** tab

### 2. Add CORS Variable
1. Click **"+ New Variable"**
2. Enter:
   - **Name**: `CORS_ALLOWED_ORIGINS`
   - **Value**: `https://heart-monitor-7mfy9y7nm-careys-projects-42fe5375.vercel.app`
3. Click **"Add"**

### 3. Wait for Redeploy
- Railway will automatically redeploy with the new CORS setting
- This usually takes 1-2 minutes

### 4. Test Again
- After redeploy, try registering/logging in again
- CORS errors should be gone!

---

## Alternative: Allow All Origins (Temporary)

If you want to test quickly, you can temporarily allow all origins:

**Variable Name**: `CORS_ALLOW_ALL_ORIGINS`  
**Variable Value**: `True`

⚠️ **Note**: This is less secure. Use the specific origin above for production.

---

## After Adding CORS

Once you add the CORS variable, Railway will:
1. ✅ Automatically redeploy
2. ✅ Include the Vercel URL in CORS headers
3. ✅ Allow your frontend to make API calls

**The CORS variable is already configured in your Django settings**, so you just need to add it in Railway!

