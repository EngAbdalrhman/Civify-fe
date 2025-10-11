import requests
import base64

url = "https://cvupper.netlify.app/api/cv/generate-tailored"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer hicv_live_ykdBc8Nc44ekABqhRWeDdrNq9s5tCqw5"  # Fixed: removed extra space
}
payload = {
    "cv": """John Doe
Software Engineer
Email: john.doe@example.com
Phone: +1 (555) 123-4567
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development.
Proficient in React, Node.js, TypeScript, and cloud technologies.

EXPERIENCE
Senior Software Engineer at TechCorp Inc.
2020 - Present
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored junior developers and conducted code reviews

Software Engineer at StartupXYZ
2018 - 2020
- Built responsive web applications using React and Node.js
- Optimized database performance improving query speed by 40%
- Collaborated with cross-functional teams on product features

EDUCATION
Bachelor of Science in Computer Science
University of Technology
2014-2018

SKILLS
- Languages: JavaScript, TypeScript, Python, Java
- Frontend: React, Vue.js, HTML5, CSS3
- Backend: Node.js, Express, Django
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Docker, Kubernetes
- Tools: Git, Jenkins, JIRA
""",
    "jobDescription": """We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development
- Strong expertise in React and Node.js
- Experience with cloud technologies (AWS preferred)
- Excellent problem-solving skills
- Team player with good communication skills

Responsibilities:
- Design and develop scalable web applications
- Lead technical discussions and code reviews
- Mentor junior developers
- Collaborate with product team on new features
""",
    "masked": False,
    "isPdf": False  # Important: Set to False for production (PDF parsing not supported)
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