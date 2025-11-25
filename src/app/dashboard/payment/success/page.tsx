"use client";

import { useEffect, useState, Suspense } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle,
  ArrowRight,
  Home,
} from "lucide-react";

function PaymentSuccessContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    verifyPayment();
  }, [user]);

  const verifyPayment = async () => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000; // 2 seconds

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        setVerifying(true);

        // Detect gateway from URL params or use default
        const gateway = searchParams.get("gateway") || "fawaterak";

        let callbackData;
        if (gateway === "paymob") {
          callbackData = paymentService.parsePaymobCallback(searchParams);
        } else if (gateway === "fawaterak") {
          callbackData = paymentService.parseFawaterakCallback(searchParams);
        } else {
          throw new Error("Unknown payment gateway");
        }

        if (!callbackData.success || !callbackData.transactionId) {
          throw new Error(
            callbackData.error || "Invalid payment callback data"
          );
        }

        // Verify payment with backend
        const transaction = await paymentService.handlePaymentSuccess(
          callbackData.transactionId
        );

        // Success!
        setVerified(true);

        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        });
        return;
      } catch (error: any) {
        if (attempt < MAX_RETRIES - 1) {
          // Wait before retrying
          console.log(
            `Payment verification attempt ${attempt + 1} failed, retrying...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }

        // Final attempt failed
        console.error("Payment verification error:", error);
        toast({
          title: "Verification Error",
          description:
            error.message ||
            "Failed to verify payment. Please contact support.",
          variant: "destructive",
        });
        setVerified(false);
      } finally {
        if (attempt === MAX_RETRIES - 1) {
          setVerifying(false);
        }
      }
    }
  };

  if (verifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <h2 className="text-2xl font-bold">Verifying Payment...</h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="text-base">
            Your subscription has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Thank you for your purchase! Your account has been upgraded and you
              now have access to all premium features.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push("/dashboard/cvs")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Start Creating CVs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

