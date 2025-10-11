import requests
import base64

url = "https://cvupper.netlify.app/api/cv/generate-tailored"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer  hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"
}
payload = {
    "cv": "Your CV text content here...",
    "jobDescription": "Job description text here...",
    "masked": False,
    "isPdf": False
}

response = requests.post(url, json=payload, headers=headers)
print("Status code:", response.status_code)
print("Raw response text:", response.text[:500])  # show first 500 chars

if response.status_code != 200:
    print("❌ API returned an error.")
    exit()

try:
    data = response.json()
except Exception as e:
    print("❌ Failed to parse JSON:", e)
    exit()

# Decode and save PDF with unique filename
pdf_data = base64.b64decode(data["data"]["pdf"])
filename = data["data"]["filename"]  # Use unique filename from response
with open(filename, "wb") as f:
    f.write(pdf_data)
print(f"Saved as: {filename}")