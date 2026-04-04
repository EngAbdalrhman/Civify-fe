"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  // Get API URL from environment variable on client side
  useEffect(() => {
    setBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'https://api.civify.cv');
  }, []);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      id: 'parse',
      method: 'POST',
      path: '/v1/external/cvs/parse',
      title: 'Parse CV',
      description: 'Upload a CV to extract structured data in JSON format',
      parameters: [
        { name: 'file', type: 'multipart/form-data', required: true, description: 'The CV file (PDF, DOC, DOCX)' },
        { name: 'language', type: 'string', required: false, description: 'Language hint for parsing (e.g., "en", "ar")' },
      ],
      curlExample: `curl -X POST \\
  ${baseUrl}/v1/external/cvs/parse \\
  -H "X-API-KEY: your_api_key_here" \\
  -F "file=@/path/to/cv.pdf" \\
  -F "language=en"`,
      jsExample: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('language', 'en');

const response = await fetch('${baseUrl}/v1/external/cvs/parse', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your_api_key_here'
  },
  body: formData
});

const data = await response.json();
console.log(data);`,
      pythonExample: `import requests
import json

url = "${baseUrl}/v1/external/cvs/parse"
headers = {"X-API-KEY": "your_api_key_here"}
files = {"file": open("/path/to/cv.pdf", "rb")}
data = {
    "language": "en"
}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()
print(result)`,
      response: `{
  "success": true,
  "message": "CV parsed successfully",
  "resumeData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "experience": [...],
    "education": [...],
    "skills": [...]
  }
}`
    },
    {
      id: 'mask',
      method: 'POST',
      path: '/v1/external/cvs/mask',
      title: 'Mask CV',
      description: 'Upload a CV to mask PII and receive a masked PDF',
      parameters: [
        { name: 'file', type: 'multipart/form-data', required: true, description: 'The CV file (PDF, DOC, DOCX)' },
        { name: 'language', type: 'string', required: false, description: 'Language hint for parsing (e.g., "en", "ar")' },
      ],
      curlExample: `curl -X POST \\
  ${baseUrl}/v1/external/cvs/mask \\
  -H "X-API-KEY: your_api_key_here" \\
  -F "file=@/path/to/cv.pdf" \\
  -F "language=en" \\
  --output masked_cv.pdf`,
      jsExample: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('language', 'en');

const response = await fetch('${baseUrl}/v1/external/cvs/mask', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your_api_key_here'
  },
  body: formData
});

const blob = await response.blob();
// Create download link
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'masked_cv.pdf';
a.click();`,
      pythonExample: `import requests

url = "${baseUrl}/v1/external/cvs/mask"
headers = {"X-API-KEY": "your_api_key_here"}
files = {"file": open("/path/to/cv.pdf", "rb")}
data = {"language": "en"}

response = requests.post(url, headers=headers, files=files, data=data)

# Save the masked PDF
with open("masked_cv.pdf", "wb") as f:
    f.write(response.content)`,
      response: `Returns a PDF file with PII (Personal Identifiable Information) masked.

HTTP Headers:
Content-Type: application/pdf
Content-Disposition: attachment; filename="masked_cv.pdf"`
    },
    {
      id: 'tailor',
      method: 'POST',
      path: '/v1/external/cvs/tailor',
      title: 'Tailor CV',
      description: 'Upload a CV and job description to get a tailored CV with ATS analysis',
      parameters: [
        { name: 'file', type: 'multipart/form-data', required: true, description: 'The CV file (PDF, DOC, DOCX)' },
        { name: 'jobDescription', type: 'string', required: true, description: 'The job description to tailor the CV against' },
        { name: 'jobTitle', type: 'string', required: false, description: 'Target job title' },
        { name: 'companyName', type: 'string', required: false, description: 'Target company name' },
        { name: 'language', type: 'string', required: false, description: 'Target language (e.g., "en", "ar")' },
        { name: 'generateCoverLetter', type: 'boolean', required: false, description: 'Whether to generate a cover letter (default: false)' },
        { name: 'includeInterviewQuestions', type: 'boolean', required: false, description: 'Whether to include interview questions (default: false)' },
        { name: 'includeRoadmap', type: 'boolean', required: false, description: 'Whether to include a learning roadmap (default: false)' }
      ],
      curlExample: `curl -X POST \\
  \${baseUrl}/v1/external/cvs/tailor \\
  -H "X-API-KEY: your_api_key_here" \\
  -F "file=@/path/to/cv.pdf" \\
  -F "jobDescription=We are looking for a Senior Software Engineer..." \\
  -F "jobTitle=Senior Software Engineer" \\
  -F "companyName=Tech Corp" \\
  -F "generateCoverLetter=true"`,
      jsExample: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('jobDescription', 'We are looking for a Senior Software Engineer...');
formData.append('jobTitle', 'Senior Software Engineer');
formData.append('companyName', 'Tech Corp');
formData.append('generateCoverLetter', 'true');

const response = await fetch('\${baseUrl}/v1/external/cvs/tailor', {
  method: 'POST',
  headers: {
    'X-API-KEY': 'your_api_key_here'
  },
  body: formData
});

const data = await response.json();
console.log(data);`,
      pythonExample: `import requests

url = "\${baseUrl}/v1/external/cvs/tailor"
headers = {"X-API-KEY": "your_api_key_here"}
files = {"file": open("/path/to/cv.pdf", "rb")}
data = {
    "jobDescription": "We are looking for a Senior Software Engineer...",
    "jobTitle": "Senior Software Engineer",
    "companyName": "Tech Corp",
    "generateCoverLetter": "true"
}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()
print(result)`,
      response: `{
  "success": true,
  "message": "CV tailored successfully",
  "tailoredCv": {
    "summary": "Experienced software engineer...",
    "score": 85,
    "improvements": [...]
  },
  "coverLetter": "Dear Hiring Manager...",
  "interviewQuestions": [...],
  "roadmap": [...]
}`
    },
    {
      id: 'profile',
      method: 'GET',
      path: '/v1/external/user/profile',
      title: 'Get User Profile',
      description: 'Get basic user profile and subscription plan details',
      parameters: [],
      curlExample: `curl -X GET \\
  \${baseUrl}/v1/external/user/profile \\
  -H "X-API-KEY: your_api_key_here"`,
      jsExample: `const response = await fetch('\${baseUrl}/v1/external/user/profile', {
  method: 'GET',
  headers: {
    'X-API-KEY': 'your_api_key_here'
  }
});

const data = await response.json();
console.log(data);`,
      pythonExample: `import requests

url = "\${baseUrl}/v1/external/user/profile"
headers = {"X-API-KEY": "your_api_key_here"}

response = requests.get(url, headers=headers)
result = response.json()
print(result)`,
      response: `{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "Jane Smith",
  "plan": "premium",
  "apiCallsQuota": 1000,
  "apiCallsUsed": 150,
  "createdAt": "2024-01-01T00:00:00Z"
}`
    }
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-2xl">API Documentation</CardTitle>
        <CardDescription>
          Learn how to integrate Civify CV API into your applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Section */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            🔐 Authentication
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            All API requests require authentication using your API key. Include it in the <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">X-API-KEY</code> header.
          </p>
        </div>

        {/* Endpoints */}
        <Tabs defaultValue="parse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {endpoints.map((endpoint) => (
              <TabsTrigger key={endpoint.id} value={endpoint.id} className="text-sm">
                <Badge variant="outline" className="mr-2">{endpoint.method}</Badge>
                {endpoint.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {endpoints.map((endpoint) => (
            <TabsContent key={endpoint.id} value={endpoint.id} className="space-y-4 mt-6">
              {/* Endpoint Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{endpoint.method}</Badge>
                  <code className="text-sm bg-muted px-3 py-1 rounded">{endpoint.path}</code>
                </div>
                <p className="text-muted-foreground">{endpoint.description}</p>
              </div>

              {/* Parameters */}
              <div>
                <h4 className="font-semibold mb-3">Parameters</h4>
                <div className="space-y-2">
                  {endpoint.parameters.map((param, idx) => (
                    <div key={idx} className="flex gap-4 text-sm border-l-2 border-muted pl-4 py-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold">{param.name}</code>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">{param.description}</p>
                      </div>
                      <div className="text-muted-foreground text-xs">{param.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Examples */}
              <div>
                <h4 className="font-semibold mb-3">Code Examples</h4>
                <Tabs defaultValue="curl" className="w-full">
                  <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl" className="relative">
                    <div className="relative group">
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.curlExample}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyCode(endpoint.curlExample, `${endpoint.id}-curl`)}
                      >
                        {copiedCode === `${endpoint.id}-curl` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="javascript" className="relative">
                    <div className="relative group">
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.jsExample}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyCode(endpoint.jsExample, `${endpoint.id}-js`)}
                      >
                        {copiedCode === `${endpoint.id}-js` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="python" className="relative">
                    <div className="relative group">
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.pythonExample}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyCode(endpoint.pythonExample, `${endpoint.id}-python`)}
                      >
                        {copiedCode === `${endpoint.id}-python` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Response Example */}
              <div>
                <h4 className="font-semibold mb-3">Response</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{endpoint.response}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Rate Limits */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
            ⚡ Rate Limits
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            API rate limits depend on your subscription plan. Exceeding limits will result in HTTP 429 responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
