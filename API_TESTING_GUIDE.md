# API Testing Guide - Local & Production

## Issue Fixed ✅

**Problem:** API documentation showed `https://your-domain.com/` instead of actual domain.

**Solution:** Updated API docs to dynamically show the correct URL:
- **Local:** `http://localhost:3000`
- **Production:** `https://cvupper.netlify.app`

---

## Testing API Locally

### 1. Start Local Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

---

### 2. Get Your API Key

1. Login to your app at `http://localhost:3000`
2. Go to **Dashboard → API Keys**
3. Click **"Generate New API Key"**
4. Copy the key (starts with `hicv_live_...`)

**Important:** The API key is shown only once! Save it securely.

---

### 3. Test API Endpoints

#### A. Test Generate Masked CV (Text-based)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/cv/generate-masked \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hicv_live_YOUR_API_KEY_HERE" \
  -d '{
    "cv": "John Doe\nEmail: john@example.com\nPhone: +1234567890\nSoftware Engineer with 5 years experience..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "pdf": "JVBERi0xLjQKJeLjz9MK...",
  "message": "Masked CV generated successfully"
}
```

---

#### B. Test Generate Masked PDF (PDF-based)

**Using cURL:**
```bash
# First, convert your PDF to base64
base64 -i your-cv.pdf -o cv-base64.txt

# Then send the request
curl -X POST http://localhost:3000/api/cv/generate-masked-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hicv_live_YOUR_API_KEY_HERE" \
  -d '{
    "cvPdf": "'"$(cat cv-base64.txt)"'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "maskedPdf": "JVBERi0xLjQKJeLjz9MK...",
  "message": "CV masked successfully"
}
```

---

#### C. Test Generate Tailored CV (AI-powered)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/cv/generate-tailored \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hicv_live_YOUR_API_KEY_HERE" \
  -d '{
    "cv": "John Doe\nEmail: john@example.com\nSoftware Engineer...",
    "jobDescription": "We are looking for a Senior Software Engineer with React and Node.js experience...",
    "masked": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "pdf": "JVBERi0xLjQKJeLjz9MK...",
  "message": "Tailored CV generated successfully"
}
```

---

### 4. Using JavaScript/Fetch

```javascript
const apiKey = "hicv_live_YOUR_API_KEY_HERE";
const apiBaseUrl = "http://localhost:3000"; // or https://cvupper.netlify.app

async function testMaskedCV() {
  const response = await fetch(`${apiBaseUrl}/api/cv/generate-masked`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      cv: 'John Doe\nEmail: john@example.com\nPhone: +1234567890\n...'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Download the PDF
    const pdfBlob = await fetch(`data:application/pdf;base64,${data.pdf}`).then(r => r.blob());
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'masked-cv.pdf';
    a.click();
  } else {
    console.error('Error:', data.error);
  }
}

testMaskedCV();
```

---

### 5. Using Python

```python
import requests
import base64

api_key = "hicv_live_YOUR_API_KEY_HERE"
api_base_url = "http://localhost:3000"  # or https://cvupper.netlify.app

# Test Generate Masked CV
url = f"{api_base_url}/api/cv/generate-masked"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}
payload = {
    "cv": "John Doe\nEmail: john@example.com\nPhone: +1234567890\n..."
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

if data.get('success'):
    # Save the PDF
    pdf_bytes = base64.b64decode(data['pdf'])
    with open('masked-cv.pdf', 'wb') as f:
        f.write(pdf_bytes)
    print("PDF saved successfully!")
else:
    print("Error:", data.get('error'))
```

---

## Testing on Production

### Production URL: `https://cvupper.netlify.app`

Simply replace `http://localhost:3000` with `https://cvupper.netlify.app` in all examples above.

**Example:**
```bash
curl -X POST https://cvupper.netlify.app/api/cv/generate-masked \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hicv_live_YOUR_API_KEY_HERE" \
  -d '{
    "cv": "John Doe\nEmail: john@example.com\nPhone: +1234567890\n..."
  }'
```

---

## Common Errors & Solutions

### 1. 404 Not Found

**Problem:** API endpoint not found.

**Solutions:**
- ✅ Make sure dev server is running (`npm run dev`)
- ✅ Check the URL is correct: `http://localhost:3000/api/cv/generate-masked`
- ✅ Verify the endpoint path (no typos)

---

### 2. 401 Unauthorized

**Problem:** Invalid or missing API key.

**Solutions:**
- ✅ Check API key format: must start with `hicv_live_`
- ✅ Verify API key is active (check in Dashboard → API Keys)
- ✅ Make sure Authorization header is correct: `Bearer hicv_live_...`

---

### 3. 403 Forbidden

**Problem:** User not licensed.

**Solutions:**
- ✅ Activate a license key in Dashboard → Activate License
- ✅ Contact admin to grant you a license

---

### 4. 429 Too Many Requests

**Problem:** API rate limit exceeded.

**Solutions:**
- ✅ Check your usage in Dashboard
- ✅ Default limit: 500 calls/month
- ✅ Contact admin to increase your limit

---

### 5. 500 Internal Server Error

**Problem:** Server error.

**Solutions:**
- ✅ Check server logs in terminal
- ✅ Verify all environment variables are set
- ✅ Check Appwrite connection

---

## Viewing API Documentation in App

1. Login to the app
2. Go to **Dashboard → API Keys**
3. Click **"View API Documentation"** button
4. You'll see:
   - ✅ Current API Base URL (auto-detected)
   - ✅ All 3 API endpoints with examples
   - ✅ Code examples in cURL, JavaScript, and Python

---

## Rate Limits

### Default Limits:
- **API Calls:** 500 per month
- **CVs:** 3 per user

### Custom Limits:
Admins can set custom limits per user in **Admin Dashboard**:
- **CV Limits** tab - Set custom CV storage limits
- **API Rate Limits** tab - Set custom API call limits

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cv/generate-masked` | POST | Generate masked CV from text |
| `/api/cv/generate-masked-pdf` | POST | Generate masked CV from PDF |
| `/api/cv/generate-tailored` | POST | Generate AI-tailored CV |

---

## Example: Complete Test Flow

```bash
# 1. Start local server
npm run dev

# 2. Get API key from dashboard
# Login → Dashboard → API Keys → Generate New API Key

# 3. Test the API
curl -X POST http://localhost:3000/api/cv/generate-masked \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5" \
  -d '{
    "cv": "John Doe\nEmail: john@example.com\nPhone: +1234567890\nSoftware Engineer with 5 years of experience in React, Node.js, and TypeScript."
  }' \
  | jq '.success'

# Expected output: true
```

---

## Troubleshooting Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] User is logged in
- [ ] User has activated a license
- [ ] API key is generated and copied correctly
- [ ] API key starts with `hicv_live_`
- [ ] Authorization header is included
- [ ] Content-Type is `application/json`
- [ ] Request body is valid JSON
- [ ] API endpoint URL is correct
- [ ] Not exceeded rate limit (500 calls/month)

---

**Last Updated:** 2025-10-11  
**Status:** ✅ API documentation fixed and ready for testing

