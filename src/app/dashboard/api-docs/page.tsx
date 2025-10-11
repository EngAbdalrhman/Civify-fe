"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, CheckCircle, Code, Book, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
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
              Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">Authorization</code> header
              as a Bearer token:
            </p>
            <CodeBlock
              id="auth-header"
              language="HTTP"
              code={`Authorization: Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`}
            />
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>Important:</strong> Keep your API key secure and never share it publicly.
                Treat it like a password.
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
  "cv": "Your CV text content here..."
}`}
                      />
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
  "message": "Masked CV generated successfully"
}`}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    The <code className="bg-gray-100 px-2 py-1 rounded">pdf</code> field contains a base64-encoded PDF file.
                  </p>
                </div>

                {/* Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Example (cURL)</h3>
                  <CodeBlock
                    id="masked-curl"
                    language="bash"
                    code={`curl -X POST https://your-domain.com/api/cv/generate-masked \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \\
  -d '{
    "cv": "John Doe\\nEmail: john@example.com\\nPhone: +1234567890\\n..."
  }'`}
                  />
                </div>

                {/* Example (JavaScript) */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Example (JavaScript)</h3>
                  <CodeBlock
                    id="masked-js"
                    language="javascript"
                    code={`const response = await fetch('https://your-domain.com/api/cv/generate-masked', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  body: JSON.stringify({
    cv: 'Your CV text content here...'
  })
});

const data = await response.json();

// Decode base64 PDF and download
const pdfBlob = await fetch(\`data:application/pdf;base64,\${data.pdf}\`).then(r => r.blob());
const url = URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'masked-cv.pdf';
a.click();`}
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
                  Generate an AI-tailored PDF CV optimized for a specific job description
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
  "masked": false
}`}
                      />
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>cv</strong> (required): Your CV text content</p>
                        <p><strong>jobDescription</strong> (required): The job description to tailor the CV for</p>
                        <p><strong>masked</strong> (optional): Set to <code className="bg-gray-100 px-1 rounded">true</code> to mask personal information. Default: <code className="bg-gray-100 px-1 rounded">false</code></p>
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
  "pdf": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzPDw+Pj4+CmVuZG9iago...",
  "message": "Tailored CV generated successfully"
}`}
                  />
                </div>

                {/* Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Example (cURL)</h3>
                  <CodeBlock
                    id="tailored-curl"
                    language="bash"
                    code={`curl -X POST https://your-domain.com/api/cv/generate-tailored \\
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
                  <h3 className="text-lg font-semibold mb-3">Example (Python)</h3>
                  <CodeBlock
                    id="tailored-python"
                    language="python"
                    code={`import requests
import base64

url = "https://your-domain.com/api/cv/generate-tailored"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer hicv_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
payload = {
    "cv": "Your CV text content here...",
    "jobDescription": "Job description text here...",
    "masked": False
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

# Decode and save PDF
pdf_data = base64.b64decode(data["pdf"])
with open("tailored-cv.pdf", "wb") as f:
    f.write(pdf_data)`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
              <p>• <strong>500 API calls per month</strong> for licensed users</p>
              <p>• Rate limit resets on the 1st of each month</p>
              <p>• Exceeding the limit will result in <code className="bg-gray-100 px-2 py-1 rounded">429 Too Many Requests</code> errors</p>
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
                <p className="text-sm text-gray-600">Missing or invalid API key</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-semibold">403 Forbidden</p>
                <p className="text-sm text-gray-600">License inactive or expired</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-semibold">429 Too Many Requests</p>
                <p className="text-sm text-gray-600">Monthly API limit exceeded</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold">400 Bad Request</p>
                <p className="text-sm text-gray-600">Invalid request body or missing required fields</p>
              </div>
              <div className="border-l-4 border-gray-500 pl-4">
                <p className="font-semibold">500 Internal Server Error</p>
                <p className="text-sm text-gray-600">Server error - please try again later</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

