# API Endpoint Fix - Generate Masked CV

## Issue Found ✅

**Problem:** The `/api/cv/generate-masked` endpoint was **missing**!

The API documentation referenced this endpoint, but it didn't exist in the codebase. Only these endpoints existed:
- ✅ `/api/cv/generate-masked-pdf` - Existed
- ✅ `/api/cv/generate-tailored` - Existed
- ❌ `/api/cv/generate-masked` - **MISSING!**

---

## Solution ✅

**Created:** `src/app/api/cv/generate-masked/route.ts`

This endpoint:
1. Accepts CV text in JSON format
2. Masks personal information (email, phone, LinkedIn, GitHub, etc.)
3. Generates a PDF with masked content
4. Returns base64-encoded PDF
5. Logs API usage to Appwrite
6. Respects API rate limits

---

## How to Test

### Step 1: Restart Dev Server

**IMPORTANT:** You must restart the dev server to pick up the new API route!

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

### Step 2: Run the Test Script

I've created a PowerShell test script for you:

```powershell
.\test-api.ps1
```

This will:
- ✅ Test the `/api/cv/generate-masked` endpoint
- ✅ Test the `/api/cv/generate-tailored` endpoint
- ✅ Save generated PDFs to files
- ✅ Show success/error messages

---

### Step 3: Manual Testing with PowerShell

If you prefer to test manually:

```powershell
# Set variables
$apiKey = "hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"
$baseUrl = "http://localhost:9002"

# Create headers
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $apiKey"
}

# Create request body
$body = @{
    cv = "John Doe`nEmail: john@example.com`nPhone: +1234567890`nSoftware Engineer with 5 years experience"
} | ConvertTo-Json

# Send request
$response = Invoke-RestMethod -Uri "$baseUrl/api/cv/generate-masked" -Method POST -Headers $headers -Body $body

# Check response
if ($response.success) {
    Write-Host "✅ Success! PDF generated"
    
    # Save PDF
    $pdfBytes = [Convert]::FromBase64String($response.pdf)
    [IO.File]::WriteAllBytes("masked-cv.pdf", $pdfBytes)
    Write-Host "📄 PDF saved to: masked-cv.pdf"
} else {
    Write-Host "❌ Error: $($response.error)"
}
```

---

## API Endpoint Details

### POST /api/cv/generate-masked

**Description:** Generate a masked CV from text input

**Request:**
```json
{
  "cv": "John Doe\nEmail: john@example.com\nPhone: +1234567890\n..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "pdf": "JVBERi0xLjQKJeLjz9MK...",
  "message": "Masked CV generated successfully"
}
```

**Response (Error):**
```json
{
  "error": "Error message here",
  "details": "Detailed error information"
}
```

---

## What Gets Masked

The endpoint masks the following personal information:

1. **Email addresses** → `[EMAIL REDACTED]`
2. **Phone numbers** → `[PHONE REDACTED]`
3. **LinkedIn URLs** → `[LINKEDIN REDACTED]`
4. **GitHub URLs** → `[GITHUB REDACTED]`
5. **Personal websites** → `[WEBSITE REDACTED]`
6. **Street addresses** → `[ADDRESS REDACTED]`
7. **Dates of birth** → `[DOB REDACTED]`
8. **Social Security Numbers** → `[SSN REDACTED]`

---

## Testing Checklist

Before testing, make sure:

- [ ] Dev server is restarted (`npm run dev`)
- [ ] Server is running on `http://localhost:9002`
- [ ] You have a valid API key
- [ ] User is licensed (has activated a license)
- [ ] API rate limit not exceeded (500 calls/month)

---

## Common Errors

### 1. 404 Not Found

**Cause:** Server not restarted after adding new route

**Solution:**
```powershell
# Stop server (Ctrl+C)
npm run dev
```

---

### 2. 401 Unauthorized

**Cause:** Invalid or missing API key

**Solution:**
- Check API key format: `hicv_live_...`
- Verify API key is active in Dashboard → API Keys
- Make sure Authorization header is correct

---

### 3. 403 Forbidden

**Cause:** User not licensed

**Solution:**
- Go to Dashboard → Activate License
- Enter a license key
- Or ask admin to grant you a license

---

### 4. 429 Too Many Requests

**Cause:** API rate limit exceeded

**Solution:**
- Check usage in Dashboard
- Default limit: 500 calls/month
- Ask admin to increase limit in Admin Dashboard → API Rate Limits

---

### 5. 500 Internal Server Error

**Cause:** Server error (check logs)

**Solution:**
- Check terminal for error messages
- Verify Appwrite connection
- Check environment variables

---

## All 3 API Endpoints

Now all 3 endpoints are available:

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `/api/cv/generate-masked` | CV text | Masked PDF | Mask personal info in text |
| `/api/cv/generate-masked-pdf` | PDF (base64) | Masked PDF | Mask personal info in PDF |
| `/api/cv/generate-tailored` | CV + Job Description | Tailored PDF | AI-optimize CV for job |

---

## Example: Complete Test Flow

```powershell
# 1. Restart server
npm run dev

# 2. Wait for server to start
# Look for: "✓ Ready in XXXXms"

# 3. Run test script
.\test-api.ps1

# 4. Check results
# - Should see "✅ SUCCESS!" messages
# - PDFs should be saved to current directory
# - Open PDFs to verify masking worked
```

---

## Verifying the Fix

After restarting the server, you should see:

1. **No 404 errors** when calling `/api/cv/generate-masked`
2. **200 OK response** with success message
3. **PDF file generated** with masked content
4. **API usage logged** in Appwrite database

---

## Files Created/Modified

### Created:
1. ✅ `src/app/api/cv/generate-masked/route.ts` - New API endpoint
2. ✅ `test-api.ps1` - PowerShell test script
3. ✅ `API_ENDPOINT_FIX.md` - This documentation

### Modified:
1. ✅ `src/app/dashboard/api-docs/page.tsx` - Dynamic URL detection

---

## Next Steps

1. **Restart dev server** (IMPORTANT!)
2. **Run test script:** `.\test-api.ps1`
3. **Check generated PDFs** to verify masking
4. **Test in production** at `https://cvupper.netlify.app`

---

## Production Deployment

When deploying to production:

1. The new endpoint will be automatically deployed
2. Update API docs will show production URL
3. Test with production API key
4. Verify rate limiting works

---

**Status:** ✅ API endpoint created and ready to test  
**Last Updated:** 2025-10-11  
**Action Required:** Restart dev server and run test script

