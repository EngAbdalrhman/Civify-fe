"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  MessageCircle,
} from "lucide-react";
import { Link } from "@/i18n/routing";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("payment.failure");

  const errorMessage = searchParams.get("error") || "Payment was not completed";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">{t("title")}</CardTitle>
          <CardDescription className="text-base">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-400">
              {errorMessage}
            </p>
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-3">{t("whatYouCanDo")}</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Check your payment details and try again
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Try a different payment method
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Contact your bank if the issue persists
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Reach out to our support team for assistance
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/plans">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("tryAgain")}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full" size="lg">
              <Link href="/app">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToDashboard")}
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full" size="lg">
              <a href="mailto:support@civify.cv">
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("contactSupport")}
              </a>
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
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
