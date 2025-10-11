#!/usr/bin/env python3
"""
Production API Debugging Script
Tests all endpoints and provides detailed error information
"""

import requests
import json
import base64
from datetime import datetime

# Configuration
BASE_URL = "https://cvupper.netlify.app"
API_KEY = "hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health_check():
    """Test the health check endpoint"""
    print_section("1. Health Check")
    
    try:
        url = f"{BASE_URL}/api/health"
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Server is running!")
            print(f"\nEnvironment Check:")
            for key, value in data.get("environment", {}).items():
                status = "✅" if value else "❌"
                print(f"  {status} {key}: {value}")
            
            print(f"\nRuntime Info:")
            for key, value in data.get("runtime", {}).items():
                print(f"  • {key}: {value}")
        else:
            print(f"❌ Health check failed: {response.text}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_masked_cv():
    """Test the masked CV endpoint"""
    print_section("2. Generate Masked CV")
    
    try:
        url = f"{BASE_URL}/api/cv/generate-masked"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
        payload = {
            "cv": "John Doe\nEmail: john@example.com\nPhone: +1234567890\nSoftware Engineer with 5 years experience",
            "isPdf": False
        }
        
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Masked CV generated successfully!")
            print(f"  • Filename: {data.get('filename', 'N/A')}")
            print(f"  • PDF size: {len(data.get('pdf', ''))} characters (base64)")
            
            # Save PDF
            if data.get('pdf'):
                pdf_bytes = base64.b64decode(data['pdf'])
                filename = data.get('filename', 'masked-cv-test.pdf')
                with open(filename, 'wb') as f:
                    f.write(pdf_bytes)
                print(f"  • Saved to: {filename}")
        else:
            print(f"\n❌ Request failed!")
            print(f"Response: {response.text[:500]}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_tailored_cv():
    """Test the tailored CV endpoint"""
    print_section("3. Generate Tailored CV")
    
    try:
        url = f"{BASE_URL}/api/cv/generate-tailored"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
        payload = {
            "cv": """John Doe
Software Engineer
Email: john@example.com
Phone: +1234567890

EXPERIENCE:
- Senior Developer at TechCorp (2020-2024)
- Built scalable web applications
- Led team of 5 developers

SKILLS:
- JavaScript, Python, React
- Node.js, Docker, AWS
""",
            "jobDescription": "Looking for a Senior Software Engineer with experience in React and Node.js",
            "masked": False,
            "isPdf": False
        }
        
        print(f"URL: {url}")
        print(f"Payload keys: {list(payload.keys())}")
        print(f"CV length: {len(payload['cv'])} characters")
        print(f"Job description length: {len(payload['jobDescription'])} characters")
        
        response = requests.post(url, json=payload, headers=headers, timeout=90)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Tailored CV generated successfully!")
            
            if data.get('success') and data.get('data'):
                print(f"  • Filename: {data['data'].get('filename', 'N/A')}")
                print(f"  • PDF size: {len(data['data'].get('pdf', ''))} characters (base64)")
                
                # Save PDF
                if data['data'].get('pdf'):
                    pdf_bytes = base64.b64decode(data['data']['pdf'])
                    filename = data['data'].get('filename', 'tailored-cv-test.pdf')
                    with open(filename, 'wb') as f:
                        f.write(pdf_bytes)
                    print(f"  • Saved to: {filename}")
            else:
                print(f"  • Response structure: {json.dumps(data, indent=2)[:200]}")
        else:
            print(f"\n❌ Request failed!")
            print(f"Response: {response.text[:1000]}")
            
            # Try to parse as JSON for better error display
            try:
                error_data = response.json()
                print(f"\nError Details:")
                print(json.dumps(error_data, indent=2))
            except:
                pass
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "🔍 HICv API Production Debugging".center(60))
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    results = {
        "health": test_health_check(),
        "masked": test_masked_cv(),
        "tailored": test_tailored_cv(),
    }
    
    # Summary
    print_section("Summary")
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\nTests Passed: {passed}/{total}")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {test_name}")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")
        print("\nTroubleshooting:")
        print("1. Check Netlify function logs")
        print("2. Verify environment variables in Netlify dashboard")
        print("3. Check Appwrite api_usage_logs for error messages")
        print("4. Ensure GEMINI_API_KEY is set correctly")

if __name__ == "__main__":
    main()

