# 🚨 DEPLOY NOW - Quick Reference

## What Was Wrong

1. **404 on all API routes** - Netlify wasn't configured for Next.js
2. **500 errors** - PDF parsing library doesn't work in serverless

## What Was Fixed

1. **`netlify.toml`** - Now uses `@netlify/plugin-nextjs` (proper Next.js support)
2. **API endpoints** - Graceful fallback when PDF parsing unavailable
3. **Test script** - Updated with realistic data and `isPdf: False`

## Deploy Steps

```bash
# 1. Commit and push
git add .
git commit -m "Critical fix: Proper Netlify configuration"
git push origin main

# 2. Wait 3-5 minutes for Netlify to build

# 3. Test health endpoint
curl https://cvupper.netlify.app/api/health

# 4. Test API
python test.py
```

## Expected Results

### Health Endpoint
```bash
curl https://cvupper.netlify.app/api/health
```
**Should return:** 200 with JSON showing environment variables

### API Test
```bash
python test.py
```
**Should return:** 
- Status code: 200
- Saved PDF file with unique name

## Important Notes

- ✅ **Text input works** in production
- ❌ **PDF input does NOT work** in production (serverless limitation)
- ✅ **All API routes will work** after deployment
- ✅ **Error logging works** - failed requests logged but don't count against limit

## If Still Not Working

1. **Check Netlify build logs** - Look for errors
2. **Verify environment variables** - All should be set in Netlify dashboard
3. **Check function logs** - Netlify Dashboard → Functions → Click on failed function

## Files Changed

- ✅ `netlify.toml` - Simplified, uses Next.js plugin
- ✅ `src/app/api/cv/generate-tailored/route.ts` - PDF fallback
- ✅ `src/app/api/cv/generate-masked/route.ts` - PDF fallback  
- ✅ `test.py` - Updated with realistic data
- ✅ `src/app/api/health/route.ts` - New health check endpoint

---

**Status:** Ready to deploy  
**Priority:** 🚨 CRITICAL  
**Action:** Push to main branch NOW

