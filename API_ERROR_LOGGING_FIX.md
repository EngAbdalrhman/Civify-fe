# API Error Logging & Production Debugging Fix

**Date:** 2025-10-11  
**Status:** ✅ **FIXED - Ready for Testing**

---

## 🔧 Changes Made

### 1. Fixed API Usage Logging (Critical Fix)

**File:** `src/lib/services/appwrite-server-database.ts`

**Problem:** Failed API requests were counting against user's monthly limit

**Solution:** Only increment `apiUsageCount` when `success: true`

```typescript
// Only increment API usage count for successful requests
if (log.success) {
  // Update user's API usage count
  const currentMonth = new Date().toISOString().substring(0, 7);
  // ... increment logic ...
}
// If success is false, we still log the error but don't increment the counter
```

**Impact:**
- ✅ Failed requests are logged in `api_usage_logs` collection
- ✅ Failed requests do NOT count against the 500/month limit
- ✅ Users only pay for successful API calls

---

### 2. Enhanced Error Logging

**Files:**
- `src/app/api/cv/generate-tailored/route.ts`
- `src/app/api/cv/generate-masked/route.ts`

**Added:**
```typescript
console.error("Error generating tailored CV:", error);
console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
```

**Benefits:**
- Full stack traces logged to server console
- Easier debugging in production
- Better error tracking

---

### 3. Environment-Aware Error Messages

**Development Mode:**
```json
{
  "success": false,
  "error": "Failed to generate tailored CV: GEMINI_API_KEY not found"
}
```

**Production Mode:**
```json
{
  "success": false,
  "error": "Failed to generate tailored CV"
}
```

**Code:**
```typescript
const isDevelopment = process.env.NODE_ENV === "development";

return createErrorResponse(
  isDevelopment 
    ? `Failed to generate tailored CV: ${errorMessage}` 
    : "Failed to generate tailored CV",
  500
);
```

---

## 🐛 Production 500 Error - Debugging Guide

### Possible Causes

#### 1. **Missing Environment Variables** (Most Likely)

**Required Variables:**
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
# OR
GOOGLE_API_KEY=your_google_api_key_here

# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_appwrite_api_key  # For server-side operations

# Firebase (for auth)
# ... your firebase config ...
```

**Check in Netlify:**
1. Go to Site Settings → Environment Variables
2. Verify all variables are set
3. Make sure there are no extra spaces or quotes
4. Redeploy after adding/updating variables

---

#### 2. **Genkit AI Not Working in Serverless**

**Issue:** Genkit might not work properly in Netlify's serverless functions

**Solution:** The AI flows should work, but check:
- Gemini API key is valid
- API key has proper permissions
- No rate limiting from Google

**Test Locally First:**
```bash
npm run dev
# Test with your test.py script against localhost:9002
```

---

#### 3. **PDF Libraries Not Working**

**Issue:** `pdf-parse` or `jspdf` might not work in serverless environment

**Check:**
- Canvas dependencies (jsPDF might need canvas)
- Binary dependencies (pdf-parse uses native modules)

**Netlify Build Settings:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["canvas", "pdf-parse"]
```

---

#### 4. **Appwrite Connection Issues**

**Check:**
- Appwrite endpoint is accessible from Netlify
- API key has proper permissions
- Database/collection IDs are correct

---

## 🔍 How to Debug Production Error

### Step 1: Check Netlify Function Logs

1. Go to Netlify Dashboard
2. Click on your site
3. Go to **Functions** tab
4. Look for recent invocations
5. Check the logs for error messages

**Look for:**
- `Error generating tailored CV:`
- `Error stack:`
- Any environment variable warnings

---

### Step 2: Add Diagnostic Endpoint

Create a test endpoint to check environment:

**File:** `src/app/api/health/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasGoogleKey: !!process.env.GOOGLE_API_KEY,
      hasAppwriteEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      hasAppwriteProject: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      nodeEnv: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
```

**Test:**
```bash
curl https://cvupper.netlify.app/api/health
```

---

### Step 3: Test with Minimal Payload

**Simplify test.py:**
```python
import requests

url = "https://cvupper.netlify.app/api/cv/generate-tailored"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"
}
payload = {
    "cv": "John Doe\nSoftware Engineer\n5 years experience",
    "jobDescription": "Looking for a software engineer",
    "masked": False,
    "isPdf": False
}

response = requests.post(url, json=payload, headers=headers)
print("Status:", response.status_code)
print("Response:", response.text)
```

---

### Step 4: Check API Usage Logs

Even though the request failed, it should be logged:

**Query Appwrite:**
```javascript
// In Appwrite console, check api_usage_logs collection
// Filter by: success = false
// Look at errorMessage field
```

---

## 📋 Netlify Configuration

### Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"
  # Exclude native modules from bundling
  external_node_modules = ["canvas", "pdf-parse", "sharp"]
```

---

## 🧪 Testing Checklist

### Local Testing
- ✅ Test with `npm run dev`
- ✅ Run `test.py` against localhost:9002
- ✅ Verify PDF generation works
- ✅ Check console for errors

### Production Testing
- ⏳ Deploy to Netlify
- ⏳ Test `/api/health` endpoint
- ⏳ Run `test.py` against production URL
- ⏳ Check Netlify function logs
- ⏳ Verify API usage logging in Appwrite

---

## 🔑 Environment Variables Checklist

**Netlify Dashboard → Site Settings → Environment Variables:**

```
✅ GEMINI_API_KEY = AIza...
✅ NEXT_PUBLIC_APPWRITE_ENDPOINT = https://cloud.appwrite.io/v1
✅ NEXT_PUBLIC_APPWRITE_PROJECT_ID = 67...
✅ APPWRITE_API_KEY = standard_...
✅ NEXT_PUBLIC_APPWRITE_DATABASE_ID = hicv_database
✅ NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID = users
✅ NEXT_PUBLIC_APPWRITE_API_KEYS_COLLECTION_ID = api_keys
✅ NEXT_PUBLIC_APPWRITE_API_USAGE_LOGS_COLLECTION_ID = api_usage_logs
```

**Important:** After adding/updating environment variables, you MUST redeploy!

---

## 🚨 Common Netlify Issues

### Issue 1: Function Timeout
**Error:** Function execution timed out
**Solution:** Increase timeout in `netlify.toml`:
```toml
[functions]
  timeout = 60  # seconds (default is 10)
```

### Issue 2: Function Size Limit
**Error:** Function size exceeds limit
**Solution:** Optimize dependencies or use external modules

### Issue 3: Cold Start
**Error:** First request is slow/fails
**Solution:** This is normal for serverless, retry the request

---

## 📊 What Gets Logged

### Successful Request
```javascript
{
  users: "user_id",
  endpoint: "/api/cv/generate-tailored",
  timestamp: "2025-10-11T20:30:00.000Z",
  success: true,
  errorMessage: null
}
// apiUsageCount incremented ✅
```

### Failed Request
```javascript
{
  users: "user_id",
  endpoint: "/api/cv/generate-tailored",
  timestamp: "2025-10-11T20:30:00.000Z",
  success: false,
  errorMessage: "GEMINI_API_KEY not found"
}
// apiUsageCount NOT incremented ✅
```

---

## 🎯 Next Steps

1. **Create health check endpoint** (see Step 2 above)
2. **Test health endpoint** to verify environment variables
3. **Check Netlify function logs** for actual error
4. **Create `netlify.toml`** if not exists
5. **Redeploy** after any environment variable changes
6. **Test with minimal payload** first
7. **Check Appwrite logs** for error messages

---

## 📝 Files Modified

- ✅ `src/lib/services/appwrite-server-database.ts` - Fixed usage counting
- ✅ `src/app/api/cv/generate-tailored/route.ts` - Enhanced error logging
- ✅ `src/app/api/cv/generate-masked/route.ts` - Enhanced error logging

---

**Status:** ✅ **READY FOR PRODUCTION TESTING**  
**Last Updated:** 2025-10-11

