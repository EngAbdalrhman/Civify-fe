# Production Deployment & Debugging Guide

**Date:** 2025-10-11  
**Status:** 🔧 **DEBUGGING IN PROGRESS**

---

## ✅ What Was Fixed

### 1. API Usage Logging
- ✅ Failed requests no longer count against user's 500/month limit
- ✅ All requests (success and failure) are logged to `api_usage_logs`
- ✅ Only successful requests increment `apiUsageCount`

### 2. Error Logging
- ✅ Full stack traces logged to console
- ✅ Detailed error messages in development
- ✅ Generic error messages in production (security)

### 3. New Debugging Tools
- ✅ Health check endpoint: `/api/health`
- ✅ Production debug script: `test-production-debug.py`
- ✅ Netlify configuration: `netlify.toml`

---

## 🚀 Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Fix API error logging and add production debugging tools"
git push origin main
```

### Step 2: Configure Netlify Environment Variables

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

**Required Variables:**

```bash
# AI/Gemini
GEMINI_API_KEY=AIza...your_key_here

# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=67...your_project_id
APPWRITE_API_KEY=standard_...your_api_key
NEXT_PUBLIC_APPWRITE_DATABASE_ID=hicv_database
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID=api_keys
NEXT_PUBLIC_APPWRITE_API_USAGE_LOGS_COLLECTION_ID=api_usage_logs
NEXT_PUBLIC_APPWRITE_CVS_COLLECTION_ID=cvs
NEXT_PUBLIC_APPWRITE_LOGS_COLLECTION_ID=logs

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase config
```

**Important:** After adding/updating variables, click **"Trigger deploy"** to redeploy!

### Step 3: Deploy

Netlify will automatically deploy when you push to main, or you can manually trigger:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (~2-5 minutes)

### Step 4: Test Health Endpoint

```bash
curl https://cvupper.netlify.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T...",
  "environment": {
    "nodeEnv": "production",
    "hasGeminiKey": true,
    "hasGoogleKey": false,
    "hasAppwriteEndpoint": true,
    "hasAppwriteProject": true,
    "hasAppwriteApiKey": true,
    ...
  },
  "runtime": {
    "platform": "linux",
    "nodeVersion": "v20.x.x",
    "arch": "x64"
  }
}
```

**Check:** All `has*` values should be `true` (except `hasGoogleKey` if you're using `GEMINI_API_KEY`)

### Step 5: Run Debug Script

```bash
python test-production-debug.py
```

This will test:
1. Health check endpoint
2. Masked CV generation
3. Tailored CV generation

---

## 🐛 Debugging 500 Errors

### Check 1: Netlify Function Logs

1. Go to **Netlify Dashboard**
2. Click on your site
3. Go to **Functions** tab
4. Look for recent invocations
5. Click on a failed function to see logs

**Look for:**
- `Error generating tailored CV:`
- `Error stack:`
- Environment variable warnings
- Gemini API errors

### Check 2: Environment Variables

Run health check and verify all variables are set:

```bash
curl https://cvupper.netlify.app/api/health | jq '.environment'
```

All values should be `true`.

### Check 3: Appwrite Logs

1. Go to Appwrite Console
2. Open `api_usage_logs` collection
3. Filter by `success = false`
4. Check `errorMessage` field for details

### Check 4: Test Locally First

```bash
# Start local server
npm run dev

# Test against localhost
python test-production-debug.py
# (Edit BASE_URL to http://localhost:9002)
```

If it works locally but not in production, it's likely an environment issue.

---

## 🔍 Common Production Issues

### Issue 1: GEMINI_API_KEY Not Found

**Symptoms:**
- 500 error
- Logs show: "GEMINI_API_KEY or GOOGLE_API_KEY environment variable not found"

**Solution:**
1. Add `GEMINI_API_KEY` to Netlify environment variables
2. Redeploy the site
3. Test health endpoint to verify

### Issue 2: Appwrite Connection Failed

**Symptoms:**
- 500 error
- Logs show Appwrite connection errors

**Solution:**
1. Verify Appwrite endpoint is accessible
2. Check API key has proper permissions
3. Verify database/collection IDs are correct

### Issue 3: Function Timeout

**Symptoms:**
- 504 Gateway Timeout
- Function takes too long

**Solution:**
Already configured in `netlify.toml`:
```toml
[functions]
  timeout = 60  # 60 seconds
```

If still timing out, the AI processing might be too slow. Consider:
- Using a faster Gemini model
- Reducing CV/job description length
- Optimizing AI prompts

### Issue 4: PDF Generation Failed

**Symptoms:**
- 500 error
- Logs show jsPDF or pdf-parse errors

**Solution:**
Already configured in `netlify.toml`:
```toml
[functions]
  external_node_modules = ["canvas", "pdf-parse", "sharp"]
```

If still failing, might need to use a different PDF library.

---

## 📊 Monitoring

### Check API Usage

**Appwrite Console:**
1. Go to `api_usage_logs` collection
2. View recent logs
3. Check success rate

**Query Example:**
```javascript
// Get failed requests in last hour
timestamp > "2025-10-11T19:00:00.000Z" AND success = false
```

### Check User Limits

**Appwrite Console:**
1. Go to `users` collection
2. Find user by ID
3. Check `apiUsageCount` and `apiUsageMonth`

**Verify:**
- Failed requests don't increment count ✅
- Successful requests do increment count ✅

---

## 🧪 Testing Checklist

### Before Deployment
- ✅ All environment variables set in Netlify
- ✅ `netlify.toml` committed to repo
- ✅ Health endpoint created
- ✅ Code tested locally

### After Deployment
- ⏳ Health endpoint returns 200
- ⏳ All environment checks pass
- ⏳ Masked CV endpoint works
- ⏳ Tailored CV endpoint works
- ⏳ Failed requests logged correctly
- ⏳ Failed requests don't count against limit

---

## 📝 Files Created/Modified

### New Files
- ✅ `src/app/api/health/route.ts` - Health check endpoint
- ✅ `netlify.toml` - Netlify configuration
- ✅ `test-production-debug.py` - Production debugging script
- ✅ `API_ERROR_LOGGING_FIX.md` - Detailed fix documentation
- ✅ `PRODUCTION_DEPLOYMENT_GUIDE.md` - This file

### Modified Files
- ✅ `src/lib/services/appwrite-server-database.ts` - Fixed usage counting
- ✅ `src/app/api/cv/generate-tailored/route.ts` - Enhanced error logging
- ✅ `src/app/api/cv/generate-masked/route.ts` - Enhanced error logging

---

## 🎯 Next Steps

1. **Deploy to Netlify**
   ```bash
   git push origin main
   ```

2. **Test Health Endpoint**
   ```bash
   curl https://cvupper.netlify.app/api/health
   ```

3. **Run Debug Script**
   ```bash
   python test-production-debug.py
   ```

4. **Check Netlify Logs**
   - If tests fail, check function logs for errors

5. **Fix Issues**
   - Based on error messages, fix environment variables or code
   - Redeploy and test again

6. **Verify API Usage Logging**
   - Check Appwrite `api_usage_logs` collection
   - Verify failed requests are logged
   - Verify failed requests don't increment counter

---

## 📞 Support

If you're still getting 500 errors after following this guide:

1. **Share the output of:**
   ```bash
   curl https://cvupper.netlify.app/api/health
   python test-production-debug.py
   ```

2. **Share Netlify function logs:**
   - Screenshot or copy the error from Netlify Functions tab

3. **Share Appwrite logs:**
   - Check `api_usage_logs` for `errorMessage`

---

**Status:** 🔧 **READY FOR DEPLOYMENT & TESTING**  
**Last Updated:** 2025-10-11

