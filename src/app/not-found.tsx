"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* 404 Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <FileQuestion className="h-32 w-32 text-gray-300 relative" />
              </div>
            </div>

            {/* 404 Text */}
            <div>
              <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                404
              </h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Oops! The page you're looking for doesn't exist. It might have
                been moved or deleted.
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Here's what you can do:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Check the URL for typos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Go back to the previous page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Return to the homepage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Contact support if you think this is an error</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Home className="h-5 w-5" />
                Go to Dashboard
              </Button>
            </div>

            {/* Error Code */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Error Code: <span className="font-mono font-semibold">404</span>{" "}
                | Page Not Found
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

