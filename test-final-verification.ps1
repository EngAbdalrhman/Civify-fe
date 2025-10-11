# ============================================
# HICv API - Final Verification Test
# ============================================

$apiKey = "hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"
$baseUrl = "http://localhost:9002"

$sampleCV = @"
John Doe
Email: john.doe@example.com
Phone: +1 (555) 123-4567
LinkedIn: https://linkedin.com/in/johndoe
GitHub: https://github.com/johndoe
Address: 123 Main Street, San Francisco, CA 94102

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development.
Proficient in React, Node.js, TypeScript, and cloud technologies.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-Present
- Led development of microservices architecture
- Implemented CI/CD pipelines using Jenkins and Docker
- Mentored 5 junior developers

Software Engineer | StartupXYZ | 2018-2020
- Built responsive web applications using React
- Optimized database performance (PostgreSQL)
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014-2018
GPA: 3.8/4.0

SKILLS
Languages: JavaScript, TypeScript, Python, Java
Frameworks: React, Node.js, Express, Next.js
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS, Azure, Docker, Kubernetes
"@

$jobDescription = @"
We are seeking a Senior Full-Stack Engineer with strong experience in React and Node.js.

Requirements:
- 5+ years of software development experience
- Expert knowledge of React and modern JavaScript
- Experience with Node.js and Express
- Experience with microservices architecture
- Strong problem-solving skills
- Excellent communication abilities
- Experience with cloud platforms (AWS/Azure)
"@

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HICv API - Final Verification Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $apiKey"
}

# ============================================
# Test 1: Mask Personal Information
# ============================================
Write-Host "[Test 1] Mask Personal Information" -ForegroundColor Yellow
Write-Host "Testing: /api/cv/generate-masked" -ForegroundColor Gray

try {
    $body = @{
        cv = $sampleCV
        isPdf = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cv/generate-masked" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   PDF Length: $($response.pdf.Length) characters" -ForegroundColor Green
        Write-Host "   Filename: $($response.filename)" -ForegroundColor Cyan

        $pdfBytes = [Convert]::FromBase64String($response.pdf)
        $filename = if ($response.filename) { $response.filename } else { "final-test-masked.pdf" }
        [IO.File]::WriteAllBytes($filename, $pdfBytes)
        Write-Host "   Saved to: $filename" -ForegroundColor Green
        Write-Host "   ✓ Personal info should be masked" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Test 2: AI-Tailor CV (Unmasked)
# ============================================
Write-Host "Test 2: AI-Tailor CV - Unmasked" -ForegroundColor Yellow
Write-Host "Testing: /api/cv/generate-tailored with masked=false" -ForegroundColor Gray

try {
    $body = @{
        cv = $sampleCV
        jobDescription = $jobDescription
        masked = $false
        isPdf = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cv/generate-tailored" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   PDF Length: $($response.data.pdf.Length) characters" -ForegroundColor Green
        Write-Host "   Filename: $($response.data.filename)" -ForegroundColor Cyan

        $pdfBytes = [Convert]::FromBase64String($response.data.pdf)
        $filename = if ($response.data.filename) { $response.data.filename } else { "final-test-tailored-unmasked.pdf" }
        [IO.File]::WriteAllBytes($filename, $pdfBytes)
        Write-Host "   Saved to: $filename" -ForegroundColor Green
        Write-Host "   ✓ Should contain real name, email, phone" -ForegroundColor Cyan
        Write-Host "   ✓ Should be tailored to job description" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Test 3: AI-Tailor CV (MASKED)
# ============================================
Write-Host "Test 3: AI-Tailor CV - MASKED" -ForegroundColor Yellow
Write-Host "Testing: /api/cv/generate-tailored with masked=true" -ForegroundColor Gray

try {
    $body = @{
        cv = $sampleCV
        jobDescription = $jobDescription
        masked = $true
        isPdf = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cv/generate-tailored" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   PDF Length: $($response.data.pdf.Length) characters" -ForegroundColor Green
        Write-Host "   Filename: $($response.data.filename)" -ForegroundColor Cyan

        $pdfBytes = [Convert]::FromBase64String($response.data.pdf)
        $filename = if ($response.data.filename) { $response.data.filename } else { "final-test-tailored-MASKED.pdf" }
        [IO.File]::WriteAllBytes($filename, $pdfBytes)
        Write-Host "   Saved to: $filename" -ForegroundColor Green
        Write-Host "   ✓ Email should be: [EMAIL REDACTED]" -ForegroundColor Cyan
        Write-Host "   ✓ Phone should be: [PHONE REDACTED]" -ForegroundColor Cyan
        Write-Host "   ✓ LinkedIn should be: [LINKEDIN REDACTED]" -ForegroundColor Cyan
        Write-Host "   ✓ GitHub should be: [GITHUB REDACTED]" -ForegroundColor Cyan
        Write-Host "   ✓ Address should be: [ADDRESS REDACTED]" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================
# Summary
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "final-test-*.pdf") {
    Write-Host "Generated PDFs:" -ForegroundColor Yellow
    Get-ChildItem -Filter "final-test-*.pdf" | ForEach-Object {
        $sizeKB = [math]::Round($_.Length/1KB, 2)
        Write-Host "  - $($_.Name) - $sizeKB KB" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Verification Checklist:" -ForegroundColor Yellow
    Write-Host "  1. Open final-test-masked.pdf" -ForegroundColor White
    Write-Host "     → Verify personal info is masked" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Open final-test-tailored-unmasked.pdf" -ForegroundColor White
    Write-Host "     → Verify it contains real name, email, phone" -ForegroundColor Gray
    Write-Host "     → Verify content is tailored to job description" -ForegroundColor Gray
    Write-Host "     → Verify PDF is properly formatted (not HTML text)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Open final-test-tailored-MASKED.pdf" -ForegroundColor White
    Write-Host "     → Verify personal info shows [EMAIL REDACTED], etc." -ForegroundColor Gray
    Write-Host "     → Verify content is still tailored to job" -ForegroundColor Gray
    Write-Host "     → Verify PDF is properly formatted" -ForegroundColor Gray
} else {
    Write-Host "⚠️  No PDFs generated - check errors above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host ""

