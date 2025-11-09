"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { paymentService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function PaymentFailureContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorMessage = searchParams.get("error") || "Payment was not completed";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Log payment failure
    paymentService.handlePaymentFailure(errorMessage);
  }, [user, errorMessage]);

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Payment Failed</CardTitle>
          <CardDescription className="text-base">
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              {errorMessage}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              What you can do:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Check your payment details and try again</li>
              <li>Try a different payment method</li>
              <li>Contact your bank if the issue persists</li>
              <li>Reach out to our support team for assistance</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/dashboard/plans")}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}

