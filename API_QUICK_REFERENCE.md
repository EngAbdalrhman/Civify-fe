# HICv API - Quick Reference Guide

## 🚀 Quick Start

### Base URL

```
Local:      http://localhost:9002
Production: https://cvupper.netlify.app
```

### Authentication

```bash
Authorization: Bearer YOUR_API_KEY
```

---

## 📌 Endpoints

### 1. Mask Personal Information

**Endpoint:** `POST /api/cv/generate-masked`

**Request:**

```json
{
  "cv": "Your CV text or base64-encoded PDF",
  "isPdf": false
}
```

**Response:**

```json
{
  "success": true,
  "pdf": "base64-encoded-masked-pdf",
  "filename": "masked-cv-20251011-202336-bhx0jw.pdf",
  "message": "Masked CV generated successfully"
}
```

**Note:** The `filename` field contains a unique filename with timestamp and random ID to prevent file collisions.

**PowerShell Example:**

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_API_KEY"
}

$body = @{
    cv = "John Doe`nEmail: john@example.com`nPhone: 555-1234"
    isPdf = $false
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:9002/api/cv/generate-masked" -Method POST -Headers $headers -Body $body

# Save PDF with unique filename
$pdfBytes = [Convert]::FromBase64String($response.pdf)
$filename = $response.filename  # e.g., "masked-cv-20251011-202336-bhx0jw.pdf"
[IO.File]::WriteAllBytes($filename, $pdfBytes)
Write-Host "Saved to: $filename"
```

**cURL Example:**

```bash
curl -X POST http://localhost:9002/api/cv/generate-masked \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "cv": "Your CV text here...",
    "isPdf": false
  }'
```

---

### 2. AI-Tailor CV to Job Description

**Endpoint:** `POST /api/cv/generate-tailored`

**Request:**

```json
{
  "cv": "Your CV text or base64-encoded PDF",
  "jobDescription": "Job description text",
  "masked": false,
  "isPdf": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pdf": "base64-encoded-tailored-pdf",
    "filename": "tailored-cv-20251011-202445-xyz123.pdf"
  }
}
```

**Note:** The `filename` field contains a unique filename. For masked CVs, it includes "masked" in the name (e.g., `tailored-cv-masked-20251011-203550-abc789.pdf`).

**PowerShell Example:**

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_API_KEY"
}

$body = @{
    cv = "Your CV text here..."
    jobDescription = "Job description here..."
    masked = $false
    isPdf = $false
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:9002/api/cv/generate-tailored" -Method POST -Headers $headers -Body $body

# Save PDF with unique filename
$pdfBytes = [Convert]::FromBase64String($response.data.pdf)
$filename = $response.data.filename  # e.g., "tailored-cv-20251011-202445-xyz123.pdf"
[IO.File]::WriteAllBytes($filename, $pdfBytes)
Write-Host "Saved to: $filename"
```

**cURL Example:**

```bash
curl -X POST http://localhost:9002/api/cv/generate-tailored \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "cv": "Your CV text here...",
    "jobDescription": "Job description here...",
    "masked": false,
    "isPdf": false
  }'
```

---

## 🔒 What Gets Masked

| Type     | Example                       | Masked As             |
| -------- | ----------------------------- | --------------------- |
| Email    | `john@example.com`            | `[EMAIL REDACTED]`    |
| Phone    | `+1 (555) 123-4567`           | `[PHONE REDACTED]`    |
| LinkedIn | `linkedin.com/in/johndoe`     | `[LINKEDIN REDACTED]` |
| GitHub   | `github.com/johndoe`          | `[GITHUB REDACTED]`   |
| Website  | `https://johndoe.com`         | `[WEBSITE REDACTED]`  |
| Address  | `123 Main St, City, ST 12345` | `[ADDRESS REDACTED]`  |
| DOB      | `01/15/1990`                  | `[DOB REDACTED]`      |
| SSN      | `123-45-6789`                 | `[SSN REDACTED]`      |

---

## 📊 Response Codes

| Code | Meaning      | Action               |
| ---- | ------------ | -------------------- |
| 200  | Success      | Process response     |
| 400  | Bad Request  | Check request format |
| 401  | Unauthorized | Verify API key       |
| 500  | Server Error | Check server logs    |

---

## 🧪 Testing

### Run All Tests

```powershell
.\test-all-endpoints.ps1
```

### Test Single Endpoint

```powershell
# Test masking
$headers = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer YOUR_API_KEY" }
$body = @{ cv = "Test CV"; isPdf = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:9002/api/cv/generate-masked" -Method POST -Headers $headers -Body $body
```

---

## 💡 Tips

### Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Keep API keys secure
3. ✅ Validate input before sending
4. ✅ Handle errors gracefully
5. ✅ Check `success` field in response

### Common Patterns

**Save PDF from Response:**

```powershell
$pdfBytes = [Convert]::FromBase64String($response.pdf)
[IO.File]::WriteAllBytes("output.pdf", $pdfBytes)
```

**Read PDF as Base64:**

```powershell
$pdfBytes = [IO.File]::ReadAllBytes("input.pdf")
$base64Pdf = [Convert]::ToBase64String($pdfBytes)
```

**Error Handling:**

```powershell
try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    if ($response.success) {
        # Process success
    } else {
        Write-Host "Error: $($response.error)"
    }
} catch {
    Write-Host "Request failed: $($_.Exception.Message)"
}
```

---

## 🔧 Troubleshooting

### Issue: 401 Unauthorized

**Solution:** Check API key is valid and active

### Issue: PDF parsing fails

**Solution:** Use text input instead of PDF, or use `/api/cv/generate-masked`

### Issue: Slow response

**Solution:** AI tailoring takes 8-10 seconds (normal)

### Issue: Empty PDF

**Solution:** Check input CV has content

---

## 📚 Documentation

- **Full Status:** `API_ENDPOINTS_STATUS.md`
- **Test Results:** `ENDPOINT_TEST_RESULTS.md`
- **Summary:** `FINAL_STATUS_SUMMARY.md`
- **This Guide:** `API_QUICK_REFERENCE.md`

---

## 🎯 Quick Examples

### Example 1: Mask CV

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:9002/api/cv/generate-masked" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "Authorization" = "Bearer YOUR_KEY" } `
  -Body (@{ cv = "CV text"; isPdf = $false } | ConvertTo-Json)

[IO.File]::WriteAllBytes("masked.pdf", [Convert]::FromBase64String($response.pdf))
```

### Example 2: Tailor CV

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:9002/api/cv/generate-tailored" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "Authorization" = "Bearer YOUR_KEY" } `
  -Body (@{ cv = "CV text"; jobDescription = "Job desc"; masked = $false; isPdf = $false } | ConvertTo-Json)

[IO.File]::WriteAllBytes("tailored.pdf", [Convert]::FromBase64String($response.data.pdf))
```

### Example 3: Tailor + Mask

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:9002/api/cv/generate-tailored" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "Authorization" = "Bearer YOUR_KEY" } `
  -Body (@{ cv = "CV text"; jobDescription = "Job desc"; masked = $true; isPdf = $false } | ConvertTo-Json)

[IO.File]::WriteAllBytes("tailored-masked.pdf", [Convert]::FromBase64String($response.data.pdf))
```

---

**Last Updated:** 2025-10-11  
**Version:** 1.0.0
