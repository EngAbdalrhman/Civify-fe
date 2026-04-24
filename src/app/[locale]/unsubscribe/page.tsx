"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("status") === "success";

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {isSuccess ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <XCircle className="h-8 w-8 text-destructive" />
          )}
        </div>
        
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          {isSuccess ? "Unsubscribed Successfully" : "Unsubscribe Failed"}
        </h1>
        
        <p className="mb-8 text-muted-foreground">
          {isSuccess
            ? "You have been successfully removed from our newsletter. You will no longer receive marketing emails from us."
            : "We couldn't process your unsubscribe request. The link might be invalid or expired. Please contact support if the issue persists."}
        </p>

        <Link href="/">
          <Button className="w-full">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center">Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
