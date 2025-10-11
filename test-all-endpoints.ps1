# ============================================
# HICv API Endpoints - Comprehensive Test Suite
# ============================================

$apiKey = "hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"
$baseUrl = "http://localhost:9002"

# Test data
$sampleCV = @"
John Doe
Email: john.doe@example.com
Phone: +1 (555) 123-4567
LinkedIn: https://linkedin.com/in/johndoe
GitHub: https://github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development.
Proficient in React, Node.js, TypeScript, and cloud technologies.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-Present
- Led development of microservices architecture
- Implemented CI/CD pipelines
- Mentored junior developers

Software Engineer | StartupXYZ | 2018-2020
- Built responsive web applications
- Optimized database performance
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014-2018

SKILLS
- Languages: JavaScript, TypeScript, Python, Java
- Frameworks: React, Node.js, Express, Next.js
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Azure, Docker, Kubernetes
"@

$jobDescription = @"
We are seeking a Senior Full-Stack Engineer with strong experience in React and Node.js.
The ideal candidate will have:
- 5+ years of software development experience
- Expert knowledge of React and modern JavaScript
- Experience with microservices architecture
- Strong problem-solving skills
- Excellent communication abilities
"@

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HICv API Endpoints - Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# Test 1: Generate Masked CV (Text Input)
# ============================================
Write-Host "[Test 1] POST /api/cv/generate-masked (Text Input)" -ForegroundColor Yellow
Write-Host "Description: Mask personal information from text CV" -ForegroundColor Gray

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $apiKey"
    }
    
    $body = @{
        cv = $sampleCV
        isPdf = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cv/generate-masked" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   PDF Length: $($response.pdf.Length) characters" -ForegroundColor Green
        
        # Save PDF
        $pdfBytes = [Convert]::FromBase64String($response.pdf)
        [IO.File]::WriteAllBytes("test1-masked-text.pdf", $pdfBytes)
        Write-Host "   Saved to: test1-masked-text.pdf" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# Test 2: Generate Masked CV (PDF Input via isPdf=true)
# ============================================
Write-Host "[Test 2] POST /api/cv/generate-masked (PDF Input with isPdf=true)" -ForegroundColor Yellow
Write-Host "Description: Extract text from PDF and mask personal information" -ForegroundColor Gray

try {
    # Check if we have a PDF from Test 1
    if (Test-Path "test1-masked-text.pdf") {
        $pdfBytes = [IO.File]::ReadAllBytes("test1-masked-text.pdf")
        $base64Pdf = [Convert]::ToBase64String($pdfBytes)

        $headers = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $apiKey"
        }

        $body = @{
            cv = $base64Pdf
            isPdf = $true
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/cv/generate-masked" -Method POST -Headers $headers -Body $body -ErrorAction Stop

        if ($response.success) {
            Write-Host "✅ SUCCESS!" -ForegroundColor Green
            Write-Host "   PDF Length: $($response.pdf.Length) characters" -ForegroundColor Green

            # Save PDF
            $pdfBytes = [Convert]::FromBase64String($response.pdf)
            [IO.File]::WriteAllBytes("test2-masked-pdf.pdf", $pdfBytes)
            Write-Host "   Saved to: test2-masked-pdf.pdf" -ForegroundColor Green
        } else {
            Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  SKIPPED: No PDF available for testing" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# Test 3: Generate Tailored CV (Text Input)
# ============================================
Write-Host "[Test 3] POST /api/cv/generate-tailored (Text Input)" -ForegroundColor Yellow
Write-Host "Description: AI-tailor CV to job description" -ForegroundColor Gray

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $apiKey"
    }
    
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
        
        # Save PDF
        $pdfBytes = [Convert]::FromBase64String($response.data.pdf)
        [IO.File]::WriteAllBytes("test3-tailored-text.pdf", $pdfBytes)
        Write-Host "   Saved to: test3-tailored-text.pdf" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# Test 4: Generate Tailored CV (Masked)
# ============================================
Write-Host "[Test 4] POST /api/cv/generate-tailored (Masked)" -ForegroundColor Yellow
Write-Host "Description: AI-tailor CV and mask personal information" -ForegroundColor Gray

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $apiKey"
    }
    
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
        
        # Save PDF
        $pdfBytes = [Convert]::FromBase64String($response.data.pdf)
        [IO.File]::WriteAllBytes("test4-tailored-masked.pdf", $pdfBytes)
        Write-Host "   Saved to: test4-tailored-masked.pdf" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# Summary
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Generated PDFs:" -ForegroundColor Yellow
Get-ChildItem -Filter "test*.pdf" | ForEach-Object {
    Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Green
}
Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host ""

