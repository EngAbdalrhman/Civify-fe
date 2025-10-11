"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, CheckCircle, Code, Book, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");

  // Get the current domain (works for both local and production)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiBaseUrl(window.location.origin);
    }
  }, []);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({
    code,
    language,
    id,
  }: {
    code: string;
    language: string;
    id: string;
  }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <Badge variant="outline" className="text-xs text-white">
          {language}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCopyCode(code, id)}
          className="h-8"
        >
          {copiedCode === id ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/api-keys")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to API Keys
          </Button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Book className="h-10 w-10 text-blue-600" />
            API Documentation
          </h1>
          <p className="text-gray-600 mt-2">
            Complete guide to using the HICv API for CV generation
          </p>
          {/* {apiBaseUrl && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>API Base URL:</strong>{" "}
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {apiBaseUrl}
                </code>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {apiBaseUrl.includes("localhost")
                  ? "🔧 Running locally - Use this URL for testing"
                  : "🌐 Production environment"}
              </p>
            </div>
          )} */}
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>
              All API requests require authentication using your API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Include your API key in the{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                Authorization
              </code>{" "}
              header as a Bearer token:
            </p>
            <CodeBlock
              id="auth-header"
              language="HTTP"
              code={`Authorization: Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`}
            />
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>Important:</strong> Keep your API key secure and never
                share it publicly. Treat it like a password.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Tabs defaultValue="masked" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="masked">Generate Masked CV</TabsTrigger>
            <TabsTrigger value="tailored">Generate Tailored CV</TabsTrigger>
          </TabsList>

          {/* Masked CV Endpoint */}
          <TabsContent value="masked" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  POST /api/cv/generate-masked
                </CardTitle>
                <CardDescription>
                  Generate a PDF CV with personal information masked for privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Request */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Request</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Headers</h4>
                      <CodeBlock
                        id="masked-headers"
                        language="HTTP"
                        code={`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Body</h4>
                      <CodeBlock
                        id="masked-body"
                        language="JSON"
                        code={`{
  "cv": "Your CV text content here...",
  "isPdf": false
}`}
                      />
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>cv</strong> (required): Your CV text content
                          or base64-encoded PDF
                        </p>
                        <p>
                          <strong>isPdf</strong> (optional): Set to{" "}
                          <code className="bg-gray-100 px-1 rounded">true</code>{" "}
                          if cv is a base64-encoded PDF. Default:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            false
                          </code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Response</h3>
                  <CodeBlock
                    id="masked-response"
                    language="JSON"
                    code={`{
  "success": true,
  "pdf": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDw+Pj4+CmVuZG9iago...",
  "filename": "masked-cv-20251011-202336-bhx0jw.pdf",
  "message": "Masked CV generated successfully"
}`}
                  />
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      The{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">pdf</code>{" "}
                      field contains a base64-encoded PDF file.
                    </p>
                    <p>
                      The{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        filename
                      </code>{" "}
                      field contains a unique filename with timestamp and random
                      ID to prevent file collisions.
                    </p>
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Example (cURL)</h3>
                  <CodeBlock
                    id="masked-curl"
                    language="bash"
                    code={`curl -X POST ${
                      apiBaseUrl || "http://localhost:3000"
                    }/api/cv/generate-masked \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \\
  -d '{
    "cv": "John Doe\\nEmail: john@example.com\\nPhone: +1234567890\\n..."
  }'`}
                  />
                </div>

                {/* Example (JavaScript) */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Example (JavaScript)
                  </h3>
                  <CodeBlock
                    id="masked-js"
                    language="javascript"
                    code={`const response = await fetch('${
                      apiBaseUrl || "http://localhost:3000"
                    }/api/cv/generate-masked', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  body: JSON.stringify({
    cv: 'Your CV text content here...',
    isPdf: false
  })
});

const data = await response.json();

// Decode base64 PDF and download with unique filename
const pdfBlob = await fetch(\`data:application/pdf;base64,\${data.pdf}\`).then(r => r.blob());
const url = URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = data.filename; // Use unique filename from response
a.click();
console.log('Saved as:', data.filename);`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tailored CV Endpoint */}
          <TabsContent value="tailored" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  POST /api/cv/generate-tailored
                </CardTitle>
                <CardDescription>
                  Generate an AI-tailored PDF CV optimized for a specific job
                  description. Uses AI to parse CV structure and tailor content
                  to match job requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Request */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Request</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Headers</h4>
                      <CodeBlock
                        id="tailored-headers"
                        language="HTTP"
                        code={`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Body</h4>
                      <CodeBlock
                        id="tailored-body"
                        language="JSON"
                        code={`{
  "cv": "Your CV text content here...",
  "jobDescription": "Job description text here...",
  "masked": false,
  "isPdf": false
}`}
                      />
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>cv</strong> (required): Your CV text content
                          or base64-encoded PDF
                        </p>
                        <p>
                          <strong>jobDescription</strong> (required): The job
                          description to tailor the CV for
                        </p>
                        <p>
                          <strong>masked</strong> (optional): Set to{" "}
                          <code className="bg-gray-100 px-1 rounded">true</code>{" "}
                          to mask personal information (email, phone, LinkedIn,
                          GitHub, etc.). Default:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            false
                          </code>
                        </p>
                        <p>
                          <strong>isPdf</strong> (optional): Set to{" "}
                          <code className="bg-gray-100 px-1 rounded">true</code>{" "}
                          if cv is a base64-encoded PDF. Default:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            false
                          </code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Response</h3>
                  <CodeBlock
                    id="tailored-response"
                    language="JSON"
                    code={`{
  "success": true,
  "data": {
    "pdf": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDw+Pj4+CmVuZG9iago...",
    "filename": "tailored-cv-20251011-202445-xyz123.pdf"
  }
}`}
                  />
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      The{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        data.pdf
                      </code>{" "}
                      field contains a base64-encoded PDF file.
                    </p>
                    <p>
                      The{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        data.filename
                      </code>{" "}
                      field contains a unique filename. For masked CVs, it
                      includes "masked" in the name (e.g.,{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        tailored-cv-masked-20251011-203550-abc789.pdf
                      </code>
                      ).
                    </p>
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Example (cURL)</h3>
                  <CodeBlock
                    id="tailored-curl"
                    language="bash"
                    code={`curl -X POST ${
                      apiBaseUrl || "http://localhost:3000"
                    }/api/cv/generate-tailored \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \\
  -d '{
    "cv": "John Doe\\nEmail: john@example.com\\n...",
    "jobDescription": "We are looking for a Senior Software Engineer...",
    "masked": true
  }'`}
                  />
                </div>

                {/* Example (Python) */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Example (Python)
                  </h3>
                  <CodeBlock
                    id="tailored-python"
                    language="python"
                    code={`import requests
import base64

url = "${apiBaseUrl || "http://localhost:3000"}/api/cv/generate-tailored"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
payload = {
    "cv": "Your CV text content here...",
    "jobDescription": "Job description text here...",
    "masked": False,
    "isPdf": False
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

# Decode and save PDF with unique filename
pdf_data = base64.b64decode(data["data"]["pdf"])
filename = data["data"]["filename"]  # Use unique filename from response
with open(filename, "wb") as f:
    f.write(pdf_data)
print(f"Saved as: {filename}")`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Features */}
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI-Powered Features</CardTitle>
            <CardDescription>
              How our AI processes and tailors your CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">CV Parsing</h4>
                <p className="text-sm text-gray-700">
                  The{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    /api/cv/generate-tailored
                  </code>{" "}
                  endpoint uses AI to:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>Extract structured data from your CV text or PDF</li>
                  <li>
                    Identify personal information, work experience, education,
                    skills, etc.
                  </li>
                  <li>
                    Understand the context and relationships between different
                    sections
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">CV Tailoring</h4>
                <p className="text-sm text-gray-700">
                  The AI then tailors your CV by:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>Analyzing the job description requirements</li>
                  <li>Highlighting relevant skills and experience</li>
                  <li>Optimizing content to match job keywords</li>
                  <li>Generating a professionally formatted PDF</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  Personal Information Masking
                </h4>
                <p className="text-sm text-gray-700">
                  When{" "}
                  <code className="bg-gray-100 px-1 rounded">masked: true</code>
                  , the following information is redacted:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>
                    Email addresses →{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      [EMAIL REDACTED]
                    </code>
                  </li>
                  <li>
                    Phone numbers →{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      [PHONE REDACTED]
                    </code>
                  </li>
                  <li>
                    LinkedIn URLs →{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      [LINKEDIN REDACTED]
                    </code>
                  </li>
                  <li>
                    GitHub URLs →{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      [GITHUB REDACTED]
                    </code>
                  </li>
                  <li>
                    Website URLs →{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      [WEBSITE REDACTED]
                    </code>
                  </li>
                  <li>
                    Physical addresses →{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      [ADDRESS REDACTED]
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Rate Limits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>
              API usage limits for licensed accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                • <strong>500 API calls per month</strong> for licensed users
              </p>
              <p>• Rate limit resets on the 1st of each month</p>
              <p>
                • Exceeding the limit will result in{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  429 Too Many Requests
                </code>{" "}
                errors
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Error Codes</CardTitle>
            <CardDescription>
              Common error responses and their meanings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="font-semibold">401 Unauthorized</p>
                <p className="text-sm text-gray-600">
                  Missing or invalid API key
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-semibold">403 Forbidden</p>
                <p className="text-sm text-gray-600">
                  License inactive or expired
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-semibold">429 Too Many Requests</p>
                <p className="text-sm text-gray-600">
                  Monthly API limit exceeded
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold">400 Bad Request</p>
                <p className="text-sm text-gray-600">
                  Invalid request body or missing required fields
                </p>
              </div>
              <div className="border-l-4 border-gray-500 pl-4">
                <p className="font-semibold">500 Internal Server Error</p>
                <p className="text-sm text-gray-600">
                  Server error - please try again later
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
